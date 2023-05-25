import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import algoliasearch from 'algoliasearch';

// v2 functions can only contain lowercase letters, numbers and no underscores.
exports.onpostwritten = onDocumentWritten('networks/{network}/post_types/{postType}/posts/{postId}', (event) => {
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

exports.onuserwritten = onDocumentWritten('users/{userId}', (event) => {
	const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
	const ALGOLIA_WRITE_API_KEY = process.env.ALGOLIA_WRITE_API_KEY;

	if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) return;

	const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
	const index = algoliaClient.initIndex('polkassembly_users');

	const { userId } = event.params;
	logger.info('User written: ', { userId });

	// Retrieve the data from the Firestore event
	const userData = event.data?.after.data();

	// Create an object to be indexed by Algolia
	const userRecord = {
		objectID: userId, // Unique identifier for the object
		created_at: userData?.created_at || new Date(),
		email: userData?.email || '',
		username: userData?.username || '',
		profile: userData?.profile || {}
	};

	// Update the Algolia index
	index
		.saveObject(userRecord)
		.then(() => {
			logger.info('User indexed successfully:', { userId });
		})
		.catch((error) => {
			logger.error('Error indexing user:', { userId, error });
		});
});
