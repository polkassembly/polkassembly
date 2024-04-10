// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
interface Args {
	network: string;
}
const getIdentityRegistrarIndex = ({ network }: Args) => {
	switch (network) {
		case 'polkadot':
			return 3;
		case 'kusama':
			return 5;
		case 'polkadex':
			return 4;
		default:
			return null;
	}
};

export default getIdentityRegistrarIndex;
