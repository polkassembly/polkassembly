// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import messages from '~src/auth/utils/messages';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import { getProposalTypeTitle, getStatusesFromCustomStatus, getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { GET_ALL_ACTIVE_PROPOSAL_FOR_EXPLORE_FEED, GET_TOTAL_VOTE_COUNT_ON_PROPOSAL, VOTED_PROPOSAL_BY_PROPOSAL_INDEX_AND_VOTERS } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getReactions, IPIPsVoting, IReactions } from '../posts/on-chain-post';
import { getSubSquareContentAndTitle } from '../posts/subsqaure/subsquare-content';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import { getTimeline } from '~src/util/getTimeline';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { getIsSwapStatus } from '~src/util/getIsSwapStatus';
import { getContentSummary } from '~src/util/getPostContentAiSummary';
import { getProposerAddressFromFirestorePostData } from '~src/util/getProposerAddressFromFirestorePostData';
import { EAllowedCommentor, EGovType, IBeneficiary, IPostHistory } from '~src/types';
import getBeneficiaryDetails from '~src/util/getBeneficiaryDetails';
import { getDefaultContent } from '~src/util/getDefaultContent';

export interface IActivityFeedPost {
	allowedCommentors: EAllowedCommentor;
	assetId?: string | null;
	post_reactions?: IReactions;
	commentsCount: number;
	content?: string;
	end?: number;
	delay?: number;
	vote_threshold?: any;
	created_at?: string;
	tippers?: any[];
	topic: {
		id: number;
		name: string;
	};
	decision?: string;
	last_edited_at?: string | Date;
	gov_type?: EGovType;
	proposalHashBlock?: string | null;
	tags?: string[] | [];
	history?: IPostHistory[];
	pips_voters?: IPIPsVoting[];
	title?: string;
	beneficiaries?: IBeneficiary[];
	[key: string]: any;
	preimageHash?: string;
	summary?: string;
}

