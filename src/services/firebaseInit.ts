// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as firebaseAdmin from 'firebase-admin';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
	throw new Error('Internal Error: GOOGLE_APPLICATION_CREDENTIALS missing.');
}

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS) as firebaseAdmin.ServiceAccount;

try {
	firebaseAdmin.initializeApp({
		credential: firebaseAdmin.credential.cert(serviceAccount)
	});
	console.log('Firebase admin Initialized.');
} catch (error) {
	// Skipping the "already exists" message which is not an actual error when we're hot-reloading.
	if (!/already exists/u.test(error.message)) {
		console.error('Firebase admin initialization error : ', error);
	}
}

export const firestore_db = firebaseAdmin.firestore();

export default firebaseAdmin;
