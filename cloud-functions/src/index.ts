import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import algoliasearch from 'algoliasearch';

// posts
exports.myfunction = onDocumentWritten('networks/{network}/post_types/{postType}/posts/{postId}', (event) => {
	const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
	const ALGOLIA_WRITE_API_KEY = process.env.ALGOLIA_WRITE_API_KEY;

	if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) return;

	const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
	const index = algoliaClient.initIndex('polkassembly_posts');

	const { network, postType, postId } = event.params;
	logger.info('Document written: ', { network, postType, postId });

	// Retrieve the data from the Firestore event
	const post = event.data?.after.data();

	// Create an object to be indexed by Algolia
	const postRecord = {
		objectID: postId, // Unique identifier for the object
		network,
		postType,
		...post
	};

	// Update the Algolia index
	index
		.saveObject(postRecord)
		.then(() => {
			logger.info('Post indexed successfully:', { postId });
		})
		.catch((error) => {
			logger.error('Error indexing post:', { postId, error });
		});
});
