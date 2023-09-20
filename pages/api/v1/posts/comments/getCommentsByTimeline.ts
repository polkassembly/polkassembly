// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import messages from '~src/util/messages';
import { getComments } from '../on-chain-post';
import { MessageType } from '~src/auth/types';
import { ProposalType, getFirestoreProposalType } from '~src/global/proposalType';
import { IComment } from '~src/components/Post/Comment/Comment';
import { ITimelineData } from '~src/context/PostDataContext';
import { ESentiments } from '~src/types';
import { getSubSquareComments } from './subsquare-comments';

export interface ITimelineComments {
	comments: {
		[index: string]: Array<IComment>;
	};
	overallSentiments: {
		[index: string]: number;
	};
}

export const getCommentsByTimeline = async ({ network, postTimeline }: { network: string; postTimeline: ITimelineData }) => {
	try {
		const allTimelineComments: any = {};
		const commentPromises = postTimeline.map(async (timeline: any) => {
			const post_index = timeline.type === 'Tip' ? timeline.hash : timeline.index;
			const type = getFirestoreProposalType(timeline.type) as ProposalType;
			const postDocRef = postsByTypeRef(network, type).doc(String(post_index));
			const commentsSnapshot = await postDocRef.collection('comments').get();
			const timelineComments = await getComments(commentsSnapshot, postDocRef, network, type, post_index);
			return timelineComments;
		});

		const commentPromiseSettledResults = await Promise.allSettled(commentPromises);
		commentPromiseSettledResults.forEach((result, index) => {
			if (result && result.status === 'fulfilled' && result.value && Array.isArray(result.value)) {
				const key = `${postTimeline[index].index}_${postTimeline[index].type}`;
				allTimelineComments[key] = result.value;
			}
		});

		// Subsquare Comments
		try {
			const lastTimeline = postTimeline[postTimeline.length - 1];
			const proposalIndex = lastTimeline.type === 'Tip' ? lastTimeline.hash : lastTimeline.index;
			const subsquareComments = await getSubSquareComments(getFirestoreProposalType(lastTimeline.type), network, proposalIndex);
			if (subsquareComments.length > 0) {
				const key = `${lastTimeline.index}_${lastTimeline.type}`;
				allTimelineComments[key] = [...(allTimelineComments?.[key] || []), ...subsquareComments];
			}
		} catch (e) {
			console.log('error in fetching subsquare comments', e);
		}

		// Sentiments
		const sentiments: any = {};
		const sentimentsKey: Array<ESentiments> = [ESentiments.Against, ESentiments.SlightlyAgainst, ESentiments.Neutral, ESentiments.SlightlyFor, ESentiments.For];
		if (postTimeline && Array.isArray(postTimeline) && postTimeline.length > 0) {
			let timeline: any = null;
			for (timeline of postTimeline) {
				const postDocRef = postsByTypeRef(network, getFirestoreProposalType(timeline.type) as ProposalType).doc(String(timeline.type === 'Tip' ? timeline.hash : timeline.index));
				for (let i = 0; i < sentimentsKey.length; i++) {
					const key = sentimentsKey[i];
					sentiments[key] = sentiments[key]
						? sentiments[key] +
						  (
								await postDocRef
									.collection('comments')
									.where('isDeleted', '==', false)
									.where('sentiment', '==', i + 1)
									.count()
									.get()
						  ).data().count
						: (
								await postDocRef
									.collection('comments')
									.where('isDeleted', '==', false)
									.where('sentiment', '==', i + 1)
									.count()
									.get()
						  ).data().count;
				}
			}
		}

		return {
			data: { comments: allTimelineComments, overallSentiments: sentiments } as ITimelineComments,
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
};

const handler: NextApiHandler<ITimelineComments | MessageType> = async (req, res) => {
	const { postTimeline } = req.body;
	const network = String(req.headers['x-network']);

	if (!postTimeline) {
		return res.status(400).json({ message: messages.NETWORK_VALIDATION_ERROR });
	}
	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: messages.NETWORK_VALIDATION_ERROR });
	}
	const { data, error, status } = await getCommentsByTimeline({
		network,
		postTimeline
	});

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
