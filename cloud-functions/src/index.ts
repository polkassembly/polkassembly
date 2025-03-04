import algoliasearch from 'algoliasearch';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetchSubsquid from './utils/fetchSubsquid';
import { htmlOrMarkdownToText } from './utils/htmlOrMarkdownToText';
import dayjs from 'dayjs';
import trackLevelAnalytics from './trackLevelAnalytics';
import crypto from 'crypto';

import cors = require('cors');
import fetchTokenUSDPrice from './utils/fetchTokenUSDPrice';
import { fetchTreasuryStats } from './utils/fetchTreasuryStats';
import updateNewProposalsInAlgolia from './updateNewProposalsInAlgolia';
const corsHandler = cors({ origin: true });

admin.initializeApp();
const logger = functions.logger;

export const firestoreDB = admin.firestore();

const GET_PROPOSAL_TRACKS = `query MyQuery($index_eq:Int,$type_eq:ProposalType) {
  proposals(limit: 1, where: {type_eq: $type_eq, index_eq: $index_eq}) {
    trackNumber
  }
}`;
// schedule fn which runs every 10 minutes and updates the algolia index for looping through all subsquid proposals ;
exports.onPostWritten = functions
	.region('europe-west1')
	.firestore.document('networks/{network}/post_types/{postType}/posts/{postId}')
	.onWrite(async (change, context) => {
		const { network, postType, postId } = context.params;

		const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
		const ALGOLIA_WRITE_API_KEY = process.env.ALGOLIA_WRITE_API_KEY;

		if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) {
			logger.error(`Error indexing ${network}, ${postType}, ${postId} : Algolia env variables not set`);
			return;
		}

		const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
		const index = algoliaClient.initIndex('polkassembly_posts');

		logger.info('Document written: ', { network, postType, postId });

		// Retrieve the data from the Firestore event
		const post = change.after.data();

		const subsquidRes =
			postType === 'ReferendumV2' &&
			(await fetchSubsquid({
				network,
				query: GET_PROPOSAL_TRACKS,
				variables: {
					index_eq: Number(postId),
					type_eq: 'ReferendumV2'
				}
			}));

		const subsquidData = subsquidRes && subsquidRes?.data?.proposals?.[0];
		const parsedContent = htmlOrMarkdownToText(post?.content || '');

		// Create an object to be indexed by Algolia
		let postRecord: { [index: string]: any } = {
			...post,
			tags: post?.tags,
			objectID: `${network}_${postType}_${postId}`, // Unique identifier for the object
			network,
			created_at: dayjs(post?.created_at?.toDate?.() || new Date()).unix(),
			last_comment_at: dayjs(post?.last_comment_at?.toDate?.() || new Date()).unix(),
			last_edited_at: dayjs(post?.last_edited_at?.toDate?.() || new Date()).unix(),
			parsed_content: parsedContent || post?.content || '',
			updated_at: dayjs(post?.updated_at?.toDate?.() || new Date()).unix(),
			post_type: postType
		};

		if (post?.topic) delete post?.topic;
		if (post?.history) delete post?.history;
		if (post?.post_link) delete post?.post_link;
		if (post?.subscribers) delete post?.subscribers;
		if (post?.author_id) delete post?.author_id;
		if (post?.content) delete post?.content;
		if (post?.summary) delete post?.summary;

		postRecord = postType === 'ReferendumV2' ? { ...postRecord, track_number: subsquidData?.trackNumber } : postRecord;

		// Update the Algolia index
		await index
			.saveObject(postRecord)
			.then(() => {
				logger.info('Post indexed successfully:', { network, postType, postId });
			})
			.catch((error) => {
				logger.error('Error indexing post:', { error, network, postType, postId });
			});
	});

exports.onUserWritten = functions
	.region('europe-west1')
	.firestore.document('users/{userId}')
	.onWrite(async (change, context) => {
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
		await index
			.saveObject(userRecord)
			.then(() => {
				logger.info('User indexed successfully:', { userId });
			})
			.catch((error) => {
				logger.error('Error indexing user:', { userId, error });
			});
	});

exports.onAddressWritten = functions
	.region('europe-west1')
	.firestore.document('addresses/{address}')
	.onWrite(async (change, context) => {
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
		await index
			.saveObject(addressRecord)
			.then(() => {
				logger.info('Address indexed successfully:', { address });
			})
			.catch((error) => {
				logger.error('Error indexing address:', { address, error });
			});
	});

