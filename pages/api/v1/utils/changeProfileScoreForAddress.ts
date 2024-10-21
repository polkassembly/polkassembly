// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import firebaseAdmin, { firestore_db } from '~src/services/firebaseInit';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

/**
 * Updates the profile score for a given address, both in the addresses collection and in the users collection.
 *
 * @export
 * @param {string} address
 * @param {number} change_score_by
 */
export default async function changeProfileScoreForAddress(address: string, change_score_by: number) {
	const substrateAddress = getSubstrateAddress(address);

	if (!substrateAddress) {
		console.error('Invalid address', address);
		return;
	}

	const addressRef = firestore_db.collection('addresses').doc(substrateAddress);

	// update the user's profile score
	await addressRef.set(
		{
			profile_score: firebaseAdmin.firestore.FieldValue.increment(change_score_by)
		},
		{
			merge: true
		}
	);

	// find user id for the address
	const user_id = (await addressRef.get()).data()?.user_id;

	if (isNaN(user_id)) return;

	// update the user's profile score in the user collection
	await firestore_db
		.collection('users')
		.doc(user_id)
		.set(
			{
				profile_score: firebaseAdmin.firestore.FieldValue.increment(change_score_by)
			},
			{
				merge: true
			}
		);
}
