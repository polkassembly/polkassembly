// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import messages from '~src/auth/utils/messages';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import { getStatusesFromCustomStatus, getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { GET_ALL_ACTIVE_PROPOSAL_FOR_EXPLORE_FEED, GET_TOTAL_VOTE_COUNT_ON_PROPOSAL } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getReactions } from '../posts/on-chain-post';

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	try {
		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_ALL_ACTIVE_PROPOSAL_FOR_EXPLORE_FEED,
			variables: {
				status_in: getStatusesFromCustomStatus(CustomStatus.Active),
				type_eq: getSubsquidProposalType(ProposalType.OPEN_GOV)
			}
		});

		const subsquidData = subsquidRes?.['data']?.proposals;
		if (!subsquidData?.length) return res.status(400).json({ message: messages.NO_ACTIVE_PROPOSAL_FOUND });

		const allPromises = subsquidData.map(async (subsquidPost: any) => {
			const { createdAt, index: postId } = subsquidPost;

			const totalVotesSubsquidRes = await fetchSubsquid({
				network,
				query: GET_TOTAL_VOTE_COUNT_ON_PROPOSAL,
				variables: {
					index_eq: postId,
					type_eq: getSubsquidProposalType(ProposalType.OPEN_GOV)
				}
			});

			const totalVotes = totalVotesSubsquidRes?.['data']?.flattenedConvictionVotesConnection?.totalCount || 0;

			const postDocRef = postsByTypeRef(network, ProposalType.REFERENDUM_V2 as ProposalType).doc(String(postId));
			const post_reactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
			const reactions = getReactions(post_reactionsQuerySnapshot);

			const commentsQuerySnapshot = await postDocRef.collection('comments').where('isDeleted', '==', false).count().get();

			return {
				createdAt: new Date(createdAt).toISOString().split('T')[0],
				votes: totalVotes,
				likes: reactions['👍']?.count || 0,
				dislikes: reactions['👎']?.count || 0,
				comments: commentsQuerySnapshot.data()?.count || 0
			};
		});

		const resolvedPromises = await Promise.allSettled(allPromises);
		const activityByDate: Record<string, { proposalsCreated: number; votes: number; likes: number; dislikes: number; comments: number }> = {};

		resolvedPromises.forEach((promise) => {
			if (promise.status === 'fulfilled' && promise.value) {
				const { createdAt, votes, likes, dislikes, comments } = promise.value;

				if (!activityByDate[createdAt]) {
					activityByDate[createdAt] = {
						proposalsCreated: 0,
						votes: 0,
						likes: 0,
						dislikes: 0,
						comments: 0
					};
				}

				activityByDate[createdAt].proposalsCreated += 1;
				activityByDate[createdAt].votes += votes;
				activityByDate[createdAt].likes += likes;
				activityByDate[createdAt].dislikes += dislikes;
				activityByDate[createdAt].comments += comments;
			}
		});

		const response = Object.entries(activityByDate).map(([date, metrics]) => ({
			date,
			...metrics
		}));

		return res.status(200).json({ data: response });
	} catch (err) {
		console.error('Error fetching activity calendar data:', err);
		return res.status(500).json({ message: messages.API_FETCH_ERROR });
	}
}

export default withErrorHandling(handler);
