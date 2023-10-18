// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { MessageType } from '~src/auth/types';
import { ProposalType, getSubsquidProposalType } from '~src/global/proposalType';
import { GET_PROPOSAL_ALLIANCE_ANNOUNCEMENT, GET_POSTS_LISTING_BY_TYPE_FOR_COLLECTIVE, GET_POSTS_LISTING_BY_TYPE, GET_POSTS_LISTING_FOR_POLYMESH } from '~src/queries';
import { network as AllNetworks } from '~src/global/networkConstants';

import fetchSubsquid from '~src/util/fetchSubsquid';
import messages from '~src/util/messages';
import { getSubSquareContentAndTitle } from '../posts/subsqaure/subsquare-content';
import { getProposerAddressFromFirestorePostData } from './on-chain-posts';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import { IProfileVoteHistoryRespose } from '../votesHistory/getVotesByVoter';
import { noTitle } from '~src/global/noTitle';

const handler: NextApiHandler<any | MessageType> = async (req, res) => {
	const { postId, proposalType, tags, topicId, trackNumber } = req.body;
	// const { tags = ['xcm'], proposalType = 'referendums_v2', trackNumber = 34, topicId = 1 } = req.body;
	const network = String(req.headers['x-network']);
	let query;
	if (network === AllNetworks.COLLECTIVES || network === AllNetworks.WESTENDCOLLECTIVES) {
		if (proposalType === ProposalType.ANNOUNCEMENT) {
			query = GET_PROPOSAL_ALLIANCE_ANNOUNCEMENT;
		} else {
			query = GET_POSTS_LISTING_BY_TYPE_FOR_COLLECTIVE;
		}
	} else {
		query = GET_POSTS_LISTING_BY_TYPE;
	}
	if (network === AllNetworks.POLYMESH) {
		query = GET_POSTS_LISTING_FOR_POLYMESH;
	}

	const strProposalType = String(proposalType);
	if (!isProposalTypeValid(strProposalType)) {
		return res.status(400).json({ message: `The proposal type of the name "${proposalType}" does not exist.` });
	}
	const postsVariables: any = {
		type_eq: getSubsquidProposalType(proposalType as any)
	};
	const subsquidRes = await fetchSubsquid({
		network,
		query,
		variables: postsVariables
	});
	let posts: any;
	const subsquidData = subsquidRes.data.proposals;
	const activePostIds = subsquidData.map((proposal: any) => proposal.index);
	let onChainCollRef;
	if (tags && activePostIds && topicId) {
		onChainCollRef = postsByTypeRef(network, strProposalType as ProposalType);
		let postsSnapshotArr;
		if (tags.lenght > 0) {
			postsSnapshotArr = await onChainCollRef.where('tags', 'array-contains-any', tags).get();
		} else {
			postsSnapshotArr = await onChainCollRef.get();
		}
		const postsPromise = postsSnapshotArr.docs.map(async (doc: any) => {
			if (doc && doc.exists) {
				const docData = doc.data();
				if (docData) {
					let subsquareTitle = '';
					if (docData?.title === '' || docData?.title === undefined) {
						const res = await getSubSquareContentAndTitle(strProposalType, network, docData.id);
						subsquareTitle = res?.title;
					}
					const created_at = docData.created_at;
					const { topic, topic_id } = docData;

					return {
						created_at: created_at?.toDate ? created_at?.toDate() : created_at,
						gov_type: docData?.gov_type,
						isSpam: docData?.isSpam || false,
						isSpamReportInvalid: docData?.isSpamReportInvalid || false,
						post_id: docData.id,
						proposer: getProposerAddressFromFirestorePostData(docData, network),
						spam_users_count:
							docData?.isSpam && !docData?.isSpamReportInvalid ? Number(process.env.REPORTS_THRESHOLD || 50) : docData?.isSpamReportInvalid ? 0 : docData?.spam_users_count || 0,
						tags: docData?.tags || [],
						title: docData?.title || subsquareTitle || null,
						topic: topic
							? topic
							: isTopicIdValid(topic_id)
							? {
									id: topic_id,
									name: getTopicNameFromTopicId(topic_id)
							  }
							: getTopicFromType(strProposalType as ProposalType),
						user_id: docData?.user_id || 1,
						username: docData?.username
					};
				}
			}
		});

		posts = await Promise.all(postsPromise);
	}

	console.log(posts);

	let result = [];
	if (subsquidRes['data'].proposal && posts) {
		result = subsquidRes['data'].proposals
			.map((proposal: any) => posts.filter((post: any) => proposal.index === post?.post_id))
			.flat()
			.map((match: any) => {
				console.log(`ids from active tags -> ${match}`);
				return match;
			});
	}

	if (result.length < 3) {
		result = subsquidRes['data'].proposals
			.filter((proposal: any) => proposal.trackNumber === trackNumber && proposal.trackNumber !== null)
			.map((proposal: any) => {
				console.log(`ids from active tracks -> ${proposal.index}`);
				return proposal.index;
			});
	}

	// for categories (start)
	let postTopics: any;
	if (result.length > 3) {
		onChainCollRef = postsByTypeRef(network, strProposalType as ProposalType);
		const postSnapshottopic = await onChainCollRef.where('topic.id', '==', topicId).get();
		const postsTopicPromise = postSnapshottopic.docs.map(async (doc: any) => {
			if (doc && doc.exists) {
				const docData = doc.data();
				if (docData) {
					let subsquareTitle = '';
					if (docData?.title === '' || docData?.title === undefined) {
						const res = await getSubSquareContentAndTitle(strProposalType, network, docData.id);
						subsquareTitle = res?.title;
					}
					const created_at = docData.created_at;
					const { topic, topic_id } = docData;

					return {
						created_at: created_at?.toDate ? created_at?.toDate() : created_at,
						gov_type: docData?.gov_type,
						isSpam: docData?.isSpam || false,
						isSpamReportInvalid: docData?.isSpamReportInvalid || false,
						post_id: docData.id,
						proposer: getProposerAddressFromFirestorePostData(docData, network),
						spam_users_count:
							docData?.isSpam && !docData?.isSpamReportInvalid ? Number(process.env.REPORTS_THRESHOLD || 50) : docData?.isSpamReportInvalid ? 0 : docData?.spam_users_count || 0,
						tags: docData?.tags || [],
						title: docData?.title || subsquareTitle || null,
						topic: topic
							? topic
							: isTopicIdValid(topic_id)
							? {
									id: topic_id,
									name: getTopicNameFromTopicId(topic_id)
							  }
							: getTopicFromType(strProposalType as ProposalType),
						user_id: docData?.user_id || 1,
						username: docData?.username
					};
				}
			}
		});
		postTopics = await Promise.all(postsTopicPromise);
		if (subsquidRes['data'].proposal && postTopics) {
			result = subsquidRes['data'].proposals
				.map((proposal: any) => postTopics.filter((postTopic: any) => proposal.index === postTopic?.post_id))
				.flat()
				.map((match: any) => {
					console.log(`ids from active subtracks -> ${match}`);
					return match;
				});
		}
	}

	if (result.length < 3) {
		result = subsquidRes['data'].proposals.map((proposal: any) => {
			console.log(`ids from non matches -> ${proposal.index}`);
			return proposal.index;
		});
	}
	result = result.filter((number: any) => number !== postId);
	result = result.slice(0, 3);
	// console.log(result);
	const postDataPromise = result.map(async (id: any) => {
		console.log(id);
		const postRef = postsByTypeRef(network, proposalType).doc(String(id));
		const postData = (await postRef.get()).data();
		const subsquidDatas = subsquidData.map((post: any) => {
			if (post.index == id) {
				return {
					...postData,
					created_at: post?.createdAt,
					curator: post?.curator,
					description: postData?.description || '',
					end: post?.end,
					hash: post?.hash,
					post_id: id,
					proposer: post?.proposer,
					status: post?.status,
					status_history: post?.statusHistory,
					tags: postData?.tags || [],
					tally: post?.tally,
					title: postData?.title || noTitle,
					topic: postData?.topic || postData?.topicId,
					trackNumber: post?.trackNumber,
					type: postData?.type || getSubsquidProposalType(proposalType as any),
					username: postData?.username
				};
			}
			return null;
		});
		return subsquidDatas;
	});
	const resultArray = await Promise.allSettled(postDataPromise);

	let data = resultArray.reduce((prev, post) => {
		if (post && post.status === 'fulfilled') {
			prev.push(post.value);
		}
		return prev;
	}, [] as IProfileVoteHistoryRespose[]);
	data = data.flat();
	const filteredArray = data.filter((item) => item !== null);
	if (!subsquidRes) {
		return res.status(400).json({ message: 'error' || messages.API_FETCH_ERROR });
	} else {
		return res.status(200).json(filteredArray || []);
	}
};

export default withErrorHandling(handler);
