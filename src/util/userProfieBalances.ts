// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';

interface Props {
    address: string;
    api: any;
    apiReady: any;
    setBalance: (pre: string) => void;
    setLockBalance?: (pre: string) => void;
    setTransferableBalance?: (pre: string) => void;
    network: string;
}

const userProfileBalances = ({
    address,
    api,
    apiReady,
    network,
    setBalance,
    setLockBalance,
    setTransferableBalance,
}: Props) => {
    if (!api || !apiReady || !address) return;

    if (['genshiro'].includes(network)) {
        api.query.eqBalances
            .account(address, { '0': 1734700659 })
            .then((result: any) => {
                setBalance(result.toHuman()?.Positive?.toString() || '0');
            })
            .catch((e: any) => console.error(e));
    } else if (['equilibrium'].includes(network)) {
        api.query.system
            .account(address)
            .then((result: any) => {
                const locked =
                    result
                        .toHuman()
                        .data?.V0?.lock?.toString()
                        .replaceAll(',', '') || '0';
                const positive =
                    result
                        .toHuman()
                        .data?.V0?.balance?.[0]?.[1]?.Positive?.toString()
                        .replaceAll(',', '') || '0';
                if (new BN(positive).cmp(new BN(locked))) {
                    setBalance(
                        new BN(positive).sub(new BN(locked)).toString() || '0',
                    );
                    setLockBalance && setLockBalance(locked);
                } else {
                    setBalance(positive);
                }
            })
            .catch((e: any) => console.error(e));
    } else {
        api.query.system
            .account(address)
            .then((result: any) => {
                if (
                    result.data.free &&
                    result.data?.free?.toBigInt() >=
                        result.data?.frozen?.toBigInt()
                ) {
                    setTransferableBalance &&
                        setTransferableBalance(
                            (
                                result.data?.free?.toBigInt() -
                                result.data?.frozen?.toBigInt()
                            ).toString() || '0',
                        );
                    setLockBalance &&
                        setLockBalance(
                            result.data?.frozen?.toBigInt().toString(),
                        );
                    setBalance(result.data?.free?.toBigInt().toString());
                } else {
                    setBalance('0');
                }
            })
            .catch((e: any) => console.error(e));
    }
};
export default userProfileBalances;
