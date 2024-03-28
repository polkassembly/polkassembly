// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import firebaseAdmin, { firestore_db } from '~src/services/firebaseInit';

export default async function changeProfileScore(user_id: number, change_score_by: number) {
	const userRef = firestore_db.collection('users').doc(String(user_id));

	await userRef.update({
		profile_score: firebaseAdmin.firestore.FieldValue.increment(change_score_by)
	});
}
