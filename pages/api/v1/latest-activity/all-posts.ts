// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isGovTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { getFirestoreProposalType, gov1ProposalTypes, ProposalType } from '~src/global/proposalType';
import { GET_PROPOSALS_LISTING_BY_TYPE, GET_PARENT_BOUNTIES_PROPOSER_FOR_CHILD_BOUNTY } from '~src/queries';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import messages from '~src/util/messages';

import { getProposerAddressFromFirestorePostData } from '../listing/on-chain-posts';
import { ILatestActivityPostsListingResponse } from './on-chain-posts';

interface IGetLatestActivityAllPostsParams {
	listingLimit?: string | string[] | number;
	network: string;
	govType?: string | string[];
}

export async function getLatestActivityAllPosts(params: IGetLatestActivityAllPostsParams): Promise<IApiResponse<ILatestActivityPostsListingResponse>> {
	try {
		const { listingLimit, network, govType } = params;

		const numListingLimit = Number(listingLimit);
		if (isNaN(numListingLimit)) {
			throw apiErrorWithStatusCode(`Invalid listingLimit "${listingLimit}"`, 400);
		}

		const strGovType = String(govType);
		if (govType !== undefined && govType !== null && !isGovTypeValid(strGovType)) {
			throw apiErrorWithStatusCode(`Invalid govType "${govType}"`, 400);
		}

		const variables: any = {
			limit: numListingLimit,
			type_in: gov1ProposalTypes
		};

		if (strGovType === 'open_gov') {
			variables.type_in = 'ReferendumV2';
		}

		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_PROPOSALS_LISTING_BY_TYPE,
			variables
		});

		const subsquidData = subsquidRes?.data;
		const subsquidPosts: any[] = subsquidData?.proposals || [];

		const parentBounties = new Set<number>();
		const onChainPostsPromise = subsquidPosts?.map(async (subsquidPost) => {
			const { createdAt, proposer, preimage, type, index, status, hash, method, origin, trackNumber, curator, description, proposalArguments, parentBountyIndex } = subsquidPost;
			const postId = type === 'Tip'? hash: index;
			const postDocRef = postsByTypeRef(network, getFirestoreProposalType(type) as ProposalType).doc(String(postId));
			const postDoc = await postDocRef.get();
			const newProposer = proposer || preimage?.proposer || curator;
			if (!newProposer && (parentBountyIndex || parentBountyIndex === 0)) {
				parentBounties.add(parentBountyIndex);
			}
			const onChainPost = {
				created_at: createdAt,
				description: description || (proposalArguments? proposalArguments?.description: null),
				hash,
				method: method || preimage?.method || (proposalArguments? proposalArguments?.method: proposalArguments?.method),
				origin,
				parent_bounty_index: parentBountyIndex,
				post_id: postId,
				proposer: newProposer,
				status: status,
				title: '',
				track_number: trackNumber,
				type
			};
			if (postDoc && postDoc.exists) {
				const data = postDoc?.data();
				return {
					...onChainPost,
					title: data?.title || null
				};
			}
			return onChainPost;
		});

		let onChainPosts = await Promise.all(onChainPostsPromise);
		const onChainPostsCount = Number(subsquidData?.proposalsConnection?.totalCount || 0);

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
						onChainPosts = onChainPosts.map((onChainPost) => {
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

		const discussionsPostsColRef = postsByTypeRef(network, ProposalType.DISCUSSIONS);
		const postsSnapshotArr = await discussionsPostsColRef
			.orderBy('created_at', 'desc')
			.limit(numListingLimit)
			.get();

		const offChainPosts: any[] = [];
		const offChainPostsCount = (await discussionsPostsColRef.count().get()).data().count;

		postsSnapshotArr.docs.forEach((doc) => {
			if (doc && doc.exists) {
				const data = doc.data();
				if (data) {
					const { topic, topic_id } = data;
					offChainPosts.push({
						created_at: data?.created_at?.toDate? data?.created_at?.toDate(): data?.created_at,
						post_id: data?.id,
						proposer: getProposerAddressFromFirestorePostData(data, network),
						title: data?.title,
						topic: topic? topic: isTopicIdValid(topic_id)? {
							id: topic_id,
							name: getTopicNameFromTopicId(topic_id)
						}: getTopicFromType(ProposalType.DISCUSSIONS),
						type: 'Discussions',
						username: data?.username || ''
					});
				}
			}
		});

		const allPosts = [...onChainPosts, ...offChainPosts];
		const deDupedAllPosts = Array.from(new Set(allPosts));
		deDupedAllPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

		const data: ILatestActivityPostsListingResponse = {
			count:  onChainPostsCount + offChainPostsCount,
			posts: deDupedAllPosts.slice(0, numListingLimit)
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

const handler: NextApiHandler<ILatestActivityPostsListingResponse | { error: string }> = async (req, res) => {
	const { govType, listingLimit = LISTING_LIMIT } = req.query;

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });

	const { data, error, status } = await getLatestActivityAllPosts({
		govType,
		listingLimit,
		network
	});

	if(error || !data) {
		res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	}else {
		res.status(status).json(data);
	}
};
export default withErrorHandling(handler);