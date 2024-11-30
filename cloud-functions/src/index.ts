import algoliasearch from 'algoliasearch';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetchSubsquid from './utils/fetchSubsquid';
import { htmlOrMarkdownToText } from './utils/htmlOrMarkdownToText';
import dayjs from 'dayjs';
import trackLevelAnalytics from './trackLevelAnalytics';
import crypto from 'crypto';

import cors = require('cors');
import getOpenAiClient from './utils/getOpenAiClient';
import getTwitterClient from './utils/getTwitterClient';
import getTwitterMentions from './utils/getTwitterMentions';
import { BountyStatus, EBountySource, IBounty, IBountyReply, TwitterUsersMap } from './types';
import getOpenAiResponse from './utils/getOpenAiResponse';
import { DEFAULT_AMOUNT, DEFAULT_TASK } from './utils/constants';
import getBountyDeadline from './utils/getBountyDeadline';
import getMentionedRepliesForTweet from './utils/getMentionedRepliesForTweet';
const corsHandler = cors({ origin: true });

admin.initializeApp();
const logger = functions.logger;

export const firestoreDB = admin.firestore();

const GET_PROPOSAL_TRACKS = `query MyQuery($index_eq:Int,$type_eq:ProposalType) {
  proposals(limit: 1, where: {type_eq: $type_eq, index_eq: $index_eq}) {
    trackNumber
  }
}`;

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

async function saveTwitterBounties() {
	const openAIClient = getOpenAiClient();
	const twitterClient = getTwitterClient();

	const mentionsLastFetchedAt: Date = await firestoreDB
		.collection('meta')
		.doc('twitter_bot')
		.get()
		.then((doc) => doc.data()?.mentions_fetched_at?.toDate());

	if (mentionsLastFetchedAt && dayjs(mentionsLastFetchedAt).isAfter(dayjs().subtract(2, 'minutes'))) {
		// this is to make sure that rate limit is not exceeded and we don't fetch old tweets
		logger.info('Rate limit exceeded, skipping.');
		return;
	}

	logger.info('Mentions last fetched at :', mentionsLastFetchedAt);

	const twitterMentions = await getTwitterMentions({
		client: twitterClient,
		username: process.env.TWITTER_BOT_USERNAME || '',
		startTime: mentionsLastFetchedAt
	});

	logger.info('mentions fetched : ', { twitterMentions });

	// Create a map for easier access to usernames by author_id
	const twitterUsersMap: TwitterUsersMap = twitterMentions.includes.users.reduce((usersMap: TwitterUsersMap, user) => {
		usersMap[user.id] = {
			username: user.username,
			display_name: user.name,
			verified: user.verified || false
		};

		return usersMap;
	}, {});

	const tweets = twitterMentions?.data?.data;

	logger.info('tweets : ', { twitterMentions });

	if (!tweets) {
		logger.info('No tweets found.');
		// update last fetched at
		await firestoreDB.collection('meta').doc('twitter_bot').set(
			{
				mentions_fetched_at: new Date()
			},
			{ merge: true }
		);
		return;
	}

	const tweetsIds = tweets.map((tweet: any) => tweet.id);

	logger.info('# of Tweets fetched :', tweetsIds.length);

	// check if already replied to tweet (only exists in db if already replied to)
	const bountiesTweetIds: string[] = (await firestoreDB.collection('bounties').where('source_id', 'in', tweetsIds).where('source', '==', EBountySource.TWITTER).get()).docs.map(
		(doc) => doc.data()?.source_id || ''
	);

	logger.info('Replied Tweet Ids :', bountiesTweetIds);

	// reply to tweets
	for (const tweet of tweets) {
		// skip if already replied to
		if (bountiesTweetIds.includes(tweet.id)) {
			logger.info('Replied already, skipping for ID :', tweet.id);
			continue;
		}

		const aiResponse = await getOpenAiResponse(openAIClient, tweet.text);

		logger.info('aiResponse:', { id: tweet.id, aiResponse });

		if (!aiResponse.task) {
			logger.info('No task found, skipping for ID :', tweet.id);
			continue;
		}

		if (
			!tweet.author_id
			// TODO: ||
			// !(
			// twitterUsersMap[tweet.author_id].verified ||
			// twitterUsersMap[tweet.author_id].username === 'thebhavyabatra'
			// )
		) {
			logger.info('User not verified, skipping for: ', tweet.id);
			continue;
		}

		const bountyRef = firestoreDB.collection('bounties').doc();

		const bounty: IBounty = {
			id: bountyRef.id,
			username: twitterUsersMap[tweet.author_id].username || '',
			display_name: twitterUsersMap[tweet.author_id].display_name || '',
			status: BountyStatus.OPEN,
			source: EBountySource.TWITTER,
			created_at: new Date(),
			updated_at: new Date(),
			replies: [],
			source_author_id: tweet.author_id,
			source_id: tweet.id,
			source_text: tweet.text,
			task: aiResponse?.task || DEFAULT_TASK,
			amount: aiResponse?.reward || DEFAULT_AMOUNT,
			max_claims: Number(aiResponse.max_claims) || 1,
			deleted: false
		};

		bounty.deadline = getBountyDeadline(aiResponse.deadline);

		logger.info('Bounty created :', bounty);

		// save bounties to db
		await bountyRef.set(bounty);

		// respond to tweet, with the link of the bounty
		const response = `Wohoo! Your bounty was just created.\nCheck it out here :https://polkadot.polkassembly.io/bounty/${bounty.id}\nMake your submission by replying to this post.`;

		logger.info('Responding to tweet :', response);
		await twitterClient.v2.reply(response, tweet.id);
	}

	// update last fetched at
	await firestoreDB.collection('meta').doc('twitter_bot').update({
		mentions_fetched_at: new Date()
	});

	return;
}

