// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isCustomOpenGovStatusValid, isProposalTypeValid, isSortByValid, isTrackNoValid, isValidNetwork } from '~src/api-utils';
import { networkDocRef, postsByTypeRef } from '~src/api-utils/firestore_refs';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { getFirestoreProposalType, getStatusesFromCustomStatus, getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { sortValues } from '~src/global/sortOptions';
import {
	GET_ALLIANCE_ANNOUNCEMENTS,
	GET_BOUNTY_REWARDS_BY_IDS,
	GET_PARENT_BOUNTY_DETAILS,
	GET_PARENT_BOUNTY_REQUESTED_AMOUNT_FOR_CHILD_BOUNTY,
	GET_POLYMESH_PROPOSAL_LISTING_BY_TYPE_AND_INDEXES,
	GET_PROPOSALS_LISTING_BY_TYPE,
	GET_PROPOSALS_LISTING_BY_TYPE_FOR_COLLECTIVES,
	GET_PROPOSALS_LISTING_BY_TYPE_FOR_ZEITGEIST,
	GET_PROPOSALS_LISTING_FOR_POLYMESH,
	GET_PROPOSAL_LISTING_BY_TYPE_AND_INDEXES,
	GET_PROPOSAL_LISTING_BY_TYPE_AND_INDEXES_FOR_ZEITGEIST
} from '~src/queries';
import { ESentiments, IApiResponse, IBeneficiary } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { getTopicFromType, getTopicNameFromTopicId, isTopicIdValid } from '~src/util/getTopicFromType';
import messages from '~src/util/messages';
import { checkReportThreshold, getReactions } from '../posts/on-chain-post';
import { network as AllNetworks } from '~src/global/networkConstants';
import { splitterAndCapitalizer } from '~src/util/splitterAndCapitalizer';
import { getSubSquareContentAndTitle } from '../posts/subsqaure/subsquare-content';
import { convertAnyHexToASCII } from '~src/util/decodingOnChainInfo';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { getAllchildBountiesFromBountyIndex } from '../child_bounties/getAllChildBounties';
import getAscciiFromHex from '~src/util/getAscciiFromHex';
import { getTimeline } from '~src/util/getTimeline';
import { getProposerAddressFromFirestorePostData } from '~src/util/getProposerAddressFromFirestorePostData';
import preimageToBeneficiaries from '~src/util/preimageToBeneficiaries';
import console_pretty from '~src/api-utils/console_pretty';

export const fetchSubsquare = async (network: string, limit: number, page: number, track?: number) => {
	try {
		let res: Response;
		if (track) {
			res = await fetch(`https://${network}.subsquare.io/api/gov2/tracks/${track}/referendums?page=${page}&page_size=${limit}`);
		} else {
			res = await fetch(`https://${network}.subsquare.io/api/gov2/referendums?page=${page}&page_size=${limit}`);
		}
		return await res.json();
	} catch (error) {
		return [];
	}
};

export const fetchLatestSubsquare = async (network: string) => {
	try {
		const res = await fetch(`https://${network}.subsquare.io/api/gov2/referendums`);
		return await res.json();
	} catch (error) {
		return [];
	}
};
export interface IPostListing {
	user_id?: string | number;
	comments_count: number;
	created_at: string;
	end?: number;
	hash?: string;
	post_id: string | number;
	description?: string;
	votesCount?: number;
	post_reactions: {
		'👍': number;
		'👎': number;
	};
	proposedCall?: any;
	requestedAmount?: string;
	proposer?: string;
	curator?: string;
	proposalHashBlock?: string | null;
	parent_bounty_index?: number;
	parent_bounty_requested_amount: string;
	method?: string;
	status?: string;
	status_history: {
		block: number;
		status: string;
	}[];
	title: string;
	tally?: {
		ayes: string;
		nays: string;
	};
	topic: {
		id: number;
		name: string;
	};
	type?: string;
	username?: string;
	tags?: string[] | [];
	gov_type?: 'gov_1' | 'open_gov';
	timeline?: any;
	track_no?: number | null;
	isSpam?: boolean;
	identity?: string | null;
	isSpamReportInvalid?: boolean;
	spam_users_count?: number;
	beneficiaries?: IBeneficiary[];
	allChildBounties?: any[];
	assetId?: string | null;
	reward?: string;
	content?: string;
	includeContent?: boolean;
	isVoted?: boolean;
	highestSentiment?: { sentiment: ESentiments; percentage: number } | null;
}

export interface IPostsListingResponse {
	count: number;
	posts: IPostListing[];
}

export function getGeneralStatus(status: string) {
	switch (status) {
		case 'DecisionDepositPlaced':
			return 'Deciding';
	}
	return status;
}

interface IGetOnChainPostsParams {
	preimageSection?: string;
	network: string;
	page?: string | string[] | number;
	sortBy: string | string[];
	trackNo?: string | string[] | number;
	listingLimit: string | string[] | number;
	trackStatus?: string | string[];
	proposalType?: string | string[];
	postIds?: string | string[] | number[];
	filterBy?: string[] | [];
	proposalStatus?: string | string[];
	includeContent?: boolean;
	getBountyReward?: boolean;
}

export async function getOnChainPosts(params: IGetOnChainPostsParams): Promise<IApiResponse<IPostsListingResponse>> {
	try {
		const {
			listingLimit,
			network,
			page,
			proposalType,
			sortBy,
			trackNo,
			trackStatus,
			postIds,
			filterBy,
			proposalStatus,
			preimageSection,
			includeContent = false,
			getBountyReward = false
		} = params;

		const numListingLimit = Number(listingLimit);
		if (isNaN(numListingLimit)) {
			throw apiErrorWithStatusCode(`Invalid listingLimit "${listingLimit}"`, 400);
		}

		const numPage = Number(page);
		if (isNaN(numPage) || numPage <= 0) {
			throw apiErrorWithStatusCode(`Invalid page "${page}"`, 400);
		}

		const strSortBy = String(sortBy);
		if (!isSortByValid(strSortBy)) {
			throw apiErrorWithStatusCode('sortBy is invalid', 400);
		}

		let strProposalType = String(proposalType);
		if (!isProposalTypeValid(strProposalType)) {
			throw apiErrorWithStatusCode(`The proposal type of the name "${proposalType}" does not exist.`, 400);
		}

		if (filterBy && Array.isArray(filterBy) && filterBy.length > 0) {
			const onChainCollRef = postsByTypeRef(network, strProposalType as ProposalType);
			let order: 'desc' | 'asc' = sortBy === sortValues.NEWEST ? 'desc' : 'asc';
			let orderedField = 'created_at';
			if (sortBy === sortValues.COMMENTED) {
				order = 'desc';
				orderedField = 'last_comment_at';
			}
			const postsSnapshotArr = await onChainCollRef
				.orderBy(orderedField, order)
				.where('tags', 'array-contains-any', filterBy)
				.limit(Number(listingLimit) || LISTING_LIMIT)
				.offset((Number(page) - 1) * Number(listingLimit || LISTING_LIMIT))
				.get();

			const count = (await onChainCollRef.where('tags', 'array-contains-any', filterBy).count().get()).data().count;
			const postsPromise = postsSnapshotArr.docs.map(async (doc) => {
				if (doc && doc.exists) {
					const docData = doc.data();
					if (docData) {
						let subsquareTitle = '';
						if (docData?.title === '' || docData?.title === undefined) {
							const res = await getSubSquareContentAndTitle(strProposalType, network, docData.id);
							subsquareTitle = res?.title;
						}
						const postDocRef = onChainCollRef.doc(String(docData.id));

						const post_reactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
						const reactions = getReactions(post_reactionsQuerySnapshot);
						const post_reactions = {
							'👍': reactions['👍']?.count || 0,
							'👎': reactions['👎']?.count || 0
						};

						const commentsQuerySnapshot = await postDocRef.collection('comments').where('isDeleted', '==', false).count().get();

						const created_at = docData.created_at;
						const { topic, topic_id } = docData;

						return {
							comments_count: commentsQuerySnapshot.data()?.count || 0,
							created_at: created_at?.toDate ? created_at?.toDate() : created_at,
							gov_type: docData?.gov_type,
							isSpam: docData?.isSpam || false,
							isSpamReportInvalid: docData?.isSpamReportInvalid || false,
							post_id: docData.id,
							post_reactions,
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
			const posts = await Promise.all(postsPromise);
			const indexMap: any = {};
			const ids = posts.map((post, index) => {
				indexMap[Number(post?.post_id)] = index;
				return Number(post?.post_id);
			});

			const topicFromType = getTopicFromType(proposalType as ProposalType);
			const subsquidProposalType = getSubsquidProposalType(proposalType as any);

			const postsVariables: any = {
				index_in: ids,
				limit: numListingLimit,
				offset: numListingLimit * (numPage - 1),
				type_eq: subsquidProposalType
			};

			if (Array.isArray(proposalStatus) && proposalStatus.length > 0) {
				postsVariables.status_in = proposalStatus;
			}

			if (preimageSection) {
				postsVariables.section_eq = preimageSection;
			}

			let query = GET_PROPOSAL_LISTING_BY_TYPE_AND_INDEXES;
			if (network === 'polymesh') {
				query = GET_POLYMESH_PROPOSAL_LISTING_BY_TYPE_AND_INDEXES;
			}
			if (network === 'zeitgeist') {
				query = GET_PROPOSAL_LISTING_BY_TYPE_AND_INDEXES_FOR_ZEITGEIST;
			}
			const subsquidRes = await fetchSubsquid({
				network,
				query,
				variables: postsVariables
			});
			const subsquidData = subsquidRes?.data;
			const subsquidPosts: any[] = subsquidData?.proposals;
			const parentBountyIndexes: any = {};

			const subsquidPostsPromise = subsquidPosts?.map(async (subsquidPost): Promise<IPostListing> => {
				const { createdAt, end, hash, index, type, proposer, description, group, curator, parentBountyIndex, statusHistory, trackNumber, proposalHashBlock } = subsquidPost;

				if (!subsquidPost?.preimage) {
					subsquidPost.preimage = {
						description: subsquidPost?.proposalArguments?.description,
						method: subsquidPost?.proposalArguments?.method,
						proposedCall: { args: subsquidPost?.proposalArguments?.args, method: subsquidPost?.proposalArguments?.method, section: subsquidPost?.proposalArguments?.section },
						section: subsquidPost?.proposalArguments?.section
					};
					subsquidPost.proposalArguments = null;
				}

				if (proposalType === ProposalType.CHILD_BOUNTIES && typeof parentBountyIndex == 'number') {
					parentBountyIndexes[parentBountyIndex] = 1;
				}

				console_pretty({ parentBountyIndexes });

				let parentBountyRequestedAmount = '0';

				if (parentBountyIndex) {
					const variables = {
						index_eq: parentBountyIndex
					};
					const parentBountyRequestedAmountData = await fetchSubsquid({
						network,
						query: GET_PARENT_BOUNTY_REQUESTED_AMOUNT_FOR_CHILD_BOUNTY,
						variables
					});
					parentBountyRequestedAmount = parentBountyRequestedAmountData?.['data']?.proposals?.[0]?.reward || '0';
				}
				const proposedCall = subsquidPost?.preimage?.proposedCall || null;

				if (proposedCall?.args) {
					proposedCall.args = convertAnyHexToASCII(proposedCall?.args, network) || proposedCall?.args;
				}

				const beneficiariesInfo = preimageToBeneficiaries(proposedCall, network);

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
								index,
								statusHistory,
								type
							}
						],
						isStatus
					);
				} else {
					proposalTimeline = getTimeline(group?.proposals, isStatus) || [];
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
				const status = subsquidPost.status;
				const identity = subsquidPost?.identity || null;
				const tally = subsquidPost.tally;
				const postId = proposalType === ProposalType.TIPS ? hash : index;
				const postDocRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(postId));

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
							const res = await getSubSquareContentAndTitle(strProposalType, network, postId);
							subsquareTitle = res?.title;
							subsquareContent = res?.content;
						}
						const proposer_address = getProposerAddressFromFirestorePostData(data, network);
						const topic = data?.topic;
						const topic_id = data?.topic_id;

						return {
							assetId: beneficiariesInfo?.assetId || null,
							comments_count: commentsQuerySnapshot.data()?.count || 0,
							content: !includeContent ? '' : data.content || subsquareContent || '',
							created_at: createdAt,
							curator,
							description: network === AllNetworks.POLYMESH ? getAscciiFromHex(description) : description || '',
							end,
							gov_type: data.gov_type,
							hash,
							identity,
							isSpam: data?.isSpam || false,
							isSpamReportInvalid: data?.isSpamReportInvalid || false,
							method: subsquidPost?.preimage?.method,
							parent_bounty_index: parentBountyIndex || null,
							parent_bounty_requested_amount: parentBountyRequestedAmount,
							post_id: postId,
							post_reactions,
							proposalHashBlock: proposalHashBlock || null,
							proposer: proposer || subsquidPost?.preimage?.proposer || otherPostProposer || proposer_address || curator,
							requestedAmount: Array.isArray(beneficiariesInfo?.beneficiaries) && beneficiariesInfo?.requested ? beneficiariesInfo?.requested.toString() : undefined,
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
							track_no: !isNaN(trackNumber) ? trackNumber : null,
							type: type || subsquidProposalType,
							user_id: data?.user_id || 1
						};
					}
				}

				let subsquareTitle = '';
				let subsquareContent = '';
				const res = await getSubSquareContentAndTitle(strProposalType, network, postId);
				subsquareTitle = res?.title;
				subsquareContent = res?.content;

				return {
					assetId: beneficiariesInfo?.assetId || null,
					comments_count: commentsQuerySnapshot.data()?.count || 0,
					content: !includeContent ? '' : subsquareContent || '',
					created_at: createdAt,
					curator,
					description: network === AllNetworks.POLYMESH ? getAscciiFromHex(description) : description || '',
					end: end,
					hash: hash || null,
					identity,
					method: subsquidPost?.preimage?.method,
					parent_bounty_index: parentBountyIndex || null,
					parent_bounty_requested_amount: parentBountyRequestedAmount,
					post_id: postId,
					post_reactions,
					proposalHashBlock: proposalHashBlock || null,
					proposer: proposer || subsquidPost?.preimage?.proposer || otherPostProposer || curator || null,
					requestedAmount: Array.isArray(beneficiariesInfo?.beneficiaries) && beneficiariesInfo?.requested ? beneficiariesInfo?.requested.toString() : undefined,
					status: status,
					status_history: statusHistory,
					tally,
					timeline: proposalTimeline,
					title: subsquareTitle || 'Untitled',
					topic: topicFromType,
					track_no: !isNaN(trackNumber) ? trackNumber : null,
					type: type || subsquidProposalType,
					user_id: 1
				};
			});

			const subsquidDataPost = await Promise.all(subsquidPostsPromise);

			const parentBountyDetails: any = {};

			if (Object.keys(parentBountyIndexes)?.length) {
				for (const index of Object.keys(parentBountyIndexes)) {
					const { data } = await getAllchildBountiesFromBountyIndex({ network, parentBountyIndex: Number(index) });
					if (data) {
						parentBountyIndexes[index] = data?.child_bounties;
					}
				}
				const parentBountyIndexesNum = Object.keys(parentBountyIndexes)?.map((index) => Number(index));
				const parentBountiesSubsquidRes = await fetchSubsquid({
					network,
					query: GET_PARENT_BOUNTY_DETAILS,
					variables: { index_in: parentBountyIndexesNum, type: getSubsquidProposalType(ProposalType.BOUNTIES) }
				});
				const parentBountiesSubsquidDetails = parentBountiesSubsquidRes?.['data']?.proposals || [];
				if (parentBountiesSubsquidDetails?.length) {
					parentBountiesSubsquidDetails?.map((item: { index: number; curator: string }) => {
						parentBountyDetails[item?.index] = item?.curator || '';
					});
				}
			}

			if (proposalType === ProposalType.CHILD_BOUNTIES && Object.keys(parentBountyIndexes)?.length) {
				subsquidDataPost.map((post) => {
					if (typeof post?.parent_bounty_index === 'number') {
						return { ...post, allChildBounties: parentBountyIndexes[post?.parent_bounty_index], proposer: post?.proposer || parentBountyDetails[post?.parent_bounty_index] || '' };
					}
					return post;
				});
			}

			const data: IPostsListingResponse = {
				count: count,
				posts: subsquidDataPost
			};

			return {
				data: JSON.parse(JSON.stringify(data)),
				error: null,
				status: 200
			};
		} else {
			const numTrackNo = Number(trackNo);
			const strTrackStatus = String(trackStatus);

			if (strProposalType === ProposalType.OPEN_GOV) {
				if (numTrackNo && !isTrackNoValid(numTrackNo, network)) {
					throw apiErrorWithStatusCode(`The OpenGov trackNo "${trackNo}" is invalid.`, 400);
				}
				if (trackStatus !== undefined && trackStatus !== null && !isCustomOpenGovStatusValid(strTrackStatus)) {
					throw apiErrorWithStatusCode(`The Track status of the name "${trackStatus}" is invalid.`, 400);
				}
			}

			const topicFromType = getTopicFromType(proposalType as ProposalType);

			const subsquidProposalType = getSubsquidProposalType(proposalType as any);

			const orderBy = strSortBy === 'newest' ? 'createdAtBlock_DESC' : 'createdAtBlock_ASC';

			const postsVariables: any = {
				limit: numListingLimit,
				offset: numListingLimit * (numPage - 1),
				orderBy: orderBy,
				type_in: subsquidProposalType
			};

			if (Array.isArray(proposalStatus) && proposalStatus.length > 0) {
				postsVariables.status_in = proposalStatus;
			}

			if (preimageSection) {
				postsVariables.section_eq = preimageSection;
			}

			if (proposalType === ProposalType.OPEN_GOV) {
				strProposalType = 'referendums_v2';
				if (proposalType == ProposalType.OPEN_GOV) {
					if (numTrackNo !== undefined && numTrackNo !== null && !isNaN(numTrackNo)) {
						postsVariables.trackNumber_in = numTrackNo;
					}
					if (strTrackStatus && strTrackStatus !== 'All' && isCustomOpenGovStatusValid(strTrackStatus)) {
						postsVariables.status_in = getStatusesFromCustomStatus(strTrackStatus as any);
						if (Array.isArray(proposalStatus) && proposalStatus.length > 0) {
							postsVariables.status_in = proposalStatus;
						}
					}
				}
			} else if (strProposalType === ProposalType.FELLOWSHIP_REFERENDUMS) {
				if (numTrackNo !== undefined && numTrackNo !== null && !isNaN(numTrackNo)) {
					postsVariables.trackNumber_in = numTrackNo;
				}
			}

			if (postIds && postIds.length > 0) {
				if (proposalType === ProposalType.TIPS) {
					postsVariables['hash_in'] = postIds;
				} else {
					postsVariables['index_in'] = postIds;
				}
			}

			let query;
			if (network === AllNetworks.COLLECTIVES || network === AllNetworks.WESTENDCOLLECTIVES) {
				if (proposalType === ProposalType.ANNOUNCEMENT) {
					query = GET_ALLIANCE_ANNOUNCEMENTS;
				} else {
					query = GET_PROPOSALS_LISTING_BY_TYPE_FOR_COLLECTIVES;
				}
			} else {
				query = GET_PROPOSALS_LISTING_BY_TYPE;
			}
			if (network === AllNetworks.POLYMESH) {
				query = GET_PROPOSALS_LISTING_FOR_POLYMESH;
			}
			if (network === 'zeitgeist') {
				query = GET_PROPOSALS_LISTING_BY_TYPE_FOR_ZEITGEIST;
			}
			let subsquidRes: any = {};
			try {
				subsquidRes = await fetchSubsquid({
					network,
					query: query,
					variables: postsVariables
				});
			} catch (error) {
				const data = await fetchSubsquare(network, Number(listingLimit), Number(page), Number(trackNo));

				if (data?.items && Array.isArray(data.items)) {
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
			const subsquidPosts: any[] = proposalType === ProposalType.ANNOUNCEMENT ? subsquidData?.announcements : subsquidData?.proposals;
			let postsPromise;
			let posts: any[];
			console_pretty(subsquidData[0]);
			if (network === AllNetworks.COLLECTIVES || network === AllNetworks.WESTENDCOLLECTIVES) {
				if (proposalType === ProposalType.ANNOUNCEMENT) {
					postsPromise = subsquidPosts?.map(async (subsquidPost) => {
						const { createdAt, hash, proposer, type, updatedAt, version, cid } = subsquidPost;
						let status = subsquidPost.status;
						if (status === 'DecisionDepositPlaced') {
							const statuses = (subsquidPost?.statusHistory || []) as { status: string }[];
							statuses.forEach((obj) => {
								if (obj.status === 'Deciding') {
									status = 'Deciding';
								}
							});
						}

						const postId = cid;
						const postDocRef = postsByTypeRef(network, proposalType as ProposalType).doc(String(postId));

						const post_reactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
						const reactions = getReactions(post_reactionsQuerySnapshot);

						const post_reactions = {
							'👍': reactions['👍']?.count || 0,
							'👎': reactions['👎']?.count || 0
						};

						const commentsQuerySnapshot = await postDocRef.collection('comments').where('isDeleted', '==', false).count().get();
						const newProposer = proposer || null;
						const postDoc = await postDocRef.get();
						if (postDoc && postDoc.exists) {
							const data = postDoc.data();
							if (data) {
								let subsquareTitle = '';
								let subsquareContent = '';

								if (data?.title === '' || data?.content === '' || data.title === undefined || data?.content === undefined) {
									const res = await getSubSquareContentAndTitle(strProposalType, network, postId);
									subsquareTitle = res?.title;
									subsquareContent = res?.content;
								}
								return {
									cid: cid,
									comments_count: commentsQuerySnapshot.data()?.count || 0,
									content: !includeContent ? '' : data.content || subsquareContent || '',
									created_at: createdAt,
									gov_type: data.gov_type,
									hash,
									isSpam: data?.isSpam || false,
									isSpamReportInvalid: data?.isSpamReportInvalid || false,
									post_id: postId,
									post_reactions,
									proposer: proposer,
									spam_users_count:
										data?.isSpam && !data?.isSpamReportInvalid ? Number(process.env.REPORTS_THRESHOLD || 50) : data?.isSpamReportInvalid ? 0 : data?.spam_users_count || 0,
									status,
									tags: data?.tags || [],
									title: data?.title || subsquareTitle,
									type: type || subsquidProposalType,
									user_id: data?.user_id || 1
								};
							}
						}

						return {
							cid: cid,
							comments_count: commentsQuerySnapshot.data()?.count || 0,
							created_at: createdAt,
							hash: hash || null,
							post_id: postId,
							post_reactions,
							proposer: newProposer,
							status: status,
							type: type || proposalType,
							updated_at: updatedAt,
							user_id: 1,
							version: version
						};
					});
				} else {
					postsPromise = subsquidPosts?.map(async (subsquidPost) => {
						const { createdAt, description, hash, proposer, type, end, index } = subsquidPost;

						const title = splitterAndCapitalizer(subsquidPost.callData?.method || '', '_');

						let status = subsquidPost.status;
						if (status === 'DecisionDepositPlaced') {
							const statuses = (subsquidPost?.statusHistory || []) as { status: string }[];
							statuses.forEach((obj) => {
								if (obj.status === 'Deciding') {
									status = 'Deciding';
								}
							});
						}

						const postId = index;
						const postDocRef = postsByTypeRef(network, proposalType as ProposalType).doc(String(postId));

						const post_reactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
						const reactions = getReactions(post_reactionsQuerySnapshot);

						const post_reactions = {
							'👍': reactions['👍']?.count || 0,
							'👎': reactions['👎']?.count || 0
						};
						const commentsQuerySnapshot = await postDocRef.collection('comments').where('isDeleted', '==', false).count().get();
						const newProposer = proposer || null;
						const postDoc = await postDocRef.get();
						if (postDoc && postDoc.exists) {
							const data = postDoc.data();
							if (data) {
								let subsquareTitle = '';
								let subsquareContent = '';
								if (data?.title === '' || data?.title === title || data?.title === undefined) {
									const res = await getSubSquareContentAndTitle(strProposalType, network, postId);
									subsquareTitle = res?.title;
									subsquareContent = res?.content;
								}
								return {
									comments_count: commentsQuerySnapshot.data()?.count || 0,
									content: !includeContent ? '' : data.content || subsquareContent || '',
									created_at: createdAt,
									description: network === AllNetworks.POLYMESH ? getAscciiFromHex(description) : description || '',
									end,
									gov_type: data.gov_type,
									hash,
									isSpam: data?.isSpam || false,
									isSpamReportInvalid: data?.isSpamReportInvalid || false,
									post_id: postId,
									post_reactions,
									proposer: proposer,
									reward: subsquidPost.reward || '',
									spam_users_count:
										data?.isSpam && !data?.isSpamReportInvalid ? Number(process.env.REPORTS_THRESHOLD || 50) : data?.isSpamReportInvalid ? 0 : data?.spam_users_count || 0,
									status,
									tags: data?.tags || [],
									title: data?.title || subsquareTitle || title,
									type: type || subsquidProposalType,
									user_id: data?.user_id || 1
								};
							}
						}

						let subsquareTitle = '';
						let subsquareContent = '';
						const res = await getSubSquareContentAndTitle(strProposalType, network, postId);
						subsquareTitle = res?.title;
						subsquareContent = res?.content;

						return {
							comments_count: commentsQuerySnapshot.data()?.count || 0,
							content: !includeContent ? '' : subsquareContent || '',
							created_at: createdAt,
							description: network === AllNetworks.POLYMESH ? getAscciiFromHex(description) : description || '',
							end: end,
							hash: hash || null,
							post_id: postId,
							post_reactions,
							proposer: newProposer,
							reward: subsquidPost.reward || '',
							status: status,
							title: subsquareTitle || title || '',
							type: type || proposalType,
							user_id: 1
						};
					});
				}
				posts = await Promise.all(postsPromise);
			} else {
				const parentBountyIndexes: any = {};

				const bountyIds = subsquidPosts?.reduce((acc: number[], post: any) => {
					if (!isNaN(post?.preimage?.proposedCall?.args?.bountyId)) {
						acc.push(Number(post?.preimage?.proposedCall?.args?.bountyId));
					}
					return acc;
				}, []);

				const bountyIndexToRewardMap: { [index: number]: string } = {};
				if (getBountyReward && bountyIds) {
					const bountyRewardRes = await fetchSubsquid({
						network,
						query: GET_BOUNTY_REWARDS_BY_IDS,
						variables: {
							index_in: bountyIds
						}
					});

					if (bountyRewardRes?.data?.proposals?.length) {
						bountyRewardRes.data.proposals.forEach((bounty: any) => {
							bountyIndexToRewardMap[bounty.index] = bounty.reward;
						});
					}
				}

				postsPromise = subsquidPosts?.map(async (subsquidPost): Promise<IPostListing> => {
					const { createdAt, end, hash, index, type, proposer, description, group, curator, parentBountyIndex, statusHistory, trackNumber, proposalHashBlock } = subsquidPost;
					if (!subsquidPost?.preimage && subsquidPost?.proposalArguments) {
						subsquidPost.preimage = {
							description: subsquidPost?.proposalArguments?.description,
							method: subsquidPost?.proposalArguments?.method,
							proposedCall: { args: subsquidPost?.proposalArguments?.args, method: subsquidPost?.proposalArguments?.method, section: subsquidPost?.proposalArguments?.section },
							section: subsquidPost?.proposalArguments?.section
						};
						subsquidPost.proposalArguments = null;
					}

					if (proposalType === ProposalType.CHILD_BOUNTIES && typeof parentBountyIndex == 'number') {
						parentBountyIndexes[parentBountyIndex] = 1;
					}

					console_pretty({ parentBountyIndexes });

					let parentBountyRequestedAmount = '0';

					if (parentBountyIndex) {
						const variables = {
							index_eq: parentBountyIndex
						};
						const parentBountyRequestedAmountData = await fetchSubsquid({
							network,
							query: GET_PARENT_BOUNTY_REQUESTED_AMOUNT_FOR_CHILD_BOUNTY,
							variables
						});
						parentBountyRequestedAmount = parentBountyRequestedAmountData?.['data']?.proposals?.[0]?.reward || '0';
					}

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
									index,
									statusHistory: statusHistory || [],
									type
								}
							],
							isStatus
						);
					} else {
						proposalTimeline = getTimeline(group?.proposals || [], isStatus) || [];
					}
					let otherPostProposer = '';
					const method = splitterAndCapitalizer(subsquidPost?.callData?.method || '', '_');
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
					const tally = subsquidPost?.tally;
					const identity = subsquidPost?.identity || null;
					let status = subsquidPost.status;
					if (status === 'DecisionDepositPlaced') {
						const statuses = (subsquidPost?.statusHistory || []) as { status: string }[];
						statuses.forEach((obj) => {
							if (obj.status === 'Deciding') {
								status = 'Deciding';
							}
						});
					}

					const postId = proposalType === ProposalType.TIPS ? hash : index;
					const postDocRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(postId));

					const post_reactionsQuerySnapshot = await postDocRef.collection('post_reactions').get();
					const reactions = getReactions(post_reactionsQuerySnapshot);
					const post_reactions = {
						'👍': reactions['👍']?.count || 0,
						'👎': reactions['👎']?.count || 0
					};

					const commentsQuerySnapshot = await postDocRef.collection('comments').where('isDeleted', '==', false).count().get();
					const postDoc = await postDocRef.get();
					const proposedCall = subsquidPost?.preimage?.proposedCall || null;

					if (proposedCall?.args) {
						proposedCall.args = convertAnyHexToASCII(proposedCall?.args, network) || proposedCall?.args;
					}

					const beneficiariesInfo = preimageToBeneficiaries(proposedCall, network);

					if (postDoc && postDoc.exists) {
						const data = postDoc.data();
						if (data) {
							let subsquareTitle = '';
							let subsquareContent = '';

							if (data?.title === '' || data?.title === method) {
								const res = await getSubSquareContentAndTitle(strProposalType, network, postId);
								subsquareTitle = res?.title;
								subsquareContent = res?.content;
							}

							const proposer_address = getProposerAddressFromFirestorePostData(data, network);
							const topic = data?.topic;
							const topic_id = data?.topic_id;

							let reward = subsquidPost.reward || '';

							// proposal is related to bounty
							if (!isNaN(subsquidPost?.preimage?.proposedCall?.args?.bountyId)) {
								reward = bountyIndexToRewardMap[subsquidPost?.preimage?.proposedCall?.args?.bountyId] || '';
							}

							return {
								assetId: beneficiariesInfo?.assetId || null,
								beneficiaries: beneficiariesInfo?.beneficiaries || [],
								comments_count: commentsQuerySnapshot.data()?.count || 0,
								content: !includeContent ? '' : data.content || subsquareContent || '',
								created_at: createdAt,
								curator,
								description: network === AllNetworks.POLYMESH ? getAscciiFromHex(description) : description || '',
								end,
								gov_type: data.gov_type,
								hash,
								identity,
								isSpam: data?.isSpam || false,
								isSpamReportInvalid: data?.isSpamReportInvalid || false,
								method: subsquidPost?.preimage?.method,
								parent_bounty_index: parentBountyIndex || null,
								parent_bounty_requested_amount: parentBountyRequestedAmount,
								post_id: postId,
								post_reactions,
								proposalHashBlock: proposalHashBlock || null,
								proposer: proposer || subsquidPost?.preimage?.proposer || otherPostProposer || proposer_address || curator,
								requestedAmount: Array.isArray(beneficiariesInfo?.beneficiaries) && beneficiariesInfo?.requested ? beneficiariesInfo?.requested.toString() : undefined,
								reward,
								spam_users_count:
									data?.isSpam && !data?.isSpamReportInvalid ? Number(process.env.REPORTS_THRESHOLD || 50) : data?.isSpamReportInvalid ? 0 : data?.spam_users_count || 0,
								status,
								status_history: statusHistory,
								tags: data?.tags || [],
								tally,
								timeline: proposalTimeline,
								title: data?.title || subsquareTitle,
								topic: topic
									? topic
									: isTopicIdValid(topic_id)
									? {
											id: topic_id,
											name: getTopicNameFromTopicId(topic_id)
									  }
									: topicFromType,
								track_no: !isNaN(trackNumber) ? trackNumber : null,
								type: type || subsquidProposalType,
								user_id: data?.user_id || 1
							};
						}
					}

					let subsquareTitle = '';
					let subsquareContent = '';

					const res = await getSubSquareContentAndTitle(strProposalType, network, postId);
					subsquareTitle = res?.title;
					subsquareContent = res?.content;

					let reward = subsquidPost.reward || '';

					// proposal is related to bounty
					if (!isNaN(subsquidPost?.preimage?.proposedCall?.args?.bountyId)) {
						reward = bountyIndexToRewardMap[subsquidPost?.preimage?.proposedCall?.args?.bountyId] || '';
					}

					return {
						assetId: beneficiariesInfo?.assetId || null,
						beneficiaries: beneficiariesInfo?.beneficiaries || [],
						comments_count: commentsQuerySnapshot.data()?.count || 0,
						content: !includeContent ? '' : subsquareContent || '',
						created_at: createdAt,
						curator,
						description: network === AllNetworks.POLYMESH ? getAscciiFromHex(description) : description || '',
						end: end,
						hash: hash || null,
						identity,
						method: subsquidPost?.preimage?.method,
						parent_bounty_index: parentBountyIndex || null,
						parent_bounty_requested_amount: parentBountyRequestedAmount,
						post_id: postId,
						post_reactions,
						proposalHashBlock: proposalHashBlock || null,
						proposer: proposer || subsquidPost?.preimage?.proposer || otherPostProposer || curator || null,
						requestedAmount: Array.isArray(beneficiariesInfo?.beneficiaries) && beneficiariesInfo?.requested ? beneficiariesInfo?.requested.toString() : undefined,
						reward,
						status: status,
						status_history: statusHistory || [],
						tally,
						timeline: proposalTimeline,
						title: subsquareTitle,
						topic: topicFromType,
						track_no: !isNaN(trackNumber) ? trackNumber : null,
						type: type || subsquidProposalType,
						user_id: 1
					};
				});

				const postsResults = await Promise.allSettled(postsPromise);

				const parentBountyDetails: any = {};

				if (Object.keys(parentBountyIndexes)?.length) {
					for (const index of Object.keys(parentBountyIndexes)) {
						const { data } = await getAllchildBountiesFromBountyIndex({ network, parentBountyIndex: Number(index) });
						if (data) {
							parentBountyIndexes[index] = data?.child_bounties;
						}
					}

					const parentBountyIndexesNum = Object.keys(parentBountyIndexes)?.map((index) => Number(index));
					const parentBountiesSubsquidRes = await fetchSubsquid({
						network,
						query: GET_PARENT_BOUNTY_DETAILS,
						variables: { index_in: parentBountyIndexesNum, type: getSubsquidProposalType(ProposalType.BOUNTIES) }
					});
					const parentBountiesSubsquidDetails = parentBountiesSubsquidRes?.['data']?.proposals || [];
					if (parentBountiesSubsquidDetails?.length) {
						parentBountiesSubsquidDetails?.map((item: { index: number; curator: string }) => {
							parentBountyDetails[item?.index] = item?.curator || '';
						});
					}
				}

				posts = postsResults?.reduce((prev, post) => {
					if (post && post.status === 'fulfilled') {
						if (proposalType === ProposalType.CHILD_BOUNTIES && Object.keys(parentBountyIndexes)?.length && typeof post?.value?.parent_bounty_index === 'number') {
							prev.push({
								...post?.value,
								allChildBounties: parentBountyIndexes[post?.value?.parent_bounty_index],
								proposer: post?.value?.proposer || parentBountyDetails[post?.value?.parent_bounty_index] || ''
							});
						} else {
							prev.push(post.value);
						}
					}
					return prev;
				}, [] as any[]);

				posts = await getSpamUsersCountForPosts(network, posts, strProposalType);
			}

			const data: IPostsListingResponse = {
				count: Number(subsquidData?.proposalsConnection?.totalCount || subsquidData?.announcementsConnection?.totalCount || 0),
				posts
			};
			return {
				data: JSON.parse(JSON.stringify(data)),
				error: null,
				status: 200
			};
		}
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
}

