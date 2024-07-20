// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { getFirestoreProposalType, getProposalTypeTitle, getStatusesFromCustomStatus, getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { ACTIVE_PROPOSALS_FROM_PROPOSALS_INDEXES } from '~src/queries';
import { firestore_db } from '~src/services/firebaseInit';
import { IBeneficiary } from '~src/types';
import { convertAnyHexToASCII } from '~src/util/decodingOnChainInfo';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { getContentSummary } from '~src/util/getPostContentAiSummary';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import { IPostResponse } from '../../posts/on-chain-post';
import { getSubSquareContentAndTitle } from '../../posts/subsqaure/subsquare-content';

interface Args {
	userAddress: string;
	page: number;
	isExternalApiCall: boolean;
}

export interface IBatchVoteCartResponse {
	referendumIndex: number;
	network: string;
	decision: 'aye' | 'nay' | 'abstain';
	balance: string;
	lockedPeriod: number;
	userAddress: string;
	id: string;
	createAt: Date;
	updatedAt: Date | null;
	proposal?: IPostResponse | null;
}

const getIsSwapStatus = (statusHistory: string[]) => {
	const index = statusHistory.findIndex((v: any) => v.status === 'DecisionDepositPlaced');
	if (index >= 0) {
		const decidingIndex = statusHistory.findIndex((v: any) => v.status === 'Deciding');
		if (decidingIndex >= 0) {
			const obj = statusHistory[index];
			statusHistory.splice(index, 1);
			statusHistory.splice(decidingIndex, 0, obj);
			return { isSwap: true, statusHistory };
		}
	}
	return { isSwap: false, statusHistory };
};

export const getTopicFromFirestoreData = (data: any, proposalType: ProposalType) => {
	if (data) {
		const topic = data.topic;
		const topic_id = data.topic_id;
		return topic
			? topic
			: isTopicIdValid(topic_id)
			? {
					id: topic_id,
					name: getTopicNameFromTopicId(topic_id)
			  }
			: getTopicFromType(proposalType);
	}
	return null;
};

export const getUpdatedAt = (data: any) => {
	if (data) {
		if (data?.last_edited_at) {
			return data?.last_edited_at?.toDate ? data?.last_edited_at?.toDate()?.toString() : data?.last_edited_at;
		} else if (data.updated_at) {
			return data.updated_at?.toDate ? data.updated_at?.toDate()?.toString() : data.updated_at;
		}
	}
};

