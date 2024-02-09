// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { TOTAL_DELEGATE_BALANCE } from '~src/queries';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import BN from 'bn.js';
import messages from '~src/auth/utils/messages';
import getEncodedAddress from '~src/util/getEncodedAddress';

const ZERO_BN = new BN(0);
export interface IDelegateBalance {
	totalDelegateBalance: string;
}
interface Props {
	addresses: string[];
}
async function handler(req: NextApiRequest, res: NextApiResponse<IDelegateBalance | MessageType>) {
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { addresses } = req.body as Props;

	if (!addresses.length) return res.status(400).json({ message: messages.INVALID_PARAMS });

	try {
		const data = await fetchSubsquid({
			network,
			query: TOTAL_DELEGATE_BALANCE,
			variables: {
				to_in: addresses.map((item) => getEncodedAddress(item, network)),
				type_eq: isOpenGovSupported(network) ? 'OpenGov' : 'Democracy'
			}
		});
		let totalDelegateBalance = ZERO_BN;
		data['data']?.votingDelegations.map((item: any) => {
			const bnBalance = new BN(item?.balance);
			totalDelegateBalance = totalDelegateBalance.add(bnBalance);
		});
		const delegationStats: IDelegateBalance = {
			totalDelegateBalance: totalDelegateBalance.toString()
		};
		return res.status(200).json(delegationStats as any);
	} catch (error) {
		return res.status(500).json({ message: error });
	}
}

export default withErrorHandling(handler);
