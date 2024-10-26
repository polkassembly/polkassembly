// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { network as AllNetworks } from '~src/global/networkConstants';
interface IArgs {
	network: string;
}
const getIdentityRegistrarIndex = ({ network }: IArgs) => {
	switch (network) {
		case AllNetworks.POLKADOT:
			return 3;
		case AllNetworks.KUSAMA:
			return 5;
		case AllNetworks.POLKADEX:
			return 4;
		default:
			return null;
	}
};

export default getIdentityRegistrarIndex;
