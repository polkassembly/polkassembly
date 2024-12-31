import { TwitterApi } from 'twitter-api-v2';

/* eslint-disable quote-props */
export default async function getTwitterMentions({ client, username, startTime }: { client: TwitterApi; username?: string; startTime: Date }) {
	const searchQuery = `@${username} -is:retweet -is:reply`;

	const tweets = await client.v2.search(searchQuery, {
		expansions: ['author_id'],
		'tweet.fields': ['author_id', 'text'],
		'user.fields': ['username', 'name', 'verified'],
		max_results: 10,
		start_time: startTime.toISOString()
	});

	return tweets;
}
