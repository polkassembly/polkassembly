// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { CreatePostResponseType } from '~src/auth/types';
import getDefaultUserAddressFromId from '~src/auth/utils/getDefaultUserAddressFromId';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';
import { IPostTag, Post } from '~src/types';

async function handler(req: NextApiRequest, res: NextApiResponse<CreatePostResponseType>) {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { content, proposalType, title, topicId, userId ,gov_type,tags, remark_options, start_block_num, end_block_num, proposer_address } = req.body;
	if(!content || !title || !topicId || !userId || !proposalType) return res.status(400).json({ message: 'Missing parameters in request body' });

	if(tags && !Array.isArray(tags)) return  res.status(400).json({ message: 'Invalid tags parameter' });
	if(remark_options && !Array.isArray(remark_options)) return  res.status(400).json({ message: 'Invalid remark_options parameter' });

	const strProposalType = String(proposalType);
	if (!isOffChainProposalTypeValid(strProposalType)) return res.status(400).json({ message: `The off chain proposal type "${proposalType}" is invalid.` });

	if(strProposalType === ProposalType.REMARK_PROPOSALS) {
		if(!start_block_num || !end_block_num || !proposer_address) return res.status(400).json({ message: 'Missing parameters for remark post in request body' });
	}

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user || user.id != Number(userId)) return res.status(403).json({ message: messages.UNAUTHORISED });

	const lastPostQuerySnapshot = await postsByTypeRef(network, strProposalType as ProposalType).orderBy('id', 'desc').limit(1).get();
	const postsCount = lastPostQuerySnapshot.empty ? 0 : lastPostQuerySnapshot.docs[0].data().id || 0;
	const newID = Number(postsCount) + 1;

	const userDefaultAddress = await getDefaultUserAddressFromId(Number(userId));

	const postDocRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(newID));

	const last_comment_at = new Date();
	const newPost: Post = {
		content,
		created_at: new Date(),
		gov_type:gov_type,
		id: newID,
		last_comment_at,
		last_edited_at: last_comment_at,
		post_link: null,
		proposer_address: proposer_address || userDefaultAddress?.address || '',
		tags:tags ? tags : [],
		title,
		topic_id: strProposalType === ProposalType.GRANTS? 6:Number(topicId),
		user_id: user.id,
		username: user.username
	};

	if(remark_options && remark_options.length) {
		newPost.remark_options = remark_options;
		newPost.start_block_num = Number(start_block_num);
		newPost.end_block_num = Number(end_block_num);
	}

	const batch = firestore_db.batch();
	tags.length > 0 && tags?.map((tag:string) => {
		const tagRef = firestore_db.collection('tags').doc(tag);
		const newTag:IPostTag={
			name:tag.toLowerCase() ,
			// eslint-disable-next-line sort-keys
			last_used_at:new Date()
		};
		batch.set(tagRef, newTag, { merge: true });}
	);

	await postDocRef.set(newPost).then(() => {
		res.status(200).json({ message: 'Post saved.', post_id: newID });
		tags.length>0 && batch.commit();
		return;
	}).catch((error) => {
		// The document probably doesn't exist.
		console.error('Error saving post: ', error);
		return res.status(500).json({ message: 'Error saving post' });
	});
}

export default withErrorHandling(handler);
