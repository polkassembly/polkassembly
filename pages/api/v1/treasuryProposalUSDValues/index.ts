// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import { isValidNetwork } from '~src/api-utils';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { ProposalType, getStatusesFromCustomStatus } from '~src/global/proposalType';
import { chainProperties } from '~src/global/networkConstants';
import dayjs from 'dayjs';
import { subscanApiHeaders } from '~src/global/apiHeaders';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';

interface Props {
	postId: number;
	closedStatus: { timeStamp: Date; status: string } | null;
	proposalCreatedAt: Date;
}

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const { postId, proposalCreatedAt, closedStatus } = req.body as unknown as Props;

	const network = String(req.headers['x-network']);
	if (network === 'undefined' || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });
	try {
		const postSnapShot = postsByTypeRef(network, ProposalType.REFERENDUM_V2).doc(String(postId));
		const postRef = await postSnapShot.get();
		let usdValueOnCreation = null;
		let usdValueOnClosed = null;
		const postData: any = postRef?.data() || {};
		if (postData?.usdValueOnCreation) {
			usdValueOnCreation = postData?.usdValueOnCreation;
		} else {
			const date = dayjs(proposalCreatedAt).format('YYYY-MM-DD');

			const response = await fetch(`${chainProperties[network].externalLinks}/api/scan/price/history`, {
				body: JSON.stringify({
					end: date,
					start: date
				}),
				headers: subscanApiHeaders,
				method: 'POST'
			});
			const responseJSON = await response.json();
			if (responseJSON['message'] == 'Success') {
				const price = responseJSON['data']['ema7_average'];
				const priceNum: number = parseFloat(price);
				if (priceNum == 0) {
					usdValueOnCreation = null;
				} else {
					usdValueOnCreation = price ? String(price) : null;
				}
			}
		}
		if (closedStatus) {
			if (closedStatus?.status && getStatusesFromCustomStatus(CustomStatus.Closed).includes(closedStatus?.status)) {
				if (postData?.usdValueOnClosed) {
					usdValueOnClosed = postData?.usdValueOnClosed;
				} else {
					const date = dayjs(closedStatus?.timeStamp).format('YYYY-MM-DD');

					const response = await fetch(`${chainProperties[network].externalLinks}/api/scan/price/history`, {
						body: JSON.stringify({
							end: date,
							start: date
						}),
						headers: subscanApiHeaders,
						method: 'POST'
					});
					const responseJSON = await response.json();
					if (responseJSON['message'] == 'Success') {
						const price = responseJSON['data']['ema7_average'];
						const priceNum: number = parseFloat(price);
						if (priceNum == 0) {
							usdValueOnClosed = null;
						} else {
							usdValueOnClosed = price ? String(price) : null;
						}
					}
				}
			}
		}

		res.status(200).json({ usdValueOnClosed: usdValueOnClosed || null, usdValueOnCreation: usdValueOnCreation || null });

		if (!(postData?.usdValueOnCreation || postData?.usdValueOnClosed)) {
			let payload: any = { ...(postData || {}), usdValueOnCreation };
			if (closedStatus) {
				payload = { ...payload, usdValueOnClosed };
			}
			await postSnapShot.set(payload, { merge: true });
			return;
		} else {
			return;
		}
	} catch (error) {
		return res.status(500).json({ messages: error || messages.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
