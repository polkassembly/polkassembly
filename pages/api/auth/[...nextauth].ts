// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers/twitter';
import firebaseAdmin from '~src/services/firebaseInit';

const firestore = firebaseAdmin.firestore();

export default NextAuth({
    callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async redirect({ url, baseUrl }) {
            return baseUrl;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async signIn({ user, account, profile }) {
            const { screen_name } = profile as any;
            const twitterVerification = await firestore.collection('twitter_verification_tokens').doc(screen_name).get();
            const data = twitterVerification.data();

            if (!data) {
                return false;
            }

            if (data?.verified) {
                return false;
            }

            const twitterVerificationRef = firestore.collection('twitter_verification_tokens').doc(screen_name);
            await twitterVerificationRef.update({
                verified: true
            });

            return true;
        }
    },
    providers: [
        Providers({
            clientId: process.env.NEXT_TWITTER_CLIENT_ID!,
            clientSecret: process.env.NEXT_TWITTER_CLIENT_SECRET!
        })
    ]

});