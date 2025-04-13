// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { OffChainProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';
import { WebHooks } from '../../utils/webHook';

const deletePostIfAuthorized = async ({
	authorId,
	postId,
	network,
	postType,
	userId
}: {
	authorId: number;
	postId: number;
	network: string;
	postType: OffChainProposalType;
	userId: number;
}): Promise<{ success: boolean; message: string; error?: string }> => {
	try {
		if (authorId !== userId) {
			return {
				success: false,
				message: 'You are not authorized to delete this post'
			};
		}

		const postRef = firestore_db.collection('networks').doc(network).collection('post_types').doc(postType).collection('posts').doc(String(postId));

		await postRef.update({
			isDeleted: true
		});

		return {
			success: true,
			message: 'Post deleted successfully'
		};
	} catch (error) {
		console.log('Error: ', error);
		return {
			success: false,
			message: 'Internal server error',
			error: error instanceof Error ? error.message : 'Unexpected error occurred.'
		};
	}
};

const handler: NextApiHandler<MessageType> = async (req, res) => {
	try {
		const network = String(req.headers['x-network']);

		if (!network || !isValidNetwork(network)) {
			return res.status(400).json({ message: messages.INVALID_NETWORK });
		}

		const token = getTokenFromReq(req);
		if (!token) {
			return res.status(400).json({ message: 'Invalid token' });
		}

		const user = await authServiceInstance.GetUser(token);
		if (!user || !user.id) {
			return res.status(403).json({ message: 'Unauthorized' });
		}

		const { authorId, postId, postType } = req.body;

		if (!authorId || !postId || !network || !postType) {
			return;
		}

		if (!Object.values(OffChainProposalType).includes(postType)) {
			res.status(400).json({ message: 'Invalid post type' });
		}

		const response = await deletePostIfAuthorized({
			authorId,
			postId,
			network,
			postType,
			userId: Number(user.id)
		});

		if (response.success) {
			return res.status(200).json({ message: response.message });
		} else {
			return res.status(403).json({ message: response.message });
		}
	} catch (error) {
		console.log('Error: ', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

export default withErrorHandling(handler);