async function resolveOverdueTwitterBounties() {
	const bountiesLastClosedAt: Date = await firestoreDB
		.collection('meta')
		.doc('twitter_bot')
		.get()
		.then((doc) => doc.data()?.bounties_closed_at?.toDate());

	logger.info('bountiesLastClosedAt :', bountiesLastClosedAt);

	const bounties = (
		await firestoreDB.collection('bounties').where('deadline', '<=', new Date()).where('deadline', '>', bountiesLastClosedAt).where('source', '==', EBountySource.TWITTER).get()
	).docs.map((doc) => {
		const data = doc.data();
		return {
			...data,
			deadline: data.deadline?.toDate(),
			created_at: data.created_at.toDate(),
			updated_at: data.updated_at.toDate()
		} as IBounty;
	});

	if (!bounties.length) {
		logger.info('No overdue bounties found.');
		return;
	}

	logger.info('overdue bounties : ', { bounties });

	const twitterClient = getTwitterClient();

	// get replies for each bounty tweet
	for (const bounty of bounties) {
		if (!bounty.source_id) continue;

		const replies = await getMentionedRepliesForTweet({
			client: twitterClient,
			tweetId: bounty.source_id,
			username: process.env.TWITTER_BOT_USERNAME || ''
		});

		logger.info('replies for tweet : ', { bounty_id: bounty.id, replies });

		if (replies?.data?.data) {
			// save replies to db
			const batch = firestoreDB.batch(); // (NOTE: do not use batch if you fetch more than 500 replies)

			// Create a map for easier access to usernames by author_id
			const twitterUsersMap: TwitterUsersMap = replies.includes.users.reduce((usersMap: TwitterUsersMap, user) => {
				usersMap[user.id] = {
					username: user.username,
					display_name: user.name,
					verified: user.verified || false
				};

				return usersMap;
			}, {});

			if (!replies.data.data.length) {
				logger.info('No replies found for tweet id :', bounty.source_id);
				continue;
			}

			// get all replies from db to ignore duplicates
			const savedReplies = (await firestoreDB.collection('bounties').doc(bounty.id).collection('replies').get()).docs.map((doc) => (doc.data().id as string) || '') || [];

			for (const reply of replies.data.data) {
				if (savedReplies.includes(reply.id)) {
					logger.info('Reply already saved, skipping for ID :', reply.id);
					continue;
				}

				const replyRef = firestoreDB.collection('bounties').doc(bounty.id).collection('replies').doc();

				if (!reply.author_id) continue;

				const bountyReply: IBountyReply = {
					id: reply.id,
					created_at: new Date(),
					updated_at: new Date(),
					source_author_id: reply.author_id,
					display_name: twitterUsersMap[reply.author_id].display_name || '',
					username: twitterUsersMap[reply.author_id].username || '',
					text: reply.text,
					source: EBountySource.TWITTER,
					deleted: false
				};

				batch.set(replyRef, bountyReply);
			}

			await batch.commit();
		}

		// close bounty
		const bountyRef = firestoreDB.collection('bounties').doc(bounty.id);
		await bountyRef.update({
			status: BountyStatus.CLOSED,
			updated_at: new Date()
		});

		// respond to tweet, with the link of the bounty
		const response = `Tweet Tweet! The bounty deadline has flown by. We're closing the bounty now.\nCheck out the submissions here : https://polkadot.polkassembly.io/bounty/${bounty.id}\n#BountyClosed`;
		logger.info('Responding to tweet :', response);

		await twitterClient.v2.reply(response, bounty.source_id);
	}

	// update last closed at
	await firestoreDB.collection('meta').doc('twitter_bot').update({
		bounties_closed_at: new Date()
	});
}

exports.bountiesTwitterBot = functions.pubsub.schedule('every 2 minutes').onRun(async () => {
	try {
		logger.info('bountiesTwitterBot ran at : ', new Date());

		if (!process.env.BOUNTIES_TWITTER_BOT_USERNAME) {
			logger.error('BOUNTIES_TWITTER_BOT_USERNAME env variable not set.');
			return;
		}

		await saveTwitterBounties();
		await resolveOverdueTwitterBounties();

		return;
	} catch (err: unknown) {
		logger.error('Error in twitterBot :', {
			err,
			stack: (err as any).stack
		});
	}
});

export const callBountiesTwitterBot = functions.https.onRequest(async (req, res) => {
	logger.info('callBountiesTwitterBot ran at : ', new Date());

	corsHandler(req, res, async () => {
		if (!process.env.BOUNTIES_TWITTER_BOT_USERNAME) {
			return res.status(500).json({ error: 'BOUNTIES_TWITTER_BOT_USERNAME env variable not set.' });
		}

		try {
			await saveTwitterBounties();
			await resolveOverdueTwitterBounties();

			return res.status(200).end();
		} catch (err: unknown) {
			logger.error('Error in callTwitterBot :', {
				err,
				stack: (err as any).stack
			});
			return res.status(500).json({ error: 'Internal error.' });
		}
	});
});
