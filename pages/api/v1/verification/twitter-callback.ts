// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import { promisify } from 'util';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import firebaseAdmin from '~src/services/firebaseInit';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import getOauthConsumer from '~src/util/getOauthConsumer';

const firestore = firebaseAdmin.firestore();

export enum VerificationStatus {
	ALREADY_VERIFIED = 'Already verified',
	VERFICATION_EMAIL_SENT = 'Verification email sent',
	PLEASE_VERIFY_TWITTER = 'Please verify twitter',
	NOT_VERIFIED = 'Not verified',
}

interface Props{
	oauthVerifier: string,
	oauthRequestToken: string,
	network: string;
}

async function oauthGetUserById(
	userId: string | number, network:string, { oauthAccessToken, oauthAccessTokenSecret }:{ oauthAccessToken?: any; oauthAccessTokenSecret?: any } = {})
{
	const oauthConsumer =  getOauthConsumer(network);

	return promisify(oauthConsumer.get.bind(oauthConsumer))(
		`https://api.twitter.com/1.1/users/show.json?user_id=${userId}`,
		oauthAccessToken,
		oauthAccessTokenSecret
	).then((body: any) => JSON.parse(body));
}

async function getOAuthAccessTokenWith( network: string, {
	oauthRequestToken,
	oauthRequestTokenSecret,
	oauthVerifier
}:{
	oauthRequestToken?: any;
	oauthRequestTokenSecret?: any;
	oauthVerifier?: any;
} = {}): Promise<any> {

	const oauthConsumer =  getOauthConsumer(network);

	return new Promise((resolve, reject) => {
		oauthConsumer.getOAuthAccessToken(
			oauthRequestToken,
			oauthRequestTokenSecret,
			oauthVerifier,
			function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
				return error ? reject(new Error('Error getting OAuth access token')) : resolve({ oauthAccessToken, oauthAccessTokenSecret, results });
			}
		);
	});
}

export const getTwitterCallback = async({ network, oauthVerifier, oauthRequestToken }: Props ): Promise<IApiResponse<string | MessageType>> => {
	try{
		const tokenVerification = await firestore.collection('twitter_verification_tokens').where('oauth_request_token', '==', oauthRequestToken).limit(1).get();
		if (tokenVerification.empty) {
			return {
				data: null,
				error: 'Wrong verification token found!',
				status: 400
			};
		}
		const data = tokenVerification.docs[0].data();

		const oauthRequestTokenSecret = data?.oauth_requestToken_secret;

		const { oauthAccessToken, oauthAccessTokenSecret, results } =
		await getOAuthAccessTokenWith(network,{ oauthRequestToken, oauthRequestTokenSecret, oauthVerifier });

		const { user_id: userId /*, screen_name */ } = results;
		const user = await oauthGetUserById(userId, network,
			{
				oauthAccessToken,
				oauthAccessTokenSecret
			});

		const twitterVerificationRef = firestore.collection('twitter_verification_tokens').doc(user?.screen_name);
		if(! twitterVerificationRef) throw apiErrorWithStatusCode('Wrong verification token found', 400);

		await twitterVerificationRef.set({
			...twitterVerificationRef,
			screen_name: user?.screen_name || '',
			verified: true
		});

		return {
			data: '/',
			error: null,
			status: 200
		};
	}catch(error){
		return {
			data: null,
			error: 'Wrong verification token found!',
			status: 400
		};
	}
};

const handler: NextApiHandler<any> = async (req, res) => {
	const {
		oauthVerifier,
		oauthRequestToken
	} = req.query;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	if(!oauthVerifier || !oauthRequestToken )  return res.status(400).json({ message: 'Invalid params in req body' });

	const { data, error } = await getTwitterCallback({
		network,
		oauthRequestToken: String(oauthRequestToken),
		oauthVerifier: String(oauthVerifier)
	});
	if(error){
		return res.status(400).send({ message: error });
	}
	return res.redirect(data as string);
};
export default handler;
