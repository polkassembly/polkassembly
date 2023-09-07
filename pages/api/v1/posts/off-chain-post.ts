// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isFirestoreProposalTypeValid, isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { getFirestoreProposalType, getSubsquidProposalType, OffChainProposalType, ProposalType } from '~src/global/proposalType';
import { GET_PROPOSAL_BY_INDEX_AND_TYPE_FOR_LINKING } from '~src/queries';
import { firestore_db } from '~src/services/firebaseInit';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import messages from '~src/util/messages';

import { checkReportThreshold, getComments, getReactions, getSpamUsersCount, IPostResponse, isDataExist, updatePostTimeline } from './on-chain-post';
import { getProposerAddressFromFirestorePostData } from '../listing/on-chain-posts';
import { getContentSummary } from '~src/util/getPostContentAiSummary';
import dayjs from 'dayjs';
import { getStatus } from '~src/components/Post/Comment/CommentsContainer';
import { redisGet, redisSet } from '~src/auth/redis';
import { generateKey } from '~src/util/getRedisKeys';

interface IGetOffChainPostParams {
	network: string;
	postId?: string | string[] | number;
	proposalType: OffChainProposalType | string | string[];
	isExternalApiCall?: boolean;
	noComments?:boolean
}

export const getUpdatedAt = (data: any) => {
	let updated_at: Date | string | undefined;
	if (data) {
		if (data.last_edited_at) {
			updated_at = data.last_edited_at?.toDate? data.last_edited_at.toDate(): data.last_edited_at;
		} else if (data.updated_at) {
			updated_at = data.updated_at?.toDate? data.updated_at?.toDate(): data.updated_at;
		}
	}
	return updated_at;
};