const handler: NextApiHandler<{ votes: IBatchVoteCartResponse[] } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const token = getTokenFromReq(req);
		if (!token) return res.status(403).json({ message: messages.UNAUTHORISED });

		const user = await authServiceInstance.GetUser(token);
		if (!user || isNaN(user.id)) return res.status(403).json({ message: messages.UNAUTHORISED });

		const { userAddress, page, isExternalApiCall } = req.body as unknown as Args;

		if (isNaN(page) || !getEncodedAddress(userAddress, network)) {
			return res.status(500).json({ message: messages.INVALID_PARAMS });
		}

		const cartRef = await firestore_db
			.collection('users')
			.doc(String(user?.id))
			.collection('batch_votes_cart')
			.where('user_address', '==', userAddress)
			.where('network', '==', network)
			.limit(LISTING_LIMIT)
			.offset(LISTING_LIMIT * (page - 1))
			.orderBy('created_at', 'desc')
			.get();

		const postsIndex: number[] = [];

		if (cartRef?.empty) {
			return res.status(200).json({ votes: [] });
		} else {
			const cartDocs = cartRef.docs;
			const votes = cartDocs.map((doc: any) => {
				const data = doc.data();
				postsIndex.push(data?.referendum_index);
				return {
					balance: data?.balance || '0',
					createAt: data?.created_at?.toDate ? data?.created_at.toDate().toString() : data?.created_at,
					decision: data?.decison || 'aye',
					id: data?.id || '',
					lockedPeriod: data?.locked_period || 0.1,
					network: data?.network || network,
					referendumIndex: data?.referendum_index,
					updatedAt: getUpdatedAt(data),
					userAddress: data?.user_address
				};
			});

			if (postsIndex.length) {
				const subsquidProposalsRes = await fetchSubsquid({
					network,
					query: ACTIVE_PROPOSALS_FROM_PROPOSALS_INDEXES,
					variables: {
						index_in: postsIndex,
						status_in: getStatusesFromCustomStatus(CustomStatus.Active),
						type: getSubsquidProposalType(ProposalType.REFERENDUM_V2 as any)
					}
				});

				const subsquidProposalsData = subsquidProposalsRes?.['data']?.proposals || [];
				const results: any[] = [];

				if (subsquidProposalsData.length) {
					const activeProposalIds = subsquidProposalsData.map((proposal: any) => (isNaN(proposal?.index) ? null : proposal?.index));

					const postsSnapshot = await postsByTypeRef(network, getFirestoreProposalType(ProposalType.REFERENDUM_V2) as ProposalType)
						.where(
							'id',
							'in',
							activeProposalIds.filter((item: string | null) => !!item)
						)
						.get();

					if (!postsSnapshot.empty) {
						const postsDocs = postsSnapshot.docs;
						const subsquidProposalsDataPromises = subsquidProposalsData.map(async (subsquidPost: any) => {
							const firebasePostDoc = postsDocs.find((doc) => doc.id == subsquidPost.index);

							const preimage = subsquidPost?.preimage;
							const proposedCall = preimage?.proposedCall;
							const proposalArguments = subsquidProposalsData?.proposalArguments || subsquidProposalsData?.callData;
							let requested = BigInt(0);
							const beneficiaries: IBeneficiary[] = [];
							let assetId: null | string = null;

							if (proposedCall?.args) {
								if (proposedCall?.args?.assetKind?.assetId?.value?.interior) {
									const call = proposedCall?.args?.assetKind?.assetId?.value?.interior?.value;
									assetId = (call?.length ? call?.find((item: { value: number; __kind: string }) => item?.__kind == 'GeneralIndex')?.value : null) || null;
								}
								proposedCall.args = convertAnyHexToASCII(proposedCall.args, network);

								if (proposedCall?.args?.beneficiary?.value?.interior?.value?.id) {
									proposedCall.args.beneficiary.value.interior.value.id = convertAnyHexToASCII(proposedCall?.args?.beneficiary?.value?.interior?.value?.id, network);
								}

								if (proposedCall.args.amount) {
									requested = proposedCall.args.amount;
									if (proposedCall.args.beneficiary) {
										beneficiaries.push({
											address: proposedCall.args.beneficiary as string,
											amount: proposedCall.args.amount
										});
									}
								} else {
									const calls = proposedCall.args.calls;
									if (calls && Array.isArray(calls) && calls.length > 0) {
										calls.forEach((call) => {
											if (call && call.amount) {
												requested += BigInt(call.amount);
												if (call.beneficiary) {
													beneficiaries.push({
														address: call.beneficiary as string,
														amount: call.amount
													});
												}
											}
										});
									}
								}
							}

							const payload: any = {
								assetId: assetId || null,
								beneficiaries: beneficiaries || [],
								comments: [],
								content: '',
								created_at: subsquidPost?.createdAt?.toDate ? subsquidPost?.createdAt?.toDate() : subsquidPost?.createdAt || null,
								gov_type: ProposalType.OPEN_GOV,
								id: subsquidPost.index,
								last_edited_at: subsquidPost?.createdAt?.toDate ? subsquidPost?.createdAt?.toDate() : subsquidPost?.createdAt || null,
								method: preimage?.method || proposedCall?.method || proposalArguments?.method,
								preimageHash: preimage.hash,
								proposedCall: proposedCall,
								proposer: subsquidPost?.proposer || '',
								requested: requested.toString() || '0',
								status: subsquidPost?.status,
								statusHistory: subsquidPost?.statusHistory || [],
								summary: '',
								tags: [],
								tally: subsquidPost.tally,
								title: '',
								track_number: subsquidPost.trackNumber,
								type: subsquidPost.type
							};

							if (firebasePostDoc?.exists) {
								const firebasePost = firebasePostDoc?.data();

								const { statusHistory, isSwap } = getIsSwapStatus(subsquidPost?.statusHistory);

								payload.statusHistory = statusHistory;
								payload.summary = firebasePost?.summary || '';
								payload.tags = firebasePost?.tags || [];
								payload.title = firebasePost?.title || '';
								payload.topic = getTopicFromFirestoreData(firebasePost, getFirestoreProposalType(ProposalType.OPEN_GOV) as ProposalType);

								if (!firebasePost?.title?.length || !firebasePost?.content?.length) {
									const res = await getSubSquareContentAndTitle(ProposalType.REFERENDUM_V2, network, subsquidPost.index);
									firebasePost.content = payload?.content || res?.content || '';
									firebasePost.title = payload?.title || res.title || '';
									payload.content =
										payload?.content ||
										res.content ||
										`This is a ${getProposalTypeTitle(ProposalType.REFERENDUM_V2)} whose proposer address (${
											payload.proposer
										}) is shown in on-chain info below. Only this user can edit this description and the title. If you own this account, login and tell us more about your proposal.`;
									payload.title = payload?.title || res.title || `Referenda #${subsquidPost.index}`;
								}

								if (isSwap) {
									if (payload.status === 'DecisionDepositPlaced') {
										payload.status = 'Deciding';
									}
								}

								await getContentSummary(firebasePost, network, isExternalApiCall);
								results.push(payload);
							} else {
								if (!payload?.title?.length || !payload?.content?.length) {
									const res = await getSubSquareContentAndTitle(ProposalType.REFERENDUM_V2, network, subsquidPost.index);
									payload.content =
										payload?.content ||
										res.content ||
										`This is a ${getProposalTypeTitle(ProposalType.REFERENDUM_V2)} whose proposer address (${
											payload.proposer
										}) is shown in on-chain info below. Only this user can edit this description and the title. If you own this account, login and tell us more about your proposal.`;
									payload.title = payload?.title || res.title || `Referenda #${subsquidPost.index}`;
								}
								results.push(payload);
							}
						});

						await Promise.allSettled(subsquidProposalsDataPromises);
					}
				}

				votes.map((vote) => {
					results.map((item) => {
						if (item.id == vote?.referendumIndex) {
							return {
								...vote,
								proposal: item
							};
						}
					});

					return vote;
				});
			}
			const sortByIdResultsData = votes.sort((a: IBatchVoteCartResponse, b: IBatchVoteCartResponse) => b?.referendumIndex - a?.referendumIndex);

			return res.status(200).send({ votes: sortByIdResultsData || [] });
		}
	} catch (error) {
		return res.status(500).send({ message: error || messages.API_FETCH_ERROR });
	}
};
export default withErrorHandling(handler);
