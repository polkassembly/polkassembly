// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getOnChainAddressDetails } from 'pages/api/v1/getOnChainAddressData';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

// of the Apache-2.0 license. See the LICENSE file for details.
export const checkIsProposer = async (address: string, currentUserAddresses: Array<string>, network: string) => {
	const { data: addressDetail } = await getOnChainAddressDetails(address, network);
	const signatories = addressDetail?.account?.multisig?.multi_account_member;
	if (signatories) {
		const allSignatories = signatories.map((user: { address: string }) => getSubstrateAddress(user.address));
		for (const userAddress of currentUserAddresses) {
			const address = getSubstrateAddress(userAddress) || userAddress;
			if (allSignatories.includes(address)) {
				return true;
			}
		}
		return false;
	}
	return false;
};
