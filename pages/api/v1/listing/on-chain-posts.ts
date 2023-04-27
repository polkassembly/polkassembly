// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isCustomOpenGovStatusValid, isProposalTypeValid, isSortByValid, isTrackNoValid, isTrackPostStatusValid, isValidNetwork } from '~src/api-utils';
import { networkDocRef, postsByTypeRef } from '~src/api-utils/firestore_refs';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { getFirestoreProposalType, getStatusesFromCustomStatus, getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { sortValues } from '~src/global/sortOptions';
import {  GET_PROPOSALS_LISTING_BY_TYPE, GET_PROPOSAL_LISTING_BY_TYPE_AND_INDEXES } from '~src/queries';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import messages from '~src/util/messages';

import { checkReportThreshold, getReactions } from '../posts/on-chain-post';

export interface IPostListing {
	user_id?: string | number;
	comments_count: number;
	created_at: string;
	end?: number;
	hash?: string;
	post_id: string | number;
	description?: string;
	post_reactions: {
		'👍': number;
		'👎': number;
	};
	proposer?: string;
	curator?: string;
	parent_bounty_index?: number
	method?: string;
	status?: string;
	title: string;
	topic: {
		id: number;
		name: string;
	};
	type?: string;
	username?: string;
  tags?:string[] | [];
  gov_type?:'gov_1' | 'open_gov';
}

export interface IPostsListingResponse {
	count: number
	posts: IPostListing[]
}

export function getGeneralStatus(status: string) {
	switch(status) {
	case 'DecisionDepositPlaced':
		return 'Deciding';
	}
	return status;
}

interface IGetOnChainPostsParams {
	network: string;
	page?: string | string[] | number;
	sortBy: string | string[];
	trackNo?: string | string[] | number;
	listingLimit: string | string[] | number;
	trackStatus?: string | string[];
	proposalType?: string | string[];
	postIds?: string | string[] | number[];
  filterBy?: string[] | [];
}

export function getProposerAddressFromFirestorePostData(data: any, network: string) {
	let proposer_address = '';
	if (data) {
		if (Array.isArray(data?.proposer_address)) {
			if (data.proposer_address.length > 0) {
				proposer_address = data?.proposer_address[0];
			}
		} else if (typeof data.proposer_address === 'string') {
			proposer_address = data.proposer_address;
		}
		if (data?.default_address && !proposer_address) {
			proposer_address = data?.default_address;
		}
	}

	if(proposer_address.startsWith('0x')) {
		return proposer_address;
	}

	return (proposer_address && getEncodedAddress(proposer_address, network)) || proposer_address;
}

export async function getOnChainPosts(params: IGetOnChainPostsParams) : Promise<IApiResponse<IPostsListingResponse>> {
	try {
		const { listingLimit, network, page, proposalType, sortBy, trackNo, trackStatus, postIds, filterBy } = params;
		const numListingLimit = Number(listingLimit);
		if (isNaN(numListingLimit)) {
			throw apiErrorWithStatusCode( `Invalid listingLimit "${listingLimit}"`, 400);
		}

		const numPage = Number(page);
		if (isNaN(numPage) || numPage <= 0) {
			throw apiErrorWithStatusCode(`Invalid page "${page}"`, 400);
		}

		const strSortBy = String(sortBy);
		if (!isSortByValid(strSortBy)) {
			throw apiErrorWithStatusCode('sortBy is invalid', 400);
		}

		let strProposalType = String(proposalType);
		if (!isProposalTypeValid(strProposalType)) {
			throw apiErrorWithStatusCode(`The proposal type of the name "${proposalType}" does not exist.`, 400);
		}

		if(filterBy && Array.isArray(filterBy) && filterBy.length > 0){

			const offChainCollRef = postsByTypeRef(network, strProposalType as ProposalType);
			let order: 'desc' | 'asc' = sortBy === sortValues.NEWEST ? 'desc' : 'asc';
			let orderedField = 'created_at';
			if (sortBy === sortValues.COMMENTED) {
				order = 'desc';
				orderedField = 'last_comment_at';
			}
			const postsSnapshotArr =await offChainCollRef
				.orderBy(orderedField,order)
				.where('tags','array-contains-any',filterBy)
				.limit(Number(listingLimit) || LISTING_LIMIT)
				.offset((Number(page) - 1) * Number(listingLimit || LISTING_LIMIT))
				.get();

			const count = (await offChainCollRef.where('tags','array-contains-any',filterBy).count().get()).data().count;
			const postsPromise = postsSnapshotArr.docs.map(async (doc) => {
				if (doc && doc.exists) {
					const docData = doc.data();
					if (docData) {
						const postDocRef = offChainCollRef.doc(String(docData.id));

						const post_reactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
						const reactions = getReactions(post_reactionsQuerySnapshot);
						const post_reactions = {
							'👍': reactions['👍']?.count || 0,
							'👎': reactions['👎']?.count || 0
						};

						const commentsQuerySnapshot = await postDocRef.collection('comments').count().get();

						const created_at = docData.created_at;
						const { topic, topic_id } = docData;

						return {
							comments_count: commentsQuerySnapshot.data()?.count || 0,
							created_at: created_at?.toDate? created_at?.toDate(): created_at,
							gov_type:docData?.gov_type ,
							post_id: docData.id,
							post_reactions,
							proposer: getProposerAddressFromFirestorePostData(docData, network),
							tags:docData?.tags || [],
							title:  docData?.title || null,
							topic: topic? topic: isTopicIdValid(topic_id)? {
								id: topic_id,
								name: getTopicNameFromTopicId(topic_id)
							}: getTopicFromType(strProposalType as ProposalType),
							user_id: docData?.user_id || 1,
							username: docData?.username
						};
					}
				}

			});
			const posts = await Promise.all(postsPromise);
			const indexMap: any = {};
			const ids = posts.map((post, index) => {
				indexMap[Number(post?.post_id)] = index;
				return Number(post?.post_id);
			});

			const topicFromType = getTopicFromType(proposalType as ProposalType);
			const subsquidProposalType = getSubsquidProposalType(proposalType as any);
			const postsVariables: any = {
				index_in:ids,
				limit: numListingLimit,
				offset: numListingLimit * (numPage - 1),
				type_eq: subsquidProposalType
			};

			const subsquidRes = await fetchSubsquid({
				network,
				query: GET_PROPOSAL_LISTING_BY_TYPE_AND_INDEXES,
				variables: postsVariables
			});

			const subsquidData = subsquidRes?.data;
			const subsquidPosts: any[] = subsquidData?.proposals;
			const subsquidPostsPromise = subsquidPosts?.map(async (subsquidPost): Promise<IPostListing> => {
				const { createdAt, end, hash, index, type, proposer, preimage, description, group, curator, parentBountyIndex } = subsquidPost;
				let otherPostProposer = '';
				if (group?.proposals?.length) {
					group.proposals.forEach((obj: any) => {
						if (!otherPostProposer) {
							if (obj.proposer) {
								otherPostProposer = obj.proposer;
							} else if (obj?.preimage?.proposer) {
								otherPostProposer = obj.preimage.proposer;
							}
						}
					});
				}
				const status = subsquidPost.status;
				const postId = proposalType === ProposalType.TIPS? hash: index;
				const postDocRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(postId));

				const post_reactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
				const reactions = getReactions(post_reactionsQuerySnapshot);
				const post_reactions = {
					'👍': reactions['👍']?.count || 0,
					'👎': reactions['👎']?.count || 0
				};

				const commentsQuerySnapshot = await postDocRef.collection('comments').count().get();
				const postDoc = await postDocRef.get();
				if (postDoc && postDoc.exists) {
					const data = postDoc.data();
					if (data) {
						const proposer_address = getProposerAddressFromFirestorePostData(data, network);
						const topic = data?.topic;
						const topic_id = data?.topic_id;
						return {
							comments_count: commentsQuerySnapshot.data()?.count || 0,
							created_at: createdAt,
							curator,
							description,
							end,
							gov_type:data.gov_type,
							hash,
							method: preimage?.method,
							parent_bounty_index: parentBountyIndex || null,
							post_id: postId,
							post_reactions,
							proposer: proposer || preimage?.proposer || otherPostProposer || proposer_address || curator,
							status,
							tags:data?.tags || [],
							title: data?.title || null,
							topic: topic? topic: isTopicIdValid(topic_id)? {
								id: topic_id,
								name: getTopicNameFromTopicId(topic_id)
							}: topicFromType,
							type: type || subsquidProposalType,
							user_id: data?.user_id || 1
						};
					}
				}

				return {
					comments_count: commentsQuerySnapshot.data()?.count || 0,
					created_at: createdAt,
					curator,
					description,
					end: end,
					hash: hash || null,
					method: preimage?.method,
					parent_bounty_index: parentBountyIndex || null,
					post_id: postId,
					post_reactions,
					proposer: proposer || preimage?.proposer || otherPostProposer || curator || null,
					status: status,
					title: '',
					topic: topicFromType,
					type: type || subsquidProposalType,
					user_id: 1
				};
			});

			const subsquidDataPost = await Promise.all(subsquidPostsPromise);

			const data: IPostsListingResponse = {
				count:count,
				posts:subsquidDataPost
			};

			return {
				data: JSON.parse(JSON.stringify(data)),
				error: null,
				status: 200
			};
		}
		else{
			const numTrackNo = Number(trackNo);
			const strTrackStatus = String(trackStatus);
			if (strProposalType === ProposalType.OPEN_GOV) {
				if (!isTrackNoValid(numTrackNo, network)) {
					throw apiErrorWithStatusCode(`The OpenGov trackNo "${trackNo}" is invalid.`, 400);
				}
				if (trackStatus !== undefined && trackStatus !== null && !isTrackPostStatusValid(strTrackStatus) && !isCustomOpenGovStatusValid(strTrackStatus)) {
					throw apiErrorWithStatusCode(`The Track status of the name "${trackStatus}" is invalid.`, 400);
				}
			}

			const topicFromType = getTopicFromType(proposalType as ProposalType);

			const subsquidProposalType = getSubsquidProposalType(proposalType as any);

			const orderBy = strSortBy === 'newest'? 'createdAtBlock_DESC': 'createdAtBlock_ASC';
			const postsVariables: any = {
				limit: numListingLimit,
				offset: numListingLimit * (numPage - 1),
				orderBy: orderBy,
				type_in: subsquidProposalType
			};

			if (proposalType === ProposalType.OPEN_GOV) {
				strProposalType = 'referendums_v2';
				postsVariables.trackNumber_in = numTrackNo;
				if (strTrackStatus && strTrackStatus !== 'All' && isCustomOpenGovStatusValid(strTrackStatus)) {
					postsVariables.status_in = getStatusesFromCustomStatus(strTrackStatus as any);
				}
			} else if (strProposalType === ProposalType.FELLOWSHIP_REFERENDUMS) {
				if (numTrackNo !== undefined && numTrackNo !== null && !isNaN(numTrackNo)) {
					postsVariables.trackNumber_in = numTrackNo;
				}
			}

			if (postIds && postIds.length > 0) {
				if (proposalType === ProposalType.TIPS) {
					postsVariables['hash_in'] = postIds;
				} else {
					postsVariables['index_in'] = postIds;
				}
			}

			const subsquidRes = await fetchSubsquid({
				network,
				query: GET_PROPOSALS_LISTING_BY_TYPE,
				variables: postsVariables
			});

			const subsquidData = subsquidRes?.data;
			const subsquidPosts: any[] = subsquidData?.proposals;

			const postsPromise = subsquidPosts?.map(async (subsquidPost): Promise<IPostListing> => {
				const { createdAt, end, hash, index, type, proposer, preimage, description, group, curator, parentBountyIndex } = subsquidPost;
				let otherPostProposer = '';
				if (group?.proposals?.length) {
					group.proposals.forEach((obj: any) => {
						if (!otherPostProposer) {
							if (obj.proposer) {
								otherPostProposer = obj.proposer;
							} else if (obj?.preimage?.proposer) {
								otherPostProposer = obj.preimage.proposer;
							}
						}
					});
				}
				const status = subsquidPost.status;
				const postId = proposalType === ProposalType.TIPS? hash: index;
				const postDocRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(postId));

				const post_reactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
				const reactions = getReactions(post_reactionsQuerySnapshot);
				const post_reactions = {
					'👍': reactions['👍']?.count || 0,
					'👎': reactions['👎']?.count || 0
				};

				const commentsQuerySnapshot = await postDocRef.collection('comments').count().get();
				const postDoc = await postDocRef.get();
				if (postDoc && postDoc.exists) {
					const data = postDoc.data();
					if (data) {
						const proposer_address = getProposerAddressFromFirestorePostData(data, network);
						const topic = data?.topic;
						const topic_id = data?.topic_id;
						return {
							comments_count: commentsQuerySnapshot.data()?.count || 0,
							created_at: createdAt,
							curator,
							description,
							end,
							gov_type:data.gov_type,
							hash,
							method: preimage?.method,
							parent_bounty_index: parentBountyIndex || null,
							post_id: postId,
							post_reactions,
							proposer: proposer || preimage?.proposer || otherPostProposer || proposer_address || curator,
							status,
							tags:data?.tags || [],
							title: data?.title || null,
							topic: topic? topic: isTopicIdValid(topic_id)? {
								id: topic_id,
								name: getTopicNameFromTopicId(topic_id)
							}: topicFromType,
							type: type || subsquidProposalType,
							user_id: data?.user_id || 1
						};
					}
				}

				return {
					comments_count: commentsQuerySnapshot.data()?.count || 0,
					created_at: createdAt,
					curator,
					description,
					end: end,
					hash: hash || null,
					method: preimage?.method,
					parent_bounty_index: parentBountyIndex || null,
					post_id: postId,
					post_reactions,
					proposer: proposer || preimage?.proposer || otherPostProposer || curator || null,
					status: status,
					title: '',
					topic: topicFromType,
					type: type || subsquidProposalType,
					user_id: 1
				};
			});

			const postsResults = await Promise.allSettled(postsPromise);
			let posts = postsResults.reduce((prev, post) => {
				if (post && post.status === 'fulfilled') {
					prev.push(post.value);
				}
				return prev;
			}, [] as any[]);

			posts = await getSpamUsersCountForPosts(network, posts, strProposalType);

			const data: IPostsListingResponse = {
				count: Number(subsquidData?.proposalsConnection?.totalCount || 0),
				posts
			};

			return {
				data: JSON.parse(JSON.stringify(data)),
				error: null,
				status: 200
			};
		}
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
}

