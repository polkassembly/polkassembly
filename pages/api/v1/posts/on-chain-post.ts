// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { networkDocRef, postsByTypeRef } from '~src/api-utils/firestore_refs';
import { getFirestoreProposalType, getProposalTypeTitle, getSubsquidProposalType, ProposalType, VoteType } from '~src/global/proposalType';
import {
	GET_PROPOSAL_BY_INDEX_AND_TYPE,
	GET_COLLECTIVE_FELLOWSHIP_POST_BY_INDEX_AND_PROPOSALTYPE,
	GET_PARENT_BOUNTIES_PROPOSER_FOR_CHILD_BOUNTY,
	GET_ALLIANCE_ANNOUNCEMENT_BY_CID_AND_TYPE,
	GET_ALLIANCE_POST_BY_INDEX_AND_PROPOSALTYPE,
	GET_POLYMESH_PROPOSAL_BY_INDEX_AND_TYPE
} from '~src/queries';
import { firestore_db } from '~src/services/firebaseInit';
import { IApiResponse, IPostHistory } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import messages from '~src/util/messages';

import { getProposerAddressFromFirestorePostData } from '../listing/on-chain-posts';
import { getUpdatedAt } from './off-chain-post';
import { network as AllNetworks } from '~src/global/networkConstants';
import { splitterAndCapitalizer } from '~src/util/splitterAndCapitalizer';
import { getContentSummary } from '~src/util/getPostContentAiSummary';
import { getSubSquareContentAndTitle } from './subsqaure/subsquare-content';
import MANUAL_USERNAME_25_CHAR from '~src/auth/utils/manualUsername25Char';
import { containsBinaryData, convertAnyHexToASCII } from '~src/util/decodingOnChainInfo';
import dayjs from 'dayjs';
import { getVotesHistory } from '../votes/history';
import getEncodedAddress from '~src/util/getEncodedAddress';

import { getStatus } from '~src/components/Post/Comment/CommentsContainer';
import { generateKey } from '~src/util/getRedisKeys';
import { redisGet, redisSet } from '~src/auth/redis';

export const isDataExist = (data: any) => {
	return (data && data.proposals && data.proposals.length > 0 && data.proposals[0]) || (data && data.announcements && data.announcements.length > 0 && data.announcements[0]);
};

export const fetchSubsquare = async (network: string, id: string | number) => {
	try {
		const res = await fetch(`https://${network}.subsquare.io/api/gov2/referendums/${id}`);
		return await res.json();
	} catch (error) {
		return [];
	}
};

export const getTimeline = (
	proposals: any,
	isStatus?: {
		swap: boolean;
	}
) => {
	return (
		proposals?.map((obj: any) => {
			const statuses = obj?.statusHistory as { status: string }[];
			if (obj.type && ['ReferendumV2', 'FellowshipReferendum'].includes(obj.type)) {
				const index = statuses.findIndex((v) => v.status === 'DecisionDepositPlaced');
				if (index >= 0) {
					const decidingIndex = statuses.findIndex((v) => v.status === 'Deciding');
					if (decidingIndex >= 0) {
						const obj = statuses[index];
						statuses.splice(index, 1);
						statuses.splice(decidingIndex, 0, obj);
						if (isStatus) {
							isStatus.swap = true;
						}
					}
				}
			}
			return {
				created_at: obj?.createdAt,
				hash: obj?.hash,
				index: obj?.index,
				statuses,
				type: obj?.type
			};
		}) || []
	);
};

export interface IReactions {
	'👍': {
		count: number;
		usernames: string[];
	};
	'👎': {
		count: number;
		usernames: string[];
	};
}

export interface IPIPsVoting {
	balance: null | string;
	voter: null | string;
	decision: 'yes' | 'no';
	identityId: string;
}

export interface IPostResponse {
	post_reactions: IReactions;
	timeline: any[];
	comments: any;
	currentTimeline?: any;
	content: string;
	end?: number;
	delay?: number;
	vote_threshold?: any;
	created_at?: string;
	tippers?: any[];
	topic: {
		id: number;
		name: string;
	};
	decision?: string;
	last_edited_at?: string | Date;
	gov_type?: 'gov_1' | 'open_gov';
	tags?: string[] | [];
	history?: IPostHistory[];
	pips_voters?: IPIPsVoting[];
	title?: string;
	[key: string]: any;
}

export type IReaction = '👍' | '👎';

interface IGetOnChainPostParams {
	network: string;
	postId?: string | number | string[];
	voterAddress?: string | string[];
	proposalType: string | string[];
	isExternalApiCall?: boolean;
	noComments?: boolean;
}

export function getDefaultReactionObj(): IReactions {
	return {
		'👍': {
			count: 0,
			usernames: []
		},
		'👎': {
			count: 0,
			usernames: []
		}
	};
}

export function getReactions(reactionsQuerySnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>): IReactions {
	const reactions = getDefaultReactionObj();
	reactionsQuerySnapshot.docs.forEach((doc) => {
		if (doc && doc.exists) {
			const data = doc.data();
			if (data) {
				const { reaction, username } = data;
				if (['👍', '👎'].includes(reaction)) {
					reactions[reaction as IReaction].count++;
					reactions[reaction as IReaction].usernames.push(username);
				}
			}
		}
	});
	return reactions;
}

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

type TDocRef = FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;

