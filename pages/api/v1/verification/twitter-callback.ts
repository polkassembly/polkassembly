// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import oauth from 'oauth';
import { promisify } from 'util';
import { isValidNetwork } from '~src/api-utils';
import firebaseAdmin from '~src/services/firebaseInit';

const TWITTER_CONSUMER_API_KEY = 'ThK9KnoZSdWSUkXYSLE6VbMnh' ;
const TWITTER_CONSUMER_API_SECRET_KEY = 'iEaXIuqknmKr4k6s0tIBxaqvEz70nowJvHz28zo0iIbfPnlFXs';
const firestore = firebaseAdmin.firestore();

export enum VerificationStatus {
	ALREADY_VERIFIED = 'Already verified',
	VERFICATION_EMAIL_SENT = 'Verification email sent',
	PLEASE_VERIFY_TWITTER = 'Please verify twitter',
	NOT_VERIFIED = 'Not verified'
}

const oauthConsumer = new oauth.OAuth(
	'https://twitter.com/oauth/request_token', 'https://twitter.com/oauth/access_token',
	TWITTER_CONSUMER_API_KEY,
	TWITTER_CONSUMER_API_SECRET_KEY,
	'1.0A', 'https://api.polkassembly.io/twitter-callback', 'HMAC-SHA1');

	async function oauthGetUserById (userId:string | number, { oauthAccessToken, oauthAccessTokenSecret }:{ oauthAccessToken?:any, oauthAccessTokenSecret?:any} = {}) {
		return promisify(oauthConsumer.get.bind(oauthConsumer))(`https://api.twitter.com/1.1/users/show.json?user_id=${userId}`, oauthAccessToken, oauthAccessTokenSecret)
			.then((body:any) => JSON.parse(body));
	}
	async function getOAuthAccessTokenWith ({ oauthRequestToken, oauthRequestTokenSecret, oauthVerifier }:{ oauthRequestToken?:any, oauthRequestTokenSecret?:any, oauthVerifier?:any} = {}):Promise<any> {
		return new Promise((resolve, reject) => {
			oauthConsumer.getOAuthAccessToken(oauthRequestToken, oauthRequestTokenSecret, oauthVerifier, function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
				return error
					? reject(new Error('Error getting OAuth access token'))
					: resolve({ oauthAccessToken, oauthAccessTokenSecret, results });
			});
		});
	}

const handler: NextApiHandler< any> = async (req, res) => {
	const { oauth_verifier: oauthVerifier, oauthRequestToken, oauthRequestTokenSecret } = req.query;

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { oauthAccessToken, oauthAccessTokenSecret, results } = await getOAuthAccessTokenWith({ oauthRequestToken, oauthRequestTokenSecret, oauthVerifier });

	const { user_id: userId /*, screen_name */ } = results;
	const user = await oauthGetUserById(userId, { oauthAccessToken, oauthAccessTokenSecret });

	const twitterVerification = await firestore.collection('twitter_verification_tokens').doc( user.screen_name || '').get();
		const data = twitterVerification.data();

		if (data?.verified) {
			return res.status(200).json({ status: VerificationStatus.ALREADY_VERIFIED });
		} else {
			const twitterVerificationRef = firestore.collection('twitter_verification_tokens').doc( user.screen_name || '');
			await twitterVerificationRef.set({
				...twitterVerificationRef,
				screen_name: user?.screen_name || '',
				verified: true
			});
		}
 return res.redirect(`https:${network}/polkassembly.io`);
};
export default handler;