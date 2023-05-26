// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { firestore_db } from '~src/services/firebaseInit';
import { IPostTag } from '~src/types';
import algoliasearch from 'algoliasearch';

const handler: NextApiHandler<IPostTag[] | MessageType> = async (req, res) => {

	//init algolia client
	const ALGOLIA_APP_ID = '9CLYRE6KU9';
	const ALGOLIA_WRITE_API_KEY = 'f725ce93e259bab149442117ed23fc97';

	if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) return;

	const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
	const index = algoliaClient.initIndex('polkassembly_users');

	const tagsSnapshots = await firestore_db.collection('users').get();

	let batch_count = 0;
	let userRecords = [];

	for(let docs = 0 ; docs < tagsSnapshots.docs.length; docs++) {

		let break_loop = false;
		const userRecord = tagsSnapshots.docs[docs];
		userRecords.push(userRecord);
		batch_count++;

		if(batch_count === 500) {
			///commit batch
			await index.saveObjects(userRecords).catch((err) => {
				console.log(err);
				break_loop = true;
			});
			batch_count = 0;
			userRecords = [];
		}
		if(break_loop) break;

	}
	res.status(200).json({ message: 'asdsa' });

};

export default withErrorHandling(handler);