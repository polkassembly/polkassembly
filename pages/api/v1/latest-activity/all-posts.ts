// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isGovTypeValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { getFirestoreProposalType, gov1ProposalTypes, ProposalType } from '~src/global/proposalType';
import {
	GET_PROPOSALS_LISTING_BY_TYPE,
	GET_PARENT_BOUNTIES_PROPOSER_FOR_CHILD_BOUNTY,
	GET_ALLIANCE_LATEST_ACTIVITY,
	GET_PROPOSALS_LISTING_FOR_POLYMESH,
	GET_PROPOSALS_LISTING_BY_TYPE_FOR_ZEITGEIST
} from '~src/queries';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import messages from '~src/util/messages';

import { ILatestActivityPostsListingResponse } from './on-chain-posts';
import { firestore_db } from '~src/services/firebaseInit';
import { chainProperties, network as AllNetworks } from '~src/global/networkConstants';
import { fetchLatestSubsquare, getSpamUsersCountForPosts } from '../listing/on-chain-posts';
import { getSubSquareContentAndTitle } from '../posts/subsqaure/subsquare-content';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import getAscciiFromHex from '~src/util/getAscciiFromHex';

interface IGetLatestActivityAllPostsParams {
	listingLimit?: string | string[] | number;
	network: string;
	govType?: string | string[];
}

