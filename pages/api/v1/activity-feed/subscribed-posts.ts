// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import authServiceInstance from '~src/auth/auth';
import { getProposalTypeTitle, getStatusesFromCustomStatus, getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { ACTIVE_PROPOSALS_FROM_INDEXES } from '~src/queries';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCardAll';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import { getTimeline } from '~src/util/getTimeline';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { getDefaultReactionObj, getReactions } from '../posts/on-chain-post';
import { getSubSquareContentAndTitle } from '../posts/subsqaure/subsquare-content';
import { getIsSwapStatus } from '~src/util/getIsSwapStatus';
import { getProposerAddressFromFirestorePostData } from '~src/util/getProposerAddressFromFirestorePostData';
import { EAllowedCommentor } from '~src/types';
import { getContentSummary } from '~src/util/getPostContentAiSummary';
import { IActivityFeedPost } from '~src/components/ActivityFeed/types/types';
import getBeneficiaryDetails from '~src/util/getBeneficiaryDetails';
import { getDefaultContent } from '~src/util/getDefaultContent';

interface ISubscribedPost {
	network: string;
	post_id: number;
	post_type: ProposalType;
	created_at?: Date;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	const token = getTokenFromReq(req);
	if (!token) return res.status(401).json({ message: messages.INVALID_JWT });

	const user = await authServiceInstance.GetUser(token);
	if (!user || isNaN(user.id)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const userId = user?.id;
	try {
		const userRef = await firestore_db.collection('users').doc(String(userId)).get();
		const userData = userRef?.data();

		const allSubscribedPostsAccToNetwork = userData?.subscribed_posts?.length ? userData?.subscribed_posts?.filter((post: ISubscribedPost) => post?.network == network) : [];

		const allOpenGovReferendumIndexes: number[] = [];
		allSubscribedPostsAccToNetwork.map((post: ISubscribedPost) => {
			if (post?.post_type == ProposalType.REFERENDUM_V2) {
				allOpenGovReferendumIndexes.push(post?.post_id);
			}
		});

		const subsquidRes = await fetchSubsquid({
			network,
			query: ACTIVE_PROPOSALS_FROM_INDEXES,
			variables: {
				indexes_in: allOpenGovReferendumIndexes,
				status_in: getStatusesFromCustomStatus(CustomStatus.Active),
				type_eq: getSubsquidProposalType(ProposalType.OPEN_GOV)
			}
		});

		const subsquidData = subsquidRes?.['data']?.proposals;

		const allPromises = subsquidData.map(async (subsquidPost: any) => {
			const { createdAt, end, hash, index: postId, type, proposer, description, group, curator, parentBountyIndex, statusHistory, trackNumber, proposalHashBlock } = subsquidPost;

			if (!subsquidPost?.preimage) {
				subsquidPost.preimage = {
					description: subsquidPost?.proposalArguments?.description,
					method: subsquidPost?.proposalArguments?.method,
					proposedCall: { args: subsquidPost?.proposalArguments?.args, method: subsquidPost?.proposalArguments?.method, section: subsquidPost?.proposalArguments?.section },
					section: subsquidPost?.proposalArguments?.section
				};
				subsquidPost.proposalArguments = null;
			}
			const args = subsquidPost?.preimage?.proposedCall?.args;

			const { assetId, requestedAmt } = getBeneficiaryDetails({ network, preimageArgs: args });

			let otherPostProposer = '';
			if (group?.proposals?.length) {
				group.proposals.forEach((obj: any) => {
					if (!otherPostProposer) {
						if (obj.proposer) {
							otherPostProposer = obj.proposer;
						} else if (obj?.preimage?.proposer) {
							otherPostProposer = obj.preimage.proposer;
						}
					}
				});
			}

			const isSwap: boolean = getIsSwapStatus(statusHistory);

			if (isSwap) {
				if (subsquidPost?.status === 'DecisionDepositPlaced') {
					subsquidPost.status = 'Deciding';
				}
			}
			const topicFromType = getTopicFromType(ProposalType.REFERENDUM_V2 as ProposalType);
			const status = subsquidPost.status;
			const identity = subsquidPost?.identity || null;
			const tally = subsquidPost.tally;

			const isStatus = {
				swap: false
			};

			let proposalTimeline;
			if (!group?.proposals) {
				proposalTimeline = getTimeline(
					[
						{
							createdAt,
							hash,
							index: postId,
							statusHistory,
							type
						}
					],
					isStatus
				);
			} else {
				proposalTimeline = getTimeline(group?.proposals, isStatus) || [];
			}
			const postDocRef = postsByTypeRef(network, ProposalType.REFERENDUM_V2 as ProposalType).doc(String(postId));

			const commentsQuerySnapshot = await postDocRef.collection('comments').where('isDeleted', '==', false).count().get();

			const postDoc = await postDocRef.get();
			if (postDoc?.exists) {
				const data = postDoc.data();
				if (data) {
					let subsquareTitle = '';
					let subsquareContent = '';
					if (data?.title === '' || data?.title === undefined) {
						const subsqaureRes = await getSubSquareContentAndTitle(ProposalType.REFERENDUM_V2, network, postId);
						subsquareTitle = subsqaureRes?.title || '';
						subsquareContent = subsqaureRes?.content || '';
					}
					const proposer_address = getProposerAddressFromFirestorePostData(data, network);
					const topic = data?.topic;
					const topic_id = data?.topic_id;

					const post_reactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
					const reactions = getReactions(post_reactionsQuerySnapshot);

					const sentiments: { [key: number]: number } = {};
					const commentsQueryDocs = await postDocRef.collection('comments').where('isDeleted', '==', false).get();

					commentsQueryDocs.docs.map((doc) => {
						if (doc.exists) {
							const data = doc.data();
							if (!isNaN(data?.sentiment)) {
								if (sentiments[data?.sentiment]) {
									sentiments[data?.sentiment] += 1;
								} else {
									sentiments[data?.sentiment] = 1;
								}
							}
						}
					});
					let maxSentiment = null;
					let maxSentimentCount = 0;
					let totalSentiments = 0;
					Object.entries(sentiments).map(([key, value]) => {
						totalSentiments += 1;
						if (maxSentimentCount < value) {
							maxSentimentCount = value;
							maxSentiment = key;
						}
					});

					const commentsCountQuerySnapshot = await postDocRef.collection('comments').where('isDeleted', '==', false).count().get();

					const commentsCount = commentsCountQuerySnapshot.data()?.count || 0;
					const post: IActivityFeedPost = {
						allowedCommentors: data?.allowedCommentors?.[0] || EAllowedCommentor.ALL,
						assetId: assetId || null,
						commentsCount: commentsCount || 0,
						content: data.content || subsquareContent || '',
						created_at: createdAt,
						curator,
						description: description || '',
						end,
						gov_type: data.gov_type,
						hash,
						higestSentiment: maxSentiment ? { percentage: Math.floor((maxSentimentCount * 100) / totalSentiments), sentiment: maxSentiment } : null,
						identity,
						isSpam: data?.isSpam || false,
						isSpamReportInvalid: data?.isSpamReportInvalid || false,
						method: subsquidPost?.preimage?.method,
						parent_bounty_index: parentBountyIndex || null,
						post_id: postId,
						post_reactions: reactions,
						proposalHashBlock: proposalHashBlock || null,
						proposer: proposer || subsquidPost?.preimage?.proposer || otherPostProposer || proposer_address || curator,
						requestedAmount: requestedAmt ? requestedAmt.toString() : undefined,
						spam_users_count:
							data?.isSpam && !data?.isSpamReportInvalid ? Number(process.env.REPORTS_THRESHOLD || 50) : data?.isSpamReportInvalid ? 0 : data?.spam_users_count || 0,
						status,
						status_history: statusHistory,
						summary: data?.summary || '',
						tags: data?.tags || [],
						tally,
						timeline: proposalTimeline,
						title: data?.title || subsquareTitle || getProposalTypeTitle(ProposalType.REFERENDUM_V2),
						topic: topic
							? topic
							: isTopicIdValid(topic_id)
								? {
										id: topic_id,
										name: getTopicNameFromTopicId(topic_id)
									}
								: topicFromType,
						track_no: !isNaN(trackNumber) ? trackNumber : null,
						type: type || ProposalType.REFERENDUM_V2,
						user_id: data?.user_id || 1
					};

					await getContentSummary(post, network, true);

					if (!post?.content?.length) {
						post.content = getDefaultContent({ proposalType: ProposalType.REFERENDUM_V2, proposer });
					}

					if (!process.env.AI_SUMMARY_API_KEY) {
						post.summary = post?.content;
					}
					post.content = '';

					return post;
				}
			}
			let subsquareTitle = '';
			let subsquareContent = '';
			const res = await getSubSquareContentAndTitle(ProposalType.REFERENDUM_V2, network, postId);
			subsquareTitle = res?.title;
			subsquareContent = res?.content;

			const post: IActivityFeedPost = {
				allowedCommentors: EAllowedCommentor.ALL,
				assetId: assetId || null,
				commentsCount: commentsQuerySnapshot.data()?.count || 0,
				content: subsquareContent || '',
				created_at: createdAt,
				curator,
				description: description || '',
				end: end,
				hash: hash || null,
				higestSentiment: null,
				identity,
				method: subsquidPost?.preimage?.method,
				parent_bounty_index: parentBountyIndex || null,
				post_id: postId,
				post_reactions: getDefaultReactionObj(),
				proposalHashBlock: proposalHashBlock || null,
				proposer: proposer || subsquidPost?.preimage?.proposer || otherPostProposer || curator || null,
				requestedAmount: requestedAmt ? requestedAmt.toString() : undefined,
				status: status,
				status_history: statusHistory,
				tally,
				timeline: proposalTimeline,
				title: subsquareTitle || getProposalTypeTitle(ProposalType.REFERENDUM_V2),
				topic: topicFromType,
				track_no: !isNaN(trackNumber) ? trackNumber : null,
				type: type,
				user_id: 1
			};
			await getContentSummary(post, network, true);

			if (!post?.content?.length) {
				post.content = getDefaultContent({ proposalType: ProposalType.REFERENDUM_V2, proposer });
			}

			if (!process.env.AI_SUMMARY_API_KEY) {
				post.summary = post?.content;
			}
			post.content = '';

			return post;
		});

		const resolvedPromises = await Promise.allSettled(allPromises);

		const results: IActivityFeedPost[] = [];
		resolvedPromises?.map((promise) => {
			if (promise.status == 'fulfilled') {
				results.push(promise.value);
			}
		});

		return res.status(200).json({ data: results });
	} catch (err) {
		console.error('Error fetching subscribed posts:', err);
		return res.status(500).json({ message: messages.API_FETCH_ERROR });
	}
}

export default withErrorHandling(handler);
