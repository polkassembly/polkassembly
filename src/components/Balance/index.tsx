// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
import BN from 'bn.js';
import React, { useContext, useEffect, useState } from 'react';
import { useApiContext, usePostDataContext } from 'src/context';
import formatBnBalance from 'src/util/formatBnBalance';

import { NetworkContext } from '~src/context/NetworkContext';
import { ProposalType } from '~src/global/proposalType';

interface Props {
	address: string
	onChange?: (balance: string) => void;
	isBalanceUpdated?: boolean;
}

const Balance = ({ address, onChange, isBalanceUpdated }: Props) => {
	const [balance, setBalance] = useState<string>('0');
	const { api, apiReady } = useApiContext();
	const { network } = useContext(NetworkContext);
	const { postData } = usePostDataContext();

	const isReferendum = postData?.postType === ProposalType.REFERENDUMS;

	useEffect(() => {
		if (!api || !apiReady || !address) return;

		if (['genshiro'].includes(network)){
			api.query.eqBalances.account(address, { '0': 1734700659 })
				.then((result: any) => {
					setBalance(result.toHuman()?.Positive?.toString() || '0');
					onChange && onChange(result.toHuman()?.Positive?.toString() || '0');
				})
				.catch(e => console.error(e));

		}
		else if(['equilibrium'].includes(network)){
			api.query.system.account(address)
				.then((result: any) => {
					if(isReferendum){
						setBalance(result.toHuman().data?.V0?.balance?.[0]?.[1]?.Positive?.toString().replaceAll(',', '') || '0');
						onChange && onChange(result.toHuman().data?.V0?.balance?.[0]?.[1]?.Positive?.toString().replaceAll(',', '') || '0');
					}
					else{
						const locked = result.toHuman().data?.V0?.lock?.toString().replaceAll(',', '') || '0';
						const positive = result.toHuman().data?.V0?.balance?.[0]?.[1]?.Positive?.toString().replaceAll(',', '') || '0';
						if(new BN(positive).cmp(new BN(locked))){
							setBalance((new BN(positive).sub(new BN(locked))).toString() || '0');
							onChange && onChange((new BN(positive).sub(new BN(locked))).toString() || '0');
						}
						else{
							setBalance(positive);
							onChange && onChange(positive);
						}
					}
				}).catch(e => console.error(e));
		}
		else{
			api.query.system.account(address)
				.then((result: any) => {
					if(isReferendum){
						setBalance(result.data?.free?.toString() || '0');
						onChange && onChange(result.data?.free?.toString() || '0');
					}
					else if (result.data.free && result.data?.free?.toBigInt() >= result.data?.miscFrozen?.toBigInt()){
						setBalance((result.data?.free?.toBigInt() - result.data?.miscFrozen?.toBigInt()).toString() || '0');
						onChange && onChange((result.data?.free?.toBigInt() - result.data?.miscFrozen?.toBigInt()).toString() || '0');
					}
					else{
						setBalance('0');
						onChange && onChange('0');
					}
				})
				.catch(e => console.error(e));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady, isReferendum, isBalanceUpdated]);

	return (
		<div className='text-xs ml-auto text-[#53595C]'>
			<span className='font-medium text-[#2E2F30]'>{formatBnBalance(balance, { numberAfterComma: 2, withUnit: true }, network)}</span> available.
		</div>
	);
};

export default Balance;