// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { isValidNetwork } from '~src/api-utils';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { getStatusesFromCustomStatus } from '~src/global/proposalType';
import dayjs from 'dayjs';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import { getSubscanData } from '../subscanApi';

interface Props {
	closedStatus: { timeStamp: Date; status: string } | null;
	proposalCreatedAt: Date;
	postId: number;
}

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const { proposalCreatedAt, closedStatus, postId } = req.body as unknown as Props;

	const network = String(req.headers['x-network']);
	if (network === 'undefined' || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });
	try {
		let usdValueOnCreation = null;
		let usdValueOnClosed = null;

		const date = dayjs(proposalCreatedAt).format('YYYY-MM-DD');

		const response = await getSubscanData('/api/scan/price/history', network, {
			end: date,
			post_id: postId,
			start: date
		});

		if (response.message === 'Success' && response?.['list']?.[0]?.['price']) {
			const price = response?.['list']?.[0]?.['price'];
			const priceNum: number = parseFloat(price.toFixed(2));
			if (priceNum == 0) {
				usdValueOnCreation = null;
			} else {
				usdValueOnCreation = price ? String(price) : null;
			}
		} else {
			usdValueOnCreation = null;
		}

		if (closedStatus) {
			if (closedStatus?.status && getStatusesFromCustomStatus(CustomStatus.Closed).includes(closedStatus?.status)) {
				const closedDate = dayjs(closedStatus?.timeStamp).format('YYYY-MM-DD');

				const response = await getSubscanData('/api/scan/price/history', network, {
					end: closedDate,
					post_id: postId,
					start: closedDate
				});

				if (response.message === 'Success' && response?.['list']?.[0]?.['price']) {
					const price = response?.['list']?.[0]?.['price'];
					const priceNum: number = parseFloat(price.toFixed(2));
					if (priceNum == 0) {
						usdValueOnClosed = null;
					} else {
						usdValueOnClosed = price ? String(price) : null;
					}
				} else {
					usdValueOnClosed = null;
				}
			}
		}

		return res.status(200).json({ usdValueOnClosed: usdValueOnClosed || null, usdValueOnCreation: usdValueOnCreation || null });
	} catch (error) {
		return res.status(500).json({ messages: error || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
