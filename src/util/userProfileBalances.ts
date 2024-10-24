// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import getEncodedAddress from './getEncodedAddress';

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
	totalBalance: BN;
}
const ZERO_BN = new BN(0);

const userProfileBalances = async ({ address, api, apiReady, network }: Props): Promise<IResponse> => {
	const getBalances = async () => {
		let freeBalance = ZERO_BN;
		let transferableBalance = ZERO_BN;
		let lockedBalance = ZERO_BN;
		let totalBalance = ZERO_BN;

		const responseObj = {
			freeBalance,
			lockedBalance,
			totalBalance,
			transferableBalance
		};

		if (!api || !apiReady || !address || !network) {
			return responseObj;
		}

		const encodedAddr = getEncodedAddress(address, network) || address;
		if (['genshiro'].includes(network)) {
			await api.query.eqBalances
				.account(encodedAddr, { '0': 1734700659 })
				.then((result: any) => {
					freeBalance = new BN(result.toHuman()?.Positive?.toString());
				})
				.catch((e: any) => console.error(e));
		} else if (['equilibrium'].includes(network)) {
			await api.query.system
				.account(encodedAddr)
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
		} else if (network === 'zeitgeist') {
			await api.query.system
				.account(encodedAddr)
				.then((result: any) => {
					if (result.data.free && result.data?.free?.toBigInt() >= result.data?.miscFrozen?.toBigInt()) {
						transferableBalance = new BN(result.data?.free?.toBigInt() - result.data?.miscFrozen?.toBigInt());
						lockedBalance = new BN(result.data?.miscFrozen?.toBigInt().toString());
						freeBalance = new BN(result.data?.free?.toBigInt().toString());
					} else {
						freeBalance = ZERO_BN;
					}
				})
				.catch((e: any) => console.error(e));
		} else {
			if (!api.derive || !api.derive.balances || !api.derive.balances.all) {
				return {
					freeBalance,
					lockedBalance,
					totalBalance,
					transferableBalance
				};
			}

			await api.derive.balances
				.all(encodedAddr)
				.then((result: any) => {
					transferableBalance = new BN((result?.transferable || result.availableBalance).toBigInt().toString());
					lockedBalance = new BN((result.lockedBalance || lockedBalance.toString()).toBigInt().toString());
				})
				.catch((e: any) => console.log(e));

			await api.query.system
				.account(encodedAddr)
				.then((result: any) => {
					const free = result.data?.free?.toBigInt() || BigInt(0);
					const reserved = result.data?.reserved?.toBigInt() || BigInt(0);
					totalBalance = new BN((free + reserved).toString());
					freeBalance = new BN(free.toString());
				})
				.catch((e: any) => console.error(e));
		}

		return {
			freeBalance,
			lockedBalance,
			totalBalance,
			transferableBalance
		};
	};

	const result = await getBalances();

	return result;
};
export default userProfileBalances;