interface IParams {
	data?: any;
	id: string;
	proposer?: string;
	network: string;
	proposalType: ProposalType;
	timeline: any[];
}

const isDefaultStringExist = (str: string, proposalType: any) => {
	const firstDefaultStr = `This is a ${getProposalTypeTitle(proposalType as ProposalType)}`;
	const secondDefaultStr = 'Only this user can edit this description and the title. If you own this account, login and tell us more about your proposal';
	if (!proposalType) return true;
	return str?.includes(firstDefaultStr) && str?.includes(secondDefaultStr);
};

const getAndSetNewData = async (params: IParams) => {
	const { timeline, network, id, proposalType, data, proposer } = params;

	let newData: {
		[key: string]: any;
	} = {
		content: '',
		id: proposalType === ProposalType.TIPS ? id : Number(id),
		title: ''
	};

	if ((!data?.title || !data.content || isDefaultStringExist(data.content, proposalType.toString())) && timeline && Array.isArray(timeline) && timeline.length > 1) {
		const resultDocList: TDocRef[] = [];
		const created_at = new Date();
		const docRefMap: {
			[key: string]: {
				data?: any;
				ref: TDocRef;
			};
		} = {};

		timeline.forEach((obj) => {
			const firestorePostType = getFirestoreProposalType(obj.type) as ProposalType;
			const postId = String(obj.index);
			const postRef = postsByTypeRef(network, firestorePostType).doc(postId);
			resultDocList.push(postRef);
			docRefMap[postRef.path] = {
				ref: postRef
			};
		});

		if (resultDocList.length > 0) {
			const results = await firestore_db.getAll(...resultDocList);
			if (results) {
				results.forEach((result) => {
					const path = result.ref.path;
					const pathArr = path.split('/');
					let data: FirebaseFirestore.DocumentData | undefined;
					if (result && result.exists) {
						data = result.data();
						if (data) {
							if (data?.title && !newData?.title) {
								newData.title = data?.title;
							}
							if (data.content && !isDefaultStringExist(data.content, pathArr.length > 3 ? pathArr[3] : '') && !newData.content) {
								newData.content = data.content;
								newData.user_id = data.user_id || data.author_id;
							}
							if (!newData.proposer_address) {
								newData.proposer_address = getProposerAddressFromFirestorePostData(data, network);
							}
							if (data.created_at && !newData.created_at) {
								newData.created_at = data.created_at;
							}
							if (!newData.topic_id) {
								newData.topic_id = getTopicFromFirestoreData(data, proposalType)?.id || null;
							}
							if (data.username && !newData.username) {
								newData.username = data.username;
							}
							if (data.post_link && !newData.post_link) {
								newData.post_link = data.post_link;
							}
							if (data.summary && !newData.summary) {
								newData.summary = data.summary;
							}
							if (data.tags && Array.isArray(data.tags)) {
								newData.tags = data?.tags;
							}
							if (data.gov_type) {
								newData.gov_type = data?.gov_type;
							}
						}
					}
					if (docRefMap[path]) {
						docRefMap[path].data = data;
					} else {
						docRefMap[path] = {
							data,
							ref: result.ref
						};
					}
				});
			}
		}
		if (newData?.title && newData.content) {
			const batch = firestore_db.batch();
			Object.entries(docRefMap).forEach(([key, value]) => {
				if (!(key && value)) return;
				// Getting post_types and postId from firestore doc path
				const colDocNameArr = key.split('/');
				if (colDocNameArr.length >= 6) {
					const pathPostType = colDocNameArr[3];
					const postId: string | number = colDocNameArr[5];
					// Constructing "dummy data" from existing "data" and "newData"
					const dummyData = value.data
						? {
								...value.data,
								content: value.data.content && !isDefaultStringExist(value?.data?.content, pathPostType) ? value.data.content : newData.content,
								title: value.data?.title ? value.data?.title : newData?.title,
								user_id: newData.user_id ? newData.user_id : value.data.user_id
						  }
						: {
								...newData,
								id: postId
						  };
					if (pathPostType !== 'tips') {
						const numPostId = Number(dummyData.id);
						if (!isNaN(numPostId)) {
							dummyData.id = numPostId;
						}
					}

					// Sanitization
					if (dummyData) {
						const realData: any = {};
						Object.entries(dummyData).forEach(([key, value]) => {
							if (value !== undefined && value !== null) {
								realData[key === 'author_id' ? 'user_id' : key] = value;
							}
						});
						if (!realData.created_at) {
							realData.created_at = created_at;
						}
						const date = getUpdatedAt(realData);
						if (!date) {
							realData.last_edited_at = new Date();
						} else if (realData.updated_at) {
							realData['last_edited_at'] = date;
							delete realData['updated_at'];
						}
						if (!realData.proposer_address && proposer) {
							realData.proposer_address = getSubstrateAddress(proposer);
						}
						if (realData.user_id && realData.id) {
							batch.set(value.ref, realData, { merge: true });
						}
					}
				}
			});
			batch
				.commit()
				.then(() => {})
				.catch((err) => {
					console.log('Error while creating posts of group', err);
				});
		}
	} else {
		newData = data;
	}
	return newData;
};

