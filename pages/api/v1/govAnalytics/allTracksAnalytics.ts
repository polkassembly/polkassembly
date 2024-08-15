// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { networkDocRef } from '~src/api-utils/firestore_refs';
import { redisGet, redisSetex } from '~src/auth/redis';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { IAnalyticsVoteTrends } from '~src/components/TrackLevelAnalytics/types';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { ProposalType } from '~src/global/proposalType';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import { generateKey } from '~src/util/getRedisKeys';

const getAllTrackLevelVotesAnalytics = async ({ network }: { network: string }) => {
	const TTL_DURATION = 3600 * 23; // 23 Hours or 82800 seconds

	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);

		const trackNumbers = Object.entries(networkTrackInfo[network]).map(([, value]) => value.trackId);
		const votes: IAnalyticsVoteTrends[] = [];
		const averageSupportPercentages: Record<string, number> = {}; // Object to store the average support percentages

		if (process.env.IS_CACHING_ALLOWED == '1') {
			const redisKey = generateKey({ govType: 'OpenGov', keyType: 'allTrackVotesAnalytics', network, proposalType: ProposalType.REFERENDUM_V2 });
			const redisData = await redisGet(redisKey);

			if (redisData) {
				return {
					data: { votes: JSON.parse(redisData) },
					error: null,
					status: 200
				};
			}
		}

		const dataPromise = trackNumbers.map(async (trackNumber) => {
			let totalSupportedVoted = 0;
			let totalVotes = 0;

			const trackSnapshot = await networkDocRef(network).collection('track_level_analytics').doc(String(trackNumber))?.collection('votes').get();

			trackSnapshot.docs.map((doc) => {
				const data = doc.data();
				console.log(data);
				const supportPercentage = data.voteAmount.supportData.percentage;
				const roundedNumber = Number(supportPercentage).toFixed(2);
				totalSupportedVoted += parseFloat(roundedNumber);
				totalVotes += 1; // Increment the total number of votes for this track
				votes.push(data as IAnalyticsVoteTrends);
			});

			// Calculate the average support percentage for the track and store it in the object
			averageSupportPercentages[trackNumber] = totalVotes ? totalSupportedVoted / totalVotes : 0;
			console.log('total supported votes --> ', totalSupportedVoted);
			console.log('average support percentage for track', trackNumber, ' --> ', averageSupportPercentages[trackNumber]);
		});

		await Promise.allSettled(dataPromise);

		if (process.env.IS_CACHING_ALLOWED == '1') {
			await redisSetex(
				generateKey({ govType: 'OpenGov', keyType: 'allTrackVotesAnalytics', network, proposalType: ProposalType.REFERENDUM_V2 }),
				TTL_DURATION,
				JSON.stringify(votes)
			);
		}

		console.log('average support percentage --> ', averageSupportPercentages);

		return { data: { averageSupportPercentages }, error: null, status: 200 };
	} catch (err) {
		return { data: null, error: err || messages.API_FETCH_ERROR, status: err.name };
	}
};

async function handler(req: NextApiRequest, res: NextApiResponse<any | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	const { data, error } = await getAllTrackLevelVotesAnalytics({
		network
	});
	if (data) {
		return res.status(200).json(data);
	} else {
		return res.status(400).json({ message: error });
	}
}

export default withErrorHandling(handler);
