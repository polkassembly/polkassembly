// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from 'dayjs-init';
import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { deleteKeys, redisDel } from '~src/auth/redis';
import { MessageType } from '~src/auth/types';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';
import getDefaultUserAddressFromId from '~src/auth/utils/getDefaultUserAddressFromId';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { getFirestoreProposalType, getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import {
	GET_ALLIANCE_ANNOUNCEMENT_BY_CID_AND_TYPE,
	GET_ALLIANCE_POST_BY_INDEX_AND_PROPOSALTYPE,
	GET_COLLECTIVE_FELLOWSHIP_POST_BY_INDEX_AND_PROPOSALTYPE,
	GET_POLYMESH_PROPOSAL_BY_INDEX_AND_TYPE,
	GET_PROPOSAL_BY_INDEX_AND_TYPE_V2,
	GET_PROPOSAL_BY_INDEX_FOR_ADVISORY_COMMITTEE
} from '~src/queries';
import { firestore_db } from '~src/services/firebaseInit';
import { EActivityAction, EAllowedCommentor, IPostHistory, IPostTag, Post } from '~src/types';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { fetchContentSummary } from '~src/util/getPostContentAiSummary';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { getTopicFromType, getTopicNameFromTopicId } from '~src/util/getTopicFromType';
import { checkIsProposer } from './utils/checkIsProposer';
import { getUserWithAddress } from '../data/userProfileWithUsername';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import createUserActivity from '../../utils/create-activity';
import { getSubscanData } from '../../subscanApi';
import { isSubscanSupport } from '~src/util/subscanCheck';

export interface IEditPostResponse {
	content: string;
	proposer: string;
	summary: string;
	title: string;
	topic: {
		id: number;
		name: string;
	};
	last_edited_at: Date;
	allowedCommentors: EAllowedCommentor[];
}

const handler: NextApiHandler<IEditPostResponse | MessageType> = async (req, res) => {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { content, postId, proposalType, title, timeline, tags, topicId, allowedCommentors } = req.body;

	if (allowedCommentors && !Array.isArray(allowedCommentors)) {
		return res.status(400).json({ message: 'Invalid allowedCommentors parameter' });
	}

	if ((allowedCommentors || []).length > 0) {
		const invalidCommentors = allowedCommentors.filter((commentor: unknown) => !Object.values(EAllowedCommentor).includes(String(commentor) as EAllowedCommentor));
		if (invalidCommentors.length > 0) return res.status(400).json({ message: 'Invalid values in allowedCommentors array parameter' });
	}

	if (proposalType === ProposalType.ANNOUNCEMENT) {
		if (!postId || !title || !content || !proposalType || !topicId) return res.status(400).json({ message: 'Missing parameters in request body' });
	} else {
		if (isNaN(postId) || !title || !content || !proposalType || !topicId) return res.status(400).json({ message: 'Missing parameters in request body' });
	}

	if (tags && !Array.isArray(tags)) return res.status(400).json({ message: 'Invalid tags parameter' });

	const strProposalType = String(proposalType);
	if (!isOffChainProposalTypeValid(strProposalType) && !isProposalTypeValid(strProposalType))
		return res.status(400).json({ message: `The proposal type of the name "${proposalType}" does not exist.` });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postDocRef = postsByTypeRef(network, proposalType).doc(String(postId));

	let created_at = new Date();
	let post_link: any = null;
	let proposer_address = '';

	const userAddresses = await getAddressesFromUserId(user.id, true);

	const postDoc = await postDocRef.get();
	const post = postDoc.data();
	let isAuthor = false;
	let proposerAddress = post?.proposer_address || '';

	let allowedCommentorsArr = allowedCommentors || [EAllowedCommentor.ALL];

	if (postDoc.exists && !isNaN(post?.user_id)) {
		allowedCommentorsArr = allowedCommentors || post?.allowedCommentors || [EAllowedCommentor.ALL];

		if (![ProposalType.DISCUSSIONS, ProposalType.GRANTS].includes(proposalType)) {
			const subsquidProposalType = getSubsquidProposalType(proposalType as any);
			let postQuery =
				proposalType === ProposalType.ALLIANCE_MOTION
					? GET_ALLIANCE_POST_BY_INDEX_AND_PROPOSALTYPE
					: proposalType === ProposalType.ANNOUNCEMENT
					? GET_ALLIANCE_ANNOUNCEMENT_BY_CID_AND_TYPE
					: proposalType === ProposalType.FELLOWSHIP_REFERENDUMS && ['collectives', 'westend-collectives'].includes(network)
					? GET_COLLECTIVE_FELLOWSHIP_POST_BY_INDEX_AND_PROPOSALTYPE
					: proposalType === ProposalType.ADVISORY_COMMITTEE && network === 'zeitgeist'
					? GET_PROPOSAL_BY_INDEX_FOR_ADVISORY_COMMITTEE
					: GET_PROPOSAL_BY_INDEX_AND_TYPE_V2;

			if (network === 'polymesh') {
				postQuery = GET_POLYMESH_PROPOSAL_BY_INDEX_AND_TYPE;
			}
			let variables: any = {
				index_eq: Number(postId),
				type_eq: subsquidProposalType
			};

			if ([ProposalType.TIPS, ProposalType.ADVISORY_COMMITTEE].includes(proposalType)) {
				variables = {
					hash_eq: String(postId),
					type_eq: subsquidProposalType
				};
			}

			const postRes = await fetchSubsquid({
				network,
				query: postQuery,
				variables
			});

			let post = postRes.data?.proposals?.[0] || postRes.data?.announcements?.[0];
			if (!post.preimage?.proposer && !post?.proposer && isSubscanSupport(network)) {
				post = await getSubscanData('/api/scan/referenda/referendum', network, { referendum_index: Number(postId) });
			}
			if (!post) return res.status(500).json({ message: 'Post not found on our on-chain database. Something went wrong.' });
			//temp
			const firestorePost = postDoc.data();

			if (!post?.proposer && !post?.preimage?.proposer && !post?.data?.account && !post?.data?.account?.address && !firestorePost?.proposer_address)
				return res.status(500).json({ message: 'Post proposer not found on our on-chain database. Something went wrong.' });

			proposerAddress = post?.proposer || post?.preimage?.proposer || post?.data?.account?.address || firestorePost?.proposer_address || '';

			const substrateAddress = getSubstrateAddress(proposerAddress);
			if (!substrateAddress) return res.status(500).json({ message: 'Invalid address for proposer. Something went wrong.' });
			proposer_address = substrateAddress;
			isAuthor = Boolean(userAddresses.find((address) => address.address === substrateAddress));
			if (network === 'moonbeam' && proposalType === ProposalType.DEMOCRACY_PROPOSALS && post?.id === 23) {
				if (userAddresses.find((address) => address.address === '0xbb1e1722513a8fa80f7593617bb0113b1258b7f1')) {
					isAuthor = true;
				}
			}
			if (network === 'moonriver' && proposalType === ProposalType.REFERENDUM_V2 && post?.id === 3) {
				if (userAddresses.find((address) => address.address === '0x16095c509f728721ad19a51704fc39116157be3a')) {
					isAuthor = true;
				}
			}
			if (!isAuthor) {
				isAuthor = await checkIsProposer(
					proposerAddress,
					userAddresses.map((a) => a.address),
					network
				);
			}

			if (!isAuthor) {
				isAuthor = !isNaN(postDoc?.data?.()?.user_id) && Number(postDoc?.data?.()?.user_id) === user.id;
			}

			if (proposalType == ProposalType.REFERENDUM_V2 && process.env.IS_CACHING_ALLOWED == '1') {
				const latestActivitykey = `${network}_latestActivity_OpenGov`;
				const trackListingKey = `${network}_${subsquidProposalType}_trackId_${postRes.data?.proposals?.[0].trackNumber}_*`;
				const referendumDetailsKey = `${network}_OpenGov_${subsquidProposalType}_postId_${postId}`;

				await redisDel(latestActivitykey);
				await deleteKeys(trackListingKey);
				await redisDel(referendumDetailsKey);
			}
		} else if (post?.user_id === user.id) {
			isAuthor = true;
		} else {
			isAuthor = await checkIsProposer(
				proposerAddress,
				userAddresses.map((a) => a.address),
				network
			); // true
		}
		if (process.env.IS_CACHING_ALLOWED == '1') {
			if (proposalType == ProposalType.DISCUSSIONS) {
				const latestActivitykey = `${network}_latestActivity_OpenGov`;
				const referendumDetailsKey = `${network}_${ProposalType.DISCUSSIONS}_postId_${postId}`;
				const discussionListingKey = `${network}_${ProposalType.DISCUSSIONS}_page_*`;

				await redisDel(latestActivitykey);
				await redisDel(referendumDetailsKey);
				await deleteKeys(discussionListingKey);
			}
		}

		if (!isAuthor) return res.status(403).json({ message: messages.UNAUTHORISED });
		created_at = post?.created_at?.toDate() || created_at;
		post_link = post?.post_link || post_link;
		proposer_address = post?.proposer_address || proposer_address;
	} else {
		const defaultUserAddress = await getDefaultUserAddressFromId(user.id);
		proposer_address = defaultUserAddress?.address || '';

		const subsquidProposalType = getSubsquidProposalType(proposalType as any);
		let postQuery =
			proposalType === ProposalType.ALLIANCE_MOTION
				? GET_ALLIANCE_POST_BY_INDEX_AND_PROPOSALTYPE
				: proposalType === ProposalType.ANNOUNCEMENT
				? GET_ALLIANCE_ANNOUNCEMENT_BY_CID_AND_TYPE
				: proposalType === ProposalType.FELLOWSHIP_REFERENDUMS && ['collectives', 'westend-collectives'].includes(network)
				? GET_COLLECTIVE_FELLOWSHIP_POST_BY_INDEX_AND_PROPOSALTYPE
				: proposalType === ProposalType.ADVISORY_COMMITTEE && network === 'zeitgeist'
				? GET_PROPOSAL_BY_INDEX_FOR_ADVISORY_COMMITTEE
				: GET_PROPOSAL_BY_INDEX_AND_TYPE_V2;

		if (network === 'polymesh') {
			postQuery = GET_POLYMESH_PROPOSAL_BY_INDEX_AND_TYPE;
		}

		let variables: any = {
			index_eq: Number(postId),
			type_eq: subsquidProposalType
		};

		if ([ProposalType.TIPS, ProposalType.ADVISORY_COMMITTEE].includes(proposalType)) {
			variables = {
				hash_eq: String(postId),
				type_eq: subsquidProposalType
			};
		}

		const postRes = await fetchSubsquid({
			network,
			query: postQuery,
			variables
		});

		let post = postRes.data?.proposals?.[0] || postRes.data?.announcements?.[0];
		if (!post.preimage?.proposer && !post?.proposer && isSubscanSupport(network)) {
			post = await getSubscanData('/api/scan/referenda/referendum', network, { referendum_index: Number(postId) });
		}
		if (!post) return res.status(500).json({ message: 'Post not found on our on-chain database. Something went wrong.' });

		if (!post?.proposer && !post?.preimage?.proposer && !post?.data?.account && !post?.data?.account?.address)
			return res.status(500).json({ message: 'Post proposer not found on our on-chain database. Something went wrong.' });

		const proposerAddress = post?.proposer || post?.preimage?.proposer || post?.data?.account?.address || '';

		const substrateAddress = getSubstrateAddress(proposerAddress);
		if (!substrateAddress) return res.status(500).json({ message: 'Invalid Proposer address. Something went wrong.' });
		proposer_address = substrateAddress;
		let isAuthor: any = userAddresses.find((address) => address.address === substrateAddress);
		if (network === 'moonbeam' && proposalType === ProposalType.DEMOCRACY_PROPOSALS && post.index === 23) {
			isAuthor = userAddresses.find((address) => address.address === '0xbb1e1722513a8fa80f7593617bb0113b1258b7f1');
		}
		if (network === 'moonriver' && proposalType === ProposalType.REFERENDUM_V2 && post.index === 3) {
			isAuthor = userAddresses.find((address) => address.address === '0x16095c509f728721ad19a51704fc39116157be3a');
		}
		if (!isAuthor) {
			isAuthor = await checkIsProposer(
				proposerAddress,
				userAddresses.map((a) => a.address),
				network
			);
		}

		created_at = dayjs(post.createdAt).toDate();

		if (!isAuthor) return res.status(403).json({ message: messages.UNAUTHORISED });

		if (process.env.IS_CACHING_ALLOWED == '1') {
			if (proposalType == ProposalType.REFERENDUM_V2) {
				const latestActivitykey = `${network}_latestActivity_OpenGov`;
				const trackListingKey = `${network}_${subsquidProposalType}_trackId_${postRes.data?.proposals?.[0].trackNumber}_*`;
				const referendumDetailsKey = `${network}_OpenGov_${subsquidProposalType}_postId_${postId}`;

				await redisDel(latestActivitykey);
				await deleteKeys(trackListingKey);
				await redisDel(referendumDetailsKey);
			}
		}
	}

	const newHistory: IPostHistory = {
		content: post?.content,
		created_at: post?.last_edited_at,
		title: post?.title
	};

	const history = post?.history && Array.isArray(post?.history) ? [newHistory, ...(post?.history || [])] : [];

	const last_comment_at = new Date();

	const summary = (await fetchContentSummary(content, proposalType)) || '';
	const { data: postUser } = await getUserWithAddress(proposer_address);

	const newPostDoc: Omit<Post, 'last_comment_at'> = {
		allowedCommentors: allowedCommentorsArr,
		content,
		created_at,
		history,
		id: [ProposalType.ANNOUNCEMENT, ProposalType.TIPS, ProposalType.ADVISORY_COMMITTEE].includes(proposalType) ? postId : Number(postId),
		isDeleted: false,
		last_edited_at: last_comment_at,
		post_link: post_link || null,
		proposer_address: proposer_address, // postAddress
		summary: summary,
		tags: tags || [],
		title,
		topic_id: topicId || getTopicFromType(proposalType).id,
		user_id: user.id ?? postUser?.userId,
		username: postUser?.username || user.username
	};

	if (!postDoc.exists || !postDoc?.data() || !postDoc?.data()?.last_comment_at) {
		(newPostDoc as Post).last_comment_at = last_comment_at;
	}

	let isCurrPostUpdated = false;
	if (timeline && Array.isArray(timeline) && timeline.length > 0) {
		const batch = firestore_db.batch();
		timeline.forEach((obj) => {
			const proposalType = getFirestoreProposalType(obj.type) as ProposalType;
			const postDocRef = postsByTypeRef(network, proposalType).doc(String(obj.index));
			if (strProposalType === proposalType && Number(obj.index) === Number(postId)) {
				isCurrPostUpdated = true;
				batch.set(postDocRef, newPostDoc, { merge: true });
			} else if (![ProposalType.DISCUSSIONS, ProposalType.GRANTS].includes(proposalType)) {
				let post_link: any = {
					id: postId,
					type: strProposalType
				};
				if (isProposalTypeValid(strProposalType)) {
					post_link = null;
				}
				batch.set(
					postDocRef,
					{
						content,
						created_at,
						id: proposalType === ProposalType.TIPS ? obj.hash : proposalType === ProposalType.ADVISORY_COMMITTEE ? obj?.proposalHashBlock || obj.hash : Number(obj.index),
						isDeleted: false,
						last_edited_at: last_comment_at,
						post_link: post_link,
						proposer_address: proposer_address,
						summary: summary,
						tags: tags || [],
						title,
						topic_id: topicId || getTopicFromType(proposalType).id,
						user_id: post?.user_id || user.id,
						username: post?.username || user.username
					},
					{ merge: true }
				);
			}
		});
		await batch.commit();
	}

	if (!isCurrPostUpdated) {
		await postDocRef.set(newPostDoc, { merge: true });
	}

	const { last_edited_at, topic_id } = newPostDoc;

	res.status(200).json({
		allowedCommentors: allowedCommentorsArr,
		content,
		last_edited_at: last_edited_at,
		proposer: proposer_address,
		summary: summary,
		title,
		topic: {
			id: topic_id,
			name: getTopicNameFromTopicId(topic_id as any)
		}
	});

	const batch = firestore_db.batch();
	if (tags && Array.isArray(tags) && tags.length > 0) {
		tags?.map((tag: string) => {
			if (tag && typeof tag === 'string') {
				const tagRef = firestore_db.collection('tags').doc(tag);
				const newTag: IPostTag = {
					last_used_at: new Date(),
					name: tag.toLowerCase()
				};
				batch.set(tagRef, newTag, { merge: true });
			}
		});
		await batch.commit();
	}
	try {
		await createUserActivity({
			action: EActivityAction.EDIT,
			content,
			network,
			postAuthorId: postUser?.userId as number,
			postId: [ProposalType.ANNOUNCEMENT, ProposalType.TIPS, ProposalType.ADVISORY_COMMITTEE].includes(proposalType) ? postId : Number(postId),
			postType: proposalType,
			userId: postUser?.userId as number
		});
		return;
	} catch (err) {
		console.log(err);
		return;
	}
};

export default withErrorHandling(handler);
