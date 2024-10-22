// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IUserDetailsStore } from '~src/redux/userDetails/@types';
import getSubstrateAddress from './getSubstrateAddress';

export default function isCurrentlyLoggedInUsingMultisig(currentUser: IUserDetailsStore) {
	const loginSubstrateAddress = getSubstrateAddress(currentUser?.loginAddress);
	const multisigAssociatedSubstrateAddress = getSubstrateAddress(currentUser?.multisigAssociatedAddress || '');

	if (!loginSubstrateAddress || !multisigAssociatedSubstrateAddress) {
		return false;
	}

	return loginSubstrateAddress !== multisigAssociatedSubstrateAddress;
}
