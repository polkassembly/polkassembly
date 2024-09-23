// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { Post } from '~src/types';
import { CHECK_IF_OPENGOV_PROPOSAL_EXISTS } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getSubsquidProposalType } from '~src/global/proposalType';

const handler: NextApiHandler<MessageType> = async (req, res) => {
	try {
		storeApiKeyUsage(req);

		if (req.method !== 'POST') {
			return res.status(405).json({ message: 'Invalid request method, POST required.' });
		}

		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) {
			return res.status(400).json({ message: messages.INVALID_NETWORK });
		}

		const token = getTokenFromReq(req);
		if (!token) {
			return res.status(400).json({ message: messages.INVALID_JWT });
		}

		const user = await authServiceInstance.GetUser(token);
		if (!user) {
			return res.status(403).json({ message: messages.UNAUTHORISED });
		}

		const { postId, proposalType, progress_report } = req.body;

		if (!postId || !proposalType || !progress_report) {
			return res.status(400).json({ message: messages.INVALID_PARAMS });
		}

		if (!isProposalTypeValid(proposalType)) {
			return res.status(500).json({ message: messages.INVALID_PARAMS });
		}

		const TreasuryRes = await fetchSubsquid({
			network: network,
			query: CHECK_IF_OPENGOV_PROPOSAL_EXISTS,
			variables: {
				proposalIndex: Number(postId),
				type_eq: getSubsquidProposalType(proposalType)
			}
		});

		const post = TreasuryRes?.data?.proposals?.[0];

		const postDocRef = postsByTypeRef(network, proposalType).doc(String(postId));
		const postDoc = await postDocRef.get();

		if (post?.index !== Number(postId) && !postDoc.exists) {
			return res.status(404).json({ message: 'Post not found.' });
		}

		const updatedPost: Partial<Post> = {
			created_at: post?.createdAt,
			id: post?.index,
			last_edited_at: post?.updatedAt,
			progress_report: progress_report,
			proposer_address: post?.proposer,
			typeOfReferendum: post?.type
		};

		await postDocRef.update(updatedPost);
		return res.status(200).json({ message: 'Progress report added and post updated successfully.' });
	} catch (error) {
		console.error('Error in updating progress report:', error);
		return res.status(500).json({ message: 'An error occurred while processing the request.' });
	}
};

export default withErrorHandling(handler);
