// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import messages from '~src/auth/utils/messages';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import { getStatusesFromCustomStatus, getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { GET_ALL_ACTIVE_PROPOSAL_FOR_EXPLORE_FEED, GET_TOTAL_VOTE_COUNT_ON_PROPOSAL, VOTED_PROPOSAL_BY_PROPOSAL_INDEX_AND_VOTERS } from '~src/queries';
import { convertAnyHexToASCII } from '~src/util/decodingOnChainInfo';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getReactions } from '../posts/on-chain-post';
import { getSubSquareContentAndTitle } from '../posts/subsqaure/subsquare-content';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import { getProposerAddressFromFirestorePostData } from '../listing/on-chain-posts';
import { getTimeline } from '~src/util/getTimeline';
import getEncodedAddress from '~src/util/getEncodedAddress';
import console_pretty from '~src/api-utils/console_pretty';

const updateNonVotedProposals = (proposals: any[]) => {
	//sort by votes Count
	const proposalsByVotesCountSorted = proposals.sort((a, b) => b?.proposal.votesCount - a?.votesCount);

	//sort by comments count
	const proposalsWithoutComments: any[] = [];
	const proposalsWithComments: any[] = [];
	proposalsByVotesCountSorted.map((proposal) => {
		if (proposal?.comments_count) {
			proposalsWithComments.push(proposal);
		} else {
			proposalsWithoutComments.push(proposal);
		}
	});

	const proposalsByCommentSorted = proposalsWithComments.sort((a, b) => b?.proposal.comments_count - a?.comments_count);

	const combineProposals = [...proposalsByCommentSorted, ...proposalsWithoutComments];
	return combineProposals;
};

