// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest } from 'next';
import firebaseAdmin, { firestore_db } from '~src/services/firebaseInit';

/**
 * Stores api key usage into firebase
 * IMPORTANT: use inside pages/api
 * Use without await keyword as 'fire-and-forget'
 * See: https://github.com/vercel/next.js/discussions/12573#discussioncomment-2799468
 * @export
 * @param {NextApiRequest} req
 */
export default async function storeApiKeyUsage(req: NextApiRequest) {
	try {
		const apiKey = (req.headers['x-api-key'] || 'unknown') as string;
		const apiRoute = req.url?.split('?')[0] || 'unknown';

		const apiUsageUpdate = {
			key: apiKey,
			usage: {
				[apiRoute]: {
					count: firebaseAdmin.firestore.FieldValue.increment(1),
					last_used_at: new Date()
				}
			}
		};

		await firestore_db.collection('api_keys').doc(apiKey).set(apiUsageUpdate, { merge: true });
	} catch (e) {
		console.error('Error in storeApiKeyUsage : ', e);
	}
}
