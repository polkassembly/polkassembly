// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import {
	isCustomOpenGovStatusValid,
	isProposalTypeValid,
	isTrackNoValid,
	isValidNetwork
} from '~src/api-utils';
import messages from '~src/util/messages';
import { IPostsListingResponse } from './on-chain-posts';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import {
	ProposalType,
	getStatusesFromCustomStatus,
	getSubsquidProposalType
} from '~src/global/proposalType';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { GET_PROPOSALS_LISTING_COUNT_BY_TYPE } from '~src/queries';

interface IGetOnChainPostsCountParams {
	network: string;
	page?: string | string[] | number;
	trackNo?: string | string[] | number;
	trackStatus?: string | string[];
	proposalType?: string | string[];
}

// Only support for Open Gov
export async function getOnChainPostsCount(
	params: IGetOnChainPostsCountParams
): Promise<IApiResponse<IPostsListingResponse>> {
	try {
		const { network, page, proposalType, trackNo, trackStatus } = params;

		const numPage = Number(page);
		if (isNaN(numPage) || numPage <= 0) {
			throw apiErrorWithStatusCode(`Invalid page "${page}"`, 400);
		}

		const strProposalType = String(proposalType);
		if (!isProposalTypeValid(strProposalType)) {
			throw apiErrorWithStatusCode(
				`The proposal type of the name "${proposalType}" does not exist.`,
				400
			);
		}

		const numTrackNo = Number(trackNo);
		const strTrackStatus = String(trackStatus);
		if (strProposalType === ProposalType.OPEN_GOV) {
			if (!isTrackNoValid(numTrackNo, network)) {
				throw apiErrorWithStatusCode(
					`The OpenGov trackNo "${trackNo}" is invalid.`,
					400
				);
			}
			if (
				trackStatus !== undefined &&
				trackStatus !== null &&
				!isCustomOpenGovStatusValid(strTrackStatus)
			) {
				throw apiErrorWithStatusCode(
					`The Track status of the name "${trackStatus}" is invalid.`,
					400
				);
			}
		}

		const subsquidProposalType = getSubsquidProposalType(
			strProposalType as any
		);

		const postsVariables: any = {
			type_in: subsquidProposalType
		};

		if (strProposalType === ProposalType.OPEN_GOV) {
			postsVariables.trackNumber_in = numTrackNo;
			if (
				strTrackStatus &&
				strTrackStatus !== 'All' &&
				isCustomOpenGovStatusValid(strTrackStatus)
			) {
				postsVariables.status_in = getStatusesFromCustomStatus(
					strTrackStatus as any
				);
			}
		} else if (strProposalType === ProposalType.FELLOWSHIP_REFERENDUMS) {
			if (
				numTrackNo !== undefined &&
				numTrackNo !== null &&
				!isNaN(numTrackNo)
			) {
				postsVariables.trackNumber_in = numTrackNo;
			}
		}

		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_PROPOSALS_LISTING_COUNT_BY_TYPE,
			variables: postsVariables
		});

		const subsquidData = subsquidRes?.data;

		const data: IPostsListingResponse = {
			count: subsquidData.proposalsConnection?.totalCount || 0,
			posts: []
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

// expects optional proposalType, page and listingLimit
const handler: NextApiHandler<
	IPostsListingResponse | { error: string }
> = async (req, res) => {
	const { page = 1, trackNo, trackStatus, proposalType } = req.query;

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network))
		res.status(400).json({ error: 'Invalid network in request header' });
	const { data, error, status } = await getOnChainPostsCount({
		network,
		page,
		proposalType,
		trackNo,
		trackStatus
	});

	if (error || !data) {
		res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	} else {
		res.status(status).json(data);
	}
};

export default withErrorHandling(handler);
