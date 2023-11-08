// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import sgMail from '@sendgrid/mail';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import firebaseAdmin from '~src/services/firebaseInit';
import { cryptoRandomStringAsync } from 'crypto-random-string';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import authServiceInstance from '~src/auth/auth';
import messages from '~src/auth/utils/messages';
import { isValidNetwork } from '~src/api-utils';
import { VerificationStatus } from '~src/types';

interface IReq {
	type: 'email' | 'twitter';
	checkingVerified?: boolean;
	account: string;
	network: string;
	token: any;
}

export interface IVerificationResponse {
	message: VerificationStatus;
}

const apiKey = process.env.SENDGRID_API_KEY;
const FROM = {
	email: 'noreply@polkassembly.io',
	name: 'Polkassembly'
};

if (apiKey) {
	sgMail.setApiKey(apiKey);
}

const firestore = firebaseAdmin.firestore();

const handler: NextApiHandler<IVerificationResponse | MessageType> = async (req, res) => {
	const { account, type, checkingVerified } = req.body as unknown as IReq;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	const token = getTokenFromReq(req);

	const user = await authServiceInstance.GetUser(token);
	const userId = user?.id;

	if (!token || !userId) return res.status(403).json({ message: messages.UNAUTHORISED });

	if (!account || !type) {
		return res.status(400).json({ message: 'Please provide valid params.' });
	}

	const verificationToken = await cryptoRandomStringAsync({ length: 20, type: 'url-safe' });

	if (type === 'email') {
		const tokenVerificationRef = firestore.collection('email_verification_tokens').doc(String(userId));
		const emailDataSnapshot = await tokenVerificationRef.get();
		const emailData = emailDataSnapshot.data();

		if (emailData?.user_id === userId) {
			if (emailData?.verified) {
				return res.status(200).json({ message: VerificationStatus.ALREADY_VERIFIED });
			}
			if (checkingVerified) return res.status(200).json({ message: VerificationStatus.NOT_VERIFIED });

			if (emailData?.status === VerificationStatus?.VERFICATION_EMAIL_SENT) {
				return res.status(200).json({ message: VerificationStatus.VERFICATION_EMAIL_SENT });
			}
		}
		if (checkingVerified) {
			return res.status(200).json({ message: VerificationStatus.NOT_VERIFIED });
		} else {
			const message = {
				from: FROM.email,
				html: `Hello ${user.username},
				<br/>
				<br>Click on the following link to complete email verification for your on chain identity: <a href="https://${network}.polkassembly.io/verify-email?token=${verificationToken}&identityVerification=${true}">Verify Email</a></br>
				<br/>
				<br>
				Thank you,
				</br>
				<br>
				Polkassembly Team
				</br>`,
				subject: 'Email Verification',
				to: account
			};
			await sgMail
				.send(message)
				.then(() => {
					res.status(200).json({ message: VerificationStatus.VERFICATION_EMAIL_SENT });
				})
				.catch((error: any) => {
					return res.status(500).json({ message: error || 'Error sending email' });
				});
			await tokenVerificationRef.set({
				created_at: new Date(),
				email: account,
				status: VerificationStatus.VERFICATION_EMAIL_SENT,
				token: verificationToken,
				user_id: userId,
				verified: false
			});
			return res.status(200).json({ message: VerificationStatus.VERFICATION_EMAIL_SENT });
		}
	} else if (type === 'twitter') {
		const twitterVerificationDoc = await firestore.collection('twitter_verification_tokens').doc(String(userId)).get();

		if (!twitterVerificationDoc.exists) return res.status(400).json({ message: `No doc found with the user id ${userId}` });

		const twitterData = twitterVerificationDoc.data();

		if (twitterData?.twitter_handle !== account) return res.status(400).json({ message: 'Twitter handle does not match' });

		if (twitterData?.verified && twitterData?.user_id === userId) {
			return res.status(200).json({ message: VerificationStatus.ALREADY_VERIFIED });
		} else if (checkingVerified === true) {
			return res.status(200).json({ message: VerificationStatus.NOT_VERIFIED });
		} else {
			await twitterVerificationDoc.ref.set({
				created_at: new Date(),
				twitter_handle: account,
				user_id: userId,
				verified: false
			});
		}
		return res.status(200).json({ message: VerificationStatus.PLEASE_VERIFY_TWITTER });
	}
};

export default withErrorHandling(handler);
