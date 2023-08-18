// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import sgMail from '@sendgrid/mail';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import firebaseAdmin, { firestore_db } from '~src/services/firebaseInit';
import { cryptoRandomStringAsync } from 'crypto-random-string';

interface IReq {
	type: 'email' | 'twitter'
}

export enum VerificationStatus {
	ALREADY_VERIFIED = 'Already verified',
	VERFICATION_EMAIL_SENT = 'Verification email sent',
	PLEASE_VERIFY_TWITTER = 'Please verify twitter'
}

export interface IVerificationResponse {
	status: VerificationStatus;
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
	const { type } = req.query as unknown as IReq;
	const { account } = req.body;

	if (!account || !type) {
		return res.status(400).json({ message: 'Please provide valid params.' });
	}

	const verificationToken = await cryptoRandomStringAsync({ length: 20, type: 'url-safe' });

	if (type == 'email') {
		const user = await firestore_db.collection('users').where('email', '==', account).where('email_verified', '==', true).limit(1).get();
		if (user.docs[0]?.exists) {
			return res.status(200).json({ status: VerificationStatus.ALREADY_VERIFIED });
		}

		const message = {
			from: FROM.email,
			html: `Click the following link to verify your email: <a href="http://localhost:3000/api/verify/${verificationToken}">Verify Email</a>`,
			subject: 'Email Verification',
			to: account
		};
		await sgMail
			.send(message)
			.then(() => res.json({ message: 'Verification email sent successfully' }))
			.catch(error => {
				console.log('error', error);
				return res.status(500).json({ message: 'Error sending email' });
			});

		const tokenVerificationRef = firestore.collection('email_verification_tokens').doc(account);

		await tokenVerificationRef.set({
			created_at: new Date(),
			email: account,
			token: verificationToken,
			verified: false
		});
	} else if (type == 'twitter') {

		const twitterVerification = await firestore.collection('twitter_verification_tokens').doc(account).get();
		const data = twitterVerification.data();

		if (data?.verified) {
			return res.status(200).json({ status: VerificationStatus.ALREADY_VERIFIED });
		} else {
			const twitterVerificationRef = firestore.collection('twitter_verification_tokens').doc(account);
			await twitterVerificationRef.set({
				created_at: new Date(),
				twitter: account,
				verified: false
			});

			return res.status(200).json({ message: VerificationStatus.PLEASE_VERIFY_TWITTER });
		}
	}
};

export default withErrorHandling(handler);