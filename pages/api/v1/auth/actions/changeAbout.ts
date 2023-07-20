// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { MessageType, ProfileDetails } from '~src/auth/types';
import getUserFromUserId from '~src/auth/utils/getUserFromUserId';
import messages from '~src/auth/utils/messages';
import verifySignature from '~src/auth/utils/verifySignature';
import firebaseAdmin from '~src/services/firebaseInit';
import { Wallet } from '~src/types';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	if (req.method !== 'POST')
		return res
			.status(405)
			.json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network)
		return res
			.status(400)
			.json({ message: 'Missing network name in request headers' });

	const {
		address,
		title,
		description,
		image = '',
		signature,
		wallet,
	} = req.body;
	if (!address || !title || !description || !signature || !wallet)
		return res
			.status(400)
			.json({ message: 'Missing parameters in request body' });

	const signMessage = `<Bytes>about::network:${network}|address:${address}|title:${title}|description:${description}|image:${image}</Bytes>`;

	const isValidSr = verifySignature(signMessage, address, signature);
	if (!isValidSr)
		return res
			.status(400)
			.json({ message: messages.ABOUT_INVALID_SIGNATURE });

	let userId: number;
	let newProfile: ProfileDetails = {
		badges: [],
		bio: description,
		image: '',
		title,
	};

	const firestore = firebaseAdmin.firestore();
	const addressDoc = await firestore
		.collection('addresses')
		.doc(address)
		.get();
	if (!addressDoc.exists) {
		const signMessage = await authServiceInstance.AddressSignupStart(
			address,
		);
		const { user_id } = await authServiceInstance.AddressSignupConfirm(
			network,
			address,
			signMessage,
			wallet as Wallet,
		);
		userId = user_id!;
	} else {
		userId = addressDoc.data()?.user_id;
		const user = await getUserFromUserId(userId);
		const oldProfile = user.profile;
		newProfile = {
			...oldProfile,
			bio: description,
			title: title,
		};
	}

	const userRef = firestore.collection('users').doc(String(userId));

	//update profile field in userRef
	userRef
		.update({ profile: newProfile })
		.then(() => {
			return res.status(200).json({ message: 'Profile updated.' });
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error('Error updating document: ', error);
			return res.status(500).json({ message: 'Error updating profile' });
		});
}

export default withErrorHandling(handler);
