// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isFirestoreProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { OffChainProposalType, ProposalType } from '~src/global/proposalType';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import messages from '~src/util/messages';

import { ILatestActivityPostsListingResponse } from './on-chain-posts';
import { firestore_db } from '~src/services/firebaseInit';
import { getSpamUsersCountForPosts } from '../listing/on-chain-posts';

interface IGetLatestActivityOffChainPostsParams {
	listingLimit?: string | string[] | number;
	proposalType: OffChainProposalType | string | string[];
	network: string;
}

export async function getLatestActivityOffChainPosts(params: IGetLatestActivityOffChainPostsParams): Promise<IApiResponse<ILatestActivityPostsListingResponse>> {
	try {
		const { listingLimit, network, proposalType } = params;

		const numListingLimit = Number(listingLimit);
		if (isNaN(numListingLimit)) {
			throw apiErrorWithStatusCode(`Invalid listingLimit "${listingLimit}"`, 400);
		}

		const strProposalType = String(proposalType);
		if (!isFirestoreProposalTypeValid(strProposalType)) {
			throw apiErrorWithStatusCode(`The off chain proposal type of the name "${proposalType}" does not exist.`, 400);
		}

		const postsColRef = postsByTypeRef(network, strProposalType as ProposalType);
		const postsSnapshotArr = await postsColRef
			.orderBy('created_at', 'desc')
			.limit(numListingLimit)
			.get();
		const count = (await postsColRef.count().get()).data().count;

		let posts: any[] = [];
		const idsSet = new Set<number>();

		postsSnapshotArr.docs.forEach((doc) => {
			if (doc && doc.exists) {
				const data = doc.data();
				if (data) {
					const { topic, topic_id } = data;
					let user_id = data.user_id;
					if (typeof user_id === 'number') {
						idsSet.add(user_id);
					} else {
						const numUserId = Number(user_id);
						if (!isNaN(numUserId)) {
							idsSet.add(numUserId);
							user_id = numUserId;
						}
					}
					posts.push({
						created_at: data?.created_at?.toDate? data?.created_at?.toDate(): data?.created_at,
						isSpam: data?.isSpam || false,
						post_id: data?.id,
						proposer: '',
						title: data?.title,
						topic: topic? topic: isTopicIdValid(topic_id)? {
							id: topic_id,
							name: getTopicNameFromTopicId(topic_id)
						}: getTopicFromType(ProposalType.DISCUSSIONS),
						type: proposalType,
						user_id,
						username: data?.username
					});
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
						posts = posts.map((v) => {
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
						posts = posts.map((v) => {
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

		posts = await getSpamUsersCountForPosts(network, posts, strProposalType);

		const data: ILatestActivityPostsListingResponse = {
			count,
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

const handler: NextApiHandler<ILatestActivityPostsListingResponse | { error: string }> = async (req, res) => {
	const { proposalType = OffChainProposalType.DISCUSSIONS, listingLimit = LISTING_LIMIT } = req.query;

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });

	const { data, error, status } = await getLatestActivityOffChainPosts({
		listingLimit,
		network,
		proposalType
	});

	if(error || !data) {
		res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	}else {
		res.status(status).json(data);
	}
};
export default withErrorHandling(handler);