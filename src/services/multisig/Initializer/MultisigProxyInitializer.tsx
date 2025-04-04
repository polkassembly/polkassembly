// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useUserDetailsSelector } from '~src/redux/selectors';
import useSetupMultisigProxy from '../hooks/useSetupMultisigProxy';

/**
 * @description This component is used to initialize the multisig and proxy addresses for the current user
 * @returns {null}
 */
function MultisigProxyInitializer() {
	const currentUser = useUserDetailsSelector();
	useSetupMultisigProxy({ userAddress: currentUser?.addresses || [] });
	return null;
}

export default MultisigProxyInitializer;