export async function getOffChainPost(params: IGetOffChainPostParams) : Promise<IApiResponse<IPostResponse>> {
	try {
		const { network, postId, proposalType, isExternalApiCall, noComments= true } = params;
		if (postId === undefined || postId === null) {
			throw apiErrorWithStatusCode('Please send postId', 400);
		}

		const strProposalType = String(proposalType);
		if (!isFirestoreProposalTypeValid(strProposalType)) {
			throw apiErrorWithStatusCode(`The off chain proposal type "${proposalType}" is invalid.`, 400);
		}

		if(proposalType === ProposalType.DISCUSSIONS && !isExternalApiCall && process.env.IS_CACHING_ALLOWED == '1'){
			const redisKey = generateKey({ keyType: 'postId', network, postId: postId, proposalType: ProposalType.DISCUSSIONS });
			const redisData = await redisGet(redisKey);
			if(redisData){
				return {
					data: JSON.parse(redisData),
					error: null,
					status: 200
				};
			}
		}

		const postDocRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(postId));
		const discussionPostDoc = await postDocRef.get();
		if (!(discussionPostDoc && discussionPostDoc.exists)) {
			throw apiErrorWithStatusCode(`The Post with id "${postId}" is not found.`, 400);
		}

		// Post Reactions
		const postReactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
		const post_reactions = getReactions(postReactionsQuerySnapshot);

		// Post Data
		const data = discussionPostDoc.data();

		const timeline = [
			{
				created_at: data?.created_at?.toDate? data?.created_at?.toDate(): data?.created_at,
				index: Number(postId),
				statuses: [
					{
						status: 'Created',
						timestamp: data?.created_at?.toDate? data?.created_at?.toDate(): data?.created_at
					}
				],
				type: 'Discussions'
			}
		];

		const topic = data?.topic;
		const topic_id = data?.topic_id;
		const spam_users_count = await getSpamUsersCount(network, proposalType, Number(postId), 'post');
		const tags = data?.tags || [];
		const gov_type = data?.gov_type;
		const history = data?.history ? data?.history.map((item: any) => { return { ...item, created_at: item?.created_at?.toDate ? item?.created_at.toDate() : item?.created_at };}) : [];
		const proposer = getProposerAddressFromFirestorePostData(data, network);
		const post: IPostResponse = {
			comments: [],
			content: data?.content,
			created_at: data?.created_at?.toDate? data?.created_at?.toDate(): data?.created_at,
			gov_type: gov_type,
			history,
			isSpam: data?.isSpam,
			isSpamReportInvalid: data?.isSpamReportInvalid,
			last_edited_at: getUpdatedAt(data),
			post_id: data?.id,
			post_link: null,
			post_reactions: post_reactions,
			proposer: proposer,
			spam_users_count,
			subscribers: data?.subscribers || [],
			summary: data?.summary,
			tags: tags || [],
			timeline: [],
			title: data?.title,
			topic: topic? topic: isTopicIdValid(topic_id)? {
				id: topic_id,
				name: getTopicNameFromTopicId(topic_id)
			}: getTopicFromType(strProposalType as ProposalType),
			type: (strProposalType === 'discussions'? 'Discussions': strProposalType === 'grants'? 'Grants': ''),
			user_id: data?.user_id,
			username: data?.username

		};

		// spam users count
		if(post?.isSpam) {
			const threshold = process.env.REPORTS_THRESHOLD || 50;
			post.spam_users_count = Number(threshold);
		} else {
			post.spam_users_count = checkReportThreshold(post.spam_users_count);
		}

		if(post?.isSpamReportInvalid) {
			post.spam_users_count = 0;
		}

		if (post && (post.user_id || post.user_id === 0)) {
			let { user_id } = post;
			if (typeof user_id !== 'number') {
				const numUserId = Number(user_id);
				if (!isNaN(numUserId)) {
					user_id = numUserId;
				}
			}
			const addressDocs = await firestore_db.collection('addresses').where('user_id', '==', user_id).where('default', '==', true).limit(1).get();
			if (addressDocs && addressDocs.size > 0) {
				const doc = addressDocs.docs[0];
				if (doc && doc.exists && doc.data()) {
					const data = doc.data();
					if (data) {
						post.proposer = data.address;
					}
				}
			}
		}

		const post_link = data?.post_link;
		if (post_link) {
			const { id, type } = post_link;
			const postDocRef = postsByTypeRef(network, type).doc(String(id));
			const postDoc = await postDocRef.get();
			const postData = postDoc.data();
			if (postDoc.exists && postData) {
				post_link.title = postData.title;
				post_link.description = postData.content;
			}
			if (isProposalTypeValid(type)) {
				const subsquidProposalType = getSubsquidProposalType(type as any);
				const variables: any = {
					type_eq: subsquidProposalType
				};

				if (type === ProposalType.TIPS) {
					variables['hash_eq'] = String(id);
				} else {
					variables['index_eq'] = Number(id);
				}
				const subsquidRes = await fetchSubsquid({
					network,
					query: GET_PROPOSAL_BY_INDEX_AND_TYPE_FOR_LINKING,
					variables: variables
				});
				const subsquidData = subsquidRes?.data;
				if (!isDataExist(subsquidData)) {
					throw apiErrorWithStatusCode(`The Post with id: "${id}" and type: "${type}" is not found.`, 400);
				}
				const postData = subsquidData.proposals[0];
				const preimage = postData?.preimage;
				if (!post_link.title) {
					post_link.title = preimage?.method;
				}
				if (!post_link.description) {
					post_link.description = postData.description || preimage?.proposedCall?.description;
				}
				updatePostTimeline(post, postData);
			}
			post.post_link = post_link;
		}
		post.timeline = [...timeline, ...(post.timeline? post.timeline: [])];

		// Comments
		if(noComments){
			if (post.timeline && Array.isArray(post.timeline) && post.timeline.length > 0) {
				const commentPromises = post.timeline.map(async (timeline: any) => {
					const postDocRef = postsByTypeRef(network, getFirestoreProposalType(timeline.type) as ProposalType).doc(String(timeline.type === 'Tips'? timeline.hash: timeline.index));
					const commentsCount = (await postDocRef.collection('comments').get()).size;
					return { ...timeline, commentsCount };
				});
				const timelines:Array<any>  = await Promise.allSettled(commentPromises);
				post.timeline = timelines.map(timeline => timeline.value);
			}
			const currentTimelineObj = post.timeline?.[0] || null;
			if(currentTimelineObj){
				post.currentTimeline = {
					commentsCount: currentTimelineObj.commentsCount,
					date: dayjs(currentTimelineObj?.created_at),
					firstCommentId: '',
					id: 1,
					index: currentTimelineObj?.index?.toString() || currentTimelineObj?.hash,
					status: getStatus(currentTimelineObj?.type),
					type: currentTimelineObj?.type
				};
			}
		}
		else{
			if (post.timeline && Array.isArray(post.timeline) && post.timeline.length > 0) {
				const commentPromises = post.timeline.map(async (timeline: any) => {
					const type = getFirestoreProposalType(timeline.type) as ProposalType;
					const index = timeline.type === 'Tips'? timeline.hash: timeline.index;
					const postDocRef = postsByTypeRef(network, type).doc(String(index));
					const commentsSnapshot = await postDocRef.collection('comments').get();
					const comments = await getComments(commentsSnapshot, postDocRef, network, type, index);
					return comments;
				});
				const commentPromiseSettledResults = await Promise.allSettled(commentPromises);
				commentPromiseSettledResults.forEach((result) => {
					if (result && result.status === 'fulfilled' && result.value && Array.isArray(result.value)) {
						if (!post.comments || !Array.isArray(post.comments)) {
							post.comments = [];
						}
						post.comments = post.comments.concat(result.value);
					}
				});
			} else {
				if (post.post_link) {
					const { id, type } = post.post_link;
					const postDocRef = postsByTypeRef(network, type).doc(String(id));
					const commentsSnapshot = await postDocRef.collection('comments').get();
					post.comments = await getComments(commentsSnapshot, postDocRef, network, type, id);
				}
				const commentsSnapshot = await postDocRef.collection('comments').get();
				const comments = await getComments(commentsSnapshot, postDocRef, network, strProposalType, Number(postId));
				if (post.comments && Array.isArray(post.comments)) {
					post.comments = post.comments.concat(comments);
				} else {
					post.comments = comments;
				}
			}
			post.comments_count = post.comments.length;
		}

		await getContentSummary(post, network, isExternalApiCall);
		if (proposalType === ProposalType.DISCUSSIONS && !isExternalApiCall && process.env.IS_CACHING_ALLOWED == '1'){
			await redisSet(generateKey({ keyType: 'postId', network, postId: postId, proposalType: ProposalType.DISCUSSIONS }), JSON.stringify(post));
		}
		return {
			data: JSON.parse(JSON.stringify(post)),
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
}

// expects optional discussionType and postId of proposal
const handler: NextApiHandler<IPostResponse | { error: string }> = async (req, res) => {
	const { postId = 0, proposalType = OffChainProposalType.DISCUSSIONS } = req.query;

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) return res.status(400).json({ error: 'Invalid network in request header' });

	const { data, error, status } = await getOffChainPost({
		isExternalApiCall: true,
		network,
		noComments:false,
		postId,
		proposalType
	});

	if(error || !data) {
		return res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	}else {
		if (data.summary) {
			delete data.summary;
		}
		return res.status(status).json(data);
	}
};
export default withErrorHandling(handler);