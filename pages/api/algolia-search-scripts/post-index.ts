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
	const index = algoliaClient.initIndex('polkassembly_posts_test');

	const networksSnapshot = await firestore_db.collection('network').get();

	// for loop for networksSnapshot
	for(const networkDoc of networksSnapshot.docs) {
		//get postTypes for each network
		const postTypesSnapshot = await networkDoc.ref.collection('post_types').get();

		// for loop for postTypesSnapshot
		for(const postTypeDoc of postTypesSnapshot.docs) {
			// get posts for each postType
			const postsSnapshot = await postTypeDoc.ref.collection('posts').get();

			// setup batch here

			let batch_count = 0;
			let postRecords = [];

			// for loop for postsSnapshot
			for(const postDoc of postsSnapshot.docs) {
				const postDocData = postDoc.data();

				const postRecord = {
					...postDocData,
					created_at: postDocData?.created_at.toDate?.() || new Date(),
					last_comment_at: postDocData?.last_comment_at.toDate?.() || new Date(),
					last_edited_at: postDocData?.last_edited_at?.toDate?.() || new Date(),
					network: networkDoc.id,
					objectID: postDoc.id,
					post_type: postTypeDoc.id
				};
				postRecords.push(postRecord);
				batch_count++;

				if(batch_count === 300) {
					///commit batch
					await index.saveObjects(postRecords).catch((err) => {
						console.log(err);
					});
					batch_count = 0;
					postRecords = [];
				}
			}
		}
	}
	res.status(200).json({ message: 'Success' });

};

export default withErrorHandling(handler);