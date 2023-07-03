// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';

let counter = 0;
export async function handler(req: NextApiRequest , res:NextApiResponse | any) {
	counter++;
	const network = String(req.headers['x-network']);
	if(!network || !isValidNetwork(network)) {
		res.status(400).json({ error: 'Invalid network in request header' });
	}
	return res.status(200).json({ requests: counter });
}

export default withErrorHandling(handler);
