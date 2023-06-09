import algoliasearch from 'algoliasearch';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetchSubsquid from './utils/fetchSubsquid';
import dayjs from 'dayjs';

admin.initializeApp();
const logger = functions.logger;

const GET_PROPOSAL_TRACKS = `query MyQuery($index_eq:Int,$type_eq:ProposalType) {
  proposals(limit: 1, where: {type_eq: $type_eq, index_eq: $index_eq}) {
    trackNumber
  }
}`;

exports.onPostWritten = functions.region('europe-west1').firestore.document('networks/{network}/post_types/{postType}/posts/{postId}').onWrite(async (change, context) => {
	const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
	const ALGOLIA_WRITE_API_KEY = process.env.ALGOLIA_WRITE_API_KEY;

	if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) return;

	const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
	const index = algoliaClient.initIndex('polkassembly_posts');

	const { network, postType, postId } = context.params;
	logger.info('Document written: ', { network, postType, postId });

	// Retrieve the data from the Firestore event
	const post = change.after.data();

	const subsquidRes = postType === 'ReferendumV2' && await fetchSubsquid({
		network,
		query: GET_PROPOSAL_TRACKS,
		variables: {
			index_eq: Number(postId),
			type_eq: 'ReferendumV2'
		}
	});

	const subsquidData = subsquidRes && subsquidRes?.data?.proposals?.[0];

	// Create an object to be indexed by Algolia
	let postRecord: {[index: string]: any} = {
		objectID: `${network}_${postType}_${postId}`, // Unique identifier for the object
		network,
		created_at: dayjs(post?.created_at?.toDate?.() || new Date()).unix(),
		last_comment_at: dayjs(post?.last_comment_at?.toDate?.() || new Date()).unix(),
		last_edited_at: dayjs(post?.last_edited_at?.toDate?.() || new Date()).unix(),
		updated_at: dayjs(post?.updated_at?.toDate?.() || new Date()).unix(),
		postType,
		...post
	};

	if (post?.topic) delete post?.topic;
	if (post?.history) delete post?.history;
	if (post?.post_link) delete post?.post_link;
	if (post?.subscribers) delete post?.subscribers;
	if (post?.author_id) delete post?.author_id;

	postRecord = postType === 'ReferendumV2' ? { ...postRecord, track_number: subsquidData?.trackNumber } : postRecord;

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

exports.onUserWritten = functions.region('europe-west1').firestore.document('users/{userId}').onWrite((change, context) => {
	const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
	const ALGOLIA_WRITE_API_KEY = process.env.ALGOLIA_WRITE_API_KEY;

	if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) return;

	const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
	const index = algoliaClient.initIndex('polkassembly_users');

	const { userId } = context.params;
	logger.info('User written: ', { userId });

	// Retrieve the data from the Firestore event
	const userData = change.after.data();

	// Create an object to be indexed by Algolia
	const userRecord = {
		objectID: userId, // Unique identifier for the object
		created_at: dayjs(userData?.created_at.toDate?.() || new Date()).unix(),
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

exports.onAddressWritten = functions.region('europe-west1').firestore.document('addresses/{address}').onWrite((change, context) => {
	const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
	const ALGOLIA_WRITE_API_KEY = process.env.ALGOLIA_WRITE_API_KEY;

	if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) return;

	const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
	const index = algoliaClient.initIndex('polkassembly_addresses');

	const { address } = context.params;
	logger.info('Address written: ', { address });

	// Retrieve the data from the Firestore event
	const addressData = change.after.data();

	// Create an object to be indexed by Algolia
	const addressRecord = {
		address: address || '',
		objectID: address, // Unique identifier for the object
		default: addressData?.default || false,
		is_erc20: addressData?.is_erc20 || address.startsWith('0x') || false,
		network: addressData?.network || '',
		public_key: addressData?.public_key || '',
		user_id: addressData?.user_id || '',
		verified: addressData?.verified || false,
		wallet: addressData?.wallet || '',
		created_at: dayjs(addressData?.created_at?.toDate?.() || new Date()).unix()
	};

	// Update the Algolia index
	index
		.saveObject(addressRecord)
		.then(() => {
			logger.info('Address indexed successfully:', { address });
		})
		.catch((error) => {
			logger.error('Error indexing address:', { address, error });
		});
});

exports.onCommentWritten = functions.region('europe-west1').firestore.document('networks/{network}/post_types/{postType}/posts/{postId}/comments/{commentId}').onWrite(async (change, context) => {
	const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
	const ALGOLIA_WRITE_API_KEY = process.env.ALGOLIA_WRITE_API_KEY;

	if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) return;

	const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
	const index = algoliaClient.initIndex('polkassembly_posts');

	const { network, postType, postId, commentId } = context.params;
	logger.info('Comment written: ', { network, postType, postId, commentId });

	const commentsCountSnapshot = await admin.firestore().collection('networks').doc(network).collection('post_types').doc(postType).collection('posts').doc(postId).collection('comments').count().get();
	const comments_count = commentsCountSnapshot.data().count;

	// Update the Algolia index
	index
		.partialUpdateObject({ comments_count, objectID: `${network}_${postType}_${postId}` })
		.then(({ objectID }) => {
			logger.info('Post indexed successfully:', { objectID });
		});
});

exports.onReactionWritten = functions.region('europe-west1').firestore.document('networks/{network}/post_types/{postType}/posts/{postId}/post_reactions/{reactionId}').onWrite(async (change, context) => {
	const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
	const ALGOLIA_WRITE_API_KEY = process.env.ALGOLIA_WRITE_API_KEY;

	if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) return;

	const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
	const index = algoliaClient.initIndex('polkassembly_posts');

	const { network, postType, postId, reactionId } = context.params;
	logger.info('Comment written: ', { network, postType, postId, reactionId });

	const firestore_db = admin.firestore();

	const reactionData = change.after.data();
	if (!reactionData) return;

	const reactionCountSnapshot = await firestore_db.collection('networks')
		.doc(network)
		.collection('post_types')
		.doc(postType)
		.collection('posts')
		.doc(postId)
		.collection('post_reactions')
		.where('reaction', '==', reactionData.reaction)
		.count()
		.get();

	const reactionCount = reactionCountSnapshot.data().count;

	// Update the Algolia index
	index
		.partialUpdateObject({ reaction_count: { [reactionData.reaction]: reactionCount }, objectID: `${network}_${postType}_${postId}` })
		.then(({ objectID }) => {
			logger.info('Post indexed successfully:', { objectID });
		});
});
