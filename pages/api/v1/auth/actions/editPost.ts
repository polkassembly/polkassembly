// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from 'dayjs-init';
import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';
import getDefaultUserAddressFromId from '~src/auth/utils/getDefaultUserAddressFromId';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { getFirestoreProposalType, getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { GET_ALLIANCE_ANNOUNCEMENT_BY_CID_AND_TYPE, GET_ALLIANCE_POST_BY_INDEX_AND_PROPOSALTYPE, GET_PROPOSAL_BY_INDEX_AND_TYPE_V2 } from '~src/queries';
import { firestore_db } from '~src/services/firebaseInit';
import { IPostHistory, IPostTag, Post } from '~src/types';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { getTopicFromType, getTopicNameFromTopicId } from '~src/util/getTopicFromType';

export interface IEditPostResponse {
	content: string;
	proposer: string;
	title: string;
	topic: {
		id: number,
		name: string
	};
	last_edited_at: Date;
}

const handler: NextApiHandler<IEditPostResponse | MessageType> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { content, postId, proposalType, title, timeline, tags } = req.body;
	if(proposalType === ProposalType.ANNOUNCEMENT){
		if(!postId || !title || !content || !proposalType) return res.status(400).json({ message: 'Missing parameters in request body' });
	}
	else{
		if(isNaN(postId) || !title || !content || !proposalType) return res.status(400).json({ message: 'Missing parameters in request body' });
	}

	if(tags && !Array.isArray(tags)) return res.status(400).json({ message: 'Invalid tags parameter' });

	const strProposalType = String(proposalType);
	if (!isOffChainProposalTypeValid(strProposalType) && !isProposalTypeValid(strProposalType)) return res.status(400).json({ message: `The proposal type of the name "${proposalType}" does not exist.` });

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postDocRef = postsByTypeRef(network, proposalType).doc(String(postId));

	let created_at = new Date();
	let topic_id: any = null;
	let post_link: any = null;
	let proposer_address = '';

	const userAddresses = await getAddressesFromUserId(user.id, true);

	const postDoc = await postDocRef.get();
	const post = postDoc.data();
	let isAuthor = false;
	if(postDoc.exists) {
		if(![ProposalType.DISCUSSIONS, ProposalType.GRANTS].includes(proposalType)){
			const subsquidProposalType = getSubsquidProposalType(proposalType as any);
			const postQuery = proposalType === ProposalType.ALLIANCE_MOTION ?
				GET_ALLIANCE_POST_BY_INDEX_AND_PROPOSALTYPE :
				proposalType === ProposalType.ANNOUNCEMENT ?
					GET_ALLIANCE_ANNOUNCEMENT_BY_CID_AND_TYPE :
					GET_PROPOSAL_BY_INDEX_AND_TYPE_V2;

			let variables: any = {
				index_eq: Number(postId),
				type_eq: subsquidProposalType
			};

			if (proposalType === ProposalType.TIPS) {
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

			const post = postRes.data?.proposals?.[0] || postRes.data?.announcements?.[0];
			if(!post) return res.status(500).json({ message: 'Something went wrong.' });
			if(!post?.proposer && !post?.preimage?.proposer) return res.status(500).json({ message: 'Something went wrong.' });

			const proposerAddress = post?.proposer || post?.preimage?.proposer;

			const substrateAddress = getSubstrateAddress(proposerAddress);
			if(!substrateAddress)  return res.status(500).json({ message: 'Something went wrong.' });
			proposer_address = substrateAddress;
			isAuthor = Boolean(userAddresses.find(address => address.address === substrateAddress));
			if(network === 'moonbeam' && proposalType === ProposalType.DEMOCRACY_PROPOSALS && post?.id === 23){
				if(userAddresses.find(address => address.address === '0xbb1e1722513a8fa80f7593617bb0113b1258b7f1')){
					isAuthor = true;
				}
			}
			if(network === 'moonriver' && proposalType === ProposalType.REFERENDUM_V2 && post?.id === 3){
				if(userAddresses.find(address => address.address === '0x16095c509f728721ad19a51704fc39116157be3a')){
					isAuthor = true;
				}
			}
		}
		else if(post?.user_id === user.id){
			isAuthor = true;
		}

		if(!isAuthor) return res.status(403).json({ message: messages.UNAUTHORISED });
		created_at = post?.created_at?.toDate();
		topic_id = post?.topic_id;
		post_link = post?.post_link;
	}else {
		const defaultUserAddress = await getDefaultUserAddressFromId(user.id);
		proposer_address = defaultUserAddress?.address || '';

		const subsquidProposalType = getSubsquidProposalType(proposalType as any);
		const postQuery = proposalType === ProposalType.ALLIANCE_MOTION ?
			GET_ALLIANCE_POST_BY_INDEX_AND_PROPOSALTYPE :
			proposalType === ProposalType.ANNOUNCEMENT ?
				GET_ALLIANCE_ANNOUNCEMENT_BY_CID_AND_TYPE :
				GET_PROPOSAL_BY_INDEX_AND_TYPE_V2;

		let variables: any = {
			index_eq: Number(postId),
			type_eq: subsquidProposalType
		};

		if (proposalType === ProposalType.TIPS) {
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

		const post = postRes.data?.proposals?.[0] || postRes.data?.announcements?.[0];
		if(!post) return res.status(500).json({ message: 'Something went wrong.' });
		if(!post?.proposer && !post?.preimage?.proposer) return res.status(500).json({ message: 'Something went wrong.' });

		const proposerAddress = post?.proposer || post?.preimage?.proposer;

		const substrateAddress = getSubstrateAddress(proposerAddress);
		if(!substrateAddress)  return res.status(500).json({ message: 'Something went wrong.' });
		proposer_address = substrateAddress;

		let isAuthor = userAddresses.find(address => address.address === substrateAddress);
		if(network === 'moonbeam' && proposalType === ProposalType.DEMOCRACY_PROPOSALS && post.index === 23){
			isAuthor = userAddresses.find(address => address.address === '0xbb1e1722513a8fa80f7593617bb0113b1258b7f1');
		}
		if(network === 'moonriver' && proposalType === ProposalType.REFERENDUM_V2 && post.index === 3){
			isAuthor = userAddresses.find(address => address.address === '0x16095c509f728721ad19a51704fc39116157be3a');
		}

		created_at = dayjs(post.createdAt).toDate();

		if(!isAuthor) return res.status(403).json({ message: messages.UNAUTHORISED });
	}

	const newHistory: IPostHistory = {
		content: post?.content,
		created_at: post?.last_edited_at,
		title: post?.title
	};

	const history =  post?.history && Array.isArray(post?.history)
		? [...(post?.history || []), newHistory]
		: new Array(newHistory);

	const last_comment_at = new Date();

	const newPostDoc: Omit<Post, 'last_comment_at'> = {
		content,
		created_at,
		history,
		id: proposalType === ProposalType.ANNOUNCEMENT ? postId : proposalType === ProposalType.TIPS ? postId : Number(postId),
		last_edited_at: last_comment_at,
		post_link: post_link || null,
		proposer_address: proposer_address,
		tags: tags || [],
		title,
		topic_id : topic_id || getTopicFromType(proposalType).id,
		user_id: user.id,
		username: user.username
	};

	if (!postDoc.exists || !postDoc?.data() || !postDoc?.data()?.last_comment_at) {
		(newPostDoc as Post).last_comment_at = last_comment_at;
	}

	let isCurrPostUpdated = false;
	if (timeline && Array.isArray(timeline) && timeline.length > 0) {
		const batch = firestore_db.batch();
		timeline.forEach((obj) => {
			const proposalType = getFirestoreProposalType(obj.type)  as ProposalType;
			const postDocRef = postsByTypeRef(network, proposalType).doc(String(obj.index));
			if (strProposalType === proposalType && Number(obj.index) === Number(postId)) {
				isCurrPostUpdated = true;
				batch.set(postDocRef, newPostDoc, { merge: true });
			} else if (![ProposalType.DISCUSSIONS, ProposalType.GRANTS].includes(proposalType)) {
				batch.set(postDocRef, {
					content,
					created_at,
					id: proposalType === ProposalType.TIPS ? obj.hash : Number(obj.index),
					last_edited_at: last_comment_at,
					post_link: {
						id: postId,
						type: strProposalType
					},
					proposer_address: proposer_address,
					tags: tags || [],
					title,
					topic_id : topic_id || getTopicFromType(proposalType).id,
					user_id: user.id,
					username: user.username
				}, { merge: true });
			}
		});
		await batch.commit();
	}

	if (!isCurrPostUpdated) {
		await postDocRef.set(newPostDoc, { merge: true });
	}

	const { last_edited_at, topic_id: topicId } = newPostDoc;

	res.status(200).json({
		content,
		last_edited_at: last_edited_at,
		proposer: proposer_address,
		title,
		topic: {
			id: topicId,
			name: getTopicNameFromTopicId(topicId as any)
		}
	});

	const batch = firestore_db.batch();
	if (tags && Array.isArray(tags) && tags.length > 0) {
		tags?.map((tag:string) => {
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
	return;
};

export default withErrorHandling(handler);