exports.onCommentWritten = functions
	.region('europe-west1')
	.firestore.document('networks/{network}/post_types/{postType}/posts/{postId}/comments/{commentId}')
	.onWrite(async (change, context) => {
		const { network, postType, postId, commentId } = context.params;
		logger.info('Comment written: ', { network, postType, postId, commentId });

		const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
		const ALGOLIA_WRITE_API_KEY = process.env.ALGOLIA_WRITE_API_KEY;

		if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) {
			logger.error(`Error indexing ${network}, ${postType}, ${postId} : Algolia env variables not set`);
			return;
		}

		const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
		const index = algoliaClient.initIndex('polkassembly_posts');

		const commentsCountSnapshot = await admin
			.firestore()
			.collection('networks')
			.doc(network)
			.collection('post_types')
			.doc(postType)
			.collection('posts')
			.doc(postId)
			.collection('comments')
			.count()
			.get();
		const comments_count = commentsCountSnapshot.data().count;

		// Update the Algolia index
		await index.partialUpdateObject({ comments_count, objectID: `${network}_${postType}_${postId}` }).then(({ objectID }) => {
			logger.info('Post indexed successfully:', { objectID });
		});
	});

exports.onReactionWritten = functions
	.region('europe-west1')
	.firestore.document('networks/{network}/post_types/{postType}/posts/{postId}/post_reactions/{reactionId}')
	.onWrite(async (change, context) => {
		const { network, postType, postId, reactionId } = context.params;
		logger.info('Comment written: ', { network, postType, postId, reactionId });

		const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
		const ALGOLIA_WRITE_API_KEY = process.env.ALGOLIA_WRITE_API_KEY;

		if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) {
			logger.error(`Error indexing ${network}, ${postType}, ${postId} : Algolia env variables not set`);
			return;
		}

		const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
		const index = algoliaClient.initIndex('polkassembly_posts');

		const firestore_db = admin.firestore();

		const reactionData = change.after.data();
		if (!reactionData) return;

		const reactionCountSnapshot = await firestore_db
			.collection('networks')
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
		await index.partialUpdateObject({ reaction_count: { [reactionData.reaction]: reactionCount }, objectID: `${network}_${postType}_${postId}` }).then(({ objectID }) => {
			logger.info('Post indexed successfully:', { objectID });
		});
	});

exports.trackLevelAnalytics = functions
	.runWith({
		memory: '1GB',
		timeoutSeconds: 540
	})
	.pubsub.schedule('every 24 hours')
	.onRun(async () => {
		functions.logger.info('scheduledTrackLevelAnalytics ran at : ', new Date());
		await trackLevelAnalytics();
		return;
	});

export const callTrackLevelAnalytics = functions
	.runWith({
		timeoutSeconds: 540
	})
	.https.onRequest(async (req, res) => {
		corsHandler(req, res, async () => {
			try {
				await trackLevelAnalytics();
				return res.status(200).end();
			} catch (err: unknown) {
				logger.error('Error in callTrackLevelAnalytics:', {
					err,
					stack: (err as any).stack
				});
				return res.status(500).json({ error: 'Internal error.' });
			}
		});
	});

export const vercelLogDrain = functions.https.onRequest(async (req, res) => {
	corsHandler(req, res, async () => {
		try {
			res.set('x-vercel-verify', 'a9899c2456a9f905c339cb25184d41968f5a4c21');

			// Validate the request
			if (req.method !== 'POST') {
				res.status(405).send('Method Not Allowed');
				return;
			}

			const LOG_DRAIN_SECRET = process.env.LOG_DRAIN_SECRET || '';

			if (!LOG_DRAIN_SECRET) {
				res.status(500).send('Internal server error, no LOG_DRAIN_SECRET key set');
				return;
			}

			const signature = crypto.createHmac('sha1', LOG_DRAIN_SECRET).update(JSON.stringify(req.body)).digest('hex');
			if (signature !== req.headers['x-vercel-signature']) {
				res.status(405).send('Invalid signature');
				return;
			}

			const LOG_DRAIN_KEY = process.env.LOG_DRAIN_KEY;

			// Authenticate the request using the password in the headers
			const logDrainKeyHeader = req.headers['x-log-drain-key'];
			if (!logDrainKeyHeader || logDrainKeyHeader !== LOG_DRAIN_KEY) {
				res.status(401).send('Unauthorized');
				return;
			}

			// Get the log data from the request body
			const logData = req.body;

			// Check if logData is valid
			if (!logData || !Array.isArray(logData) || logData.length === 0) {
				res.status(400).send('Bad Request: Missing or invalid log data');
				return;
			}

			logger.info('Received log data:', { logData });

			return res.status(200).send('Log data stored successfully');
		} catch (err: unknown) {
			logger.error('Error in vercelLogDrain:', {
				err,
				stack: (err as any).stack
			});
			return res.status(500).json({ error: 'Internal error.' });
		}
	});
});

