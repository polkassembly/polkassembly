// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
import BN from 'bn.js';
import { poppins } from 'pages/_app';
import React, { useContext, useEffect, useState } from 'react';
import { useApiContext, usePostDataContext } from 'src/context';
import formatBnBalance from 'src/util/formatBnBalance';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';

import { NetworkContext } from '~src/context/NetworkContext';
import { ProposalType } from '~src/global/proposalType';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { formatedBalance } from '~src/util/formatedBalance';
import userProfileBalances from '~src/util/userProfieBalances';

interface Props {
	address: string;
	onChange?: (balance: string) => void;
	isBalanceUpdated?: boolean;
	setAvailableBalance?: (pre: string) => void;
	classname?: string
}

const Balance = ({ address, onChange, isBalanceUpdated, setAvailableBalance, classname }: Props) => {
	const [balance, setBalance] = useState<string>('0');
	const [transferableBalance, setTransferableBalance] = useState<string>('0');
	const { api, apiReady } = useApiContext();
	const [lockBalance, setLockBalance] = useState<string>('0');
	const { network } = useContext(NetworkContext);
	const { postData } = usePostDataContext();
	const unit =`${chainProperties[network]?.tokenSymbol}`;
	const isReferendum = [ProposalType.REFERENDUMS, ProposalType.REFERENDUM_V2, ProposalType.FELLOWSHIP_REFERENDUMS].includes(postData?.postType);
	const isDemocracyProposal = [ProposalType.DEMOCRACY_PROPOSALS].includes(postData?.postType);

	useEffect(() => {
		userProfileBalances({ address, api, apiReady, network, setBalance, setLockBalance, setTransferableBalance });
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady]);

	useEffect(() => {

		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!api || !apiReady || !address) return;

		if (['genshiro'].includes(network)){
			api.query.eqBalances.account(address, { '0': 1734700659 })
				.then((result: any) => {
					setBalance(result.toHuman()?.Positive?.toString() || '0');
					setAvailableBalance &&	setAvailableBalance(result.toHuman()?.Positive?.toString() || '0');
					onChange && onChange(result.toHuman()?.Positive?.toString() || '0');
				})
				.catch(e => console.error(e));
		}
		else if(['equilibrium'].includes(network)){
			api.query.system.account(address)
				.then((result: any) => {
					if(isReferendum){
						setBalance(result.toHuman().data?.V0?.balance?.[0]?.[1]?.Positive?.toString().replaceAll(',', '') || '0');
						setAvailableBalance &&	setAvailableBalance(result.toHuman().data?.V0?.balance?.[0]?.[1]?.Positive?.toString().replaceAll(',', '') || '0');
						onChange && onChange(result.toHuman().data?.V0?.balance?.[0]?.[1]?.Positive?.toString().replaceAll(',', '') || '0');
					}
					else{
						const locked = result.toHuman().data?.V0?.lock?.toString().replaceAll(',', '') || '0';
						const positive = result.toHuman().data?.V0?.balance?.[0]?.[1]?.Positive?.toString().replaceAll(',', '') || '0';
						if(new BN(positive).cmp(new BN(locked))){
							setBalance((new BN(positive).sub(new BN(locked))).toString() || '0');
							setAvailableBalance &&	setAvailableBalance((new BN(positive).sub(new BN(locked))).toString() || '0');
							onChange && onChange((new BN(positive).sub(new BN(locked))).toString() || '0');
						}
						else{
							setBalance(positive);
							setAvailableBalance &&	setAvailableBalance(positive);
							onChange && onChange(positive);
						}
					}
				}).catch(e => console.error(e));
		}
		else{
			api.query.system.account(address)
				.then((result: any) => {
					const frozen = result.data?.miscFrozen?.toBigInt() || result.data?.frozen?.toBigInt() || BigInt(0);
					const reserved = result.data?.reserved?.toBigInt() || BigInt(0);
					if(isReferendum){
						setBalance(result.data?.free?.toString() || '0');
						setAvailableBalance &&	setAvailableBalance(result.data?.free?.toString() || '0');
						onChange && onChange(result.data?.free?.toString() || '0');
					}
					else if(isDemocracyProposal && result.data.free && result.data?.free?.toBigInt() >= frozen){
						setBalance((result.data?.free?.toBigInt() + reserved).toString()  || '0');
						setAvailableBalance && setAvailableBalance((result.data?.free?.toBigInt() + reserved - frozen).toString()  || '0');
						onChange && onChange((result.data?.free?.toBigInt() + reserved).toString()  || '0');
					}
					else if (result.data.free && result.data?.free?.toBigInt() >= frozen){
						setBalance((result.data?.free?.toBigInt() - frozen).toString() || '0');
						setAvailableBalance &&	setAvailableBalance((result.data?.free?.toBigInt() - frozen).toString() || '0');
						onChange && onChange((result.data?.free?.toBigInt() - frozen).toString() || '0');
					}
					else{
						setBalance('0');
						setAvailableBalance && setAvailableBalance('0');
						onChange && onChange('0');
					}
				})
				.catch(e => console.error(e));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady, isReferendum, isBalanceUpdated]);

	return (
		<div className={ `${poppins.className} ${poppins.variable} text-xs ml-auto text-[#576D8B] tracking-[0.0025em] font-normal mr-[2px] ${classname}`}>
	Available<HelperTooltip className="mx-1" text={<div className=""><span>Transferable Balance: {formatedBalance(transferableBalance, unit)} {unit}</span><br/><span>Locked Balance: {lockBalance} {unit}</span></div>}/>: <span className='text-pink_primary'>{formatBnBalance(balance, { numberAfterComma: 2, withUnit: true }, network)}</span>
		</div>
	);
};

export default Balance;