export const getSpamUsersCountForPosts = async (network: string, posts: any[], proposalType?: string): Promise<any[]> => {
	const postsMap = new Map();
	posts.forEach((post, index) => {
		if (post) {
			postsMap.set(post.post_id, index);
		}
	});

	const postsIds = Array.from(postsMap.keys());
	if (postsMap.size > 0) {
		const newIdsLen = postsMap.size;
		let lastIndex = 0;
		for (let i = 0; i < newIdsLen; i+=30) {
			lastIndex = i + 30;
			let querySnapshot = networkDocRef(network).collection('reports').where('type', '==', 'post').where('content_id', 'in', postsIds.slice(i, newIdsLen > (i + 30)? (i + 30): newIdsLen)).get();
			if (proposalType) {
				querySnapshot = networkDocRef(network).collection('reports').where('type', '==', 'post').where('proposal_type', '==', proposalType).where('content_id', 'in', postsIds.slice(i, newIdsLen > (i + 30)? (i + 30): newIdsLen)).get();
			}

			const reportsQuery = await querySnapshot;

			reportsQuery.docs.map((doc) => {
				if (doc && doc.exists) {
					const data = doc.data();
					const index = postsMap.get(data.content_id);
					if (index !== undefined && index !== null) {
						if (posts[index] && (proposalType || data.proposal_type === getFirestoreProposalType(posts[index].type))) {
							posts[index] = {
								...posts[index],
								spam_users_count: Number(posts[index].spam_users_count || 0) + 1
							};
						}
					}
				}
			});
		}
		if (lastIndex < newIdsLen) {
			let querySnapshot = networkDocRef(network).collection('reports').where('type', '==', 'post').where('content_id', 'in', postsIds.slice(lastIndex, (lastIndex === newIdsLen)? (newIdsLen + 1): newIdsLen)).get();
			if (proposalType) {
				querySnapshot = networkDocRef(network).collection('reports').where('type', '==', 'post').where('proposal_type', '==', proposalType).where('content_id', 'in', postsIds.slice(lastIndex, (lastIndex === newIdsLen)? (newIdsLen + 1): newIdsLen)).get();
			}
			const reportsQuery = await querySnapshot;
			reportsQuery.docs.map((doc) => {
				if (doc && doc.exists) {
					const data = doc.data();
					const index = postsMap.get(data.content_id);
					if (index !== undefined && index !== null) {
						if (posts[index] && (proposalType || data.proposal_type === getFirestoreProposalType(posts[index].type))) {
							posts[index] = {
								...posts[index],
								spam_users_count: Number(posts[index].spam_users_count || 0) + 1
							};
						}
					}
				}
			});
		}
	}

	return posts.map((post) => {
		if (post) {
			post.spam_users_count = checkReportThreshold(post.spam_users_count);
		}
		return post;
	});
};

// expects optional proposalType, page and listingLimit
const handler: NextApiHandler<IPostsListingResponse | { error: string }> = async (req, res) => {
	const { page = 1, trackNo, trackStatus, proposalType = ProposalType.DEMOCRACY_PROPOSALS, sortBy = sortValues.NEWEST,listingLimit = LISTING_LIMIT, filterBy } = req.query;

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });
	const postIds = req.body.postIds;
	const { data, error, status } = await getOnChainPosts({
		filterBy:filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy))))? JSON.parse(decodeURIComponent(String(filterBy))): [],
		listingLimit,
		network,
		page,
		postIds,
		proposalType,
		sortBy,
		trackNo,
		trackStatus
	});

	if(error || !data) {
		res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	}else {
		res.status(status).json(data);
	}
};

export default withErrorHandling(handler);