export const updateMultipleNetworkTokenPricesScheduled = functions
	.region('europe-west1')
	.pubsub.schedule('every 2 minutes')
	.timeZone('UTC')
	.onRun(async () => {
		const networks = ['polkadot', 'kusama'];
		const logResults = [];

		for (const networkName of networks) {
			try {
				const networkDocRef = firestoreDB.collection('networks').doc(networkName.toLowerCase());
				const networkDocSnapshot = await networkDocRef.get();

				let actionTaken = 'Fetched new token price';
				let lastFetchedAt = null;

				if (networkDocSnapshot.exists) {
					lastFetchedAt = networkDocSnapshot.get('token_price.last_fetched_at')?.toDate?.();
					if (lastFetchedAt && dayjs().diff(dayjs(lastFetchedAt), 'minute') < 5) {
						logResults.push({
							network: networkName,
							action: actionTaken,
							lastFetchedAt: lastFetchedAt.toISOString(),
							status: 'success'
						});
						continue;
					}
				}

				const latestTokenPrice = await fetchTokenUSDPrice(networkName);

				if (latestTokenPrice === 'N/A') {
					actionTaken = 'Skipped - price not available';
					logResults.push({
						network: networkName,
						action: actionTaken,
						status: 'skipped'
					});
					continue;
				}

				await networkDocRef.set(
					{
						token_price: {
							value: latestTokenPrice,
							last_fetched_at: admin.firestore.Timestamp.now()
						}
					},
					{ merge: true }
				);

				logResults.push({
					network: networkName,
					action: actionTaken,
					tokenPrice: latestTokenPrice,
					status: 'updated'
				});
			} catch (error) {
				logResults.push({
					network: networkName,
					action: 'Error during update',
					error: error,
					status: 'failed'
				});
				continue;
			}
		}

		logger.info('Token price update results', {
			results: logResults
		});

		return null;
	});

export const scheduledUpdateTreasuryStats = functions
	.region('europe-west1')
	.runWith({
		memory: '1GB',
		timeoutSeconds: 540
		// failurePolicy: true // retry on failure
	})
	.pubsub.schedule('every 6 hours')
	.timeZone('UTC')
	.onRun(async () => {
		logger.info('Updating treasury stats');
		const treasuryStats = await fetchTreasuryStats();

		logger.info('Treasury stats:', { treasuryStats });

		if (!treasuryStats) {
			logger.error('Treasury stats not found');
			return;
		}

		const networkDocRef = firestoreDB.collection('networks').doc('polkadot');

		await networkDocRef.set(
			{
				treasury_stats: treasuryStats
			},
			{ merge: true }
		);

		return null;
	});

export const callUpdateTreasuryStats = functions
	.runWith({
		memory: '1GB',
		timeoutSeconds: 540
	})
	.https.onRequest(async (req, res) => {
		corsHandler(req, res, async () => {
			try {
				const treasuryStats = await fetchTreasuryStats();

				logger.info('Treasury stats:', { treasuryStats });

				if (!treasuryStats) {
					logger.error('Treasury stats not found');
					return res.status(500).json({ error: 'Treasury stats not found' });
				}

				const networkDocRef = firestoreDB.collection('networks').doc('polkadot');

				await networkDocRef.set(
					{
						treasury_stats: treasuryStats
					},
					{ merge: true }
				);

				return res.status(200).end();
			} catch (err: unknown) {
				logger.error('Error in callUpdateTreasuryStats:', {
					err,
					stack: (err as any).stack
				});
				return res.status(500).json({ error: 'Internal error.' });
			}
		});
	});

exports.updateNewProposalsInAlgolia = functions
	.runWith({
		memory: '1GB',
		timeoutSeconds: 540
	})
	.pubsub.schedule('every 30 minutes')
	.onRun(async () => {
		functions.logger.info('scheduledUpdateNewProposalsInAlgolia ran at : ', new Date());
		await updateNewProposalsInAlgolia();
		return;
	});
