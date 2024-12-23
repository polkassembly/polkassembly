// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import { promisify } from 'util';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import firebaseAdmin from '~src/services/firebaseInit';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import getOauthConsumer from '~src/util/getOauthConsumer';

const firestore = firebaseAdmin.firestore();

interface ITwitterDocData {
	twitter_handle: string;
	oauth_request_token_secret: string;
}

interface Props {
	oauthVerifier: string;
	oauthRequestToken: string;
	network: string;
}

async function oauthGetUserById(
	userId: string | number,
	network: string,
	{ oauthAccessToken, oauthAccessTokenSecret }: { oauthAccessToken?: any; oauthAccessTokenSecret?: any } = {}
) {
	const oauthConsumer = getOauthConsumer(network);

	return promisify(oauthConsumer.get.bind(oauthConsumer))(
		`https://api.twitter.com/1.1/account/verify_credentials.json?user_id=${userId}`,
		oauthAccessToken,
		oauthAccessTokenSecret
	).then((body: any) => JSON.parse(body));
}

async function getOAuthAccessTokenWith(
	network: string,
	{
		oauthRequestToken,
		oauthRequestTokenSecret,
		oauthVerifier
	}: {
		oauthRequestToken?: any;
		oauthRequestTokenSecret?: any;
		oauthVerifier?: any;
	} = {}
): Promise<any> {
	const oauthConsumer = getOauthConsumer(network);

	return new Promise((resolve, reject) => {
		oauthConsumer.getOAuthAccessToken(oauthRequestToken, oauthRequestTokenSecret, oauthVerifier, function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
			return error ? reject(new Error(String(error?.data) || 'Error getting Oauth access token')) : resolve({ oauthAccessToken, oauthAccessTokenSecret, results });
		});
	});
}

export const getTwitterCallback = async ({ network, oauthVerifier, oauthRequestToken }: Props): Promise<IApiResponse<string | MessageType>> => {
	try {
		if (!oauthVerifier || !oauthRequestToken) throw apiErrorWithStatusCode('Invalid params in req body', 400);

		const twitterVerificationSnapshot = await firestore.collection('twitter_verification_tokens').where('oauth_request_token', '==', oauthRequestToken).get();
		if (twitterVerificationSnapshot.empty) throw apiErrorWithStatusCode('Invalid request token', 400);

		const twitterDoc = twitterVerificationSnapshot?.docs[0];
		const twitterDocData = twitterDoc.data() as ITwitterDocData;

		const oauthRequestTokenSecret = twitterDocData?.oauth_request_token_secret;

		const { oauthAccessToken, oauthAccessTokenSecret, results } = await getOAuthAccessTokenWith(network, { oauthRequestToken, oauthRequestTokenSecret, oauthVerifier });

		const { user_id: twitterUserId } = results;
		const twitterUser = await oauthGetUserById(twitterUserId, network, {
			oauthAccessToken,
			oauthAccessTokenSecret
		});
		if (twitterDocData?.twitter_handle.toLowerCase() !== twitterUser?.screen_name.toLowerCase()) throw apiErrorWithStatusCode('Twitter handle does not match', 400);

		await twitterDoc.ref.set({
			...twitterDocData,
			verified: true
		});

		return {
			data: twitterDocData?.twitter_handle,
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
};

const handler: NextApiHandler<MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	const { oauthVerifier, oauthRequestToken } = req.query;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	if (!oauthVerifier || !oauthRequestToken) return res.status(400).json({ message: 'Invalid params in req body' });

	const { data, error, status } = await getTwitterCallback({
		network,
		oauthRequestToken: String(oauthRequestToken),
		oauthVerifier: String(oauthVerifier)
	});
	if (error) {
		return res.status(status).json({ message: error });
	}
	return res.status(status).json({ message: data?.toString() || messages.SUCCESS });
};
export default withErrorHandling(handler);
