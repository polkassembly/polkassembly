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
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import messages from '~src/auth/utils/messages';

interface IReq {
	type: 'email' | 'twitter',
	checkingVerified?:boolean;
}

export enum VerificationStatus {
	ALREADY_VERIFIED = 'Already verified',
	VERFICATION_EMAIL_SENT = 'Verification email sent',
	PLEASE_VERIFY_TWITTER = 'Please verify twitter',
	NOT_VERIFIED = 'Not verified'
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
	const { type, checkingVerified } = req.query as unknown as IReq;
	const { account, userId } = req.body;
	const token = getTokenFromReq(req);

	const user = await authServiceInstance.GetUser(token);

	if(!userId || !user?.id) throw apiErrorWithStatusCode(messages.UNAUTHORISED, 403);

	if (!account || !type) {
		return res.status(400).json({ message: 'Please provide valid params.' });
	}

	const verificationToken = await cryptoRandomStringAsync({ length: 20, type: 'url-safe' });

	if (type === 'email') {

		const tokenVerificationRef = firestore.collection('email_verification_tokens').doc(String(userId));
		const emailDataSnapshot = await tokenVerificationRef.get();
		const emailData =  emailDataSnapshot.data();

		if(emailData?.user_id === userId){
		if(emailData?.verified ) {
			return res.status(200).json({ status: VerificationStatus.ALREADY_VERIFIED });
		}
		if(emailData?.status === VerificationStatus?.VERFICATION_EMAIL_SENT) return res.status(200).json({ status: VerificationStatus.VERFICATION_EMAIL_SENT });
	}
	if(checkingVerified === true) return res.status(200).json({ status: VerificationStatus?.NOT_VERIFIED });

		const message = {
			from: FROM.email,
			html: `Click the following link to verify your email: <a href="http://localhost:3000/verify-email?token=${verificationToken}&identityVerification=${true}">Verify Email</a>`,
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
		await tokenVerificationRef.set({
			created_at: new Date(),
			email: account,
			status: VerificationStatus.VERFICATION_EMAIL_SENT,
			token: verificationToken,
			user_id: userId,
			verified: false
		});
	} else if (type === 'twitter') {

		const twitterVerificationDoc = await firestore.collection('twitter_verification_tokens').doc(String(userId)).get();

		if(!twitterVerificationDoc.exists) throw apiErrorWithStatusCode(`No doc found with the user id ${userId}`, 400);

		const twitterData = twitterVerificationDoc.data();

		if(twitterData?.twitter_handle !== account) throw apiErrorWithStatusCode('Twitter handle does not match', 400);

		if (twitterData?.verified && twitterData?.user_id === userId) {
			return res.status(200).json({ status: VerificationStatus.ALREADY_VERIFIED });
		}else if(checkingVerified === true) {
			return res.status(200).json({ status: VerificationStatus?.NOT_VERIFIED });
		}
		else {
			await twitterVerificationDoc.ref.set({
				created_at: new Date(),
				twitter_handle: account,
				user_id: userId,
				verified: false
			});

			return res.status(200).json({ message: VerificationStatus.PLEASE_VERIFY_TWITTER });
		}
	}
};

export default withErrorHandling(handler);