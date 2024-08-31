// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
import { useEffect, useState } from 'react';
import BN from 'bn.js';
import { poppins } from 'pages/_app';
import { useApiContext, usePeopleChainApiContext, usePostDataContext } from 'src/context';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import { ProposalType } from '~src/global/proposalType';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { useNetworkSelector } from '~src/redux/selectors';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';
import userProfileBalances from '~src/util/userProfileBalances';
import { parseBalance } from '../Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';

interface Props {
	address: string;
	onChange?: (balance: string) => void;
	isBalanceUpdated?: boolean;
	setAvailableBalance?: (pre: string) => void;
	classname?: string;
	isVoting?: boolean;
	usedInIdentityFlow?: boolean;
}
const ZERO_BN = new BN(0);
const Balance = ({ address, onChange, isBalanceUpdated = false, setAvailableBalance, classname, isVoting = false, usedInIdentityFlow = false }: Props) => {
	const [balance, setBalance] = useState<string>('0');
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const [lockBalance, setLockBalance] = useState<BN>(ZERO_BN);
	const [loading, setLoading] = useState(true);
	const { network } = useNetworkSelector();
	const { postData } = usePostDataContext();
	const isReferendum = [ProposalType.REFERENDUMS, ProposalType.REFERENDUM_V2, ProposalType.FELLOWSHIP_REFERENDUMS].includes(postData?.postType);

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network]?.tokenDecimals,
			unit: chainProperties[network]?.tokenSymbol
		});
	}, [network]);

	useEffect(() => {
		if (!api || !apiReady || !address) return;
		setLoading(true);
		(async () => {
			const balances = await userProfileBalances({
				address: address,
				api: usedInIdentityFlow ? peopleChainApi ?? api : api,
				apiReady: usedInIdentityFlow ? peopleChainApiReady ?? apiReady : apiReady,
				isVoting: isVoting && isReferendum,
				network
			});

			setAvailableBalance?.(balances?.freeBalance?.toString());
			onChange?.(balances?.freeBalance?.toString());
			setLockBalance(balances?.lockedBalance);
			setBalance(balances.freeBalance.toString());
		})();
		setLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady, isReferendum, isBalanceUpdated, peopleChainApi, peopleChainApiReady, usedInIdentityFlow, isVoting]);

	return (
		<div className={`${poppins.className} ${poppins.variable} mr-[2px] text-xs font-normal tracking-[0.0025em] text-[#576D8B] dark:text-blue-dark-medium msm:ml-auto ${classname}`}>
			<span>Free Balance</span>
			<HelperTooltip
				className='mx-1'
				text={
					<div>
						<span>Free Balance: {parseBalance(balance.toString(), 3, true, network)}</span>
						<br />
						<span>Locked Balance: {parseBalance(lockBalance.toString(), 3, true, network)}</span>
					</div>
				}
			/>
			<span>:</span>
			<span className='ml-2 text-pink_primary'>{loading ? <SkeletonButton className='mr-0 h-4 w-5 p-0' /> : parseBalance(balance, 3, true, network)}</span>
		</div>
	);
};

export default Balance;