const getIsSwapStatus = (statusHistory: string[]) => {
	const index = statusHistory.findIndex((v: any) => v.status === 'DecisionDepositPlaced');
	if (index >= 0) {
		const decidingIndex = statusHistory.findIndex((v: any) => v.status === 'Deciding');
		if (decidingIndex >= 0) {
			const obj = statusHistory[index];
			statusHistory.splice(index, 1);
			statusHistory.splice(decidingIndex, 0, obj);
			return true;
		}
	}
	return false;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });
	const { userAddresses } = req.body;

	if (userAddresses?.length && userAddresses?.filter((addr: string) => !getEncodedAddress(addr, network))?.length) {
		if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_PARAMS });
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
		if (!subsquidData?.length) res.status(400).json({ message: messages.NO_ACTIVE_PROPOSAL_FOUND });
		const activeProposalIndexes = subsquidData.map((item: any) => item?.index);

		let votedProposalsIndexes = [];
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
			console_pretty(totalVotes);

			if (!subsquidPost?.preimage) {
				subsquidPost.preimage = {
					description: subsquidPost?.proposalArguments?.description,
					method: subsquidPost?.proposalArguments?.method,
					proposedCall: { args: subsquidPost?.proposalArguments?.args, method: subsquidPost?.proposalArguments?.method, section: subsquidPost?.proposalArguments?.section },
					section: subsquidPost?.proposalArguments?.section
				};
				subsquidPost.proposalArguments = null;
			}

			let requested = BigInt(0);
			let assetId: null | string = null;
			let args = subsquidPost?.preimage?.proposedCall?.args;

			if (args) {
				if (
					args?.assetKind?.assetId?.value?.interior ||
					args?.assetKind?.assetId?.interior?.value ||
					args?.calls?.map((item: any) => item?.value?.assetKind?.assetId?.interior?.value || item?.value?.assetKind?.assetId?.value?.interior)?.length
				) {
					const call =
						args?.assetKind?.assetId?.value?.interior?.value ||
						args?.assetKind?.assetId?.interior?.value ||
						args?.calls?.map((item: any) => item?.value?.assetKind?.assetId?.interior?.value || item?.value?.assetKind?.assetId?.value?.interior)?.[0]?.value;
					assetId = (call?.length ? call?.find((item: { value: number; __kind: string }) => item?.__kind == 'GeneralIndex')?.value : null) || null;
				}

				args = convertAnyHexToASCII(args, network);
				if (args?.amount) {
					requested = args.amount;
				} else {
					const calls = args.calls;

					if (calls && Array.isArray(calls) && calls.length > 0) {
						calls.forEach((call) => {
							if (call && call.amount) {
								requested += BigInt(call.amount);
							}
							if (call && call?.value?.amount) {
								requested += BigInt(call?.value?.amount);
							}
						});
					}
				}
			}

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
			const post_reactions = {
				'👍': reactions['👍']?.count || 0,
				'👎': reactions['👎']?.count || 0
			};

			const commentsQuerySnapshot = await postDocRef.collection('comments').where('isDeleted', '==', false).count().get();

			const postDoc = await postDocRef.get();
			if (postDoc && postDoc.exists) {
				const data = postDoc.data();
				if (data) {
					let subsquareTitle = '';
					let subsquareContent = '';
					if (data?.title === '' || data?.title === undefined) {
						const res = await getSubSquareContentAndTitle(ProposalType.REFERENDUM_V2, network, postId);
						subsquareTitle = res?.title;
						subsquareContent = res?.content;
					}
					const proposer_address = getProposerAddressFromFirestorePostData(data, network);
					const topic = data?.topic;
					const topic_id = data?.topic_id;

					const post_reactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
					const reactions = getReactions(post_reactionsQuerySnapshot);
					const post_reactions = {
						'👍': reactions['👍']?.count || 0,
						'👎': reactions['👎']?.count || 0
					};

					const commentsQuerySnapshot = await postDocRef.collection('comments').where('isDeleted', '==', false).count().get();

					return {
						assetId: assetId || null,
						comments_count: commentsQuerySnapshot.data()?.count || 0,
						content: data.content || subsquareContent || '',
						created_at: createdAt,
						curator,
						description: description || '',
						end,
						gov_type: data.gov_type,
						hash,
						identity,
						isSpam: data?.isSpam || false,
						isSpamReportInvalid: data?.isSpamReportInvalid || false,
						method: subsquidPost?.preimage?.method,
						parent_bounty_index: parentBountyIndex || null,
						post_id: postId,
						post_reactions,
						proposalHashBlock: proposalHashBlock || null,
						proposer: proposer || subsquidPost?.preimage?.proposer || otherPostProposer || proposer_address || curator,
						requestedAmount: requested ? requested.toString() : undefined,
						spam_users_count:
							data?.isSpam && !data?.isSpamReportInvalid ? Number(process.env.REPORTS_THRESHOLD || 50) : data?.isSpamReportInvalid ? 0 : data?.spam_users_count || 0,
						status,
						status_history: statusHistory,
						tags: data?.tags || [],
						tally,
						timeline: proposalTimeline,
						title: data?.title || subsquareTitle || null,
						topic: topic
							? topic
							: isTopicIdValid(topic_id)
							? {
									id: topic_id,
									name: getTopicNameFromTopicId(topic_id)
							  }
							: topicFromType,
						totalVotes: totalVotes || 0,
						track_no: !isNaN(trackNumber) ? trackNumber : null,
						type: type || ProposalType.REFERENDUM_V2,
						user_id: data?.user_id || 1
					};
				}
			}
			let subsquareTitle = '';
			let subsquareContent = '';
			const res = await getSubSquareContentAndTitle(ProposalType.REFERENDUM_V2, network, postId);
			subsquareTitle = res?.title;
			subsquareContent = res?.content;

			return {
				assetId: assetId || null,
				comments_count: commentsQuerySnapshot.data()?.count || 0,
				content: subsquareContent || '',
				created_at: createdAt,
				curator,
				description: description || '',
				end: end,
				hash: hash || null,
				identity,
				method: subsquidPost?.preimage?.method,
				parent_bounty_index: parentBountyIndex || null,
				post_id: postId,
				post_reactions,
				proposalHashBlock: proposalHashBlock || null,
				proposer: proposer || subsquidPost?.preimage?.proposer || otherPostProposer || curator || null,
				requestedAmount: requested ? requested.toString() : undefined,
				status: status,
				status_history: statusHistory,
				tally,
				timeline: proposalTimeline,
				title: subsquareTitle || 'Untitled',
				topic: topicFromType,
				totalVotes: totalVotes || 0,
				track_no: !isNaN(trackNumber) ? trackNumber : null,
				type: type,
				user_id: 1
			};
		});

		const resolvedPromises = await Promise.allSettled(allPromises);

		const results: any[] = [];
		resolvedPromises?.map((promise) => {
			if (promise.status == 'fulfilled') {
				results.push(promise.value);
			}
		});
		const votedProposals = votedProposalsIndexes?.length ? results.filter((data) => votedProposalsIndexes.includes(data?.post_id)) : [];
		const nonVotedProposals = votedProposals?.length ? results.filter((data) => !votedProposalsIndexes.includes(data?.post_id)) : results;
		const updatedNonVotedProposals = updateNonVotedProposals(nonVotedProposals);

		const combineProposals = [...updatedNonVotedProposals, ...votedProposals];
		return res.status(200).json({ data: combineProposals });
	} catch (err) {
		console.error('Error fetching subscribed posts:', err);
		return res.status(500).json({ message: messages.API_FETCH_ERROR });
	}
}

export default withErrorHandling(handler);
