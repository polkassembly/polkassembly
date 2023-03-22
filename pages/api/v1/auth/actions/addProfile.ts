// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { ISocial, MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import firebaseAdmin from '~src/services/firebaseInit';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	const firestore = firebaseAdmin.firestore();
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const { badges: badgesString, bio, image, title, social_links: socialLinksString } = req.body;
	if(!badgesString && !bio && !image && !title && !socialLinksString) return res.status(400).json({ message: 'Missing parameters in request body' });

	const badges = JSON.parse(badgesString);
	const social_links = JSON.parse(socialLinksString);

	if(!Array.isArray(badges)) return res.status(400).json({ message: 'Badges must be an array' });

	if (!Array.isArray(social_links)) return res.status(400).json({ message: 'Social links must be an array' });

	const newSocialLinks = (social_links as ISocial[]).reduce((prev, curr) => {
		if (curr && curr.link && curr.type) {
			return [...prev, {
				link: curr.link,
				type: curr.type
			}];
		}
		return [...prev];
	}, [] as ISocial[]);

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Missing user token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	const userRef = firestore.collection('users').doc(String(user.id));

	//update profile field in userRef
	const profile = {
		badges,
		bio,
		image,
		social_links: newSocialLinks,
		title
	};

	await userRef.update({ profile }).then(() => {
		return res.status(200).json({ message: 'Profile updated.' });
	}).catch((error) => {
		// The document probably doesn't exist.
		console.error('Error updating document: ', error);
		return res.status(500).json({ message: 'Error updating profile' });
	});
}

export default withErrorHandling(handler);
