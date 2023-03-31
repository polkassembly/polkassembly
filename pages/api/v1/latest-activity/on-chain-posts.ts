// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isProposalTypeValid, isTrackNoValid, isValidNetwork } from '~src/api-utils';
import { postsByTypeRef } from '~src/api-utils/firestore_refs';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { getSubsquidProposalType, ProposalType } from '~src/global/proposalType';
import { GET_PROPOSALS_LISTING_BY_TYPE } from '~src/queries';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import messages from '~src/util/messages';

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

		let strProposalType = String(proposalType);
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

		if (proposalType === ProposalType.OPEN_GOV) {
			strProposalType = 'referendums_v2';
			postsVariables.trackNumber_in = numTrackNo;
		}

		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_PROPOSALS_LISTING_BY_TYPE,
			variables: postsVariables
		});

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
				const decidingIndex = statuses.findIndex((status) => status && status.status === 'Deciding');
				if (decidingIndex >= 0) {
					const decisionDepositPlacedIndex = statuses.findIndex((status) => status && status.status === 'DecisionDepositPlaced');
					if (decisionDepositPlacedIndex >=0 && decidingIndex < decisionDepositPlacedIndex) {
						status = 'Deciding';
					}
				}
			}
			const postId = proposalType === ProposalType.TIPS?  hash: index;
			const postDocRef = postsByTypeRef(network, strProposalType as ProposalType).doc(String(postId));
			const postDoc = await postDocRef.get();
			if (postDoc && postDoc.exists) {
				const data = postDoc?.data();
				if (data) {
					return {
						created_at: createdAt,
						description,
						hash,
						method: method || preimage?.method,
						origin,
						post_id: postId,
						proposer: proposer || preimage?.proposer || otherPostProposer || curator,
						status: status,
						title: data?.title || null,
						track_number: trackNumber,
						type
					};
				}
			}
			return {
				created_at: createdAt,
				description,
				hash,
				method: method || preimage?.method,
				origin,
				post_id: postId,
				proposer: proposer || preimage?.proposer || otherPostProposer || curator,
				status: status,
				title: '',
				track_number: trackNumber,
				type
			};
		});

		const posts = await Promise.all(postsPromise);

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
	if(!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });

	const { data, error, status } = await getLatestActivityOnChainPosts({
		listingLimit,
		network,
		proposalType,
		trackNo
	});

	if(error || !data) {
		res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	}else {
		res.status(status).json(data);
	}
};
export default withErrorHandling(handler);