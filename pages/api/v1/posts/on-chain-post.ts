// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { networkDocRef, postsByTypeRef } from '~src/api-utils/firestore_refs';
import { getFirestoreProposalType, getProposalTypeTitle, getSubsquidProposalType, ProposalType, VoteType } from '~src/global/proposalType';
import { GET_PROPOSAL_BY_INDEX_AND_TYPE, GET_PARENT_BOUNTIES_PROPOSER_FOR_CHILD_BOUNTY } from '~src/queries';
import { firestore_db } from '~src/services/firebaseInit';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import messages from '~src/util/messages';

import { getProposerAddressFromFirestorePostData } from '../listing/on-chain-posts';
import { getUpdatedAt } from './off-chain-post';

export const isDataExist = (data: any) => {
	return (data && data.proposals && data.proposals.length > 0 && data.proposals[0]);
};

export const getTimeline = (proposals: any, isStatus?: {
	swap: boolean;
}) => {
	return proposals.map((obj: any) => {
		const statuses = obj?.statusHistory as { status: string }[];
		if (obj.type === 'ReferendumV2') {
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
	}) || [];
};

export interface IReactions {
	'👍': {
		count: number,
		usernames: string[]
	};
	'👎': {
		count: number;
		usernames: string[];
	};
}

export interface IPostResponse {
	post_reactions: IReactions;
	timeline: any[];
	comments: any[];
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
	last_edited_at?: string | Date | null;
	[key: string]: any;
  gov_type?: 'gov_1' | 'open_gov' ;
  tags?: string[] | [];
}

export type IReaction = '👍' | '👎';

interface IGetOnChainPostParams {
	network: string;
	postId?: string | number | string[];
	voterAddress?: string | string[];
	proposalType: string | string[];
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

const getTopicFromFirestoreData = (data: any, proposalType: ProposalType) => {
	if (data) {
		const topic = data.topic;
		const topic_id = data.topic_id;
		return topic? topic: isTopicIdValid(topic_id)? {
			id: topic_id,
			name: getTopicNameFromTopicId(topic_id)
		}: getTopicFromType(proposalType);
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
		id: proposalType === ProposalType.TIPS? id: Number(id),
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
							if (data.content && !isDefaultStringExist(data.content, (pathArr.length > 3? pathArr[3]: '')) && !newData.content) {
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
							if(data.tags){
								newData.tags = data?.tags;
							}
							if(data.gov_type){
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
					const dummyData = value.data? {
						...value.data,
						content: (value.data.content && !isDefaultStringExist(value?.data?.content, pathPostType))? value.data.content: newData.content,
						title: value.data?.title? value.data?.title: newData?.title,
						user_id: newData.user_id? newData.user_id: value.data.user_id
					}: {
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
								realData[key === 'author_id'? 'user_id': key] = value;
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
			batch.commit()
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

export async function getComments(commentsSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>, postDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>): Promise<any[]> {
	const commentsPromise = commentsSnapshot.docs.map(async (doc) => {
		if (doc && doc.exists) {
			const data = doc.data();
			const commentDocRef = postDocRef.collection('comments').doc(String(doc.id));
			const commentsReactionsSnapshot = await commentDocRef.collection('comment_reactions').get();
			const comment_reactions = getReactions(commentsReactionsSnapshot);
			const comment = {
				comment_reactions: comment_reactions,
				content: data.content,
				created_at: data.created_at?.toDate? data.created_at.toDate(): data.created_at,
				id: data.id,
				proposer: '',
				replies: [] as any[],
				sentiment:data.sentiment||0,
				updated_at: getUpdatedAt(data),
				user_id: data.user_id || data.user_id,
				username: data.username
			};

			const repliesSnapshot = await commentDocRef.collection('replies').orderBy('created_at', 'asc').get();
			repliesSnapshot.docs.forEach((doc) => {
				if (doc && doc.exists) {
					const data = doc.data();
					if (data) {
						const { created_at, id, username, comment_id, content, user_id } = data;
						comment.replies.push({
							comment_id,
							content,
							created_at: created_at?.toDate? created_at.toDate(): created_at,
							id: id,
							proposer: '',
							updated_at: getUpdatedAt(data),
							user_id: user_id || user_id,
							username
						});
					}
				}
			});

			const idsSet = new Set<number>();
			comment.replies.forEach((reply) => {
				if (reply) {
					const { user_id } = reply;
					if (typeof user_id === 'number') {
						idsSet.add(user_id);
					} else {
						const numUserId = Number(user_id);
						if (!isNaN(numUserId)) {
							idsSet.add(numUserId);
						}
					}
				}
			});

			const newIds = Array.from(idsSet);

			if (newIds.length > 0) {
				const newIdsLen = newIds.length;
				let lastIndex = 0;
				for (let i = 0; i < newIdsLen; i+=30) {
					lastIndex = i;
					const addressesQuery = await firestore_db.collection('addresses').where('user_id', 'in', newIds.slice(i, newIdsLen > (i + 30)? (i + 30): newIdsLen)).where('default', '==', true).get();
					addressesQuery.docs.map((doc) => {
						if (doc && doc.exists) {
							const data = doc.data();
							comment.replies = comment.replies.map((v) => {
								if (v && v.user_id == data.user_id) {
									return {
										...v,
										proposer: data.address
									};
								}
								return v;
							});
						}
					});
				}
				lastIndex += 30;
				if (lastIndex <= newIdsLen) {
					const addressesQuery = await firestore_db.collection('addresses').where('user_id', 'in', newIds.slice(lastIndex, (lastIndex === newIdsLen)? (newIdsLen + 1): newIdsLen)).where('default', '==', true).get();
					addressesQuery.docs.map((doc) => {
						if (doc && doc.exists) {
							const data = doc.data();
							comment.replies = comment.replies.map((v) => {
								if (v && v.user_id == data.user_id) {
									return {
										...v,
										proposer: data.address
									};
								}
								return v;
							});
						}
					});
				}
			}
			return comment;
		}
	});
	let comments = await Promise.all(commentsPromise);
	comments =  comments.reduce((prev, comment) => {
		if (comment) {
			prev.push(comment);
		}
		return prev;
	}, [] as any[]);

	const idsSet = new Set<number>();
	comments.forEach((comment) => {
		if (comment) {
			const { user_id } = comment;
			if (typeof user_id === 'number') {
				idsSet.add(user_id);
			} else {
				const numUserId = Number(user_id);
				if (!isNaN(numUserId)) {
					idsSet.add(numUserId);
				}
			}
		}
	});

	const newIds = Array.from(idsSet);

	if (newIds.length > 0) {
		const newIdsLen = newIds.length;
		let lastIndex = 0;
		for (let i = 0; i < newIdsLen; i+=30) {
			lastIndex = i;
			const addressesQuery = await firestore_db.collection('addresses').where('user_id', 'in', newIds.slice(i, newIdsLen > (i + 30)? (i + 30): newIdsLen)).where('default', '==', true).get();
			addressesQuery.docs.map((doc) => {
				if (doc && doc.exists) {
					const data = doc.data();
					comments = comments.map((v) => {
						if (v && v.user_id == data.user_id) {
							return {
								...v,
								proposer: data.address
							};
						}
						return v;
					});
				}
			});
		}
		if (lastIndex <= newIdsLen) {
			const addressesQuery = await firestore_db.collection('addresses').where('user_id', 'in', newIds.slice(lastIndex, (lastIndex === newIdsLen)? (newIdsLen + 1): newIdsLen)).where('default', '==', true).get();
			addressesQuery.docs.map((doc) => {
				if (doc && doc.exists) {
					const data = doc.data();
					comments = comments.map((v) => {
						if (v && v.user_id == data.user_id) {
							return {
								...v,
								proposer: data.address
							};
						}
						return v;
					});
				}
			});
		}
	}

	return comments;
}

export async function getOnChainPost(params: IGetOnChainPostParams) : Promise<IApiResponse<IPostResponse>> {
	try {
		const { network, postId, voterAddress, proposalType } = params;
		const netDocRef = networkDocRef(network);

		const numPostId = Number(postId);
		const strPostId = String(postId);
		if (proposalType === ProposalType.TIPS) {
			if (!strPostId) {
				throw apiErrorWithStatusCode(`The Tip hash "${postId} is invalid."`, 400);
			}
		} else if (isNaN(numPostId) || numPostId < 0) {
			throw apiErrorWithStatusCode(`The postId "${postId}" is invalid.`, 400);
		}

		const strProposalType = String(proposalType) as ProposalType;
		if (!isProposalTypeValid(strProposalType)) {
			throw apiErrorWithStatusCode(`The proposal type "${proposalType}" is invalid.`, 400);
		}
		const topicFromType = getTopicFromType(proposalType as ProposalType);

		const subsquidProposalType = getSubsquidProposalType(proposalType as any);

		let postVariables: any = {
			index_eq: numPostId,
			type_eq: subsquidProposalType,
			voter_eq: voterAddress? String(voterAddress): ''
		};

		const postQuery = GET_PROPOSAL_BY_INDEX_AND_TYPE;
		if (proposalType === ProposalType.TIPS) {
			postVariables = {
				hash_eq: strPostId,
				type_eq: subsquidProposalType
			};
		} else if (proposalType === ProposalType.DEMOCRACY_PROPOSALS) {
			postVariables['vote_type_eq'] = VoteType.DEMOCRACY_PROPOSAL;
		}
		const subsquidRes = await fetchSubsquid({
			network,
			query: postQuery,
			variables: postVariables
		});

		// Post
		const subsquidData = subsquidRes?.data;
		if (!isDataExist(subsquidData)) {
			throw apiErrorWithStatusCode(`The Post with index "${postId}" is not found.`, 404);
		}

		const postData = subsquidData.proposals[0];
		const preimage = postData?.preimage;
		const proposalArguments = postData?.proposalArguments;
		const proposedCall = preimage?.proposedCall;
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
							proposer = post.proposer || post.curator || (post?.preimage? post?.preimage?.proposer: '');
						}
					});
				}
			}

		}
		const post: IPostResponse = {
			bond: postData?.bond,
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
			last_edited_at: postData?.updatedAt,
			member_count: postData?.threshold?.value,
			method: preimage?.method || proposedCall?.method || proposalArguments?.method,
			motion_method: proposalArguments?.method,
			origin: postData?.origin,
			payee: postData?.payee,
			post_id: postData?.index,
			post_reactions: getDefaultReactionObj(),
			proposal_arguments: proposalArguments,
			proposed_call: proposedCall,
			proposer,
			requested: proposedCall?.args?.amount,
			reward: postData?.reward,
			status,
			statusHistory: postData?.statusHistory,
			submission_deposit_amount: postData?.submissionDeposit?.amount,
			submitted_amount: postData?.submissionDeposit?.amount,
			tally: postData?.tally,
			timeline: [],
			topic: topicFromType,
			track_number: postData?.trackNumber,
			type: postData?.type || getSubsquidProposalType(proposalType as any),
			vote_threshold: postData?.threshold?.type
		};

		const isStatus = {
			swap: false
		};
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
		if (!post.timeline || post.timeline.length === 0) {
			post.timeline = getTimeline([
				{
					createdAt: postData?.createdAt,
					hash: postData?.hash,
					index: postData?.index,
					statusHistory: postData?.statusHistory,
					type: postData?.type
				}
			], isStatus);
		}

		if (isStatus.swap) {
			if (post.status === 'DecisionDepositPlaced') {
				post.status = 'Deciding';
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
			post.tippers = subsquidData?.tippersConnection?.edges?.reduce((tippers: any[], edge: any) => {
				if (edge && edge?.node) {
					tippers.push(edge.node);
				}
				return tippers;
			}, []) || [];
		}

		// Council motions votes
		if (proposalType === ProposalType.COUNCIL_MOTIONS) {
			post.motion_votes = subsquidData?.votesConnection?.edges?.reduce((motion_votes: any[], edge: any) => {
				if (edge && edge?.node) {
					motion_votes.push(edge.node);
				}
				return motion_votes;
			}, []) || [];
		}

		// Democracy proposals votes TotalCount
		if (proposalType === ProposalType.DEMOCRACY_PROPOSALS) {
			const numTotalCount = Number(subsquidData?.votesConnection?.totalCount);
			post.seconds = isNaN(numTotalCount)? 0: numTotalCount;
		}

		// Child Bounties
		if (proposalType === ProposalType.BOUNTIES) {
			post.child_bounties_count = subsquidData?.proposalsConnection?.totalCount || 0;
			post.child_bounties = subsquidData?.proposalsConnection?.edges?.reduce((child_bounties: any[], edge: any) => {
				if (edge && edge?.node) {
					child_bounties.push(edge.node);
				}
				return child_bounties;
			}, []) || [];
		}
		if (proposalType === ProposalType.CHILD_BOUNTIES) {
			post.parent_bounty_index = postData?.parentBountyIndex;
		}

		const postDocRef = postsByTypeRef(network, (strProposalType.toString() === 'open_gov'? ProposalType.REFERENDUM_V2: strProposalType)).doc(strPostId);
		const firestorePost = await postDocRef.get();
		if (firestorePost) {
			let data = firestorePost.data();
			// traverse the group, get and set the data.
			data = await getAndSetNewData({
				data,
				id: strPostId,
				network,
				proposalType: strProposalType,
				proposer: post.proposer,
				timeline: post?.timeline
			});

			// Populate firestore post data into the post object
			if (data && post) {
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
				const post_link = data?.post_link;
				if (post_link) {
					const { id, type } = post_link;
					const postDocRef = postsByTypeRef(network, type).doc(String(id));
					const postDoc = await postDocRef.get();
					const postData = postDoc.data();
					if (postDoc.exists && postData) {
						post_link.title = postData?.title;
						post_link.description = postData.content;
						post_link.created_at = postData?.created_at?.toDate? postData?.created_at?.toDate(): postData?.created_at;
						if (post.timeline && Array.isArray(post.timeline)) {
							post.timeline.splice(0, 0, {
								created_at: postData?.created_at?.toDate? postData?.created_at?.toDate(): postData?.created_at,
								index: Number(id),
								statuses: [
									{
										status: 'Created',
										timestamp: postData?.created_at?.toDate? postData?.created_at?.toDate(): postData?.created_at
									}
								],
								type: 'Discussions'
							});
						}
					}
				}
				post.post_link = post_link;
			}
		}

		// Comments
		const commentsSnapshot = await postDocRef.collection('comments').get();
		post.comments = await getComments(commentsSnapshot, postDocRef);

		// Post Reactions
		const postReactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
		post.post_reactions = getReactions(postReactionsQuerySnapshot);

		// Check if it is a spam or not
		post.spam_users_count = await getSpamUsersCount(network, proposalType, (proposalType === ProposalType.TIPS? strPostId: numPostId));

		if (!post.content || post.content?.trim().length === 0) {
			const proposer = post.proposer;
			if (proposer) {
				post.content = `This is a ${getProposalTypeTitle(proposalType as ProposalType)} whose proposer address (${proposer}) is shown in on-chain info below. Only this user can edit this description and the title. If you own this account, login and tell us more about your proposal.`;
			} else {
				post.content = `This is a ${getProposalTypeTitle(proposalType as ProposalType)}. Only the proposer can edit this description and the title. If you own this account, login and tell us more about your proposal.`;
			}
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

export const getSpamUsersCount = async (network: string, proposalType: any, postId: string | number) => {
	const countQuery = await networkDocRef(network).collection('reports').where('type', '==', 'post').where('proposal_type', '==', proposalType).where('content_id', '==', postId).count().get();
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
	return totalUsers;
};

// expects optional proposalType and postId of proposal
const handler: NextApiHandler<IPostResponse | { error: string }> = async (req, res) => {
	const { postId = 0, proposalType = ProposalType.DEMOCRACY_PROPOSALS, voterAddress } = req.query;

	// TODO: take proposalType and postId in dynamic pi route

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });
	const { data, error, status } = await getOnChainPost({
		network,
		postId,
		proposalType,
		voterAddress
	});

	if(error || !data) {
		res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	}else {
		res.status(status).json(data);
	}
};

export default withErrorHandling(handler);