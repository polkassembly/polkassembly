// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import oauth from 'oauth';
import apiErrorWithStatusCode from './apiErrorWithStatusCode';

const TWITTER_CONSUMER_API_KEY = process.env.TWITTER_CONSUMER_API_KEY || '';
const TWITTER_CONSUMER_API_SECRET_KEY = process.env.TWITTER_CONSUMER_API_SECRET_KEY || '';

const OAUTH_CONSUMER_ERROR = 'TWITTER_CONSUMER_API_KEY or TWITTER_CONSUMER_API_SECRET_KEY missing in env';

const getOauthConsumer = (network: string) => {

	if(!TWITTER_CONSUMER_API_KEY || !TWITTER_CONSUMER_API_SECRET_KEY) throw apiErrorWithStatusCode(OAUTH_CONSUMER_ERROR, 400);

	const oauthConsumer = new oauth.OAuth(
		'https://twitter.com/oauth/request_token',
		'https://twitter.com/oauth/access_token',
		TWITTER_CONSUMER_API_KEY,
		TWITTER_CONSUMER_API_SECRET_KEY,
		'1.0A',
		`https://${network}.polkassembly.io/twitter-callback`,
		'HMAC-SHA1'
	);
	return oauthConsumer;

};
export default getOauthConsumer ;
