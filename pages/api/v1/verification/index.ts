// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import sgMail from '@sendgrid/mail';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import firebaseAdmin, { firestore_db } from '~src/services/firebaseInit';
import { cryptoRandomStringAsync } from 'crypto-random-string';

export enum VerificationStatus {
    ALREADY_VERIFIED = 'Already verified',
    VERFICATION_EMAIL_SENT = 'Verification email sent'
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
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Please provide an email to verify' });
    }
    const user = await firestore_db.collection('users').where('email', '==', email).where('email_verified', '==', true).limit(1).get();
    if (user.docs[0]?.exists) {
        res.status(200).json({ status: VerificationStatus.ALREADY_VERIFIED });
    }

    const verificationToken = await cryptoRandomStringAsync({ length: 20, type: 'url-safe' });

    const message = {
        to: email,
        from: FROM.email,
        subject: 'Email Verification',
        html: `Click the following link to verify your email: <a href="http://localhost:3000/api/verify/${verificationToken}">Verify Email</a>`
    };
    await sgMail
        .send(message)
        .then(() => res.json({ message: 'Verification email sent successfully' }))
        .catch(error => {
            console.log('error', error);
            res.status(500).json({ error: 'Error sending email' });
        });

    const tokenVerificationRef = firestore.collection('email_verification_tokens').doc(email);

    await tokenVerificationRef.set({
        created_at: new Date(),
        token: verificationToken,
        email,
        verified: false
    });
};

export default withErrorHandling(handler);