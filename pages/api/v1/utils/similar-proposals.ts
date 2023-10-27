// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { noTitle } from '~src/global/noTitle';
import { getTimeline } from '../posts/on-chain-post';
import { GET_PROPOSAL_ALLIANCE_ANNOUNCEMENT, GET_POSTS_LISTING_BY_TYPE_FOR_COLLECTIVE, GET_POSTS_LISTING_BY_TYPE, GET_POSTS_LISTING_FOR_POLYMESH } from '~src/queries';
import { network as AllNetworks } from '~src/global/networkConstants';
import { ProposalType, getFirestoreProposalType } from '~src/global/proposalType';
import { getSubSquareContentAndTitle } from '../posts/subsqaure/subsquare-content';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';

async function queryWithLargeInArray(collection: any, field: any, array: any) {
	const MAX_IN_SIZE = 30;
	const results: any[] = [];
	for (let i = 0; i < array.length; i += MAX_IN_SIZE) {
		const chunk = array.slice(i, i + MAX_IN_SIZE);
		const snapshot = await collection.where(field, 'in', chunk).get();
		snapshot.docs.forEach((doc: any) => {
			results.push(doc);
		});
	}
	return results;
}

export const getResults = async (tags: any, subsquidData: any, onChainCollRef: any, results: any, seenProposalIds: any) => {
	const filteredPostIds = subsquidData.map((proposal: any) => proposal.index);
	let postsSnapshotArr = [];
	if (tags && tags.length > 0) {
		postsSnapshotArr = await onChainCollRef.where('tags', 'array-contains-any', tags).orderBy('created_at', 'desc').get();
		postsSnapshotArr = postsSnapshotArr.docs.map((doc: any) => {
			return doc;
		});
	} else {
		postsSnapshotArr = await queryWithLargeInArray(onChainCollRef, 'id', filteredPostIds);
	}
	if (postsSnapshotArr && postsSnapshotArr.length > 0) {
		results.push(...(await combinedata(postsSnapshotArr, subsquidData, seenProposalIds)));
		if (results.length >= 3) {
			results = results.slice(0, 3);
		}
	}
	return results;
};

export const getNetworkBasedSubsquidQuery = (network: string, proposalType: any) => {
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
	return query;
};

const buildFirestoreData = async (docData: any, strProposalType: string, network: string) => {
	let subsquareTitle = '';
	let subsquareDescription = '';
	if (docData?.title === '' || docData?.title === undefined) {
		const res = await getSubSquareContentAndTitle(strProposalType, network, docData.id);
		subsquareTitle = res?.title;
		subsquareDescription = res?.content;
	}
	const created_at = docData.created_at;
	const { topic, topic_id } = docData;
	return {
		created_at: created_at?.toDate ? created_at?.toDate() : created_at,
		description: docData?.content || subsquareDescription || null,
		gov_type: docData?.gov_type,
		isSpam: docData?.isSpam || false,
		isSpamReportInvalid: docData?.isSpamReportInvalid || false,
		spam_users_count:
			docData?.isSpam && !docData?.isSpamReportInvalid ? Number(process.env.REPORTS_THRESHOLD || 50) : docData?.isSpamReportInvalid ? 0 : docData?.spam_users_count || 0,
		tags: docData?.tags || [],
		title: docData?.title || subsquareTitle || noTitle,
		topic: topic
			? topic
			: isTopicIdValid(topic_id)
			? {
					id: topic_id,
					name: getTopicNameFromTopicId(topic_id)
			  }
			: getTopicFromType(getFirestoreProposalType(strProposalType) as ProposalType),
		user_id: docData?.user_id || 1,
		username: docData?.username
	};
};

const combinedata = async (postsSnapshotArr: any, subsquidData: any, seenProposalIds: any) => {
	let result = postsSnapshotArr.map(async (firestorePostData: any) => {
		const firestorePost = firestorePostData.data();
		const subsquidPost = subsquidData.find((post: any) => post.index == firestorePost.id && !seenProposalIds.has(post.index));
		if (!subsquidPost) return;
		let timeline = [];
		const isStatus = {
			swap: false
		};

		if (!subsquidPost?.group?.proposals) {
			timeline = getTimeline(
				[
					{
						createdAt: subsquidPost.createdAt,
						hash: subsquidPost.hash,
						index: subsquidPost.index,
						statusHistory: subsquidPost.statusHistory,
						type: subsquidPost.type
					}
				],
				isStatus
			);
		} else {
			timeline = getTimeline(subsquidPost?.group?.proposals, isStatus) || [];
		}

		let status = subsquidPost.status;
		if (status === 'DecisionDepositPlaced') {
			const statuses = (subsquidPost?.statusHistory || []) as { status: string }[];
			statuses.forEach((obj) => {
				if (obj.status === 'Deciding') {
					status = 'Deciding';
				}
			});
		}
		const data = {
			...(await buildFirestoreData(firestorePost, subsquidPost.type, subsquidPost.network)),
			created_at: subsquidPost.createdAt,
			curator: subsquidPost.curator,
			end: subsquidPost.end,
			hash: subsquidPost.hash,
			post_id: subsquidPost.index,
			proposer: subsquidPost.proposer,
			status: status,
			status_history: subsquidPost.statusHistory,
			tally: subsquidPost.tally,
			timeline,
			trackNumber: subsquidPost.trackNumber,
			type: subsquidPost.type
		};
		seenProposalIds.add(subsquidPost.index);
		return data;
	});
	result = await Promise.allSettled(result);
	result = result.reduce((prev: any[], post: { status: string; value: any }) => {
		if (post && post.status === 'fulfilled' && post.value) {
			prev.push(post.value);
		}
		return prev;
	}, []);
	return result;
};
