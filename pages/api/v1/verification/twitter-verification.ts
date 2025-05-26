// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import firebaseAdmin from '~src/services/firebaseInit';
import getOauthConsumer from '~src/util/getOauthConsumer';

const firestore = firebaseAdmin.firestore();

async function getOAuthRequestToken(network: string, isUserCreatedBounty: boolean): Promise<any> {
	const oauthConsumer = getOauthConsumer(network, isUserCreatedBounty);
	// Wrap the callback-based function in a promise
	const tokenDetails = await new Promise((resolve, reject) => {
		oauthConsumer.getOAuthRequestToken((error, oauthRequestToken, oauthRequestTokenSecret, results) => {
			if (error) {
				console.log('error', error);
				// Handle specific error cases
				if (error.statusCode === 503) {
					reject(new Error('Twitter service is temporarily unavailable. Please try again later.'));
				} else if (error.statusCode === 401) {
					reject(new Error('Twitter API credentials are invalid. Please contact support.'));
				} else {
					reject(new Error(error.data || 'Oops! Something went wrong while getting the OAuth request token.'));
				}
			} else {
				resolve({ oauthRequestToken, oauthRequestTokenSecret, results });
			}
		});
	});

	return tokenDetails;
}

const handler: NextApiHandler<MessageType | { url: string }> = async (req, res) => {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);

	const { twitterHandle, isUserCreatedBounty = false } = req.query;
	try {
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

		if (!twitterHandle || typeof twitterHandle !== 'string') return res.status(400).json({ message: 'Invalid twitter handle' });

		const token = getTokenFromReq(req);
		if (!token) return res.status(403).json({ message: messages.UNAUTHORISED });

		const user = await authServiceInstance.GetUser(token);
		const userId = user?.id;

		if (!userId) return res.status(403).json({ message: messages.UNAUTHORISED });

		const { oauthRequestToken, oauthRequestTokenSecret } = await getOAuthRequestToken(network, !!isUserCreatedBounty);

		const twitterVerificationRef = firestore.collection('twitter_verification_tokens').doc(String(userId));
		await twitterVerificationRef.set({
			created_at: new Date(),
			oauth_request_token: oauthRequestToken,
			oauth_request_token_secret: oauthRequestTokenSecret,
			twitter_handle: twitterHandle,
			user_id: userId,
			verified: false
		});
		const authorizationUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthRequestToken}`;
		return res.status(200).json({ url: authorizationUrl });
	} catch (err) {
		console.error('Twitter verification error:', err);
		// Return appropriate status code based on error type
		if (err.message?.includes('temporarily unavailable')) {
			return res.status(503).json({ message: err.message });
		} else if (err.message?.includes('API credentials')) {
			return res.status(500).json({ message: err.message });
		}
		return res.status(500).json({ message: err.message || 'Internal server error' });
	}
};
export default withErrorHandling(handler);
