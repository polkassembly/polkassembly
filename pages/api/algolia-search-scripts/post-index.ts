// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import { firestore_db } from '~src/services/firebaseInit';
import { IPostTag } from '~src/types';
import algoliasearch from 'algoliasearch';
import { getTopicFromType } from '~src/util/getTopicFromType';

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
	const index = algoliaClient.initIndex('polkassembly_posts_test');

	// this would be networks not network -> should work
	const networksSnapshot = await firestore_db.collection('networks').get();

	// for loop for networksSnapshot
	for(const networkDoc of networksSnapshot.docs) {
		//get postTypes for each network
		const postTypesSnapshot = await networkDoc.ref.collection('post_types').get();

		// for loop for postTypesSnapshot
		for(const postTypeDoc of postTypesSnapshot.docs) {
			// get posts for each postType
			const postsSnapshot = await postTypeDoc.ref.collection('posts').get();

			// setup batch here

			const chunksArray = chunkArray(postsSnapshot.docs, 300);
			// for loop for postsSnapshot
			for(const postsArr of chunksArray) {
				const postRecords = postsArr.map((postDoc: any) => {
					const postDocData = postDoc.data();
					return {
						...postDocData,
						created_at: postDocData?.created_at?.toDate?.() || new Date(),
						last_comment_at: postDocData?.last_comment_at?.toDate?.() || new Date(),
						last_edited_at: postDocData?.last_edited_at?.toDate?.() || new Date(),
						network: networkDoc.id,
						objectID: `${networkDoc.id}_${postTypeDoc.id}_${postDoc.id}`,
						post_type: postTypeDoc.id,
						topic_id: postDocData?.topic?.id || postDocData?.topic_id || getTopicFromType(postDocData?.id ).id,
						updated_at: postDocData?.updated_at?.toDate?.() || new Date()
					};
				});

				///commit batch
				console.log(postRecords,'commiting');
				// await index.saveObjects(postRecords).catch((err) => {
				// console.log(err);
				// });
			}
		}
	}
	res.status(200).json({ message: 'Success' });

};

export default withErrorHandling(handler);