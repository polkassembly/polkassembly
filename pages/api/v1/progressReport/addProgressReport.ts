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
import { Post, IProgressReport } from '~src/types';
import { CHECK_IF_OPENGOV_PROPOSAL_EXISTS } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { deleteKeys, redisDel } from '~src/auth/redis';

const handler: NextApiHandler<{ message: string; progress_report?: IProgressReport[] }> = async (req, res) => {
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
		if (!postId || !proposalType || !progress_report || !isProposalTypeValid(proposalType)) {
			return res.status(400).json({ message: messages.INVALID_PARAMS });
		}

		const generateUniqueId = () => {
			const timestamp = Date.now();
			const randomNumber = Math.floor(Math.random() * 10000);
			return `${postId}-${timestamp}-${randomNumber}`;
		};

		const newProgressReport: IProgressReport = {
			created_at: new Date(),
			id: generateUniqueId(),
			is_edited: false,
			progress_file: progress_report.progress_file,
			progress_summary: progress_report.progress_summary,
			ratings: progress_report.ratings || []
		};

		const proposalTypeQuery = getSubsquidProposalType(proposalType);
		const treasuryRes = await fetchSubsquid({
			network,
			query: CHECK_IF_OPENGOV_PROPOSAL_EXISTS,
			variables: {
				proposalIndex: Number(postId),
				type_eq: proposalTypeQuery
			}
		});

		const post = treasuryRes?.data?.proposals?.[0];

		const postDocRef = postsByTypeRef(network, proposalType).doc(String(postId));
		const postDoc = await postDocRef.get();

		if (!post && !postDoc.exists) {
			return res.status(404).json({ message: 'Post not found.' });
		}

		const existingProgressReports =
			postDoc.exists && Array.isArray(postDoc.data()?.progress_report) ? postDoc.data()?.progress_report : postDoc.data()?.progress_report ? [postDoc.data()?.progress_report] : [];

		const updatedProgressReports: IProgressReport[] = [newProgressReport, ...existingProgressReports];

		const updatedPost: Partial<Post> = {
			created_at: new Date(post?.createdAt),
			id: post?.index,
			last_edited_at: new Date(post?.updatedAt),
			progress_report: updatedProgressReports,
			proposer_address: post?.proposer
		};

		await postDocRef.update(updatedPost);

		if (proposalType === ProposalType.REFERENDUM_V2 && process.env.IS_CACHING_ALLOWED === '1') {
			const trackListingKey = `${network}_${proposalTypeQuery}_trackId_${post?.trackNumber}_*`;
			const referendumDetailsKey = `${network}_OpenGov_${proposalTypeQuery}_postId_${postId}`;
			await Promise.all([deleteKeys(trackListingKey), redisDel(referendumDetailsKey)]);
		}

		return res.status(200).json({
			message: 'Progress report added and post updated successfully.',
			progress_report: updatedProgressReports
		});
	} catch (error) {
		console.error('Error in updating progress report:', error);
		return res.status(500).json({ message: messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
