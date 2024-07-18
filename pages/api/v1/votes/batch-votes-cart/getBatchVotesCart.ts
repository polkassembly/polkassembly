// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { firestore_db } from '~src/services/firebaseInit';
import getEncodedAddress from '~src/util/getEncodedAddress';

interface Args {
	userAddress: string;
	page: number;
}

export interface IBatchVoteCartResponse {
	referendumIndex: number;
	network: string;
	decision: 'aye' | 'nay' | 'abstain';
	balance: string;
	lockedPeriod: number;
	userAddress: string;
	id: string;
	createAt: Date;
	updatedAt: Date | null;
}

const handler: NextApiHandler<{ votes: IBatchVoteCartResponse[] } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	try {
		if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

		const network = String(req.headers['x-network']);
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		const token = getTokenFromReq(req);
		if (!token) return res.status(403).json({ message: messages.UNAUTHORISED });

		const user = await authServiceInstance.GetUser(token);
		if (!user || isNaN(user.id)) return res.status(403).json({ message: messages.UNAUTHORISED });

		const { userAddress, page } = req.body as unknown as Args;

		if (isNaN(page) || !getEncodedAddress(userAddress, network)) {
			return res.status(500).json({ message: messages.INVALID_PARAMS });
		}

		const cartRef = await firestore_db
			.collection('users')
			.doc(String(user?.id))
			.collection('batch_votes_cart')
			.where('user_address', '==', userAddress)
			.where('network', '==', network)
			.limit(LISTING_LIMIT)
			.offset(LISTING_LIMIT * (page - 1))
			.orderBy('created_at', 'desc')
			.get();

		if (cartRef?.empty) {
			return res.status(200).json({ votes: [] });
		} else {
			const cartDocs = cartRef.docs;
			const votes = cartDocs.map((doc: any) => {
				const data = doc.data();
				return {
					balance: data?.balance || '0',
					createAt: data?.created_at?.toDate ? data?.created_at.toDate() : data?.created_at,
					decision: data?.decison || 'aye',
					id: data?.id || '',
					lockedPeriod: data?.locked_period || 0.1,
					network: data?.network || network,
					referendumIndex: data?.referendum_index,
					updatedAt: data?.update_at?.toDate ? data?.update_at.toDate() : data?.update_at,
					userAddress: data?.user_address
				};
			});
			return res.status(200).send({ votes: votes || [] });
		}
	} catch (error) {
		return res.status(500).send({ message: error || messages.API_FETCH_ERROR });
	}
};
export default withErrorHandling(handler);
