// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import firebaseAdmin from '~src/services/firebaseInit';

import { Address } from '../types';

export default async function getAddressesFromUserId(
	userId: number,
	verified?: boolean,
): Promise<Address[]> {
	const addressesQuery = verified
		? firebaseAdmin
				.firestore()
				.collection('addresses')
				.where('user_id', '==', userId)
				.where('verified', '==', true)
		: firebaseAdmin
				.firestore()
				.collection('addresses')
				.where('user_id', '==', userId);

	const addressesQuerySnapshot = await addressesQuery.get();

	const addresses = addressesQuerySnapshot.docs.map(
		(doc) => doc.data() as Address,
	);

	return addresses;
}
