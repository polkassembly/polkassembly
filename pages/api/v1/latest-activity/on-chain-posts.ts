// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid, isTrackNoValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { GET_PROPOSALS_LISTING_BY_TYPE, GET_PROPOSALS_LISTING_BY_TYPE_FOR_COLLECTIVES, GET_PROPOSALS_LISTING_FOR_POLYMESH } from '~src/queries';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import messages from '~src/util/messages';
import { fetchSubsquare, getSpamUsersCountForPosts } from '../listing/on-chain-posts';
import { getSubSquareContentAndTitle } from '../posts/subsqaure/subsquare-content';

export interface ILatestActivityPostsListingResponse {
    count: number;
    posts: any;
}

interface IGetLatestActivityOnChainPostsParams {
	network: string;
	listingLimit: string | string[] | number;
	proposalType: ProposalType | string | string[];
	trackNo?: number | string | string[];
}

export async function getLatestActivityOnChainPosts(params: IGetLatestActivityOnChainPostsParams): Promise<IApiResponse<ILatestActivityPostsListingResponse>> {
	try {
		const { network, proposalType, trackNo, listingLimit } = params;

		const numListingLimit = Number(listingLimit);
		if (isNaN(numListingLimit)) {
			throw apiErrorWithStatusCode( `Invalid listingLimit "${listingLimit}"`, 400);
		}

		const strProposalType = String(proposalType);
		if (!isProposalTypeValid(strProposalType)) {
			throw apiErrorWithStatusCode(`The proposal type of the name "${proposalType}" does not exist.`, 400);
		}

		const numTrackNo = Number(trackNo);
		if (strProposalType === ProposalType.OPEN_GOV) {
			if (!isTrackNoValid(numTrackNo, network)) {
				throw apiErrorWithStatusCode(`The OpenGov trackNo "${trackNo}" is invalid.`, 400);
			}
		}
		const subsquidProposalType = getSubsquidProposalType(proposalType as any);

		const postsVariables: any = {
			limit: numListingLimit,
			type_in: subsquidProposalType
		};

		if (proposalType && [ProposalType.OPEN_GOV.toString(), ProposalType.FELLOWSHIP_REFERENDUMS.toString()].includes(strProposalType)) {
			postsVariables.trackNumber_in = [numTrackNo];
		}

		let query = GET_PROPOSALS_LISTING_BY_TYPE;
		if (network === 'collectives') {
			query = GET_PROPOSALS_LISTING_BY_TYPE_FOR_COLLECTIVES;
		}
		if(network === 'polymesh'){
			query = GET_PROPOSALS_LISTING_FOR_POLYMESH;
		}

		let subsquidRes: any = {};
		try {
			subsquidRes = await fetchSubsquid({
				network,
				query,
				variables: postsVariables
			});
		} catch (error) {
			const data = await fetchSubsquare(network, 10, Number(1), Number(trackNo));
			if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
				subsquidRes['data'] = {
					'proposals': data.items.map((item: any) => {
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
					'proposalsConnection': {
						totalCount: data.total
					}
				};
			}
		}

		const subsquidData = subsquidRes?.data;
		const subsquidPosts: any[] = subsquidData?.proposals || [];

		const postsPromise = subsquidPosts?.map(async (subsquidPost) => {
			const { createdAt, proposer, curator, preimage, type, index, hash, method, origin, trackNumber, group, description } = subsquidPost;
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
			let status = subsquidPost.status;
			if (status === 'DecisionDepositPlaced') {
				const statuses = (subsquidPost?.statusHistory || []) as { status: string }[];
				statuses.forEach((obj) => {
					if (obj.status === 'Deciding') {
						status = 'Deciding';
					}
				});
			}
			const postId = proposalType === ProposalType.TIPS?  hash: index;
			const postDocRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(postId));
			const postDoc = await postDocRef.get();
			if (postDoc && postDoc.exists) {
				const data = postDoc?.data();
				if (data) {
					let subsquareTitle = '';
					if(data?.title === '' || data?.title === method || data.title === null){
						const res = await getSubSquareContentAndTitle(strProposalType as ProposalType, network, postId);
						subsquareTitle = res?.title;
					}
					return {
						created_at: createdAt,
						description,
						hash,
						isSpam: data?.isSpam || false,
						isSpamReportInvalid: data?.isSpamReportInvalid || false,
						method: method || preimage?.method,
						origin,
						post_id: postId,
						proposer: proposer || preimage?.proposer || otherPostProposer || curator,
						spam_users_count: data?.isSpam && !data?.isSpamReportInvalid ? Number(process.env.REPORTS_THRESHOLD || 50) : data?.isSpamReportInvalid ? 0 : data?.spam_users_count || 0,
						status: status,
						title: data?.title || subsquareTitle,
						track_number: trackNumber,
						type
					};
				}
			}

			let subsquareTitle =  '';
			const res = await getSubSquareContentAndTitle(strProposalType as ProposalType, network, postId);
			subsquareTitle = res?.title;

			return {
				created_at: createdAt,
				description,
				hash,
				method: method || preimage?.method,
				origin,
				post_id: postId,
				proposer: proposer || preimage?.proposer || otherPostProposer || curator,
				status: status,
				title: subsquareTitle,
				track_number: trackNumber,
				type
			};
		});

		const postsResults = await Promise.allSettled(postsPromise);
		let posts = postsResults.reduce((prev, post) => {
			if (post && post.status === 'fulfilled') {
				prev.push(post.value);
			}
			return prev;
		}, [] as any[]);

		posts = await getSpamUsersCountForPosts(network, posts, strProposalType);

		const data: ILatestActivityPostsListingResponse = {
			count: Number(subsquidData?.proposalsConnection.totalCount),
			posts
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
	const { trackNo, proposalType = ProposalType.DEMOCRACY_PROPOSALS, listingLimit = LISTING_LIMIT } = req.query;

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) return res.status(400).json({ error: 'Invalid network in request header' });

	const { data, error, status } = await getLatestActivityOnChainPosts({
		listingLimit,
		network,
		proposalType,
		trackNo
	});

	if(error || !data) {
		return res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	}else {
		return res.status(status).json(data);
	}
};
export default withErrorHandling(handler);