export const getSpamUsersCountForPosts = async (network: string, posts: any[], proposalType?: string): Promise<any[]> => {
	const postsMap = new Map();
	posts.forEach((post, index) => {
		if (post) {
			postsMap.set(post.post_id, index);
		}
	});

	const postsIds = Array.from(postsMap.keys());
	if (postsMap.size > 0) {
		const newIdsLen = postsMap.size;
		let lastIndex = 0;
		for (let i = 0; i < newIdsLen; i += 30) {
			lastIndex = i + 30;
			let querySnapshot = networkDocRef(network)
				.collection('reports')
				.where('type', '==', 'post')
				.where('content_id', 'in', postsIds.slice(i, newIdsLen > i + 30 ? i + 30 : newIdsLen))
				.get();
			if (proposalType) {
				querySnapshot = networkDocRef(network)
					.collection('reports')
					.where('type', '==', 'post')
					.where('proposal_type', '==', proposalType)
					.where('content_id', 'in', postsIds.slice(i, newIdsLen > i + 30 ? i + 30 : newIdsLen))
					.get();
			}

			const reportsQuery = await querySnapshot;

			reportsQuery.docs.map((doc) => {
				if (doc && doc.exists) {
					const data = doc.data();
					const index = postsMap.get(data.content_id);
					if (index !== undefined && index !== null) {
						if (posts[index] && (proposalType || data.proposal_type === getFirestoreProposalType(posts[index].type))) {
							posts[index] = {
								...posts[index],
								spam_users_count: posts[index]?.isSpam ? Number(process.env.REPORTS_THRESHOLD || 50) : posts[index]?.isSpamReportInvalid ? 0 : posts[index]?.spam_users_count || 0
							};
						}
					}
				}
			});
		}
		if (lastIndex < newIdsLen) {
			let querySnapshot = networkDocRef(network)
				.collection('reports')
				.where('type', '==', 'post')
				.where('content_id', 'in', postsIds.slice(lastIndex, lastIndex === newIdsLen ? newIdsLen + 1 : newIdsLen))
				.get();
			if (proposalType) {
				querySnapshot = networkDocRef(network)
					.collection('reports')
					.where('type', '==', 'post')
					.where('proposal_type', '==', proposalType)
					.where('content_id', 'in', postsIds.slice(lastIndex, lastIndex === newIdsLen ? newIdsLen + 1 : newIdsLen))
					.get();
			}
			const reportsQuery = await querySnapshot;
			reportsQuery.docs.map((doc) => {
				if (doc && doc.exists) {
					const data = doc.data();
					const index = postsMap.get(data.content_id);
					if (index !== undefined && index !== null) {
						if (posts[index] && (proposalType || data.proposal_type === getFirestoreProposalType(posts[index].type))) {
							posts[index] = {
								...posts[index],
								spam_users_count: Number(posts[index].spam_users_count || 0) + 1
							};
						}
					}
				}
			});
		}
	}

	return posts.map((post) => {
		// marked as spam in the db by the team directly
		if (post?.isSpam) {
			const threshold = process.env.REPORTS_THRESHOLD || 50;
			post.spam_users_count = Number(threshold);
		} else {
			post.spam_users_count = checkReportThreshold(post.spam_users_count);
		}

		if (post?.isSpamReportInvalid) {
			post.spam_users_count = 0;
		}

		return post;
	});
};

// expects optional proposalType, page and listingLimit
const handler: NextApiHandler<IPostsListingResponse | { error: string }> = async (req, res) => {
	storeApiKeyUsage(req);

	const {
		page = 1,
		trackNo,
		trackStatus,
		proposalType,
		sortBy = sortValues.NEWEST,
		listingLimit = LISTING_LIMIT,
		filterBy,
		proposalStatus,
		preimageSection,
		includeContent = false,
		getBountyReward = false
	} = req.query;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ error: 'Invalid network in request header' });

	const postIds = req.body.postIds;

	const { data, error, status } = await getOnChainPosts({
		filterBy: filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))) ? JSON.parse(decodeURIComponent(String(filterBy))) : [],
		getBountyReward: Boolean(getBountyReward),
		includeContent: Boolean(includeContent),
		listingLimit,
		network,
		page,
		postIds,
		preimageSection: preimageSection ? String(preimageSection) : '',
		proposalStatus: proposalStatus && Array.isArray(JSON.parse(decodeURIComponent(String(proposalStatus)))) ? JSON.parse(decodeURIComponent(String(proposalStatus))) : [],
		proposalType,
		sortBy,
		trackNo,
		trackStatus
	});

	if (error || !data) {
		return res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	} else {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
