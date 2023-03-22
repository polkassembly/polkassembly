// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getTimeline } from './../../posts/on-chain-post';
import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isOffChainProposalTypeValid, isProposalTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType, User } from '~src/auth/types';
import getAddressesFromUserId from '~src/auth/utils/getAddressesFromUserId';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { getFirestoreProposalType, getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { GET_PROPOSAL_BY_INDEX_AND_TYPE_FOR_LINKING } from '~src/queries';
import { firestore_db } from '~src/services/firebaseInit';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { isDataExist } from '../../posts/on-chain-post';

interface IUpdatePostLinkInGroupParams {
	currPostData: any;
	currPostDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
	currPostId: string | number;
	currPostType: string;
	postType: string;
	postId: string | number;
	network: string;
	user: User;
	isRemove?: boolean;
	isTimeline: boolean;
}
type TUpdatePostLinkInGroup = (params: IUpdatePostLinkInGroupParams) => Promise<{
	timeline: any[];
}>;
export const updatePostLinkInGroup: TUpdatePostLinkInGroup = async (params) => {
	const { currPostDocRef, currPostId, currPostType, network, postId, postType, user, currPostData, isRemove, isTimeline } = params;
	const subsquidProposalType = getSubsquidProposalType(postType as any);

	const variables: any = {
		type_eq: subsquidProposalType
	};

	if (postType === ProposalType.TIPS) {
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
		throw apiErrorWithStatusCode(`The Post with id: "${postId}" and type: "${postType}" is not found.`, 400);
	}
	const post = subsquidData.proposals[0];
	const preimage = post?.preimage;
	if(!post || (!post?.proposer && !preimage?.proposer)) {
		throw apiErrorWithStatusCode('Proposer address is not present in subsquid response.', 400);
	}

	const proposerAddress = post.proposer || post.preimage?.proposer;

	const substrateAddress = getSubstrateAddress(proposerAddress);
	if(!substrateAddress) {
		throw apiErrorWithStatusCode('Something went wrong while getting encoded address corresponding to network', 500);
	}

	const userAddresses = await getAddressesFromUserId(user.id, true);
	const isAuthor = userAddresses.some(address => address.address === substrateAddress) || (currPostData && user.id === currPostData.user_id);
	if (!isAuthor) {
		throw apiErrorWithStatusCode(`You can not ${isRemove? 'unlink': 'link'} the post, because you are not the user who created this post`, 403);
	}
	const batch = firestore_db.batch();
	batch.set(currPostDocRef, {
		last_edited_at: new Date(),
		post_link: isRemove? null: {
			id: postType === 'tips'? postId: Number(postId),
			type: postType
		}
	}, { merge: true });

	const post_link: any = {
		id: currPostType === 'tips'? currPostId: Number(currPostId),
		type: currPostType
	};
	const postsRefWithData: TPostsRefWithData = [];
	const proposals = post?.group?.proposals || undefined;
	const timeline = [];
	if (proposals || Array.isArray(proposals)) {
		(proposals as any[]).forEach((proposal) => {
			if (proposal && proposal.type) {
				const proposalType = getFirestoreProposalType(proposal.type) as ProposalType;
				const id = (proposal.type === 'Tip'? proposal.hash: Number(proposal.index));
				postsRefWithData.push({
					data: {
						id
					},
					ref: postsByTypeRef(network, proposalType).doc(String(id))
				});
			}
		});
	}
	if (isTimeline) {
		if (!isRemove) {
			timeline.push(
				{
					created_at: new Date(),
					index: currPostId,
					statuses: [
						{
							status: 'Created',
							timestamp: new Date()
						}
					],
					type: 'Discussions'
				}
			);
		}
		timeline.push(...getTimeline(proposals));
		if (timeline.length <= 1) {
			timeline.push(getTimeline([
				{
					createdAt: post?.createdAt,
					hash: post?.hash,
					index: post?.index,
					statusHistory: post?.statusHistory,
					type: post?.type
				}
			]));
		}
	}
	if (postsRefWithData.length === 0) {
		postsRefWithData.push({
			data: {
				id: (postType === 'tips'? postId: Number(postId))
			},
			ref: postsByTypeRef(network, postType as any).doc(String(postId))
		});
	}
	const results = await firestore_db.getAll(...postsRefWithData.map((v) => (v.ref)));
	results.forEach((result, i) => {
		if (result && result.exists) {
			const data = result.data();
			const newData: any = {
				...data,
				last_edited_at: new Date(),
				post_link: isRemove? null: post_link
			};
			if (!newData.user_id && newData.user_id !== 0) {
				newData.user_id = user.id;
			}
			if (!newData.id && newData.id !== 0) {
				newData.id = postsRefWithData?.[i]?.data?.id;
			}
			if (!newData.username) {
				newData.username = user.username;
			}
			if (!newData.proposer_address) {
				newData.proposer_address = substrateAddress;
			}
			if (!newData.created_at) {
				newData.created_at = new Date();
			}
			if (!newData.topic_id && newData.topic_id !== 0) {
				const topic = newData.topic;
				if (topic && topic.name) {
					newData.topic_id = topic.id;
					delete newData.topic;
				} else {
					newData.topic_id = currPostData.topic_id;
				}
			}
			if (postsRefWithData[i]) {
				postsRefWithData[i].data = newData;
			}
		}
	});
	postsRefWithData.forEach((obj) => {
		if (obj) {
			const { data, ref } = obj;
			if (data && ref) {
				batch.set(ref, data, { merge: true });
			}
		}
	});
	await batch.commit();
	return {
		timeline
	};
};

interface IGetPostsRefAndDataParams {
	network: string;
	posts: {
		id: string | number;
		type: string;
		isExistChecked: boolean;
	}[];
}
type TPostsRefWithData = {
	data?: any,
	ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
}[];
type TGetPostsRefAndData = (params: IGetPostsRefAndDataParams) => Promise<TPostsRefWithData>;
export const getPostsRefAndData: TGetPostsRefAndData = async (params) => {
	const { network, posts } = params;

	const postsRefWithData: TPostsRefWithData = posts.map((post) => {
		return {
			data: {},
			ref: postsByTypeRef(network, post.type as any).doc(String(post.id))
		};
	});
	const results = await firestore_db.getAll(...postsRefWithData.map(({ ref }) => (ref)));

	results.forEach((result, i) => {
		const currPostData = result.data();
		if (posts?.[i].isExistChecked && !(result.exists && currPostData)) {
			throw apiErrorWithStatusCode(`Post with id: "${posts[i].id}" and type: "${posts[i].type}" does not exist.`, 404);
		}
		postsRefWithData[i].data = currPostData;
	});
	return postsRefWithData;
};

export interface ILinkPostConfirmResponse {
	timeline: any[];
}

const handler: NextApiHandler<ILinkPostConfirmResponse | MessageType> = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { postId, postType, currPostId, currPostType } = req.body;

	if((!postId && postId !== 0) || (!currPostId && currPostId !== 0) || !postType || !currPostType) return res.status(400).json({ message: 'Missing parameters in request body' });

	const token = getTokenFromReq(req);
	if(!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if(!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	try {
		[postType, currPostType].filter((type) => {
			const strType = String(type) as ProposalType;
			const isOffChainPost = isOffChainProposalTypeValid(strType);
			const isOnChainPost = isProposalTypeValid(strType);

			if (!isOffChainPost && !isOnChainPost) {
				throw apiErrorWithStatusCode(`The post type of the name "${type}" does not exist.`, 400);
			}
		});
		const postsRefWithData = await getPostsRefAndData({
			network,
			posts: [
				{
					id: currPostId,
					isExistChecked: true,
					type: currPostType
				},
				{
					id: postId,
					isExistChecked: false,
					type: postType
				}
			]
		});
		if (postsRefWithData.length !== 2) {
			throw apiErrorWithStatusCode('Something went wrong!', 500);
		}
		const [{ data: currPostData, ref: currPostDocRef }, { data: postData, ref: postDocRef }] = postsRefWithData;
		let params = {
			currPostData,
			currPostDocRef,
			currPostId,
			currPostType,
			isTimeline: true,
			network,
			postId,
			postType,
			user
		};
		if (isOffChainProposalTypeValid(String(postType))) {
			if (!postData) {
				throw apiErrorWithStatusCode(`Post with id: "${postId}" and type: "${postType}" does not exist, please create a post.`, 404);
			}
			const isAuthor = user.id === postData.user_id;
			if (!isAuthor) {
				throw apiErrorWithStatusCode('You can not link the post, because you are not the user who created this post.', 403);
			}
			params = {
				currPostData: postData,
				currPostDocRef: postDocRef,
				currPostId: postId,
				currPostType: postType,
				isTimeline: true,
				network,
				postId: currPostId,
				postType: currPostType,
				user
			};
		}

		const data = await updatePostLinkInGroup(params);
		return res.status(200).json(data);
	} catch (error) {
		return res.status(error.name).json({ message: error.message });
	}
};

export default withErrorHandling(handler);
