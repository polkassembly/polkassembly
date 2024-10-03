// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { Post } from '~src/types';
import { CHECK_IF_OPENGOV_PROPOSAL_EXISTS } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { deleteKeys, redisDel } from '~src/auth/redis';

const handler: NextApiHandler<{ message: string; progress_report?: object }> = async (req, res) => {
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
			return res.status(401).json({ message: messages.INVALID_JWT });
		}

		const user = await authServiceInstance.GetUser(token);
		if (!user) {
			return res.status(401).json({ message: messages.UNAUTHORISED });
		}

		const { postId, proposalType, progress_report } = req.body;

		if (!postId || !proposalType || !progress_report) {
			return res.status(401).json({ message: messages.INVALID_PARAMS });
		}

		if (!isProposalTypeValid(proposalType)) {
			return res.status(401).json({ message: messages.INVALID_PARAMS });
		}

		const updatedProgressReport = {
			...progress_report,
			created_at: new Date()
		};

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
			created_at: new Date(post?.createdAt),
			id: post?.index,
			last_edited_at: new Date(post?.updatedAt),
			progress_report: updatedProgressReport,
			proposer_address: post?.proposer
		};

		await postDocRef.update(updatedPost);
		const subsquidProposalType = getSubsquidProposalType(proposalType);
		if (proposalType == ProposalType.REFERENDUM_V2 && process.env.IS_CACHING_ALLOWED == '1') {
			const trackListingKey = `${network}_${subsquidProposalType}_trackId_${post?.trackNumber}_*`;
			const referendumDetailsKey = `${network}_OpenGov_${subsquidProposalType}_postId_${postId}`;
			await deleteKeys(trackListingKey);
			await redisDel(referendumDetailsKey);
		}

		return res.status(200).json({
			message: 'Progress report added and post updated successfully.',
			progress_report: updatedProgressReport
		});
	} catch (error) {
		console.error('Error in updating progress report:', error);
		return res.status(500).json({ message: error || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
