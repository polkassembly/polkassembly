// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';

interface Props {
	address: string;
	api: any;
	apiReady: any;
	network: string;
}

interface IResponse {
	freeBalance: BN;
	lockedBalance: BN;
	transferableBalance: BN;
}
const ZERO_BN = new BN(0);

const userProfileBalances = async ({ address, api, apiReady, network }: Props): Promise<IResponse> => {
	const getBalances = async () => {
		let freeBalance = ZERO_BN;
		let transferableBalance = ZERO_BN;
		let lockedBalance = ZERO_BN;

		const responseObj = {
			freeBalance,
			lockedBalance,
			transferableBalance
		};

		if (!api || !apiReady || !address || !network) {
			return responseObj;
		}
		if (['genshiro'].includes(network)) {
			await api.query.eqBalances
				.account(address, { '0': 1734700659 })
				.then((result: any) => {
					freeBalance = new BN(result.toHuman()?.Positive?.toString());
				})
				.catch((e: any) => console.error(e));
		} else if (['equilibrium'].includes(network)) {
			await api.query.system
				.account(address)
				.then((result: any) => {
					const locked = new BN(result.toHuman().data?.V0?.lock?.toString().replaceAll(',', ''));
					const positive = new BN(result.toHuman().data?.V0?.balance?.[0]?.[1]?.Positive?.toString().replaceAll(',', ''));
					if (new BN(positive).cmp(new BN(locked))) {
						freeBalance = positive.sub(locked);
						lockedBalance = locked;
					} else {
						freeBalance = positive;
					}
				})
				.catch((e: any) => console.error(e));
		} else {
			await api.query.system
				.account(address)
				.then((result: any) => {
					if (result.data.free && result.data?.free?.toBigInt() >= result.data?.frozen?.toBigInt()) {
						transferableBalance = new BN(result.data?.free?.toBigInt() - result.data?.frozen?.toBigInt());
						lockedBalance = new BN(result.data?.frozen?.toBigInt().toString());
						freeBalance = new BN(result.data?.free?.toBigInt().toString());
					} else {
						freeBalance = ZERO_BN;
					}
				})
				.catch((e: any) => console.error(e));
		}

		return {
			freeBalance,
			lockedBalance,
			transferableBalance
		};
	};

	const result = await getBalances();

	return result;
};
export default userProfileBalances;
