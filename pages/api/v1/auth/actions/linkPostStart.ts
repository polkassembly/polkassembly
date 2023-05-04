// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { getFirestoreProposalType, getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { GET_PROPOSAL_BY_INDEX_AND_TYPE_FOR_LINKING } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { getTopicFromFirestoreData, isDataExist } from '../../posts/on-chain-post';
import { getUpdatedAt } from '../../posts/off-chain-post';
import { firestore_db } from '~src/services/firebaseInit';

export interface ILinkPostStartResponse {
    title: string;
    description: string;
	created_at: Date | string;
	last_edited_at?: Date | string;
	proposer?: string;
	username?: string;
	topic?: {
		name: string;
	};
	tags?: string[];
}

const handler: NextApiHandler<ILinkPostStartResponse | MessageType> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { postId, postType } = req.body;

	if((!postId && postId !== 0) || !postType) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const strProposalType = String(postType) as ProposalType;
	const isOffChainPost = isOffChainProposalTypeValid(strProposalType);
	const isOnChainPost = isProposalTypeValid(strProposalType);
	if (!isOffChainPost && !isOnChainPost) return res.status(400).json({ message: `The post type of the name "${postType}" does not exist.` });

	const linkPostRes: ILinkPostStartResponse = {
		created_at: '',
		description: '',
		proposer: '',
		tags: [],
		title: '',
		username: ''
	};
	const postDocRef = postsByTypeRef(network, strProposalType).doc(String(postId));
	const postDoc = await postDocRef.get();
	const postData = postDoc.data();
	const isPostExist = postDoc.exists && postData;
	if (isOffChainPost) {
		if (!isPostExist) {
			return res.status(404).json({ message: `Post with id: "${postId}" and type: "${postType}" does not exist, please create a post.` });
		}
		const isAuthor = user.id === postData.user_id;
		if (!isAuthor) {
			return res.status(403).json({ message: 'You can not link the post, because you are not the user who created this post.' });
		}
		linkPostRes.title = postData?.title;
		linkPostRes.description = postData?.content;
		linkPostRes.username = postData?.username;
		linkPostRes.topic = getTopicFromFirestoreData(postData, ProposalType.DISCUSSIONS);
		linkPostRes.last_edited_at = getUpdatedAt(postData);
		linkPostRes.created_at = postData?.created_at && postData?.created_at?.toDate? postData?.created_at?.toDate(): '';
		if (postData?.tags && Array.isArray(postData?.tags)) {
			linkPostRes.tags = postData?.tags;
		}
		const addressDocs = await firestore_db.collection('addresses').where('user_id', '==', user.id).where('default', '==', true).limit(1).get();
		if (addressDocs && addressDocs.size > 0) {
			const doc = addressDocs.docs[0];
			if (doc && doc.exists && doc.data()) {
				const data = doc.data();
				if (data) {
					linkPostRes.proposer = data.address;
				}
			}
		}
	} else {
		const subsquidProposalType = getSubsquidProposalType(strProposalType as any);

		const variables: any = {
			type_eq: subsquidProposalType
		};

		if (strProposalType === ProposalType.TIPS) {
			variables['hash_eq'] = String(postId);
		} else {
			variables['index_eq'] = Number(postId);
		}
		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_PROPOSAL_BY_INDEX_AND_TYPE_FOR_LINKING,
			variables: variables
		});

		// Subsquid Data
		const subsquidData = subsquidRes?.data;
		if (!isDataExist(subsquidData)) {
			return res.status(400).json({ message: `The Post with index "${postId}" is not found.` });
		}
		const post = subsquidData.proposals[0];
		const preimage = post?.preimage;
		if(!post || (!post?.proposer && !preimage?.proposer)) return res.status(500).json({ message: 'Proposer address is not present in subsquid response.' });

		const proposerAddress = post.proposer || post.preimage?.proposer || post?.curator;

		const substrateAddress = getSubstrateAddress(proposerAddress);
		if(!substrateAddress)  return res.status(500).json({ message: 'Something went wrong while getting encoded address corresponding to network' });

		const userAddresses = await getAddressesFromUserId(user.id, true);
		const isAuthor = userAddresses.some(address => address.address === substrateAddress) || (isPostExist && user.id === postData.user_id);
		if (!isAuthor) {
			return res.status(403).json({ message: 'You can not link the post, because you are not the user who created this post.' });
		}
		if (isPostExist) {
			if (postData?.title) {
				linkPostRes.title = postData?.title;
			}
			if (postData?.content) {
				linkPostRes.description = postData?.content;
			}
			if (postData?.username) {
				linkPostRes.username = postData?.username;
			}
			linkPostRes.topic = getTopicFromFirestoreData(postData, getFirestoreProposalType(post.type) as any);
			linkPostRes.last_edited_at = getUpdatedAt(postData);
			if (postData?.tags && Array.isArray(postData?.tags)) {
				linkPostRes.tags = postData?.tags;
			}
		}
		if (!linkPostRes.title) {
			linkPostRes.title = preimage?.method;
		}
		if (!linkPostRes.description) {
			linkPostRes.description = post.description || preimage?.proposedCall?.description;
		}
		if (!linkPostRes.proposer) {
			linkPostRes.proposer = proposerAddress;
		}
		linkPostRes.created_at = post.createdAt;
	}

	return res.status(200).json(linkPostRes);
};

export default withErrorHandling(handler);
