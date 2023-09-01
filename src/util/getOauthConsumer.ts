// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import oauth from 'oauth';

const TWITTER_CONSUMER_API_KEY = process.env.TWITTER_CONSUMER_API_KEY || '';
const TWITTER_CONSUMER_API_SECRET_KEY = process.env.TWITTER_CONSUMER_API_SECRET_KEY || '';

const getOauthConsumer = (network: string) => {
	const  oauthRequestToken = localStorage.getItem('oauthRequestTokenSecret') || '';
	const oauthRequestTokenSecret = localStorage.getItem('oauthRequestTokenSecret') || '';

	const oauthConsumer = new oauth.OAuth(
		'https://twitter.com/oauth/request_token',
		'https://twitter.com/oauth/access_token',
		TWITTER_CONSUMER_API_KEY,
		TWITTER_CONSUMER_API_SECRET_KEY,
		'1.0A',
		`https://${network}.polkassembly.io/twitter-callback?oauthRequestToken=${oauthRequestToken}&oauthRequestTokenSecret=${oauthRequestTokenSecret}`,
		'HMAC-SHA1'
	);
	return oauthConsumer;

};
export default getOauthConsumer;