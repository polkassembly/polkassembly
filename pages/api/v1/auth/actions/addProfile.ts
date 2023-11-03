// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { ISocial, MessageType, TokenType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import isValidEmail from '~src/auth/utils/isValidEmail';
import messages from '~src/auth/utils/messages';
import nameBlacklist from '~src/auth/utils/nameBlacklist';
import firebaseAdmin from '~src/services/firebaseInit';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

async function handler(req: NextApiRequest, res: NextApiResponse<TokenType | MessageType>) {
	const firestore = firebaseAdmin.firestore();
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });
	const { badges: badgesString, bio, image, title, social_links: socialLinksString, username, custom_username = false, email } = req.body;
	if (!username) return res.status(400).json({ message: 'Missing parameters in request body' });

	for (let i = 0; i < nameBlacklist.length; i++) {
		if (String(username).toLowerCase().includes(nameBlacklist[i])) throw apiErrorWithStatusCode(messages.USERNAME_BANNED, 400);
	}

	const badges = JSON.parse(badgesString) || [];
	const social_links = JSON.parse(socialLinksString) || [];

	if (!Array.isArray(badges)) return res.status(400).json({ message: 'Badges must be an array' });

	if (!Array.isArray(social_links)) return res.status(400).json({ message: 'Social links must be an array' });

	const newSocialLinks = (social_links as ISocial[]).reduce((prev, curr) => {
		if (curr && curr.link && curr.type) {
			return [
				...prev,
				{
					link: curr.link,
					type: curr.type
				}
			];
		}
		return [...prev];
	}, [] as ISocial[]);

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Missing user token' });

	const network = String(req.headers['x-network']);
	if (email) {
		if (email == '' || !isValidEmail(email)) return res.status(400).json({ message: messages.INVALID_EMAIL });
		await authServiceInstance.SendVerifyEmail(token, email, network);
	}

	const user = await authServiceInstance.GetUser(token);
	console.log(user);
	if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	const userRef = firestore.collection('users').doc(String(user.id));

	const userQuerySnapshot = await firestore.collection('users').where('username', '==', String(username).toLowerCase()).limit(1).get();
	if (!userQuerySnapshot.empty && user?.username !== username) {
		throw apiErrorWithStatusCode(messages.USERNAME_ALREADY_EXISTS, 400);
	}

	const userEmailQuerySnapshot = await firestore.collection('users').where('email', '==', String(email).toLowerCase()).limit(1).get();
	if (!userEmailQuerySnapshot.empty) {
		throw apiErrorWithStatusCode(messages.USER_EMAIL_ALREADY_EXISTS, 400);
	}

	//update profile field in userRef
	const profile = {
		badges,
		bio: bio || '',
		email: email || '',
		image: image || '',
		social_links: newSocialLinks || [],
		title: title || ''
	};

	const updated_token = await authServiceInstance.getSignedToken({ ...user, custom_username, email, profile, username });

	await userRef
		.update({ custom_username, profile, username })
		.then(() => {
			return res.status(200).json({ token: updated_token });
		})
		.catch((error) => {
			// The document probably doesn't exist.
			console.error('Error updating document: ', error);
			return res.status(500).json({ message: 'Error updating profile' });
		});
}

export default withErrorHandling(handler);