export async function getComments(
	commentsSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
	postDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
	network: string,
	postType: string,
	postIndex: number | string
): Promise<any[]> {
	const userIds = new Set<number>();
	const commentsPromise = commentsSnapshot.docs.map(async (doc) => {
		if (doc && doc.exists) {
			const data = doc.data();
			const history = data?.history
				? data.history.map((item: any) => {
						return { ...item, created_at: item?.created_at?.toDate ? item?.created_at.toDate() : item?.created_at };
				  })
				: [];
			const commentDocRef = postDocRef.collection('comments').doc(String(doc.id));
			const commentsReactionsSnapshot = await commentDocRef.collection('comment_reactions').get();
			const comment_reactions = getReactions(commentsReactionsSnapshot);
			const user = (await firestore_db.collection('users').doc(String(data.user_id)).get()).data();

			if (typeof data.user_id === 'number') {
				userIds.add(data.user_id);
			} else {
				const numUserId = Number(data.user_id);
				if (!isNaN(numUserId)) {
					userIds.add(numUserId);
				}
			}

			// Send empty comment data with username and userid if comment is deleted (for replies)
			const comment = data.isDeleted
				? {
						comment_reactions: getDefaultReactionObj(),
						comment_source: 'polkassembly',
						content: '[Deleted]',
						created_at: data.created_at?.toDate ? data.created_at.toDate() : data.created_at,
						history: [],
						id: data.id,
						is_custom_username: false,
						post_index: postIndex,
						post_type: postType,
						profile: user?.profile || null,
						proposer: data.proposer || '',
						replies: data.replies || ([] as any[]),
						sentiment: 0,
						spam_users_count: 0,
						updated_at: getUpdatedAt(data),
						user_id: data.user_id,
						username: data.username,
						votes: [] as any[]
				  }
				: {
						comment_reactions: comment_reactions,
						comment_source: data.comment_source || 'polkassembly',
						content: data.content,
						created_at: data.created_at?.toDate ? data.created_at.toDate() : data.created_at,
						history: history,
						id: data.id,
						is_custom_username: false,
						post_index: postIndex,
						post_type: postType,
						profile: user?.profile || null,
						proposer: data.proposer || '',
						replies: data.replies || ([] as any[]),
						sentiment: data.sentiment || 0,
						spam_users_count: 0,
						updated_at: getUpdatedAt(data),
						user_id: data.user_id,
						username: data.username,
						votes: [] as any[]
				  };

			const replyIds: string[] = [];
			const repliesSnapshot = await commentDocRef.collection('replies').orderBy('created_at', 'asc').get();
			repliesSnapshot.docs.forEach((doc) => {
				if (doc && doc.exists) {
					const data = doc.data();
					if (data) {
						const { created_at, id, username, comment_id, content, user_id } = data;
						if (id) {
							replyIds.push(id);
						}
						if (typeof user_id === 'number') {
							userIds.add(user_id);
						} else {
							const numUserId = Number(user_id);
							if (!isNaN(numUserId)) {
								userIds.add(numUserId);
							}
						}
						comment.replies.push({
							comment_id,
							content: data.isDeleted ? '[Deleted]' : content,
							created_at: created_at?.toDate ? created_at.toDate() : created_at,
							id: id,
							isDeleted: data.isDeleted || false,
							is_custom_username: false,
							post_index: postIndex,
							post_type: postType,
							proposer: '',
							spam_users_count: 0,
							updated_at: getUpdatedAt(data),
							user_id: user_id,
							username
						});
					}
				}
			});

			if (replyIds.length > 0) {
				const chunkSize = 30;
				const totalChunks = Math.ceil(replyIds.length / chunkSize);
				for (let i = 0; i < totalChunks; i++) {
					const startIndex = i * chunkSize;
					const endIndex = startIndex + chunkSize;
					const slice = replyIds.slice(startIndex, endIndex);
					if (slice.length > 0) {
						const reportsQuery = await networkDocRef(network)
							.collection('reports')
							.where('type', '==', 'reply')
							.where('proposal_type', '==', postType)
							.where('content_id', 'in', slice)
							.get();
						reportsQuery.docs.map((doc) => {
							if (doc && doc.exists) {
								const data = doc.data();
								comment.replies = comment.replies.map((v: any) => {
									if (v && v.id == data.content_id) {
										return {
											...v,
											spam_users_count: Number(v.spam_users_count) + 1
										};
									}
									return v;
								});
							}
						});
					}
				}
			}
			return {
				...comment,
				replies: comment.replies.map((reply: any) => {
					return {
						...reply,
						spam_users_count: checkReportThreshold(Number(reply?.spam_users_count))
					};
				})
			};
		}
	});

	const commentIds: string[] = [];
	let comments = await Promise.all(commentsPromise);
	comments = comments.reduce((prev, comment) => {
		if (comment) {
			const { id } = comment;
			if (id) {
				commentIds.push(id);
			}
			prev.push(comment);
		}
		return prev;
	}, [] as any[]);

	const newIds = Array.from(userIds);
	const userIdToUserMap: {
		[key: number]: {
			username: string;
			proposer: string;
			is_custom_username: boolean;
		};
	} = {};

	if (newIds.length > 0) {
		const chunkSize = 30;
		const totalChunks = Math.ceil(newIds.length / chunkSize);
		for (let i = 0; i < totalChunks; i++) {
			const startIndex = i * chunkSize;
			const endIndex = startIndex + chunkSize;
			const slice = newIds.slice(startIndex, endIndex);
			if (slice.length > 0) {
				const usersQuery = await firestore_db.collection('users').where('id', 'in', slice).get();
				usersQuery.docs.forEach((doc) => {
					if (doc && doc.exists) {
						const data = doc.data();
						userIdToUserMap[data.id] = {
							is_custom_username: MANUAL_USERNAME_25_CHAR.includes(data.username) || data.custom_username || data.username.length !== 25,
							proposer: userIdToUserMap?.[data.user_id]?.proposer || '',
							username: data.username || ''
						};
					}
				});
				const addressesQuery = await firestore_db.collection('addresses').where('user_id', 'in', slice).where('default', '==', true).get();
				addressesQuery.docs.forEach((doc) => {
					if (doc && doc.exists) {
						const data = doc.data();
						userIdToUserMap[data.user_id] = {
							is_custom_username: userIdToUserMap?.[data.user_id]?.is_custom_username,
							proposer: data.address,
							username: userIdToUserMap?.[data.user_id]?.username || ''
						};
					}
				});
			}
		}
	}

	if (commentIds.length > 0) {
		const chunkSize = 30;
		const totalChunks = Math.ceil(commentIds.length / chunkSize);
		for (let i = 0; i < totalChunks; i++) {
			const startIndex = i * chunkSize;
			const endIndex = startIndex + chunkSize;
			const slice = commentIds.slice(startIndex, endIndex);
			if (slice.length > 0) {
				const reportsQuery = await networkDocRef(network)
					.collection('reports')
					.where('type', '==', 'comment')
					.where('proposal_type', '==', postType)
					.where('content_id', 'in', slice)
					.get();
				reportsQuery.docs.map((doc) => {
					if (doc && doc.exists) {
						const data = doc.data();
						comments = comments.map((v) => {
							if (v && v.id == data.content_id) {
								return {
									...v,
									spam_users_count: Number(v.spam_users_count) + 1
								};
							}
							return v;
						});
					}
				});
			}
		}
	}

	const commentsPromiseWithVote = comments.map(async (comment) => {
		if (comment && userIdToUserMap[comment?.user_id]) {
			comment.proposer = userIdToUserMap[comment.user_id].proposer || comment.proposer;
			comment.username = userIdToUserMap[comment.user_id].username || comment.username;
			comment.is_custom_username = userIdToUserMap[comment.user_id].is_custom_username;
			if (postType !== ProposalType.DISCUSSIONS) {
				const voteHistoryParams = {
					listingLimit: 2,
					network,
					page: 1,
					proposalIndex: postIndex,
					proposalType: postType,
					voterAddress: getEncodedAddress(comment.proposer, network) || comment.proposer
				};
				const { data = null } = await getVotesHistory(voteHistoryParams);
				if (data && data.count > 0) {
					comment.votes = data.votes;
				}
			} else {
				comment.votes = [];
			}
			if (comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0) {
				comment.replies = comment.replies.map((reply) => {
					if (reply && userIdToUserMap[reply?.user_id]) {
						reply.proposer = userIdToUserMap[reply.user_id].proposer || reply.proposer;
						reply.username = userIdToUserMap[reply.user_id].username || reply.username;
						reply.is_custom_username = userIdToUserMap[reply.user_id].is_custom_username;
					}
					return reply;
				});
			}
		}
		return {
			...comment,
			spam_users_count: checkReportThreshold(Number(comment?.spam_users_count))
		};
	});

	return await Promise.all(commentsPromiseWithVote);
}

