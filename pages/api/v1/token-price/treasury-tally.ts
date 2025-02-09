// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { NextApiHandler } from 'next';
import { firestore_db } from '~src/services/firebaseInit';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import messages from '~src/auth/utils/messages';
import { isValidNetwork } from '~src/api-utils';
import BN from 'bn.js';
import { chainProperties } from '~src/global/networkConstants';
import { TreasuryData } from '~src/types';

interface FetchTokenPriceResponse {
	data: TreasuryData | null;
	error: string | null;
	status: number;
}

const divideByPower = (value: string, power: number): string => {
	const bnValue = new BN(value, 10);
	const divisor = new BN(10).pow(new BN(power));
	const result = bnValue.div(divisor);
	return result.toString();
};

export const fetchTreasuryStatsFromDB = async ({ network }: { network: string }): Promise<FetchTokenPriceResponse> => {
	try {
		const networkDocRef = firestore_db.collection('networks').doc(network.toLowerCase());
		const networkDocSnapshot = await networkDocRef.get();

		if (!networkDocSnapshot.exists) {
			return {
				data: null,
				error: `No data found for network: ${network}`,
				status: 404
			};
		}

		const treasuryStatsData = networkDocSnapshot.get('treasury_stats');
		if (!treasuryStatsData) {
			return {
				data: null,
				error: `No treasury_stats data found for network: ${network}`,
				status: 404
			};
		}

		const tokenDecimals = chainProperties?.[network]?.tokenDecimals || 10;

		const processedData: TreasuryData = {
			relayChain: {
				dot: divideByPower(treasuryStatsData.relayChain.dot, tokenDecimals),
				myth: divideByPower(treasuryStatsData.relayChain.myth, 18)
			},
			ambassador: {
				usdt: divideByPower(treasuryStatsData.ambassador.usdt, 6)
			},
			assetHub: {
				dot: divideByPower(treasuryStatsData.assetHub.dot, tokenDecimals),
				usdc: divideByPower(treasuryStatsData.assetHub.usdc, 6),
				usdt: divideByPower(treasuryStatsData.assetHub.usdt, 6)
			},
			hydration: {
				dot: divideByPower(treasuryStatsData.hydration.dot, tokenDecimals),
				usdc: divideByPower(treasuryStatsData.hydration.usdc, 6),
				usdt: divideByPower(treasuryStatsData.hydration.usdt, 6)
			},
			bounties: {
				dot: divideByPower(treasuryStatsData.bounties.dot, tokenDecimals)
			},
			fellowship: {
				dot: divideByPower(treasuryStatsData.fellowship.dot, tokenDecimals),
				usdt: divideByPower(treasuryStatsData.fellowship.usdt, 6)
			},
			total: {
				totalDot: divideByPower(treasuryStatsData.total.totalDot, tokenDecimals),
				totalUsdc: divideByPower(treasuryStatsData.total.totalUsdc, 6),
				totalUsdt: divideByPower(treasuryStatsData.total.totalUsdt, 6),
				totalMyth: divideByPower(treasuryStatsData.total.totalMyth, 18)
			},
			loans: {
				dot: divideByPower(treasuryStatsData.loans.dot, tokenDecimals),
				usdc: divideByPower(treasuryStatsData.loans.usdc, 6)
			}
		};

		return {
			data: processedData,
			error: null,
			status: 200
		};
	} catch (error) {
		console.error('Error fetching treasury stats from Firestore:', error);
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: 500
		};
	}
};

const handler: NextApiHandler = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	if (!network || !isValidNetwork(network)) {
		return res.status(400).json({ message: messages.INVALID_NETWORK });
	}

	const { data, error, status } = await fetchTreasuryStatsFromDB({ network });

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json({ data });
	}
};

export default withErrorHandling(handler);
