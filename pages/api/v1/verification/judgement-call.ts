// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

interface Props{
	identityHash: string;
	userAddress: string;
	network: string;
}

export async function getJudgementCall(params: Props) : Promise<Response> {
	const { network, identityHash, userAddress } = params;

	if(!network || !isValidNetwork(network)) throw apiErrorWithStatusCode(messages.INVALID_NETWORK , 400);

if(!identityHash || !userAddress) throw apiErrorWithStatusCode('Invalid identityHash or userAddress', 400);

	const response = await fetch('https://us-central1-individual-node-watcher.cloudfunctions.net/judgementCall', {
		body: JSON.stringify({ identityHash, userAddress }),
		headers: {
			'Authorization': `${process.env.IDENTITY_JUDGEMENT_AUTH}`,
			'Content-Type': 'application/json'
		},
		method: 'POST'
	});

	return response;
}

const handler: NextApiHandler<{hash: string} | MessageType> = async (req, res) => {
  const network = String(req.headers['x-network']);
  const { identityHash, userAddress } = req.query;

	const result = await getJudgementCall({
		identityHash: String(identityHash),
		network,
		userAddress: String(userAddress)
	});

	if( result.status === 200){
		return res.status(200).json(result as any);
	}else{
		console.log(result);
		return res.status(500).json(result as any);
	}
};
export default withErrorHandling(handler);