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
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { IReaction } from '../posts/on-chain-post';

export interface IUserPost {
	content: string;
	created_at: Date;
	id: string;
	post_reactions: {
		'👍': number;
		'👎': number;
	};
	proposer: string;
	title: string;
	type: ProposalType;
	username?: string;
	track_number?: number;
}

export interface IUserPostsListingResponse {
	gov1: {
		discussions: {
			posts: IUserPost[];
		};
		democracy: {
			referenda: IUserPost[];
			proposals: IUserPost[];
		};
		treasury: {
			treasury_proposals: IUserPost[];
			bounties: IUserPost[];
			tips: IUserPost[];
		};
		collective: {
			council_motions: IUserPost[];
			tech_comm_proposals: IUserPost[];
		};
	};
	open_gov: {
		discussions: {
			posts: IUserPost[];
		};
		root: IUserPost[];
		staking_admin: IUserPost[];
		auction_admin: IUserPost[];
		governance: {
			lease_admin: IUserPost[];
			general_admin: IUserPost[];
			referendum_canceller: IUserPost[];
			referendum_killer: IUserPost[];
		};
		treasury: {
			treasurer: IUserPost[];
			small_tipper: IUserPost[];
			big_tipper: IUserPost[];
			small_spender: IUserPost[];
			medium_spender: IUserPost[];
			big_spender: IUserPost[];
		};
		fellowship: {
			member_referenda: IUserPost[];
			whitelisted_caller: IUserPost[];
			fellowship_admin: IUserPost[];
		};
	}
}

export const getDefaultUserPosts: () => IUserPostsListingResponse = () => {
	return {
		gov1: {
			collective: {
				council_motions: [],
				tech_comm_proposals: []
			},
			democracy: {
				proposals: [],
				referenda: []
			},
			discussions: {
				posts: []
			},
			treasury: {
				bounties: [],
				tips: [],
				treasury_proposals: []
			}
		},
		open_gov: {
			auction_admin: [],
			discussions: {
				posts: []
			},
			fellowship: {
				fellowship_admin: [],
				member_referenda: [],
				whitelisted_caller: []
			},
			governance: {
				general_admin: [],
				lease_admin: [],
				referendum_canceller: [],
				referendum_killer: []
			},
			root: [],
			staking_admin: [],
			treasury: {
				big_spender: [],
				big_tipper: [],
				medium_spender: [],
				small_spender: [],
				small_tipper: [],
				treasurer: []
			}
		}
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
		if ((!userId && userId !== 0) && !addresses) {
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
		const discussionsQuerySnapshot = await postsByTypeRef(network, ProposalType.DISCUSSIONS).where('user_id', '==', numUserId).get();
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
					proposer: data.proposer_address || '',
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
				userPosts.open_gov.discussions.posts.push(result.value);
			}
		});

		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_ONCHAIN_POSTS_BY_PROPOSER_ADDRESSES,
			variables: {
				proposer_in: (addresses as string[])?.map((address) => getEncodedAddress(address, network)) || []
			}
		});
		const edges = subsquidRes?.data?.proposalsConnection?.edges;
		if (edges && Array.isArray(edges)) {
			const onChainPostsPromise = (edges)?.map(async (edge) => {
				if (edge && edge.node) {
					const { type, hash, index, createdAt, description, proposalArguments, proposer, preimage, trackNumber } = edge.node;
					const proposalType = getFirestoreProposalType(type);
					const id = type === 'Tip'? hash: index;
					const newData: IUserPost = {
						content: description || ((proposalArguments && proposalArguments.description)? proposalArguments.description: ''),
						created_at: createdAt || null,
						id: id,
						post_reactions: {
							'👍': 0,
							'👎': 0
						},
						proposer: proposer || ((preimage && preimage.proposer)? preimage.proposer: ''),
						title: (preimage && preimage.method)? preimage.method: '',
						track_number: trackNumber,
						type: proposalType as ProposalType
					};
					const doc = await postsByTypeRef(network, proposalType as any).doc(String(id)).get();
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
					} else if (ProposalType.REFERENDUMS === type) {
						userPosts.gov1.democracy.referenda.push(value);
					} else if (ProposalType.BOUNTIES === type) {
						userPosts.gov1.treasury.bounties.push(value);
					} else if (ProposalType.TIPS === type) {
						userPosts.gov1.treasury.tips.push(value);
					} else if (ProposalType.TREASURY_PROPOSALS === type) {
						userPosts.gov1.treasury.treasury_proposals.push(value);
					} else if (ProposalType.COUNCIL_MOTIONS === type) {
						userPosts.gov1.collective.council_motions.push(value);
					} else if (ProposalType.TECH_COMMITTEE_PROPOSALS === type) {
						userPosts.gov1.collective.tech_comm_proposals.push(value);
					} else if (ProposalType.REFERENDUM_V2 === type) {
						const track_number = value.track_number;
						if (track_number !== undefined && track_number !== null) {
							switch(track_number) {
							case 0:
								userPosts.open_gov.root.push(value);
								break;
							case 1:
								userPosts.open_gov.fellowship.whitelisted_caller.push(value);
								break;
							case 10:
								userPosts.open_gov.staking_admin.push(value);
								break;
							case 11:
								userPosts.open_gov.treasury.treasurer.push(value);
								break;
							case 12:
								userPosts.open_gov.governance.lease_admin.push(value);
								break;
							case 13:
								userPosts.open_gov.fellowship.fellowship_admin.push(value);
								break;
							case 14:
								userPosts.open_gov.governance.general_admin.push(value);
								break;
							case 15:
								userPosts.open_gov.auction_admin.push(value);
								break;
							case 20:
								userPosts.open_gov.governance.referendum_canceller.push(value);
								break;
							case 21:
								userPosts.open_gov.governance.referendum_killer.push(value);
								break;
							case 30:
								userPosts.open_gov.treasury.small_tipper.push(value);
								break;
							case 31:
								userPosts.open_gov.treasury.big_tipper.push(value);
								break;
							case 32:
								userPosts.open_gov.treasury.small_spender.push(value);
								break;
							case 33:
								userPosts.open_gov.treasury.medium_spender.push(value);
								break;
							case 34:
								userPosts.open_gov.treasury.big_spender.push(value);
								break;
							}
						}
					} else if (ProposalType.FELLOWSHIP_REFERENDUMS === type) {
						userPosts.open_gov.fellowship.member_referenda.push(value);
					}
				}
			});
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
	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) res.status(400).json({ message: 'Invalid network in request header' });

	const { userId, addresses } = req.body;

	const { data, error, status } = await getUserPosts({
		addresses,
		network,
		userId
	});

	if(error || !data) {
		res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	}else {
		res.status(status).json(data);
	}
};

export default withErrorHandling(handler);