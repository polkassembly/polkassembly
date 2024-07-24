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
import { IDelegateBalance } from '~src/components/UserProfile/TotalProfileBalances';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import { IDelegation } from '~src/types';

const ZERO_BN = new BN(0);

interface Props {
	addresses: string[];
	trackNo: number;
}
async function handler(req: NextApiRequest, res: NextApiResponse<IDelegateBalance | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const { addresses, trackNo } = req.body as Props;

	if (!addresses.length || isNaN(trackNo)) return res.status(400).json({ message: messages.INVALID_PARAMS });

	try {
		const data = await fetchSubsquid({
			network,
			query: TOTAL_DELEGATE_BALANCE,
			variables: {
				to_in: addresses.map((item) => getEncodedAddress(item, network)),
				track_eq: trackNo,
				type_eq: isOpenGovSupported(network) ? 'OpenGov' : 'Democracy'
			}
		});

		let totalDelegateBalance = ZERO_BN;
		let votingPower = ZERO_BN;

		data['data']?.votingDelegations?.map((item: IDelegation) => {
			const bnBalance = new BN(item?.balance);
			const bnLockedPeriod = new BN(item?.lockPeriod || 0);
			totalDelegateBalance = totalDelegateBalance.add(bnBalance);
			votingPower = item?.lockPeriod ? votingPower.add(bnBalance.mul(bnLockedPeriod)) : votingPower.add(bnBalance.div(new BN('10')));
		});

		const delegationStats: IDelegateBalance = {
			delegateBalance: totalDelegateBalance.toString(),
			votingPower: votingPower.toString()
		};

		return res.status(200).json(delegationStats);
	} catch (error) {
		return res.status(500).json({ message: error });
	}
}

export default withErrorHandling(handler);
