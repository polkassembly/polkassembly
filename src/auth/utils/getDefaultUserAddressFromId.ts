// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import firebaseAdmin from '~src/services/firebaseInit';

import { Address } from '../types';

export default async function getDefaultUserAddressFromId(
	userId: number,
): Promise<Address | null> {
	const addressesQuery = firebaseAdmin
		.firestore()
		.collection('addresses')
		.where('user_id', '==', userId)
		.where('default', '==', true)
		.limit(1);
	const addressesQuerySnapshot = await addressesQuery.get();

	if (addressesQuerySnapshot.size === 0) return null;

	const address = addressesQuerySnapshot.docs[0].data() as Address;

	return address;
}
