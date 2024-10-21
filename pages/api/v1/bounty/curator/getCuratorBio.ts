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
import { firestore_db } from '~src/services/firebaseInit';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

interface Args {
	network: string;
	userId: number;
}

export async function getCuratorBio({ network, userId }: Args): Promise<IApiResponse<{ curatorBio: string }>> {
	try {
		if (!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK, 400);

		if (isNaN(userId)) throw apiErrorWithStatusCode(messages.INVALID_PARAMS, 400);

		const userDoc = await firestore_db.collection('users').doc(String(userId)).get();

		if (!userDoc?.exists) {
			throw apiErrorWithStatusCode(messages.UNAUTHORISED, 400);
		}

		const userData = userDoc?.data();

		return {
			data: { curatorBio: userData?.curator_bio || '' },
			error: null,
			status: 200
		};
	} catch (err) {
		return {
			data: null,
			error: err || messages.API_FETCH_ERROR,
			status: 500
		};
	}
}
const handler: NextApiHandler<{ curatorBio: string } | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: messages?.INVALID_JWT });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { data, error } = await getCuratorBio({
		network,
		userId: user?.id
	});

	if (data) {
		return res.status(200).json(data);
	} else {
		return res.status(500).json({ message: error || messages?.API_FETCH_ERROR });
	}
};

export default withErrorHandling(handler);
