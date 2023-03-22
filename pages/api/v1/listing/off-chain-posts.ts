// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isFirestoreProposalTypeValid, isSortByValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { OffChainProposalType, ProposalType } from '~src/global/proposalType';
import { sortValues } from '~src/global/sortOptions';
import { firestore_db } from '~src/services/firebaseInit';
import { IApiErrorResponse, IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { getTopicFromType, isTopicIdValid } from '~src/util/getTopicFromType';
import { getTopicNameFromTopicId } from '~src/util/getTopicFromType';
import messages from '~src/util/messages';

import { getReactions } from '../posts/on-chain-post';
import { getProposerAddressFromFirestorePostData, IPostsListingResponse } from './on-chain-posts';

interface IGetOffChainPostsParams {
	network: string;
	page?: string | string[] | number;
	sortBy: string | string[];
	listingLimit: string | string[] | number;
	proposalType: OffChainProposalType | string | string[];
}

export async function getOffChainPosts(params: IGetOffChainPostsParams) : Promise<IApiResponse<IPostsListingResponse>> {
	try {
		const { network, listingLimit, page, proposalType, sortBy } = params;
		const strSortBy = String(sortBy);

		const numListingLimit = Number(listingLimit);
		if (isNaN(numListingLimit)) {
			throw apiErrorWithStatusCode( `Invalid listingLimit "${listingLimit}"`, 400);
		}

		const strProposalType = String(proposalType);
		if (!isFirestoreProposalTypeValid(strProposalType)) {
			throw apiErrorWithStatusCode(`The off chain proposal type of the name "${proposalType}" does not exist.`, 400);
		}

		const numPage = Number(page);
		if (isNaN(numPage) || numPage <= 0) {
			throw apiErrorWithStatusCode(`Invalid page "${page}"`, 400);
		}

		if (!isSortByValid(strSortBy)) {
			throw apiErrorWithStatusCode('sortBy is invalid', 400);
		}
		let order: 'desc' | 'asc' = sortBy === sortValues.NEWEST ? 'desc' : 'asc';
		let orderedField = 'created_at';
		if (sortBy === sortValues.COMMENTED) {
			order = 'desc';
			orderedField = 'last_comment_at';
		}

		const offChainCollRef = postsByTypeRef(network, strProposalType as ProposalType);
		const postsSnapshotArr = await offChainCollRef
			.orderBy(orderedField, order)
			.limit(Number(listingLimit) || LISTING_LIMIT)
			.offset((Number(page) - 1) * Number(listingLimit || LISTING_LIMIT))
			.get();

		const count = (await offChainCollRef.count().get()).data().count;

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
						post_id: docData.id,
						post_reactions,
						proposer: getProposerAddressFromFirestorePostData(docData, network),
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
			indexMap[post?.user_id] = index;
			return post?.user_id;
		});

		const newIds = ids.filter((id) => id && !isNaN(id));

		if (newIds.length > 0) {
			const addressesQuery = await firestore_db.collection('addresses').where('user_id', 'in', newIds).get();
			addressesQuery.docs.map((doc) => {
				if (doc && doc.exists) {
					const data = doc.data();
					if (posts[indexMap[data.user_id]] && !posts[indexMap[data.user_id]]?.proposer) {
						(posts[indexMap[data.user_id]] as any).proposer = data.address;
					}
				}
			});
		}

		const data: IPostsListingResponse = {
			count,
			posts: posts.filter((post) => post !== undefined) as any
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

// expects page, sortBy, proposalType and listingLimit
const handler: NextApiHandler<IPostsListingResponse | IApiErrorResponse> = async (req, res) => {
	const { page = 1, proposalType = OffChainProposalType.DISCUSSIONS, sortBy = sortValues.COMMENTED, listingLimit = LISTING_LIMIT } = req.query;
	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });

	const { data, error, status } = await getOffChainPosts({
		listingLimit,
		network,
		page,
		proposalType,
		sortBy
	});

	if(error || !data) {
		res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	}else {
		res.status(status).json(data);
	}
};

export default withErrorHandling(handler);