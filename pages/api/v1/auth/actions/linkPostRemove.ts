// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { ProposalType } from '~src/global/proposalType';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { getPostsRefAndData, updatePostLinkInGroup } from './linkPostConfirm';

export interface ILinkPostRemoveResponse {
	timeline: any[];
}

const handler: NextApiHandler<ILinkPostRemoveResponse | MessageType> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { postId, postType, currPostId, currPostType } = req.body;

	if((!postId && postId !== 0) || (!currPostId && currPostId !== 0) || !postType || !currPostType) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	try {
		[postType, currPostType].filter((type) => {
			const strType = String(type) as ProposalType;
			const isOffChainPost = isOffChainProposalTypeValid(strType);
			const isOnChainPost = isProposalTypeValid(strType);

			if (!isOffChainPost && !isOnChainPost) {
				throw apiErrorWithStatusCode(`The post type of the name "${type}" does not exist.`, 400);
			}
		});
		const postsRefWithData = await getPostsRefAndData({
			network,
			posts: [
				{
					id: currPostId,
					isExistChecked: true,
					type: currPostType
				},
				{
					id: postId,
					isExistChecked: false,
					type: postType
				}
			]
		});
		if (postsRefWithData.length !== 2) {
			throw apiErrorWithStatusCode('Something went wrong!', 500);
		}
		const [{ data: currPostData, ref: currPostDocRef }, { data: postData, ref: postDocRef }] = postsRefWithData;
		let params = {
			currPostData,
			currPostDocRef,
			currPostId,
			currPostType,
			isRemove: true,
			isTimeline: false,
			network,
			postId,
			postType,
			user
		};
		if (isOffChainProposalTypeValid(String(postType))) {
			if (!postData) {
				throw apiErrorWithStatusCode(`Post with id: "${postId}" and type: "${postType}" does not exist.`, 404);
			}
			const isAuthor = user.id === postData.user_id;
			if (!isAuthor) {
				throw apiErrorWithStatusCode('You can not unlink the post, because you are not the user who created this post.', 403);
			}
			params = {
				currPostData: postData,
				currPostDocRef: postDocRef,
				currPostId: postId,
				currPostType: postType,
				isRemove: true,
				isTimeline: true,
				network,
				postId: currPostId,
				postType: currPostType,
				user
			};
		}

		const data = await updatePostLinkInGroup(params);
		return res.status(200).json(data);
	} catch (error) {
		return res.status(error.name).json({ message: error.message });
	}

};

export default withErrorHandling(handler);
