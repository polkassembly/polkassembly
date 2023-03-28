// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isCustomOpenGovStatusValid, isProposalTypeValid, isSortByValid, isTrackNoValid, isTrackPostStatusValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { getStatusesFromCustomStatus, getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { sortValues } from '~src/global/sortOptions';
import {  GET_PROPOSALS_LISTING_BY_TYPE, GET_PARENT_BOUNTIES_PROPOSER_FOR_CHILD_BOUNTY } from '~src/queries';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import messages from '~src/util/messages';

import { getReactions } from '../posts/on-chain-post';

export interface IPostListing {
	user_id?: string | number;
	comments_count: number;
	created_at: string;
	end?: number;
	hash?: string;
	post_id: string | number;
	description?: string;
	parent_bounty_index?: number,
	post_reactions: {
		'👍': number;
		'👎': number;
	};
	proposer?: string;
	curator?: string;
	method?: string;
	status?: string;
	title: string;
	topic: {
		id: number;
		name: string;
	};
	type?: string;
	username?: string
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
		const { listingLimit, network, page, proposalType, sortBy, trackNo, trackStatus, postIds } = params;

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

		const parentBounties = new Set<number>();

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
			const newProposer = proposer || preimage?.proposer || otherPostProposer || curator || null;
			if (postDoc && postDoc.exists) {
				const data = postDoc.data();
				if (data) {
					const proposer_address = getProposerAddressFromFirestorePostData(data, network);
					const topic = data?.topic;
					const topic_id = data?.topic_id;
					if (!(newProposer || proposer_address) && (parentBountyIndex || parentBountyIndex === 0)) {
						parentBounties.add(parentBountyIndex);
					}
					return {
						comments_count: commentsQuerySnapshot.data()?.count || 0,
						created_at: createdAt,
						curator,
						description,
						end,
						hash,
						method: preimage?.method,
						parent_bounty_index: parentBountyIndex,
						post_id: postId,
						post_reactions,
						proposer: newProposer || proposer_address,
						status,
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
			if (!newProposer && (parentBountyIndex || parentBountyIndex === 0)) {
				parentBounties.add(parentBountyIndex);
			}

			return {
				comments_count: commentsQuerySnapshot.data()?.count || 0,
				created_at: createdAt,
				curator,
				description,
				end: end,
				hash: hash || null,
				method: preimage?.method,
				parent_bounty_index: parentBountyIndex,
				post_id: postId,
				post_reactions,
				proposer: newProposer,
				status: status,
				title: '',
				topic: topicFromType,
				type: type || subsquidProposalType,
				user_id: 1
			};
		});

		let posts = await Promise.all(postsPromise);

		if (parentBounties.size > 0) {
			const subsquidRes = await fetchSubsquid({
				network,
				query: GET_PARENT_BOUNTIES_PROPOSER_FOR_CHILD_BOUNTY,
				variables: {
					index_in: Array.from(parentBounties),
					limit: parentBounties.size
				}
			});
			if (subsquidRes && subsquidRes?.data) {
				const subsquidData = subsquidRes?.data;
				if (subsquidData.proposals && Array.isArray(subsquidData.proposals) && subsquidData.proposals.length > 0) {
					const subsquidPosts: any[] = subsquidData?.proposals || [];
					subsquidPosts.forEach((post) => {
						posts = posts.map((onChainPost) => {
							if (onChainPost.parent_bounty_index === post.index && post) {
								onChainPost.proposer = post.proposer || post.curator || (post?.preimage? post?.preimage?.proposer: '');
							}
							return {
								...onChainPost
							};
						});
					});
				}
			}
		}

		const data: IPostsListingResponse = {
			count: Number(subsquidData?.proposalsConnection?.totalCount || 0),
			posts
		};

		return {
			data: JSON.parse(JSON.stringify(data)),
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

// expects optional proposalType, page and listingLimit
const handler: NextApiHandler<IPostsListingResponse | { error: string }> = async (req, res) => {
	const { page = 1, trackNo, trackStatus, proposalType = ProposalType.DEMOCRACY_PROPOSALS, sortBy = sortValues.NEWEST,listingLimit = LISTING_LIMIT } = req.query;

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });
	const postIds = req.body.postIds;
	const { data, error, status } = await getOnChainPosts({
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