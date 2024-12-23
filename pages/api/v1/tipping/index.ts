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
import { chainProperties } from '~src/global/networkConstants';
import { firestore_db } from '~src/services/firebaseInit';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

export interface ITip {
	created_at: Date;
	remark: string;
	network: string;
	tip_from: string;
	tip_to: string;
	user_id: number;
	amount: number;
	token: string;
	extrinsic_hash: any;
}

const handler: NextApiHandler<MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	const token = getTokenFromReq(req);
	if (!token) return res.status(403).json({ message: messages.UNAUTHORISED });

	const user = await authServiceInstance.GetUser(token);
	if (!user || isNaN(user.id)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { remark, tipFrom, tipTo, amount, txHash } = req.body;

	if (!remark || typeof remark !== 'string' || !tipFrom || !tipTo || typeof tipFrom !== 'string' || typeof tipTo !== 'string' || !amount || typeof amount !== 'number') {
		return res.status(400).json({ message: messages.INVALID_PARAMS });
	}

	const tokenSymbol = `${chainProperties[network]?.tokenSymbol}`;

	const substracteTipFrom = getSubstrateAddress(tipFrom) || tipFrom;
	const substracteTipTo = getSubstrateAddress(tipTo) || tipTo;

	const tippingsDoc = firestore_db.collection('tippings').doc();
	const newTip: ITip = {
		amount,
		created_at: new Date(),
		extrinsic_hash: txHash,
		network,
		remark,
		tip_from: substracteTipFrom,
		tip_to: substracteTipTo,
		token: tokenSymbol,
		user_id: user.id
	};

	await tippingsDoc
		.set(newTip as any, { merge: true })
		.then(() => {
			return res.status(200).json({ message: messages.SUCCESS });
		})
		.catch((error) => {
			console.error('Error saving post: ', error);
			return res.status(500).json({ message: messages.ERROR_IN_ADDING_EVENT });
		});
};

export default withErrorHandling(handler);
