// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { GET_PREIMAGES_TABLE_QUERY } from '~src/queries';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import messages from '~src/util/messages';

export interface IPreimagesListing {
  proposedCall?: any;
}

export interface IPreimagesListingResponse {
    count: number;
    preimages: IPreimagesListing[];
}

interface IGetPreimagesParams {
    network: string;
    listingLimit: number | string | string [];
    page: number | string | string [];
}

export async function getPreimages(params: IGetPreimagesParams): Promise<IApiResponse<IPreimagesListingResponse>> {
	try {
		const { network, listingLimit, page } = params;

		const numListingLimit = Number(listingLimit);
		if (isNaN(numListingLimit)) {
			throw apiErrorWithStatusCode(`Invalid listingLimit "${listingLimit}"`, 400);
		}

		const numPage = Number(page);
		if (isNaN(numPage) || numPage <= 0) {
			throw apiErrorWithStatusCode(`Invalid page "${page}"`, 400);
		}
		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_PREIMAGES_TABLE_QUERY,
			variables: {
				limit: numListingLimit,
				offset: numListingLimit * (numPage - 1)
			}
		});

		const subsquidData = subsquidRes?.data;
		const data: IPreimagesListingResponse = {
			count: Number(subsquidData?.preimagesConnection?.totalCount),
			preimages: subsquidData?.preimages || []
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

const handler: NextApiHandler<IPreimagesListingResponse | { error: string }> = async (req, res) => {
	const { page = 1, listingLimit = LISTING_LIMIT } = req.query;

	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) res.status(400).json({ error: 'Invalid network in request header' });

	const { data, error, status } = await getPreimages({
		listingLimit,
		network,
		page
	});

	if(error || !data) {
		res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	}else {
		res.status(status).json(data);
	}
};

export default withErrorHandling(handler);