const updateNonVotedProposals = (proposals: IActivityFeedPost[]) => {
	//sort by votes Count
	const proposalsByVotesCountSorted = proposals.sort((a, b) => (b?.votesCount || 0) - (a?.votesCount || 0));

	//sort by comments count

	const { proposalsWithComments = [], proposalsWithoutComments = [] } = proposalsByVotesCountSorted.reduce<{
		proposalsWithoutComments: IActivityFeedPost[];
		proposalsWithComments: IActivityFeedPost[];
	}>(
		(acc, proposal) => {
			if (proposal?.commentsCount) {
				acc.proposalsWithComments.push(proposal);
			} else {
				acc.proposalsWithoutComments.push(proposal);
			}
			return acc;
		},
		{ proposalsWithComments: [], proposalsWithoutComments: [] }
	);

	const proposalsByCommentSorted = proposalsWithComments.sort((a, b) => b?.commentsCount - a?.commentsCount);

	const combineProposals = [...proposalsByCommentSorted, ...proposalsWithoutComments];
	return combineProposals;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });
	const { userAddresses } = req.body;

	if (userAddresses?.length && userAddresses?.filter((addr: string) => !getEncodedAddress(addr, network))?.length) {
		return res.status(400).json({ message: messages.INVALID_PARAMS });
	}

	try {
		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_ALL_ACTIVE_PROPOSAL_FOR_EXPLORE_FEED,
			variables: {
				status_in: getStatusesFromCustomStatus(CustomStatus.Active),
				type_eq: getSubsquidProposalType(ProposalType.OPEN_GOV)
			}
		});
		const subsquidData = subsquidRes?.['data']?.proposals;
		if (!subsquidData?.length) return res.status(400).json({ message: messages.NO_ACTIVE_PROPOSAL_FOUND });
		const activeProposalIndexes = subsquidData.map((item: any) => item?.index);

		let votedProposalsIndexes: number[] = [];
		if (userAddresses?.length) {
			const encodedAddresses = userAddresses.map((addr: string) => getEncodedAddress(addr, network) || addr);
			const votedProposalsSubsquidRes = await fetchSubsquid({
				network,
				query: VOTED_PROPOSAL_BY_PROPOSAL_INDEX_AND_VOTERS,
				variables: {
					indexes_in: activeProposalIndexes,
					type_eq: getSubsquidProposalType(ProposalType.OPEN_GOV),
					voter_in: encodedAddresses
				}
			});

			const votedProposalsSubsquidData = votedProposalsSubsquidRes?.['data']?.flattenedConvictionVotes || [];
			if (votedProposalsSubsquidData?.length) {
				votedProposalsIndexes = votedProposalsSubsquidData?.map((data: any) => data?.proposalIndex) || [];
			}
		}

		const allPromises = subsquidData.map(async (subsquidPost: any) => {
			const { createdAt, end, hash, index: postId, type, proposer, description, group, curator, parentBountyIndex, statusHistory, trackNumber, proposalHashBlock } = subsquidPost;

			const totalVotesSubsquidRes = await fetchSubsquid({
				network,
				query: GET_TOTAL_VOTE_COUNT_ON_PROPOSAL,
				variables: {
					index_eq: postId,
					type_eq: getSubsquidProposalType(ProposalType.OPEN_GOV)
				}
			});

			const totalVotes = totalVotesSubsquidRes?.['data']?.flattenedConvictionVotesConnection?.totalCount || 0;

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
			const post_reactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
			const reactions = getReactions(post_reactionsQuerySnapshot);

			const commentsQuerySnapshot = await postDocRef.collection('comments').where('isDeleted', '==', false).count().get();
			const post: IActivityFeedPost = {
				allowedCommentors: EAllowedCommentor.ALL,
				assetId: assetId || null,
				commentsCount: commentsQuerySnapshot.data()?.count || 0,
				content: '',
				created_at: createdAt,
				curator,
				description: description || '',
				end: end,
				hash: hash || null,
				highestSentiment: null,
				identity,
				method: subsquidPost?.preimage?.method,
				parent_bounty_index: parentBountyIndex || null,
				post_id: postId,
				post_reactions: reactions,
				proposalHashBlock: proposalHashBlock || null,
				proposer: proposer || subsquidPost?.preimage?.proposer || otherPostProposer || curator || null,
				requestedAmount: requestedAmt ? requestedAmt.toString() : undefined,
				status: status,
				status_history: statusHistory,
				summary: '',
				tally,
				timeline: proposalTimeline,
				title: getProposalTypeTitle(ProposalType.REFERENDUM_V2),
				topic: topicFromType,
				totalVotes: totalVotes || 0,
				track_no: !isNaN(trackNumber) ? trackNumber : null,
				type: type
			};

			const postDoc = await postDocRef.get();
			if (postDoc && postDoc.exists) {
				const data = postDoc.data();
				if (data) {
					let subsquareTitle = '';
					let subsquareContent = '';
					if (!data?.title?.length || !data?.content?.length) {
						const subsqaureRes = await getSubSquareContentAndTitle(ProposalType.REFERENDUM_V2, network, postId);
						subsquareTitle = subsqaureRes?.title || post?.title;
						subsquareContent = subsqaureRes?.content || post?.content;
					}
					const proposer_address = getProposerAddressFromFirestorePostData(data, network);
					const topic = data?.topic;
					const topic_id = data?.topic_id;

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

					post.allowedCommentors = data?.allowedCommentors?.[0] || EAllowedCommentor.ALL;
					post.commentsCount = commentsCount || 0;
					post.content = data.content || subsquareContent || '';
					post.gov_type = data.gov_type;
					post.highestSentiment = maxSentiment ? { percentage: Math.floor((maxSentimentCount * 100) / totalSentiments), sentiment: maxSentiment } : null;
					post.isSpam = data?.isSpam || false;
					post.isSpamReportInvalid = data?.isSpamReportInvalid || false;
					post.post_reactions = reactions;
					post.spam_users_count =
						data?.isSpam && !data?.isSpamReportInvalid ? Number(process.env.REPORTS_THRESHOLD || 50) : data?.isSpamReportInvalid ? 0 : data?.spam_users_count || 0;
					post.proposer = proposer || subsquidPost?.preimage?.proposer || otherPostProposer || proposer_address || curator;
					post.summary = data?.summary || '';
					post.tags = data?.tags || [];
					post.title = data?.title || subsquareTitle || getProposalTypeTitle(ProposalType.REFERENDUM_V2);
					post.topic = topic
						? topic
						: isTopicIdValid(topic_id)
						? {
								id: topic_id,
								name: getTopicNameFromTopicId(topic_id)
						  }
						: topicFromType;
					post.totalVotes = totalVotes || 0;
					post.user_id = data?.user_id || 0;
				}
			}

			if (!post?.content?.length) {
				post.content = getDefaultContent({ proposalType: ProposalType.REFERENDUM_V2, proposer });
			}

			await getContentSummary(post, network, true);

			if (!process.env.AI_SUMMARY_API_KEY) {
				post.summary = post?.content;
			}
			if (!post?.title?.length) {
				post.title = 'Untitled';
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
		const votedProposals = votedProposalsIndexes?.length ? results.filter((data) => votedProposalsIndexes.includes(Number(data?.post_id))) : [];
		const nonVotedProposals = votedProposals?.length ? results.filter((data) => !votedProposalsIndexes.includes(Number(data?.post_id))) : results;
		const updatedNonVotedProposals = updateNonVotedProposals(nonVotedProposals);

		const combineProposals = [
			...updatedNonVotedProposals,
			...(votedProposals || []).map((proposal) => {
				return { ...proposal, isVoted: true };
			})
		];
		return res.status(200).json({ data: combineProposals });
	} catch (err) {
		console.error('Error fetching subscribed posts:', err);
		return res.status(500).json({ message: messages.API_FETCH_ERROR });
	}
}

export default withErrorHandling(handler);
