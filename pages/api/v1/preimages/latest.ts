// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import { GET_LATEST_PREIMAGES } from '~src/queries';
import { IApiResponse } from '~src/types';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';
import fetchSubsquid from '~src/util/fetchSubsquid';
import messages from '~src/util/messages';

export interface IPreimageData {
    hash: string;
    deposit: string;
    createdAtBlock: number;
    length: number;
    method: string;
    proposedCall: any;
    proposer: string;
    section: string;
    status: string;
    message?: string;
}

interface IPrams{
  hash: string;
  network: string;
}
export async function getLatestPreimage(params:IPrams ): Promise<IApiResponse<IPreimageData | MessageType>> {
	const { hash , network } = params;

	try {
		if(!network || !isValidNetwork(network)) {
			throw apiErrorWithStatusCode('Invalid network in request header', 400);
		}
		if(!hash) {
			throw apiErrorWithStatusCode('Invalid hash', 400);
		}
		const subsquidRes = await fetchSubsquid({
			network,
			query: GET_LATEST_PREIMAGES,
			variables: { hash_eq: hash }
		});

		if (subsquidRes && subsquidRes.data && subsquidRes.data.preimages) {
			const preimages = subsquidRes.data.preimages;
			if (preimages && Array.isArray(preimages) && preimages[0]) {
				const preimage: IPreimageData = preimages[0];
				return {
					data: JSON.parse(JSON.stringify(preimage)),
					error: null,
					status: 200
				};
			}
		}
		return {
			data: null,
			error: 'No preimage found',
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

const handler: NextApiHandler<IPreimageData | MessageType > = async (req, res) => {
	const network = String(req.headers['x-network']);
	const { hash } = req.query;
	if(!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });
	if(!hash) return res.status(400).json({ message: 'Invalid hash' });

	const { data, error, status } = await getLatestPreimage({
		hash: String(hash),
		network
	});

	if(error || !data) {
		res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	}else {
		res.status(status).json(data);
	}
};
export default withErrorHandling(handler);