export async function getOnChainPost(params: IGetOnChainPostParams): Promise<IApiResponse<IPostResponse>> {
	try {
		const { network, postId, voterAddress, proposalType, isExternalApiCall, noComments = true } = params;

		const numPostId = Number(postId);
		const strPostId = String(postId);
		if (proposalType === ProposalType.TIPS) {
			if (!strPostId) {
				throw apiErrorWithStatusCode(`The Tip hash "${postId} is invalid."`, 400);
			}
		} else if ((isNaN(numPostId) || numPostId < 0) && proposalType !== ProposalType.ANNOUNCEMENT) {
			throw apiErrorWithStatusCode(`The postId "${postId}" is invalid.`, 400);
		}

		const strProposalType = String(proposalType) as ProposalType;
		if (!isProposalTypeValid(strProposalType)) {
			throw apiErrorWithStatusCode(`The proposal type "${proposalType}" is invalid.`, 400);
		}
		const topicFromType = getTopicFromType(proposalType as ProposalType);

		const subsquidProposalType = getSubsquidProposalType(proposalType as any);

		if (proposalType === ProposalType.REFERENDUM_V2 && !isExternalApiCall && process.env.IS_CACHING_ALLOWED == '1') {
			const redisKey = generateKey({ govType: 'OpenGov', keyType: 'postId', network, postId: postId, subsquidProposalType, voterAddress: voterAddress });
			const redisData = await redisGet(redisKey);
			if (redisData) {
				return {
					data: JSON.parse(redisData),
					error: null,
					status: 200
				};
			}
		}

		const netDocRef = networkDocRef(network);

		let postVariables: any =
			proposalType === ProposalType.ANNOUNCEMENT
				? {
						cid: postId,
						type_eq: subsquidProposalType
				  }
				: {
						index_eq: numPostId,
						type_eq: subsquidProposalType,
						voter_eq: voterAddress ? String(voterAddress) : ''
				  };

		let postQuery =
			network === AllNetworks.COLLECTIVES || network === AllNetworks.WESTENDCOLLECTIVES ? GET_ALLIANCE_POST_BY_INDEX_AND_PROPOSALTYPE : GET_PROPOSAL_BY_INDEX_AND_TYPE;

		if (network === AllNetworks.COLLECTIVES && proposalType === ProposalType.FELLOWSHIP_REFERENDUMS) {
			postQuery = GET_COLLECTIVE_FELLOWSHIP_POST_BY_INDEX_AND_PROPOSALTYPE;
		}

		if (proposalType === ProposalType.ANNOUNCEMENT) {
			postQuery = GET_ALLIANCE_ANNOUNCEMENT_BY_CID_AND_TYPE;
		}

		if (proposalType === ProposalType.TIPS) {
			postVariables = {
				hash_eq: strPostId,
				type_eq: subsquidProposalType
			};
		} else if (proposalType === ProposalType.DEMOCRACY_PROPOSALS) {
			postVariables['vote_type_eq'] = VoteType.DEMOCRACY_PROPOSAL;
		} else if (network === 'polymesh') {
			postQuery = GET_POLYMESH_PROPOSAL_BY_INDEX_AND_TYPE;
			postVariables = {
				index_eq: numPostId,
				type_eq: subsquidProposalType
			};
		}

		let subsquidRes: any = {};
		try {
			subsquidRes = await fetchSubsquid({
				network,
				query: postQuery,
				variables: postVariables
			});
		} catch (error) {
			const data = await fetchSubsquare(network, strPostId);
			if (data) {
				subsquidRes['data'] = {
					proposals: [
						{
							createdAt: data?.createdAt,
							curator: data?.proposer,
							curatorDeposit: null,
							deciding: data?.onchainData?.info?.deciding,
							decisionDeposit: data?.onchainData?.info?.decisionDeposit,
							delay: null,
							deposit: data?.onchainData?.info?.deposit,
							description: null,
							enactmentAfterBlock: data?.onchainData?.info?.enactment?.after,
							enactmentAtBlock: data?.onchainData?.info?.enactment?.at,
							end: data?.onchainData?.enactment?.when,
							endedAt: null,
							endedAtBlock: null,
							fee: null,
							hash: data?.onchainData?.proposalHash,
							index: data?.referendumIndex,
							preimage: {
								method: data?.onchainData?.proposal?.method,
								proposedCall: data?.onchainData?.proposal?.call,
								section: data?.onchainData?.proposal?.section
							},
							proposalArguments: null,
							proposer: data?.proposer,
							status: data?.state?.name,
							statusHistory: data?.onchainData?.timeline?.map((obj: any) => {
								if (obj?.name === 'DecisionStarted') {
									obj.name = 'Deciding';
								}
								return {
									block: obj?.indexer?.blockHeight,
									status: obj.name,
									timestamp: obj?.indexer?.blockTime
								};
							}),
							submissionDeposit: data?.onchainData?.info?.submissionDeposit,
							tally: data?.onchainData?.tally,
							timeline: null,
							trackNumber: data?.track,
							type: 'ReferendumV2'
						}
					]
				};
			}
		}

		// Post
		const subsquidData = subsquidRes?.data;
		if (!isDataExist(subsquidData)) {
			throw apiErrorWithStatusCode(`The Post with index "${postId}" is not found.`, 404);
		}

		const postData = subsquidData.proposals?.[0] || subsquidData.announcements?.[0];
		const preimage = postData?.preimage;
		const proposalArguments = postData?.proposalArguments || postData?.callData;
		const proposedCall = preimage?.proposedCall;
		let remark = '';
		let requested = BigInt(0);
		if (proposedCall?.args) {
			proposedCall.args = convertAnyHexToASCII(proposedCall.args, network);
			if (proposedCall.args.amount) {
				requested = proposedCall.args.amount;
			} else {
				const calls = proposedCall.args.calls;
				if (calls && Array.isArray(calls) && calls.length > 0) {
					calls.forEach((call) => {
						if (call && call.remark && typeof call.remark === 'string' && !containsBinaryData(call.remark)) {
							remark += call.remark + '\n';
						}
						if (call && call.amount) {
							requested += BigInt(call.amount);
						}
					});
				}
			}
		}
		const status = postData?.status;
		let proposer = postData?.proposer || preimage?.proposer || postData?.curator;
		if (!proposer && (postData?.parentBountyIndex || postData?.parentBountyIndex === 0)) {
			const subsquidRes = await fetchSubsquid({
				network,
				query: GET_PARENT_BOUNTIES_PROPOSER_FOR_CHILD_BOUNTY,
				variables: {
					index_in: [postData?.parentBountyIndex],
					limit: 1
				}
			});
			if (subsquidRes && subsquidRes?.data) {
				const subsquidData = subsquidRes?.data;
				if (subsquidData.proposals && Array.isArray(subsquidData.proposals) && subsquidData.proposals.length > 0) {
					const subsquidPosts: any[] = subsquidData?.proposals || [];
					subsquidPosts.forEach((post) => {
						if (postData?.parentBountyIndex === post.index && post) {
							proposer = post.proposer || post.curator || (post?.preimage ? post?.preimage?.proposer : '');
						}
					});
				}
			}
		}

		const post: IPostResponse = {
			announcement: postData?.announcement,
			bond: postData?.bond,
			cid: postData?.cid,
			code: postData?.code,
			codec: postData?.codec,
			comments: [],
			content: '',
			created_at: postData?.createdAt,
			curator: postData?.curator,
			curator_deposit: postData?.curatorDeposit,
			deciding: postData?.deciding,
			decision_deposit_amount: postData?.decisionDeposit?.amount,
			delay: postData?.delay,
			deposit: postData?.deposit,
			description: postData?.description,
			enactment_after_block: postData?.enactmentAfterBlock,
			enactment_at_block: postData?.enactmentAtBlock,
			end: postData?.end,
			ended_at: postData?.endedAt,
			ended_at_block: postData?.endedAtBlock,
			fee: postData?.fee,
			hash: postData?.hash || preimage?.hash,
			history: [],
			identity: postData?.identity || null,
			last_edited_at: undefined,
			member_count: postData?.threshold?.value,
			method: preimage?.method || proposedCall?.method || proposalArguments?.method,
			motion_method: proposalArguments?.method,
			origin: postData?.origin,
			payee: postData?.payee,
			pips_voters: postData?.voting || [],
			post_id: postData?.index,
			post_reactions: getDefaultReactionObj(),
			proposal_arguments: proposalArguments,
			proposed_call: proposedCall,
			proposer,
			requested: requested ? requested.toString() : undefined,
			reward: postData?.reward,
			status,
			statusHistory: postData?.statusHistory,
			submission_deposit_amount: postData?.submissionDeposit?.amount,
			submitted_amount: postData?.submissionDeposit?.amount,
			subscribers: [],
			tally: postData?.tally,
			timeline: [],
			topic: topicFromType,
			track_number: postData?.trackNumber,
			type: postData?.type || getSubsquidProposalType(proposalType as any),
			version: postData?.version,
			vote_threshold: postData?.threshold?.type
		};
		// Timeline
		updatePostTimeline(post, postData);

		if (proposalType === ProposalType.ANNOUNCEMENT) {
			const proposal = postData.proposal;
			const isStatus = {
				swap: false
			};
			const proposalTimeline = getTimeline(
				[
					{
						createdAt: proposal.createdAt,
						hash: proposal.hash,
						index: proposal.index,
						statusHistory: proposal.statusHistory,
						type: proposal.type
					}
				],
				isStatus
			);
			post.timeline = [...proposalTimeline, ...post.timeline];
			if (isStatus.swap) {
				if (post.status === 'DecisionDepositPlaced') {
					post.status = 'Deciding';
				}
			}
		}
		if (proposalType === ProposalType.ALLIANCE_MOTION) {
			const announcement = postData.announcement;
			if (announcement) {
				const isStatus = {
					swap: false
				};
				const announcementTimeline = getTimeline(
					[
						{
							createdAt: announcement.createdAt,
							hash: announcement.hash,
							index: announcement.cid,
							statusHistory: announcement.statusHistory,
							type: announcement.type
						}
					],
					isStatus
				);
				post.timeline = [...post.timeline, ...announcementTimeline];
				if (isStatus.swap) {
					if (post.status === 'DecisionDepositPlaced') {
						post.status = 'Deciding';
					}
				}
			}
		}

		if (['referendums', 'open_gov'].includes(strProposalType) && voterAddress && postData?.votes?.[0]?.decision) {
			post['decision'] = postData?.votes?.[0]?.decision;
		}

		// deadline in treasury post
		if (proposalType === ProposalType.TREASURY_PROPOSALS) {
			post.deadline = null;
			const eventSnapshot = await netDocRef.collection('events').where('post_id', '==', strPostId).limit(1).get();
			if (eventSnapshot.size > 0) {
				const doc = eventSnapshot.docs[0];
				if (doc && doc.exists) {
					post.deadline = doc.data().end_time || null;
				}
			}
		}

		// Tippers
		if (proposalType === ProposalType.TIPS) {
			post.tippers =
				subsquidData?.tippersConnection?.edges?.reduce((tippers: any[], edge: any) => {
					if (edge && edge?.node) {
						tippers.push(edge.node);
					}
					return tippers;
				}, []) || [];
		}

		// Council motions votes
		if (proposalType === ProposalType.COUNCIL_MOTIONS) {
			post.motion_votes =
				subsquidData?.votesConnection?.edges?.reduce((motion_votes: any[], edge: any) => {
					if (edge && edge?.node) {
						motion_votes.push(edge.node);
					}
					return motion_votes;
				}, []) || [];
		}

		// Democracy proposals votes TotalCount
		if (proposalType === ProposalType.DEMOCRACY_PROPOSALS) {
			const numTotalCount = Number(subsquidData?.votesConnection?.totalCount);
			post.seconds = isNaN(numTotalCount) ? 0 : numTotalCount;
		}

		// Alliance motions votes
		if (proposalType === ProposalType.ALLIANCE_MOTION) {
			post.motion_votes = postData.voting;
		}

		// Child Bounties
		if (proposalType === ProposalType.BOUNTIES) {
			post.child_bounties_count = subsquidData?.proposalsConnection?.totalCount || 0;
			post.child_bounties =
				subsquidData?.proposalsConnection?.edges?.reduce((child_bounties: any[], edge: any) => {
					if (edge && edge?.node) {
						child_bounties.push(edge.node);
					}
					return child_bounties;
				}, []) || [];
		}
		if (proposalType === ProposalType.CHILD_BOUNTIES) {
			post.parent_bounty_index = postData?.parentBountyIndex;
		}

		const postDocRef = postsByTypeRef(network, strProposalType.toString() === 'open_gov' ? ProposalType.REFERENDUM_V2 : strProposalType).doc(strPostId);
		const firestorePost = await postDocRef.get();
		if (firestorePost) {
			let data = firestorePost.data();
			// traverse the group, get and set the data.
			const history = data?.history
				? data?.history.map((item: any) => {
						return { ...item, created_at: item?.created_at?.toDate ? item?.created_at.toDate() : item?.created_at };
				  })
				: [];
			post.history = history;
			try {
				data = await getAndSetNewData({
					data,
					id: strPostId,
					network,
					proposalType: strProposalType,
					proposer: post.proposer,
					timeline: post?.timeline
				});
			} catch (e) {
				data = undefined;
			}
			// Populate firestore post data into the post object
			if (data && post) {
				post.summary = data.summary;
				post.topic = getTopicFromFirestoreData(data, strProposalType);
				post.content = data.content;
				if (!post.proposer) {
					post.proposer = getProposerAddressFromFirestorePostData(data, network);
				}
				post.user_id = data.user_id;
				post.title = data?.title;
				post.last_edited_at = getUpdatedAt(data);
				post.tags = data?.tags;
				post.gov_type = data?.gov_type;
				post.subscribers = data?.subscribers || [];
				const post_link = data?.post_link;
				if (post_link) {
					const { id, type } = post_link;
					const postDocRef = postsByTypeRef(network, type).doc(String(id));
					const postDoc = await postDocRef.get();
					const postData = postDoc.data();
					if (postDoc.exists && postData) {
						post_link.title = postData?.title;
						post_link.description = postData.content;
						post_link.created_at = postData?.created_at?.toDate ? postData?.created_at?.toDate() : postData?.created_at;
						post_link.last_edited_at = getUpdatedAt(postData);
						post_link.topic = getTopicFromFirestoreData(postData, strProposalType);
						post_link.username = postData?.username;
						if (postData?.user_id === post.user_id) {
							post_link.proposer = post.proposer;
						}
						if (post.timeline && Array.isArray(post.timeline)) {
							post.timeline.splice(0, 0, {
								created_at: postData?.created_at?.toDate ? postData?.created_at?.toDate() : postData?.created_at,
								index: Number(id),
								statuses: [
									{
										status: 'Created',
										timestamp: postData?.created_at?.toDate ? postData?.created_at?.toDate() : postData?.created_at
									}
								],
								type: 'Discussions'
							});
						}
					}
				}
				post.post_link = post_link;
				post.isSpam = data?.isSpam || false;
				post.isSpamReportInvalid = data?.isSpamReportInvalid || false;
			}

			if (post.content === '' || post.title === '' || post.title === undefined || post.content === undefined) {
				const res = await getSubSquareContentAndTitle(proposalType, network, numPostId);
				post.content = res.content;
				post.title = res.title;
			}
		}

		// Comments
		if (noComments) {
			if (post.timeline && Array.isArray(post.timeline) && post.timeline.length > 0) {
				const commentPromises = post.timeline.map(async (timeline: any) => {
					const postDocRef = postsByTypeRef(network, getFirestoreProposalType(timeline.type) as ProposalType).doc(String(timeline.type === 'Tip' ? timeline.hash : timeline.index));
					const commentsCount = (await postDocRef.collection('comments').where('isDeleted', '==', false).count().get()).data().count;
					return { ...timeline, commentsCount };
				});
				const timelines: Array<any> = await Promise.allSettled(commentPromises);
				post.timeline = timelines.map((timeline) => timeline.value);
			}
			const currentTimelineObj = post.timeline?.[0] || null;
			if (currentTimelineObj) {
				post.currentTimeline = {
					commentsCount: currentTimelineObj.commentsCount,
					date: dayjs(currentTimelineObj?.created_at),
					firstCommentId: '',
					id: 1,
					index: currentTimelineObj?.index?.toString() || currentTimelineObj?.hash,
					status: getStatus(currentTimelineObj?.type),
					type: currentTimelineObj?.type
				};
			}
		} else {
			if (post.timeline && Array.isArray(post.timeline) && post.timeline.length > 0) {
				const commentPromises = post.timeline.map(async (timeline: any) => {
					const post_index = timeline.type === 'Tip' ? timeline.hash : timeline.index;
					const type = getFirestoreProposalType(timeline.type) as ProposalType;
					const postDocRef = postsByTypeRef(network, type).doc(String(post_index));
					const commentsSnapshot = await postDocRef.collection('comments').get();
					const comments = await getComments(commentsSnapshot, postDocRef, network, type, post_index);
					return comments;
				});
				const commentPromiseSettledResults = await Promise.allSettled(commentPromises);
				commentPromiseSettledResults.forEach((result) => {
					if (result && result.status === 'fulfilled' && result.value && Array.isArray(result.value)) {
						if (!post.comments || !Array.isArray(post.comments)) {
							post.comments = [];
						}
						post.comments = post.comments.concat(result.value);
					}
				});
			} else {
				if (post.post_link) {
					const { id, type } = post.post_link;
					const postDocRef = postsByTypeRef(network, type).doc(String(id));
					const commentsSnapshot = await postDocRef.collection('comments').get();
					post.comments = await getComments(commentsSnapshot, postDocRef, network, type, id);
				}
				const commentsSnapshot = await postDocRef.collection('comments').get();
				const comments = await getComments(
					commentsSnapshot,
					postDocRef,
					network,
					strProposalType.toString() === 'open_gov' ? ProposalType.REFERENDUM_V2 : strProposalType,
					strProposalType === ProposalType.TIPS ? strPostId : numPostId
				);
				if (post.comments && Array.isArray(post.comments)) {
					post.comments = post.comments.concat(comments);
				} else {
					post.comments = comments;
				}
			}
			post.comments_count = post.comments.length;
		}

		// Post Reactions
		const postReactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
		post.post_reactions = getReactions(postReactionsQuerySnapshot);

		// spam users count
		if (post?.isSpam) {
			const threshold = process.env.REPORTS_THRESHOLD || 50;
			post.spam_users_count = Number(threshold);
		} else {
			// Check if it is a spam or not
			post.spam_users_count = await getSpamUsersCount(network, proposalType, proposalType === ProposalType.TIPS ? strPostId : numPostId, 'post');
		}

		if (post?.isSpamReportInvalid) {
			post.spam_users_count = 0;
		}

		if (!post.content || post.content?.trim().length === 0) {
			if (remark) {
				post.content = remark.replace(/\n/g, '<br/>');
			} else {
				const proposer = post.proposer;
				const identity = post?.identity;
				if (proposer) {
					post.content = `This is a ${getProposalTypeTitle(
						proposalType as ProposalType
					)} whose proposer address (${proposer}) is shown in on-chain info below. Only this user can edit this description and the title. If you own this account, login and tell us more about your proposal.`;
					if (network === AllNetworks.POLYMESH) {
						post.content = `This is a pip whose DID (${identity}) is shown in on-chain info below. Only this user can edit this description and the title. If you own this account, login and tell us more about your proposal.`;
					}
				} else {
					post.content = `This is a ${getProposalTypeTitle(
						proposalType as ProposalType
					)}. Only the proposer can edit this description and the title. If you own this account, login and tell us more about your proposal.`;
				}
			}
		}

		if ((proposalType === ProposalType.ALLIANCE_MOTION || proposalType === ProposalType.ANNOUNCEMENT) && !post.title) {
			post.title = splitterAndCapitalizer(postData?.callData?.method || '', '_') || postData?.cid;
		}
		await getContentSummary(post, network, isExternalApiCall);
		if (proposalType === ProposalType.REFERENDUM_V2 && !isExternalApiCall && process.env.IS_CACHING_ALLOWED == '1') {
			await redisSet(generateKey({ govType: 'OpenGov', keyType: 'postId', network, postId: postId, subsquidProposalType, voterAddress: voterAddress }), JSON.stringify(post));
		}
		return {
			data: JSON.parse(JSON.stringify(post)),
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
}

export const getSpamUsersCount = async (network: string, proposalType: any, postId: string | number, type: 'post' | 'comment') => {
	const countQuery = await networkDocRef(network)
		.collection('reports')
		.where('type', '==', type)
		.where('proposal_type', '==', proposalType)
		.where('content_id', '==', postId)
		.count()
		.get();
	const data = countQuery.data();
	const totalUsers = data.count || 0;

	return checkReportThreshold(totalUsers);
};

export const checkReportThreshold = (totalUsers?: number) => {
	const threshold = process.env.REPORTS_THRESHOLD;

	if (threshold && totalUsers) {
		if (Number(totalUsers) >= Number(threshold)) {
			return totalUsers;
		}
		return 0;
	}
	return totalUsers || 0;
};

export const updatePostTimeline = (post: any, postData: any) => {
	if (post && postData) {
		const isStatus = {
			swap: false
		};
		if (postData.group && postData.group.proposals) {
			// Timeline
			const timelineProposals = postData?.group?.proposals || [];
			post.timeline = getTimeline(timelineProposals, isStatus);
			// Proposer and Curator address
			if (timelineProposals && Array.isArray(timelineProposals)) {
				for (let i = 0; i < timelineProposals.length; i++) {
					if (post.proposer && post.curator) {
						break;
					}
					const obj = timelineProposals[i];
					if (!post.proposer) {
						if (obj.proposer) {
							post.proposer = obj.proposer;
						} else if (obj?.preimage?.proposer) {
							post.proposer = obj.preimage.proposer;
						}
					}
					if (!post.curator && obj.curator) {
						post.curator = obj.curator;
					}
				}
			}
		}
		if (!post.timeline || post.timeline.length === 0) {
			post.timeline = getTimeline(
				[
					{
						createdAt: postData?.createdAt,
						hash: postData?.hash,
						index: postData?.index || postData?.cid,
						statusHistory: postData?.statusHistory,
						type: postData?.type
					}
				],
				isStatus
			);
		}

		if (isStatus.swap) {
			if (post.status === 'DecisionDepositPlaced') {
				post.status = 'Deciding';
			}
		}
	}
};

// expects optional proposalType and postId of proposal
const handler: NextApiHandler<IPostResponse | { error: string }> = async (req, res) => {
	const { postId = 0, proposalType = ProposalType.DEMOCRACY_PROPOSALS, voterAddress } = req.query;

	// TODO: take proposalType and postId in dynamic pi route

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ error: 'Invalid network in request header' });
	const { data, error, status } = await getOnChainPost({
		isExternalApiCall: true,
		network,
		noComments: false,
		postId,
		proposalType,
		voterAddress
	});

	if (error || !data) {
		return res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	} else {
		if (data.summary) {
			delete data.summary;
		}
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
