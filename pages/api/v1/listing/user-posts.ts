// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { getFirestoreProposalType, ProposalType } from '~src/global/proposalType';
import { GET_ONCHAIN_POSTS_BY_PROPOSER_ADDRESSES } from '~src/queries';
import { firestore_db } from '~src/services/firebaseInit';
import { IApiResponse, IUserPost, IUserPostsListingResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { IReaction } from '../posts/on-chain-post';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { convertAnyHexToASCII } from '~src/util/decodingOnChainInfo';
import { getTimeline } from '~src/util/getTimeline';
import { getIsSwapStatus } from '~src/util/getIsSwapStatus';
import { chainProperties } from '~src/global/networkConstants';

export const getDefaultUserPosts: () => IUserPostsListingResponse = () => {
	return {
		gov1: {
			collective: {
				council_motions: [],
				posts: [],
				tech_comm_proposals: [],
				total: 0
			},
			democracy: {
				posts: [],
				proposals: [],
				referenda: [],
				total: 0
			},
			discussions: {
				posts: [],
				total: 0
			},
			treasury: {
				bounties: [],
				posts: [],
				tips: [],
				total: 0,
				treasury_proposals: []
			}
		},
		gov1_total: 0,
		open_gov: {
			auction_admin: [],
			discussions: {
				posts: [],
				total: 0
			},
			fellowship: {
				fellowship_admin: [],
				member_referenda: [],
				posts: [],
				total: 0,
				whitelisted_caller: []
			},
			governance: {
				general_admin: [],
				lease_admin: [],
				posts: [],
				referendum_canceller: [],
				referendum_killer: [],
				total: 0
			},
			root: [],
			staking_admin: [],
			treasury: {
				big_spender: [],
				big_tipper: [],
				medium_spender: [],
				posts: [],
				small_spender: [],
				small_tipper: [],
				total: 0,
				treasurer: []
			}
		},
		open_gov_total: 0
	};
};

interface IGetPostsByAddressParams {
	network: string;
	userId?: string | string[] | number;
	addresses?: string | string[] | any[];
}

type TGetUserPosts = (params: IGetPostsByAddressParams) => Promise<IApiResponse<IUserPostsListingResponse>>;

export const getUserPosts: TGetUserPosts = async (params) => {
	try {
		const { network, userId, addresses } = params;
		if (!userId && userId !== 0 && !addresses) {
			throw apiErrorWithStatusCode('Missing parameters in request body', 400);
		}
		const numUserId = Number(userId);
		if (isNaN(numUserId)) {
			throw apiErrorWithStatusCode('UserId is invalid', 400);
		}

		const userPosts = getDefaultUserPosts();

		const userDoc = await firestore_db.collection('users').doc(String(numUserId)).get();
		let username = '';
		if (userDoc.exists && userDoc.data()) {
			username = userDoc?.data()?.username;
		}
		let proposer = addresses && addresses.length > 0 ? addresses[0] : '';
		if (!proposer) {
			const addressDocs = await firestore_db.collection('addresses').where('user_id', '==', numUserId).where('default', '==', true).limit(1).get();
			if (addressDocs && addressDocs.size > 0) {
				const addressDoc = addressDocs.docs[0];
				if (addressDoc && addressDoc.exists && addressDoc.data()) {
					proposer = addressDoc.data().address;
				}
			}
		}
		const discussionsQuerySnapshot = await postsByTypeRef(network, ProposalType.DISCUSSIONS).where('isDeleted', '==', false).where('user_id', '==', numUserId).get();
		const discussionsPromise = discussionsQuerySnapshot.docs.map(async (doc) => {
			const data = doc.data();
			if (doc && doc.exists && data) {
				const newData: IUserPost = {
					content: data.content || '',
					created_at: data?.created_at?.toDate() || null,
					id: data.id,
					post_reactions: {
						'👍': 0,
						'👎': 0
					},
					proposer: proposer,
					title: data.title || '',
					type: ProposalType.DISCUSSIONS,
					username
				};
				const postReactionsQuerySnapshot = await doc.ref.collection('post_reactions').get();
				postReactionsQuerySnapshot.docs.forEach((doc) => {
					const data = doc.data();
					if (doc && doc.exists && data && data.reaction) {
						const { reaction } = data;
						if (['👍', '👎'].includes(reaction)) {
							newData.post_reactions[reaction as IReaction]++;
						}
					}
				});
				return newData;
			}
		});
		const discussionsPromiseSettledResult = await Promise.allSettled(discussionsPromise);
		discussionsPromiseSettledResult.forEach((result) => {
			if (result && result.status === 'fulfilled' && result.value) {
				userPosts.gov1.discussions.posts.push(result.value);
				userPosts.gov1_total += 1;
				userPosts.open_gov_total += 1;
				userPosts.open_gov.discussions.posts.push(result.value);
				userPosts.gov1.discussions.total += 1;
				userPosts.open_gov.discussions.total += 1;
			}
		});

		let subsquidRes;
		if (chainProperties[network]?.subsquidUrl) {
			subsquidRes = await fetchSubsquid({
				network,
				query: GET_ONCHAIN_POSTS_BY_PROPOSER_ADDRESSES,
				variables: {
					proposer_in: (addresses as string[])?.map((address) => getEncodedAddress(address, network)) || []
				}
			});
			const edges = subsquidRes?.data?.proposalsConnection?.edges;
			if (edges && Array.isArray(edges)) {
				const onChainPostsPromise = edges?.map(async (edge) => {
					if (edge && edge.node) {
						const { type, hash, index, createdAt, description, proposalArguments, proposer, preimage, trackNumber, tally, status: resultStatus, statusHistory, group } = edge.node;
						let proposalTimeline;
						let status = resultStatus;
						const isSwap: boolean = getIsSwapStatus(statusHistory);

						if (isSwap) {
							if (resultStatus === 'DecisionDepositPlaced') {
								status = 'Deciding';
							}
						}
						const isStatus = {
							swap: isSwap
						};

						if (!group?.proposals) {
							proposalTimeline = getTimeline(
								[
									{
										createdAt,
										hash,
										index,
										statusHistory,
										type
									}
								],
								isStatus
							);
						} else {
							proposalTimeline = getTimeline(group?.proposals, isStatus) || [];
						}

						let requested = BigInt(0);
						let args = preimage?.proposedCall?.args;
						let assetId: null | string = null;

						if (args) {
							if (args?.assetKind?.assetId?.value?.interior) {
								const call = args?.assetKind?.assetId?.value?.interior?.value;
								assetId = (call?.length ? call?.find((item: { value: number; __kind: string }) => item?.__kind == 'GeneralIndex')?.value : null) || null;
							}
							args = convertAnyHexToASCII(args, network);
							if (args?.amount) {
								requested = args.amount;
							} else {
								const calls = args.calls;
								if (calls && Array.isArray(calls) && calls.length > 0) {
									calls.forEach((call) => {
										if (call && (call.amount || call?.value?.amount)) {
											requested += BigInt(call.amount || call?.value?.amount);
										}
									});
								}
							}
						}

						const proposalType = getFirestoreProposalType(type);
						const id = type === 'Tip' ? hash : index;
						const newData: IUserPost = {
							assetId: assetId || null,
							content: description || (proposalArguments && proposalArguments.description ? proposalArguments.description : ''),
							created_at: createdAt || null,
							id: id,
							post_reactions: {
								'👍': 0,
								'👎': 0
							},
							proposer: proposer || (preimage && preimage.proposer ? preimage.proposer : ''),
							requestedAmount: requested ? requested.toString() : null,
							status: status || '',
							status_history: statusHistory || null,
							tally: tally || null,
							timeline: proposalTimeline,
							title: preimage && preimage.method ? preimage.method : '',
							track_number: trackNumber,
							type: proposalType as ProposalType
						};
						const doc = await postsByTypeRef(network, proposalType as any)
							.doc(String(id))
							.get();
						const data = doc?.data();
						if (doc && doc.exists && data) {
							if (data.created_at) {
								newData.created_at = data?.created_at?.toDate();
							}
							if (data.content) {
								newData.content = data.content;
							}
							if (data.title) {
								newData.title = data.title;
							}
							if (data.tags) {
								newData.tags = data?.tags;
							}
							const postReactionsQuerySnapshot = await doc.ref.collection('post_reactions').get();
							postReactionsQuerySnapshot.docs.forEach((doc) => {
								const data = doc.data();
								if (doc && doc.exists && data && data.reaction) {
									const { reaction } = data;
									if (['👍', '👎'].includes(reaction)) {
										newData.post_reactions[reaction as IReaction]++;
									}
								}
							});
							const commentsQuerySnapshot = await doc.ref.collection('comments').where('isDeleted', '==', false).count().get();
							if (commentsQuerySnapshot.data()?.count) {
								newData.comments_count = commentsQuerySnapshot.data()?.count;
							}
						}
						return newData;
					}
				});
				const onChainPostsPromiseSettledResult = await Promise.allSettled(onChainPostsPromise);
				onChainPostsPromiseSettledResult.forEach((result) => {
					if (result && result.status === 'fulfilled' && result.value) {
						const value = result.value;
						const type = value.type;
						if (ProposalType.DEMOCRACY_PROPOSALS === type) {
							userPosts.gov1.democracy.proposals.push(value);
							userPosts.gov1_total += 1;
							userPosts.gov1.democracy.total += 1;
							userPosts.gov1.democracy.posts.push(value);
						} else if (ProposalType.REFERENDUMS === type) {
							userPosts.gov1.democracy.referenda.push(value);
							userPosts.gov1_total += 1;
							userPosts.gov1.democracy.total += 1;
							userPosts.gov1.democracy.posts.push(value);
						} else if (ProposalType.BOUNTIES === type) {
							userPosts.gov1.treasury.bounties.push(value);
							userPosts.gov1_total += 1;
							userPosts.gov1.treasury.total += 1;
							userPosts.gov1.treasury.posts.push(value);
						} else if (ProposalType.TIPS === type) {
							userPosts.gov1.treasury.tips.push(value);
							userPosts.gov1.treasury.total += 1;
							userPosts.gov1.treasury.posts.push(value);
							userPosts.gov1_total += 1;
						} else if (ProposalType.TREASURY_PROPOSALS === type) {
							userPosts.gov1.treasury.treasury_proposals.push(value);
							userPosts.gov1.treasury.total += 1;
							userPosts.gov1_total += 1;
							userPosts.gov1.treasury.posts.push(value);
						} else if (ProposalType.COUNCIL_MOTIONS === type) {
							userPosts.gov1.collective.council_motions.push(value);
							userPosts.gov1_total += 1;
							userPosts.gov1.collective.posts.push(value);
							userPosts.gov1.collective.total += 1;
						} else if (ProposalType.TECH_COMMITTEE_PROPOSALS === type) {
							userPosts.gov1.collective.tech_comm_proposals.push(value);
							userPosts.gov1.collective.total += 1;
							userPosts.gov1.collective.posts.push(value);
							userPosts.gov1_total += 1;
						} else if (ProposalType.REFERENDUM_V2 === type) {
							const track_number = value.track_number;
							//FIXME: This implemenation needs to be refactored. Trackgroups should be passed from FE using js API and should not be hardcoded here
							if (track_number !== undefined && track_number !== null) {
								if (!['moonbeam', 'moonriver', ',moonbase'].includes(network)) {
									switch (track_number) {
										case 0:
											userPosts.open_gov.root.push(value);
											break;
										case 1:
											userPosts.open_gov.fellowship.whitelisted_caller.push(value);
											userPosts.open_gov.fellowship.total += 1;
											userPosts.open_gov.fellowship.posts.push(value);
											break;
										case 10:
											userPosts.open_gov.staking_admin.push(value);
											break;
										case 11:
											userPosts.open_gov.treasury.treasurer.push(value);
											userPosts.open_gov.treasury.total += 1;
											userPosts.open_gov.treasury.posts.push(value);
											break;
										case 12:
											userPosts.open_gov.governance.lease_admin.push(value);
											userPosts.open_gov.governance.total += 1;
											userPosts.open_gov.governance.posts.push(value);
											break;
										case 13:
											userPosts.open_gov.fellowship.fellowship_admin.push(value);
											userPosts.open_gov.fellowship.total += 1;
											userPosts.open_gov.fellowship.posts.push(value);
											break;
										case 14:
											userPosts.open_gov.governance.general_admin.push(value);
											userPosts.open_gov.governance.total += 1;
											userPosts.open_gov.governance.posts.push(value);
											break;
										case 15:
											userPosts.open_gov.auction_admin.push(value);
											break;
										case 20:
											userPosts.open_gov.governance.referendum_canceller.push(value);
											userPosts.open_gov.governance.total += 1;
											userPosts.open_gov.governance.posts.push(value);
											break;
										case 21:
											userPosts.open_gov.governance.referendum_killer.push(value);
											userPosts.open_gov.governance.total += 1;
											userPosts.open_gov.governance.posts.push(value);
											break;
										case 30:
											userPosts.open_gov.treasury.small_tipper.push(value);
											userPosts.open_gov.treasury.total += 1;
											userPosts.open_gov.treasury.posts.push(value);
											break;
										case 31:
											userPosts.open_gov.treasury.big_tipper.push(value);
											userPosts.open_gov.treasury.total += 1;
											userPosts.open_gov.treasury.posts.push(value);
											break;
										case 32:
											userPosts.open_gov.treasury.small_spender.push(value);
											userPosts.open_gov.treasury.total += 1;
											userPosts.open_gov.treasury.posts.push(value);
											break;
										case 33:
											userPosts.open_gov.treasury.medium_spender.push(value);
											userPosts.open_gov.treasury.total += 1;
											userPosts.open_gov.treasury.posts.push(value);
											break;
										case 34:
											userPosts.open_gov.treasury.big_spender.push(value);
											userPosts.open_gov.treasury.total += 1;
											userPosts.open_gov.treasury.posts.push(value);
											break;
									}
								} else {
									switch (track_number) {
										case 0:
											userPosts.open_gov.root.push(value);
											break;
										case 1:
											userPosts.open_gov.fellowship.whitelisted_caller.push(value);
											userPosts.open_gov.fellowship.total += 1;
											userPosts.open_gov.fellowship.posts.push(value);
											break;
										case 2:
											userPosts.open_gov.governance.general_admin.push(value);
											userPosts.open_gov.governance.total += 1;
											userPosts.open_gov.governance.posts.push(value);
											break;
										case 3:
											userPosts.open_gov.governance.referendum_canceller.push(value);
											userPosts.open_gov.governance.total += 1;
											userPosts.open_gov.governance.posts.push(value);
											break;
										case 4:
											userPosts.open_gov.governance.referendum_killer.push(value);
											userPosts.open_gov.governance.total += 1;
											userPosts.open_gov.governance.posts.push(value);
											break;
									}
								}
								userPosts.open_gov_total += 1;
							}
						} else if (ProposalType.FELLOWSHIP_REFERENDUMS === type) {
							userPosts.open_gov.fellowship.member_referenda.push(value);
							userPosts.open_gov.fellowship.total += 1;
							userPosts.open_gov.fellowship.posts.push(value);
							userPosts.open_gov_total += 1;
						}
					}
				});
			}
		}
		return {
			data: JSON.parse(JSON.stringify(userPosts)),
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
};

// expects proposerAddress
const handler: NextApiHandler<IUserPostsListingResponse | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { userId, addresses } = req.body;

	const { data, error, status } = await getUserPosts({
		addresses,
		network,
		userId
	});

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
