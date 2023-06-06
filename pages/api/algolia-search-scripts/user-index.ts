// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { firestore_db } from '~src/services/firebaseInit';
import { IPostTag } from '~src/types';
import algoliasearch from 'algoliasearch';

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
	const index = algoliaClient.initIndex('polkassembly_users');

	const usersSnapshots = await firestore_db.collection('users').get();

	const chunksArray = chunkArray(usersSnapshots.docs, 300);

	let counter = 0;
	for(const userArr of chunksArray) {
		const userRecord = userArr.map((userDoc: any) => {
			const userDocData = userDoc.data();
			return {
				created_at: userDocData?.created_at?.toDate?.() || new Date(),
				email: userDocData?.email || '',
				objectID: userDocData.id, // Unique identifier for the object
				profile: userDocData?.profile || {},
				username: userDocData?.username || ''
			};
		});
		counter++;
		console.log(counter,usersSnapshots.size);

		// commit batch
		// await index.saveObjects(userRecord).catch((err) => {
		// 	console.log(err);
		// });
	}
	res.status(200).json({ message: 'Success' });

};

export default withErrorHandling(handler);