export async function getLatestActivityAllPosts(params: IGetLatestActivityAllPostsParams): Promise<IApiResponse<ILatestActivityPostsListingResponse>> {
	try {
		const { listingLimit, network, govType } = params;

		const numListingLimit = Number(listingLimit);
		if (isNaN(numListingLimit)) {
			throw apiErrorWithStatusCode(`Invalid listingLimit "${listingLimit}"`, 400);
		}

		const strGovType = String(govType);
		if (govType !== undefined && govType !== null && !isGovTypeValid(strGovType)) {
			throw apiErrorWithStatusCode(`Invalid govType "${govType}"`, 400);
		}

		let variables: any = {
			limit: numListingLimit,
			type_in: gov1ProposalTypes(network)
		};

		if (strGovType === 'open_gov') {
			variables.type_in = 'ReferendumV2';
		}

		let onChainPosts: {
			title: any;
			created_at: any;
			description: any;
			hash: any;
			method: any;
			origin: any;
			parent_bounty_index: any;
			post_id: any;
			proposer: any;
			status: any;
			track_number: any;
			type: any;
			isSpam?: boolean;
			isSpamReportInvalid?: boolean;
		}[] = [];

		let onChainPostsCount = 0;

		if (network === AllNetworks.COLLECTIVES || network === AllNetworks.WESTENDCOLLECTIVES) {
			const subsquidRes = await fetchSubsquid({
				network,
				query: GET_ALLIANCE_LATEST_ACTIVITY,
				variables: { limit: numListingLimit }
			});
			const subsquidData = subsquidRes?.data;
			const subsquidPosts: any[] = subsquidData?.proposals || [];

			const posts = subsquidPosts?.map(async (subsquidPost) => {
				const { createdAt, description, hash, index, proposer, type } = subsquidPost;
				let status = subsquidPost.status;
				if (status === 'DecisionDepositPlaced') {
					const statuses = (subsquidPost?.statusHistory || []) as { status: string }[];
					statuses.forEach((obj) => {
						if (obj.status === 'Deciding') {
							status = 'Deciding';
						}
					});
				}
				const title = subsquidPost.callData?.method
					?.split('_')
					.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' ');
				const singlePost = {
					created_at: createdAt,
					description: network === AllNetworks.POLYMESH ? getAscciiFromHex(description) : description || '',
					hash: hash,
					method: '',
					origin: '',
					parent_bounty_index: '',
					post_id: index,
					proposer: proposer,
					status: status,
					title: title || '',
					track_number: '',
					type: type
				};
				const postDocRef = postsByTypeRef(network, getFirestoreProposalType(type) as ProposalType).doc(String(index));
				const postDoc = await postDocRef.get();
				if (postDoc && postDoc.exists) {
					const data = postDoc?.data();
					return {
						...singlePost,
						isSpam: data?.isSpam || false,
						isSpamReportInvalid: data?.isSpamReportInvalid || false,
						title: data?.title || title
					};
				}
				return singlePost;
			});
			onChainPosts = await Promise.all(posts);
			onChainPostsCount = Number(subsquidData?.proposalsConnection?.totalCount || 0);
		}

		if (chainProperties[network]?.subsquidUrl && network !== AllNetworks.COLLECTIVES && network !== AllNetworks.WESTENDCOLLECTIVES) {
			let query = GET_PROPOSALS_LISTING_BY_TYPE;
			if (network === AllNetworks.POLYMESH) {
				query = GET_PROPOSALS_LISTING_FOR_POLYMESH;
				variables = {
					limit: numListingLimit
				};
			}
			if (network === AllNetworks.ZEITGEIST) {
				query = GET_PROPOSALS_LISTING_BY_TYPE_FOR_ZEITGEIST;
			}
			let subsquidRes: any = {};
			try {
				subsquidRes = await fetchSubsquid({
					network,
					query,
					variables
				});
			} catch (error) {
				const data = await fetchLatestSubsquare(network);
				if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
					subsquidRes['data'] = {
						proposals: data.items.map((item: any) => {
							return {
								createdAt: item?.createdAt,
								end: 0,
								hash: item?.onchainData?.proposalHash,
								index: item?.referendumIndex,
								preimage: {
									method: item?.onchainData?.proposal?.method,
									section: item?.onchainData?.proposal?.section
								},
								proposer: item?.proposer,
								status: item?.state?.name,
								trackNumber: item?.track,
								type: 'ReferendumV2'
							};
						}),
						proposalsConnection: {
							totalCount: data.total
						}
					};
				}
			}

			const subsquidData = subsquidRes?.data;
			const subsquidPosts: any[] = subsquidData?.proposals || [];

			const parentBounties = new Set<number>();
			const onChainPostsPromise = subsquidPosts?.map(async (subsquidPost) => {
				const {
					createdAt,
					proposer,
					preimage,
					type,
					index,
					hash,
					method,
					origin,
					trackNumber,
					curator,
					description,
					proposalArguments,
					parentBountyIndex,
					group,
					proposalHashBlock
				} = subsquidPost;
				const postId = type === 'Tip' ? hash : index;
				const postDocRef = postsByTypeRef(network, getFirestoreProposalType(type) as ProposalType).doc(String(postId));
				const postDoc = await postDocRef.get();
				let newProposer = proposer || preimage?.proposer || curator;
				if (!newProposer && (parentBountyIndex || parentBountyIndex === 0)) {
					parentBounties.add(parentBountyIndex);
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
				if (!newProposer) {
					// Timeline
					const timelineProposals = group?.proposals || [];
					// Proposer and Curator address
					if (timelineProposals && Array.isArray(timelineProposals)) {
						for (let i = 0; i < timelineProposals.length; i++) {
							if (newProposer) {
								break;
							}
							const obj = timelineProposals[i];
							if (!newProposer) {
								if (obj.proposer) {
									newProposer = obj.proposer;
								} else if (obj?.preimage?.proposer) {
									newProposer = obj.preimage.proposer;
								}
							}
						}
					}
				}
				const onChainPost = {
					created_at: createdAt,
					description: network === AllNetworks.POLYMESH ? getAscciiFromHex(description) : description || (proposalArguments ? proposalArguments?.description : null),
					hash,
					method: method || preimage?.method || (proposalArguments ? proposalArguments?.method : proposalArguments?.method),
					origin,
					parent_bounty_index: parentBountyIndex,
					post_id: postId,
					proposalHashBlock: proposalHashBlock || null,
					proposer: newProposer,
					status: status,
					title: '',
					track_number: trackNumber,
					type
				};
				if (postDoc && postDoc.exists) {
					const data = postDoc?.data();
					let subsquareTitle = '';
					if (data?.title === '' || data?.title === method || data?.title === null) {
						const res = await getSubSquareContentAndTitle(getFirestoreProposalType(type) as ProposalType, network, postId);
						subsquareTitle = res?.title;
					}
					return {
						...onChainPost,
						isSpam: data?.isSpam || false,
						isSpamReportInvalid: data?.isSpamReportInvalid || false,
						spam_users_count:
							data?.isSpam && !data?.isSpamReportInvalid ? Number(process.env.REPORTS_THRESHOLD || 50) : data?.isSpamReportInvalid ? 0 : data?.spam_users_count || 0,
						title: data?.title || subsquareTitle || null
					};
				}

				let subsquareTitle = '';
				const res = await getSubSquareContentAndTitle(getFirestoreProposalType(type) as ProposalType, network, postId);
				subsquareTitle = res?.title;
				onChainPost.title = subsquareTitle;

				return onChainPost;
			});

			onChainPosts = await Promise.all(onChainPostsPromise);
			onChainPostsCount = Number(subsquidData?.proposalsConnection?.totalCount || 0);

			if (parentBounties.size > 0) {
				const subsquidRes = await fetchSubsquid({
					network,
					query: GET_PARENT_BOUNTIES_PROPOSER_FOR_CHILD_BOUNTY,
					variables: {
						index_in: Array.from(parentBounties),
						limit: parentBounties.size
					}
				});
				if (subsquidRes && subsquidRes?.data) {
					const subsquidData = subsquidRes?.data;
					if (subsquidData.proposals && Array.isArray(subsquidData.proposals) && subsquidData.proposals.length > 0) {
						const subsquidPosts: any[] = subsquidData?.proposals || [];
						subsquidPosts.forEach((post) => {
							onChainPosts = onChainPosts.map((onChainPost) => {
								if (onChainPost.parent_bounty_index === post.index && post) {
									onChainPost.proposer = post.proposer || post.curator || (post?.preimage ? post?.preimage?.proposer : '');
								}
								return {
									...onChainPost
								};
							});
						});
					}
				}
			}
		}

		const discussionsPostsColRef = postsByTypeRef(network, ProposalType.DISCUSSIONS);
		const postsSnapshotArr = await discussionsPostsColRef.where('isDeleted', '==', false).orderBy('created_at', 'desc').limit(numListingLimit).get();

		let offChainPosts: any[] = [];
		const offChainPostsCount = (await discussionsPostsColRef.where('isDeleted', '==', false).count().get()).data().count;

		const idsSet = new Set<number>();
		postsSnapshotArr.docs.forEach((doc) => {
			if (doc && doc.exists) {
				const data = doc.data();
				if (data) {
					const { topic, topic_id } = data;
					let user_id = data.user_id;
					if (typeof user_id === 'number') {
						idsSet.add(user_id);
					} else {
						const numUserId = Number(user_id);
						if (!isNaN(numUserId)) {
							idsSet.add(numUserId);
							user_id = numUserId;
						}
					}
					offChainPosts.push({
						created_at: data?.created_at?.toDate ? data?.created_at?.toDate() : data?.created_at,
						isSpam: data?.isSpam || false,
						isSpamReportInvalid: data?.isSpamReportInvalid || false,
						post_id: data?.id,
						proposer: '',
						spam_users_count:
							data?.isSpam && !data?.isSpamReportInvalid ? Number(process.env.REPORTS_THRESHOLD || 50) : data?.isSpamReportInvalid ? 0 : data?.spam_users_count || 0,
						title: data?.title,
						topic: topic
							? topic
							: isTopicIdValid(topic_id)
							? {
									id: topic_id,
									name: getTopicNameFromTopicId(topic_id)
							  }
							: getTopicFromType(ProposalType.DISCUSSIONS),
						type: 'Discussions',
						user_id,
						username: data?.username || ''
					});
				}
			}
		});

		const newIds = Array.from(idsSet);

		if (newIds.length > 0) {
			const newIdsLen = newIds.length;
			let lastIndex = 0;
			for (let i = 0; i < newIdsLen; i += 30) {
				lastIndex = i;
				const addressesQuery = await firestore_db
					.collection('addresses')
					.where('user_id', 'in', newIds.slice(i, newIdsLen > i + 30 ? i + 30 : newIdsLen))
					.where('default', '==', true)
					.get();
				addressesQuery.docs.map((doc) => {
					if (doc && doc.exists) {
						const data = doc.data();
						offChainPosts = offChainPosts.map((v) => {
							if (v && v.user_id == data.user_id) {
								return {
									...v,
									proposer: data.address
								};
							}
							return v;
						});
					}
				});
			}
			if (lastIndex <= newIdsLen) {
				const addressesQuery = await firestore_db
					.collection('addresses')
					.where('user_id', 'in', newIds.slice(lastIndex, lastIndex === newIdsLen ? newIdsLen + 1 : newIdsLen))
					.where('default', '==', true)
					.get();
				addressesQuery.docs.map((doc) => {
					if (doc && doc.exists) {
						const data = doc.data();
						offChainPosts = offChainPosts.map((v) => {
							if (v && v.user_id == data.user_id) {
								return {
									...v,
									proposer: data.address
								};
							}
							return v;
						});
					}
				});
			}
		}

		const allPosts = [...onChainPosts, ...offChainPosts];
		let deDupedAllPosts = Array.from(new Set(allPosts));
		deDupedAllPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

		deDupedAllPosts = await getSpamUsersCountForPosts(network, deDupedAllPosts);

		const data: ILatestActivityPostsListingResponse = {
			count: onChainPostsCount + offChainPostsCount,
			posts: deDupedAllPosts.slice(0, numListingLimit)
		};
		return {
			data: JSON.parse(JSON.stringify(data)),
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
}

const handler: NextApiHandler<ILatestActivityPostsListingResponse | { error: string }> = async (req, res) => {
	storeApiKeyUsage(req);

	const { govType, listingLimit = LISTING_LIMIT } = req.query;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ error: 'Invalid network in request header' });

	const { data, error, status } = await getLatestActivityAllPosts({
		govType,
		listingLimit,
		network
	});

	if (error || !data) {
		return res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
};
export default withErrorHandling(handler);
