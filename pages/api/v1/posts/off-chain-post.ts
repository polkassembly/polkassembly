// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isFirestoreProposalTypeValid, isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { getSubsquidProposalType, OffChainProposalType, ProposalType } from '~src/global/proposalType';
import { GET_PROPOSAL_BY_INDEX_AND_TYPE_FOR_LINKING } from '~src/queries';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import messages from '~src/util/messages';

import { getProposerAddressFromFirestorePostData } from '../listing/on-chain-posts';
import { getComments, getReactions, getTimeline, IPostResponse, isDataExist } from './on-chain-post';

interface IGetOffChainPostParams {
	network: string;
	postId?: string | string[] | number;
	proposalType: OffChainProposalType | string | string[];
}

export const getUpdatedAt = (data: any) => {
	let updated_at: Date | string | null = null;
	if (data) {
		if (data.last_edited_at) {
			updated_at = data.last_edited_at?.toDate? data.last_edited_at.toDate(): data.last_edited_at;
		} else if (data.updated_at) {
			updated_at = data.updated_at?.toDate? data.updated_at?.toDate(): data.updated_at;
		}
	}
	return updated_at;
};

export async function getOffChainPost(params: IGetOffChainPostParams) : Promise<IApiResponse<IPostResponse>> {
	try {
		const { network, postId, proposalType } = params;
		if (postId === undefined || postId === null) {
			throw apiErrorWithStatusCode('Please send postId', 400);
		}

		const strProposalType = String(proposalType);
		if (!isFirestoreProposalTypeValid(strProposalType)) {
			throw apiErrorWithStatusCode(`The off chain proposal type "${proposalType}" is invalid.`, 400);
		}

		const postDocRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(postId));
		const discussionPostDoc = await postDocRef.get();
		if (!(discussionPostDoc && discussionPostDoc.exists)) {
			throw apiErrorWithStatusCode(`The Post with id "${postId}" is not found.`, 400);
		}

		// Post Reactions
		const postReactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
		const post_reactions = getReactions(postReactionsQuerySnapshot);

		// Comments
		const commentsSnapshot = await postDocRef.collection('comments').get();
		const comments = await getComments(commentsSnapshot, postDocRef);

		// Post Data
		const data = discussionPostDoc.data();

		const timeline = [
			{
				created_at: data?.created_at?.toDate? data?.created_at?.toDate(): data?.created_at,
				index: Number(postId),
				statuses: [
					{
						status: 'Created',
						timestamp: data?.created_at?.toDate? data?.created_at?.toDate(): data?.created_at
					}
				],
				type: 'Discussions'
			}
		];
		const topic = data?.topic;
		const topic_id = data?.topic_id;
		const tags = data?.tags || [];
		const gov_type = data?.gov_type;
		const proposer_address = getProposerAddressFromFirestorePostData(data, network);
		const post_link = data?.post_link;
		if (post_link) {
			const { id, type } = post_link;
			const postDocRef = postsByTypeRef(network, type).doc(String(id));
			const postDoc = await postDocRef.get();
			const postData = postDoc.data();
			if (postDoc.exists && postData) {
				post_link.title = postData.title;
				post_link.description = postData.content;
			}
			if (!post_link.title && !post_link.description) {
				if (isProposalTypeValid(type)) {
					const subsquidProposalType = getSubsquidProposalType(type as any);
					const variables: any = {
						type_eq: subsquidProposalType
					};

					if (type === ProposalType.TIPS) {
						variables['hash_eq'] = String(id);
					} else {
						variables['index_eq'] = Number(id);
					}
					const subsquidRes = await fetchSubsquid({
						network,
						query: GET_PROPOSAL_BY_INDEX_AND_TYPE_FOR_LINKING,
						variables: variables
					});
					const subsquidData = subsquidRes?.data;
					if (!isDataExist(subsquidData)) {
						throw apiErrorWithStatusCode(`The Post with id: "${id}" and type: "${type}" is not found.`, 400);
					}
					const post = subsquidData.proposals[0];
					const preimage = post?.preimage;
					if (!post_link.title) {
						post_link.title = preimage?.method;
					}
					if (!post_link.description) {
						post_link.description = post.description || preimage?.proposedCall?.description;
					}
					if (post) {
						const proposals = post?.group?.proposals;
						if (proposals && Array.isArray(proposals)) {
							timeline.push(...getTimeline(proposals));
						}

						if (timeline.length === 1) {
							timeline.push(getTimeline([
								{
									createdAt: postData?.createdAt,
									hash: postData?.hash,
									index: postData?.index,
									statusHistory: postData?.statusHistory,
									type: postData?.type
								}
							]));
						}
					}
				}
			}
		}
		const post: IPostResponse = {
			comments: comments,
			content: data?.content,
			created_at: data?.created_at?.toDate? data?.created_at?.toDate(): data?.created_at,
			gov_type: gov_type,
			last_edited_at: getUpdatedAt(data),
			post_id: data?.id,
			post_link: post_link,
			post_reactions: post_reactions,
			proposer: proposer_address,
			tags: tags || [],
			timeline: timeline,
			title: data?.title,
			topic: topic? topic: isTopicIdValid(topic_id)? {
				id: topic_id,
				name: getTopicNameFromTopicId(topic_id)
			}: getTopicFromType(strProposalType as ProposalType),
			user_id: data?.user_id,
			username: data?.username

		};
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

// expects optional discussionType and postId of proposal
const handler: NextApiHandler<IPostResponse | { error: string }> = async (req, res) => {
	const { postId = 0, proposalType = OffChainProposalType.DISCUSSIONS } = req.query;

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });

	const { data, error, status } = await getOffChainPost({
		network,
		postId,
		proposalType
	});

	if(error || !data) {
		res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	}else {
		res.status(status).json(data);
	}
};
export default withErrorHandling(handler);