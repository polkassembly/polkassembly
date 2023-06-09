// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { firestore_db } from '~src/services/firebaseInit';
import { IPostTag } from '~src/types';
import algoliasearch from 'algoliasearch';
import dayjs from 'dayjs';

function chunkArray(array: any[], chunkSize: number) {
	if (array.length === 0) {
		return [];
	}

	if (chunkSize >= array.length) {
		return [array];
	}

	const chunkedArray = [];
	let index = 0;

	while (index < array.length) {
		chunkedArray.push(array.slice(index, index + chunkSize));
		index += chunkSize;
	}
	return chunkedArray;
}

const handler: NextApiHandler<IPostTag[] | MessageType> = async (req, res) => {

	//init algolia client
	const ALGOLIA_APP_ID = '9CLYRE6KU9';
	const ALGOLIA_WRITE_API_KEY = 'f725ce93e259bab149442117ed23fc97';

	if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) return;

	const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const index = algoliaClient.initIndex('polkassembly_addresses');

	const addressesSnapshots = await firestore_db.collection('addresses').get();

	const chunksArray = chunkArray(addressesSnapshots.docs, 300);

	let counter = 0;
	for(const addressArr of chunksArray) {
		const addressRecord = addressArr.map((addressDoc: any) => {
			const addressData = addressDoc.data();
			return {
				created_at: dayjs(addressData?.created_at?.toDate?.() || new Date()).unix(),
				default: addressData?.default || false,
				is_erc20: addressData?.is_erc20 || addressData.address.startsWith('0x') || false,
				network: addressData?.network || '',
				objectID: addressData?.address, // Unique identifier for the object
				public_key: addressData?.public_key || '',
				user_id: addressData?.user_id || '',
				verified: addressData?.verified || false,
				wallet: addressData?.wallet || ''
			};
		});
		counter++;
		console.log(counter,addressesSnapshots.size, addressRecord);

		// commit batch
		await index.saveObjects(addressRecord).catch((err) => {
			console.log(err);
		});
	}
	res.status(200).json({ message: 'Success' });

};

export default withErrorHandling(handler);