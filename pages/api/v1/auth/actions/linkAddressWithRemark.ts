// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { Address, ChangeResponseType, MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { getSubscanData } from '../../subscanApi';
import { isValidNetwork } from '~src/api-utils';
import { firestore_db } from '~src/services/firebaseInit';
import { Wallet } from '~src/types';

async function handler(req: NextApiRequest, res: NextApiResponse<ChangeResponseType | MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Missing or invalid network name in request headers' });

	const { hash: hashRaw } = req.body;

	const hash = String(hashRaw);
	if (!hash || !hash.startsWith('0x') || hash.length <= 3) return res.status(400).json({ message: 'Missing or invalid parameter `hash` in request body.' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	// get user id from token, and verify if logged in
	const user = await authServiceInstance.GetUser(token);
	if (!user || isNaN(user.id)) return res.status(403).json({ message: messages.UNAUTHORISED });

	// get tx data from tx hash
	const txData = await getSubscanData('/api/scan/extrinsic', network, {
		events_limit: 1,
		hash,
		only_extrinsic_event: true
	});

	if (txData.message !== 'Success') {
		return res.status(400).json({ message: 'Could not get transaction data. Please try again.' });
	}

	// check tx data if it has the remark with user id
	const txParams = (txData.data.params || []) as any[];

	const remarkExists = txParams.find((paramObj) => {
		return paramObj.name === 'remark' && paramObj.value === `PolkassemblyUser:${user.id}`;
	});

	const userSubstrateAddress = getSubstrateAddress(txData.data.account_id || '');

	if (!remarkExists || !txData.data.account_id || !userSubstrateAddress) {
		return res.status(400).json({ message: 'The remark does not exist in this transaction hash. Please provide a different hash.' });
	}

	// see if address is linked with another userId already
	const addressExistsInDb = (await firestore_db.collection('addresses').doc(userSubstrateAddress).get()).exists;

	if (addressExistsInDb) return res.status(400).json({ message: 'This address is already linked to another account, please un-link to link here.' });

	//create new entry with db
	const newAddress: Address = {
		address: userSubstrateAddress,
		default: false,
		is_erc20: userSubstrateAddress.startsWith('0x'),
		network,
		public_key: '',
		sign_message: '',
		user_id: user.id,
		verified: false
	};

	await firestore_db
		.collection('addresses')
		.doc(userSubstrateAddress)
		.set(newAddress)
		.catch((error) => {
			console.log(' Error while address linking address start : ', error);
			return res.status(400).json({ message: messages.ADDRESS_LINKING_FAILED });
		});

	// link address to current userId
	const updatedJWT = await authServiceInstance.AddressLinkConfirm(token, userSubstrateAddress, '', Wallet.OTHER, true);

	return res.status(200).json({ message: messages.ADDRESS_LINKING_SUCCESSFUL, token: updatedJWT });
}

export default withErrorHandling(handler);
