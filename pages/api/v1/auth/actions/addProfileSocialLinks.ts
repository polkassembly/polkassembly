// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import authServiceInstance from '~src/auth/auth';
import { ISocial, MessageType, TokenType, User } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import changeProfileScore from '../../utils/changeProfileScore';
import REPUTATION_SCORES from '~src/util/reputationScores';
import { firestore_db } from '~src/services/firebaseInit';

async function handler(req: NextApiRequest, res: NextApiResponse<TokenType | MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const { social_links: socialLinksString } = req.body;

	if (!socialLinksString) {
		return res.status(400).json({ message: 'social_links missing in reqeust body.' });
	}

	const social_links = JSON.parse(socialLinksString) || [];

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

	const userRef = firestore_db.collection('users').doc(String(user.id));

	//update profile field in userRef
	const profile = {
		...user.profile,
		social_links: newSocialLinks || []
	};

	const updatedToken = await authServiceInstance.getSignedToken({ ...user, profile });

	await userRef.update({ profile }).catch((error) => {
		// The document probably doesn't exist.
		console.error('Error updating document: ', error);
		return res.status(500).json({ message: 'Error updating profile' });
	});

	res.status(200).json({ token: updatedToken });

	try {
		// get user profile
		const { profile: existingProfile = null } = (await firestore_db.collection('users').doc(String(user.id)).get()).data() as User;

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
