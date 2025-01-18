// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import { ProposalType, getFirestoreProposalType, getProposalTypeTitle, getStatusesFromCustomStatus, getSubsquidProposalType } from '~src/global/proposalType';

import fetchSubsquid from '~src/util/fetchSubsquid';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { GET_DELEGATED_DELEGATION_ADDRESSES, NON_VOTED_OPEN_GOV_ACTIVE_PROPOSALS } from '~src/queries';
import messages from '~src/auth/utils/messages';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import { getContentSummary } from '~src/util/getPostContentAiSummary';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import { network as AllNetworks } from '~src/global/networkConstants';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { IPostResponse } from './on-chain-post';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { firestore_db } from '~src/services/firebaseInit';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import authServiceInstance from '~src/auth/auth';
import { getSubSquareContentAndTitle } from './subsqaure/subsquare-content';
import preimageToBeneficiaries from '~src/util/preimageToBeneficiaries';
import { convertAnyHexToASCII } from '~src/util/decodingOnChainInfo';

interface Args {
	network: string;
	proposalType: ProposalType;
	isExternalApiCall?: boolean;
	userAddress: string;
	userId: number;
	skippedIndexes?: number[];
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

export const getActiveProposalsForTrack = async ({ network, proposalType, isExternalApiCall, userAddress, userId, skippedIndexes = [] }: Args) => {
	if (!network || !Object.values(AllNetworks).includes(network)) {
		throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);
	}

	const strProposalType = String(proposalType);

	if (!isProposalTypeValid(strProposalType) || !getEncodedAddress(userAddress, network) || isNaN(userId) || skippedIndexes.filter((index) => typeof index !== 'number')?.length) {
		throw apiErrorWithStatusCode(messages.INVALID_PARAMS, 400);
	}

