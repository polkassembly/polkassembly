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
import dayjs from 'dayjs';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { htmlOrMarkdownToText } from './htmlOrMarkdownToText';

function chunkArray<T>(array: T[], chunkSize: number) {
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

const GET_PROPOSAL_TRACKS = `query MyQuery($index_eq:Int,$type_eq:ProposalType) {
  proposals(limit: 1, where: {type_eq: $type_eq, index_eq: $index_eq}) {
    trackNumber
  }
}`;

const handler: NextApiHandler<IPostTag[] | MessageType> = async (req, res) => {

	//init algolia client
	const ALGOLIA_APP_ID = '9CLYRE6KU9';
	const ALGOLIA_WRITE_API_KEY = 'f725ce93e259bab149442117ed23fc97';

	if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_API_KEY) return;

	const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const index = algoliaClient.initIndex('polkassembly_posts');

	// this would be networks not network -> should work
	const networksSnapshot = await firestore_db.collection('networks').get();

	// for loop for networksSnapshot
	for(const networkDoc of networksSnapshot.docs) {
		// console.log(networkDoc.id,'docID')
		//get postTypes for each network
		const postTypesSnapshot = await networkDoc.ref.collection('post_types').get();

		// for loop for postTypesSnapshot
		for(const postTypeDoc of postTypesSnapshot.docs) {
			// get posts for each postType
			const postsSnapshot = await postTypeDoc.ref.collection('posts').get();

			// setup batch here
			const chunksArray = chunkArray<FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>>(postsSnapshot.docs, 300);
			// for loop for postsSnapshot
			for(const postsArr of chunksArray) {
				const postRecords = [];
				for(const postDoc of postsArr){

					const postDocData = postDoc.data();

					let subsquidRes: any;
					if( postTypeDoc.id === 'referendums_v2')
					{
						subsquidRes= await fetchSubsquid({
							network : networkDoc?.id,
							query: GET_PROPOSAL_TRACKS,
							variables: {
								index_eq: Number(postDocData?.id),
								type_eq: 'ReferendumV2'
							}
						}).catch((error) => console.log(error));
					}
					const subsquidData = subsquidRes && subsquidRes?.data?.proposals?.[0];

					const parsedContent = htmlOrMarkdownToText(postDocData?.content || '');

					const reaction_count = {
						'👍': (await postDoc.ref.collection('post_reactions').where('reaction', '==', '👍').count().get())?.data()?.count || 0,
						'👎': (await postDoc.ref.collection('post_reactions').where('reaction', '==', '👍').count().get())?.data()?.count || 0
					};

					const postData: {[i:string]: any} = {
						...postDocData,
						comments_count : (await postDoc.ref.collection('comments').count().get())?.data()?.count || 0,
						created_at: dayjs(postDocData?.created_at?.toDate?.() || new Date()).unix(),
						last_comment_at: dayjs(postDocData?.last_comment_at?.toDate?.() || new Date()).unix(),
						last_edited_at: dayjs(postDocData?.last_edited_at?.toDate?.() || new Date()).unix(),
						network: networkDoc.id,
						objectID: `${networkDoc.id}_${postTypeDoc.id}_${postDoc.id}`,
						parsed_content: parsedContent || postDocData?.content || '',
						post_type: postTypeDoc.id,
						reaction_count,
						topic_id: postDocData?.topic?.id || postDocData?.topic_id || getTopicFromType(postDocData?.id ).id,
						updated_at: dayjs(postDocData?.updated_at?.toDate?.() || new Date()).unix()
					};

					if(postData.topic) delete postData.topic;
					if(postData.history) delete postData.history;
					if(postData.post_link) delete postData.post_link;
					if(postData.subscribers) delete postData.subscribers;
					if(postData.author_id) delete postData.author_id;

					postRecords.push(
						subsquidData && subsquidData?.trackNumber
							? { ...postData, track_number: subsquidData?.trackNumber }
							: postData
					);
				}

				// console.log(postTypeDoc.id, networkDoc.id, postRecords);
				///commit batch

				console.log('hereee =>', networkDoc.id, postsSnapshot.size, postRecords);
				await index.saveObjects(postRecords).catch((err) => {
					console.log(err);
				});
			}
		}
	}
	res.status(200).json({ message: 'Success' });

};

export default withErrorHandling(handler);