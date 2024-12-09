import { TwitterApi } from 'twitter-api-v2';

/* eslint-disable quote-props */

export default async function getMentionedRepliesForTweet({
	client,
	tweetId,
	username
}: {
	client: TwitterApi;
	tweetId: string;
	username: string;
}) {
	// get replies to tweetId where the username is mentioned and #submitbounty tag is used
	const replies = await client.v2.search(
		`@${username} #submitbounty conversation_id:${tweetId} -from:${username}`,
		{
			expansions: ['author_id'],
			'tweet.fields': ['author_id'],
			'user.fields': ['username', 'name', 'verified'],
			max_results: 100
		}
	);

	return replies;
}