	try {
		const encodedAddress = getEncodedAddress(userAddress, network);

		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_DELEGATED_DELEGATION_ADDRESSES,
			variables: {
				address: encodedAddress || userAddress
			}
		});

		const delegatedAddressObj: { [key: string]: number } = {};
		const subsquidData = subsquidRes?.['data']?.votingDelegations || [];

		subsquidData.map((delegation: { to: string; from: string }) => {
			if (delegatedAddressObj[delegation.to] == undefined) {
				delegatedAddressObj[delegation.to] = 1;
			}
		});

		const batchVotesCartRef = await firestore_db
			.collection('users')
			.doc(String(userId))
			.collection('batch_votes_cart')
			.where('network', '==', network)
			.where('user_address', '==', userAddress)
			.get();

		const batchVotesCartDocs = batchVotesCartRef.docs;

		const batchVotesIndexes = batchVotesCartDocs.map((voteDoc) => {
			const data = voteDoc.data();
			return data?.referendum_index;
		});

		const variables: any = {
			addresses: [encodedAddress, ...(Object.keys(delegatedAddressObj) || [])],
			status_in: getStatusesFromCustomStatus(CustomStatus.Active),
			type: getSubsquidProposalType(proposalType as any)
		};

		if ([...batchVotesIndexes, ...skippedIndexes].length) {
			variables.index_not_in = [...batchVotesIndexes, ...skippedIndexes];
		}

		const subsquidProposalsRes = await fetchSubsquid({
			network,
			query: NON_VOTED_OPEN_GOV_ACTIVE_PROPOSALS,
			variables: variables
		});

		const subsquidProposalsData = subsquidProposalsRes?.['data']?.proposals || [];

		if (!subsquidProposalsData.length) {
			return { data: [], error: null };
		} else {
			const activeProposalIds: number[] = subsquidProposalsData.map((proposal: any) => (isNaN(proposal?.index) ? null : proposal?.index));

			const postsSnapshot = await postsByTypeRef(network, (getFirestoreProposalType(proposalType) as ProposalType) || proposalType)
				.where(
					'id',
					'in',
					activeProposalIds.filter((item: number | null) => !!item)
				)
				.get();

			const results: any[] = [];

			const postsDocs = postsSnapshot?.docs;
			const subsquidProposalsDataPromises = subsquidProposalsData.map(async (subsquidPost: any) => {
				const firebasePostDoc = postsDocs.find((doc) => doc.id == subsquidPost.index);

				const preimage = subsquidPost?.preimage || null;
				const proposedCall = preimage?.proposedCall || null;
				const proposalArguments = subsquidProposalsData?.proposalArguments || subsquidProposalsData?.callData || null;

				if (proposalArguments?.args) {
					proposalArguments.args = convertAnyHexToASCII(proposalArguments.args, network) || proposalArguments?.args;
				}

				const beneficiariesInfo = preimageToBeneficiaries(proposedCall, network);

				const payload: any = {
					assetId: beneficiariesInfo?.assetId || null,
					beneficiaries: beneficiariesInfo?.beneficiaries || [],
					comments: [],
					content: '',
					created_at: subsquidPost?.createdAt,
					gov_type: ProposalType.OPEN_GOV === proposalType ? 'open_gov' : 'gov_1',
					id: subsquidPost?.index,
					last_edited_at: subsquidPost?.createdAt,
					method: preimage?.method || proposedCall?.method || proposalArguments?.method,
					preimageHash: preimage?.hash || '',
					proposedCall: proposedCall || null,
					proposer: subsquidPost?.proposer || '',
					requested: Array.isArray(beneficiariesInfo?.beneficiaries) && beneficiariesInfo?.requested ? beneficiariesInfo?.requested.toString() : undefined,
					status: subsquidPost?.status,
					statusHistory: subsquidPost?.statusHistory || [],
					summary: '',
					tags: [],
					tally: subsquidPost.tally || [],
					title: '',
					track_number: subsquidPost?.trackNumber || null,
					type: subsquidPost?.type || ProposalType.REFERENDUM_V2
				};

				if (firebasePostDoc?.exists) {
					const firebasePost = firebasePostDoc?.data();
					const commentsRef = await postsByTypeRef(network, ProposalType.REFERENDUM_V2)
						.doc(String(subsquidPost.index))
						.collection('comments')
						.orderBy('created_at', 'desc')
						.limit(2)
						.offset(0)
						.get();

					const commentsDocs = commentsRef.docs;

					const comments: any[] = [];
					const commentsPromises = commentsDocs.map(async (commentDoc) => {
						if (commentDoc.exists) {
							const data = commentDoc.data();
							const user = (await firestore_db.collection('users').doc(String(data.user_id)).get()).data();

							const comment = data.isDeleted
								? {
										comment_source: 'polkassembly',
										content: '[Deleted]',
										created_at: data?.created_at?.toDate ? data?.created_at?.toDate().toString() : data?.created_at || '',
										id: data.id,
										is_custom_username: false,
										post_index: subsquidPost.index,
										post_type: subsquidPost.type,
										profile: user?.profile || null,
										proposer: data.proposer || '',
										replies: data.replies || ([] as any[]),
										sentiment: 0,
										spam_users_count: 0,
										user_id: data.user_id,
										username: data.username,
										votes: [] as any[]
								  }
								: {
										comment_source: data.comment_source || 'polkassembly',
										content: data.content,
										created_at: data?.created_at?.toDate ? data?.created_at?.toDate().toString() : data?.created_at || '',
										id: data.id,
										is_custom_username: false,
										post_index: subsquidPost.index,
										post_type: subsquidPost.type,
										profile: user?.profile || null,
										proposer: data.proposer || '',
										replies: data.replies || ([] as any[]),
										sentiment: data.sentiment || 0,
										spam_users_count: 0,
										user_id: data.user_id,
										username: data.username,
										votes: [] as any[]
								  };

							comments.push(comment);
						}
					});

					await Promise.allSettled(commentsPromises);
					await Promise.allSettled(comments);

					const { statusHistory, isSwap } = getIsSwapStatus(subsquidPost?.statusHistory);

					payload.statusHistory = statusHistory;
					payload.summary = firebasePost?.summary || '';
					payload.tags = firebasePost?.tags || [];
					payload.title = firebasePost?.title || '';
					payload.topic = getTopicFromFirestoreData(firebasePost, getFirestoreProposalType(proposalType) as ProposalType);
					payload.comments = comments || [];

					if (!firebasePost?.title?.length || !firebasePost?.content?.length) {
						const res = await getSubSquareContentAndTitle(proposalType, network, subsquidPost.index);
						firebasePost.content = res?.content;
						firebasePost.title = res?.title;
						payload.title = payload?.title || res?.title || `Referenda #${subsquidPost.index}`;
					}

					if (isSwap) {
						if (payload.status === 'DecisionDepositPlaced') {
							payload.status = 'Deciding';
						}
					}

					await getContentSummary(firebasePost, network, isExternalApiCall);

					if (!payload.summary) {
						payload.summary = `This is a ${getProposalTypeTitle(proposalType as ProposalType)} whose proposer address (${
							payload.proposer
						}) is shown in on-chain info below. Only this user can edit this description and the title. If you own this account, login and tell us more about your proposal.`;
					}

					results.push(payload);
				} else {
					if (!payload?.title?.length) {
						const res = await getSubSquareContentAndTitle(proposalType, network, subsquidPost.index);
						if (res.title) {
							payload.title = payload?.title || res?.title || `Referenda #${subsquidPost.index}`;
						} else {
							payload.title = payload?.title || `Referenda #${subsquidPost.index}`;
						}
					}
					if (!payload.summary?.length) {
						payload.summary = `This is a ${getProposalTypeTitle(proposalType as ProposalType)} whose proposer address (${
							payload.proposer
						}) is shown in on-chain info below. Only this user can edit this description and the title. If you own this account, login and tell us more about your proposal.`;
					}

					results.push(payload);
				}
			});

			await Promise.allSettled(subsquidProposalsDataPromises);

			const sortByIdResultsData = results.sort((a: IPostResponse, b: IPostResponse) => b?.id - a?.id);

			return { data: sortByIdResultsData, error: null };
		}
	} catch (err) {
		return {
			data: [],
			error: err || messages.API_FETCH_ERROR
		};
	}
};
const handler: NextApiHandler<IPostResponse[] | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(403).json({ message: messages.UNAUTHORISED });

	const user = await authServiceInstance.GetUser(token);
	if (!user || isNaN(user.id)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { proposalType, userAddress, isExternalApiCall = false, skippedIndexes } = req.body;
	const network = String(req.headers['x-network']);
	const { data, error } = await getActiveProposalsForTrack({
		isExternalApiCall: isExternalApiCall,
		network: network,
		proposalType: proposalType || ProposalType.REFERENDUM_V2,
		skippedIndexes: skippedIndexes || [],
		userAddress: userAddress,
		userId: user?.id
	});

	if (error || !data) {
		return res.status(400).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(200).json(data);
	}
};

export default withErrorHandling(handler);
