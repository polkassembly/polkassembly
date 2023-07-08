// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiHandler } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import { GET_LATEST_PREIMAGES } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';

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
}

const handler: NextApiHandler<IPreimageData | MessageType > = async (req, res) => {
	const network = String(req.headers['x-network']);
	const { hash } = req.query;
	if(!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });
	if(!hash) return res.status(400).json({ message: 'Invalid hash' });
	const subsquidRes = await fetchSubsquid({
		network,
		query: GET_LATEST_PREIMAGES,
		variables: { hash_eq: hash }
	});

	if (subsquidRes && subsquidRes.data && subsquidRes.data.preimages) {
		const preimages = subsquidRes.data.preimages;
		if (preimages && Array.isArray(preimages) && preimages[0]) {
			const preimage: IPreimageData = preimages[0];
			return res.status(200).json(preimage);
		}
	}

	return res.status(200).json({ message: 'No preimage found' });
};
export default withErrorHandling(handler);