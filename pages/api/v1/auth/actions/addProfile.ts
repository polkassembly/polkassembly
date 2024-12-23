// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { ISocial, MessageType, TokenType, User } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import isValidEmail from '~src/auth/utils/isValidEmail';
import isValidPassowrd from '~src/auth/utils/isValidPassowrd';
import messages from '~src/auth/utils/messages';
import nameBlacklist from '~src/auth/utils/nameBlacklist';
import firebaseAdmin from '~src/services/firebaseInit';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import changeProfileScore from '../../utils/changeProfileScore';
import REPUTATION_SCORES from '~src/util/reputationScores';

async function handler(req: NextApiRequest, res: NextApiResponse<TokenType | MessageType>) {
	storeApiKeyUsage(req);

	const firestore = firebaseAdmin.firestore();
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });
	const { badges: badgesString, bio, image, title, social_links: socialLinksString, username, custom_username = false, email, password, cover_image } = req.body;
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

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	const userRef = firestore.collection('users').doc(String(user.id));

	const userQuerySnapshot = await firestore.collection('users').where('username', '==', String(username)).limit(1).get();
	if (!userQuerySnapshot.empty && user?.username !== username) {
		throw apiErrorWithStatusCode(messages.USERNAME_ALREADY_EXISTS, 400);
	}

	const network = String(req.headers['x-network']);
	if (email && email?.length) {
		const userEmailQuerySnapshot = await firestore.collection('users').where('email', '==', String(email).toLowerCase()).limit(1).get();
		if (!userEmailQuerySnapshot.empty) {
			throw apiErrorWithStatusCode(messages.USER_EMAIL_ALREADY_EXISTS, 400);
		}
		if (!isValidEmail(email)) throw apiErrorWithStatusCode(messages.INVALID_EMAIL, 400);
		await authServiceInstance.SendVerifyEmail(token, email, network);
		if (!isValidPassowrd(password)) return res.status(400).json({ message: messages.PASSWORD_LENGTH_ERROR });
		await authServiceInstance.ResetPasswordFromAuth(token, password);
	}

	//update profile field in userRef
	const profile = {
		achievement_badges: [],
		badges,
		bio: bio || '',
		cover_image: cover_image || '',
		email: email || '',
		image: image || '',
		social_links: newSocialLinks || [],
		title: title || ''
	};
	let updatedToken: any;
	if (email && email?.length) {
		updatedToken = await authServiceInstance.getSignedToken({ ...user, custom_username, email, profile, username });
	} else {
		updatedToken = await authServiceInstance.getSignedToken({ ...user, custom_username, profile, username });
	}

	await userRef.update({ custom_username, profile, username }).catch((error) => {
		// The document probably doesn't exist.
		console.error('Error updating document: ', error);
		return res.status(500).json({ message: 'Error updating profile' });
	});

	res.status(200).json({ token: updatedToken });

	try {
		// get user profile
		const { profile: existingProfile = null } = (await firestore.collection('users').doc(String(user.id)).get()).data() as User;

		let totalScore = 0;

		// check if profile picture exists
		if (profile?.image && !existingProfile?.image) {
			totalScore += REPUTATION_SCORES.add_profile_picture.value;
		} else if (!profile?.image && existingProfile?.image) {
			totalScore -= REPUTATION_SCORES.add_profile_picture.value;
		}

		//bio
		if (profile?.bio && !existingProfile?.bio) {
			totalScore += REPUTATION_SCORES.add_bio.value;
		} else if (!profile?.bio && existingProfile?.bio) {
			totalScore -= REPUTATION_SCORES.add_bio.value;
		}

		//title
		if (profile?.title && !existingProfile?.title) {
			totalScore += REPUTATION_SCORES.add_profile_title.value;
		} else if (!profile?.title && existingProfile?.title) {
			totalScore -= REPUTATION_SCORES.add_profile_title.value;
		}

		//tags
		if (profile?.badges?.length && !existingProfile?.badges?.length) {
			totalScore += REPUTATION_SCORES.add_profile_tags.value;
		} else if (!profile?.badges?.length && existingProfile?.badges?.length) {
			totalScore -= REPUTATION_SCORES.add_profile_tags.value;
		}

		await changeProfileScore(user.id, totalScore);
	} catch (error) {
		console.error('Error updating user reputation: ', error);
	}
}

export default withErrorHandling(handler);
