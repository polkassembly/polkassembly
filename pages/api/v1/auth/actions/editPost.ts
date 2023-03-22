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
import { GET_PROPOSAL_BY_INDEX_AND_TYPE_V2 } from '~src/queries';
import { firestore_db } from '~src/services/firebaseInit';
import { Post } from '~src/types';
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

	const { content, postId, proposalType, title, timeline } = req.body;
	if(isNaN(postId) || !title || !content || !proposalType) return res.status(400).json({ message: 'Missing parameters in request body' });

	const strProposalType = String(proposalType);
	if (!isOffChainProposalTypeValid(strProposalType) && !isProposalTypeValid(strProposalType)) return res.status(400).json({ message: `The proposal type of the name "${proposalType}" does not exist.` });

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const postDocRef = postsByTypeRef(network, proposalType).doc(String(postId));

	let created_at = new Date();
	let topic_id = null;
	let post_link: any = null;
	let proposer_address = '';

	const userAddresses = await getAddressesFromUserId(user.id, true);

	const postDoc = await postDocRef.get();
	let isAuthor = false;
	if(postDoc.exists) {
		const post = postDoc.data();
		if(![ProposalType.DISCUSSIONS, ProposalType.GRANTS].includes(proposalType)){
			const substrateAddress = getSubstrateAddress(post?.proposer_address || '');
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
		proposer_address = post?.proposer_address;
	}else {
		const defaultUserAddress = await getDefaultUserAddressFromId(user.id);
		proposer_address = defaultUserAddress?.address || '';

		const subsquidProposalType = getSubsquidProposalType(proposalType as any);
		const postQuery = GET_PROPOSAL_BY_INDEX_AND_TYPE_V2;
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

		const post = postRes.data?.proposals?.[0];

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

	const last_comment_at = new Date();
	const newPostDoc: Post = {
		content,
		created_at,
		id: proposalType === ProposalType.TIPS ? postId : Number(postId),
		last_comment_at,
		last_edited_at: last_comment_at,
		post_link: post_link || null,
		proposer_address: proposer_address,
		title,
		topic_id : topic_id || getTopicFromType(proposalType).id,
		user_id: user.id,
		username: user.username
	};

	let isCurrPostUpdated = false;
	if (timeline && Array.isArray(timeline) && timeline.length > 0) {
		const batch = firestore_db.batch();
		timeline.forEach((obj) => {
			const proposalType = getFirestoreProposalType(obj.type)  as ProposalType;
			const postDocRef = postsByTypeRef(network, proposalType).doc(String(obj.index));
			if (strProposalType === proposalType && Number(obj.index) === Number(postId)) {
				isCurrPostUpdated = true;
				batch.set(postDocRef, newPostDoc, { merge: true });
			}
			batch.set(postDocRef, {
				content,
				created_at,
				id: proposalType === ProposalType.TIPS ? obj.hash : Number(obj.index),
				last_edited_at: new Date(),
				post_link: post_link || null,
				proposer_address: proposer_address,
				title,
				topic_id : getTopicFromType(proposalType).id,
				user_id: user.id,
				username: user.username
			}, { merge: true });
		});
		await batch.commit();
	}

	if (!isCurrPostUpdated) {
		await postDocRef.set(newPostDoc, { merge: true });
	}

	const { last_edited_at, topic_id: topicId } = newPostDoc;
	return res.status(200).json({
		content,
		last_edited_at: last_edited_at,
		proposer: proposer_address,
		title,
		topic: {
			id: topicId,
			name: getTopicNameFromTopicId(topicId as any)
		}
	});
};

export default withErrorHandling(handler);
