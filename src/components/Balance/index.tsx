// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
import { useEffect, useState } from 'react';
import BN from 'bn.js';
import { dmSans } from 'pages/_app';
import { useApiContext, usePeopleChainApiContext, usePostDataContext } from 'src/context';
import formatBnBalance from 'src/util/formatBnBalance';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import { ProposalType } from '~src/global/proposalType';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { formatedBalance } from '~src/util/formatedBalance';
import { useNetworkSelector } from '~src/redux/selectors';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';
import userProfileBalances from '~src/util/userProfileBalances';

interface Props {
	address: string;
	onChange?: (balance: string) => void;
	isBalanceUpdated?: boolean;
	setAvailableBalance?: (pre: string) => void;
	classname?: string;
	isDelegating?: boolean;
	isVoting?: boolean;
	usedInIdentityFlow?: boolean;
}
const ZERO_BN = new BN(0);
const Balance = ({ address, onChange, isBalanceUpdated = false, setAvailableBalance, classname, isDelegating = false, isVoting = false, usedInIdentityFlow = false }: Props) => {
	const [balance, setBalance] = useState<string>('0');
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const [transferableBalance, setTransferableBalance] = useState<BN>(ZERO_BN);
	const [loading, setLoading] = useState(true);
	const { network } = useNetworkSelector();
	const { postData } = usePostDataContext();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
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
			const { transferableBalance, totalBalance, freeBalance } = await userProfileBalances({
				address: address || '',
				api: usedInIdentityFlow ? peopleChainApi ?? api : api,
				apiReady: usedInIdentityFlow ? peopleChainApiReady ?? apiReady : apiReady,
				network
			});

			if ((isReferendum && isVoting) || isDelegating) {
				const calBal = isDelegating ? freeBalance?.toString() : totalBalance.toString();
				setAvailableBalance?.(calBal || '0');
				setBalance?.(calBal || '0');
				onChange?.(calBal || '0');
			} else {
				setAvailableBalance?.(transferableBalance?.toString());
				setBalance?.(transferableBalance?.toString());
				onChange?.(transferableBalance?.toString());
			}
			setTransferableBalance(transferableBalance);
			setLoading(false);
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady, isReferendum, isBalanceUpdated, peopleChainApi, peopleChainApiReady, usedInIdentityFlow]);

	return (
		<div className={`${dmSans.className} ${dmSans.variable} mr-[2px] text-xs font-normal tracking-[0.0025em] text-[#576D8B] dark:text-blue-dark-medium msm:ml-auto ${classname}`}>
			<span>Free Balance</span>
			<HelperTooltip
				className='mx-1'
				text={
					<div className='text-xs'>
						<span>Free Balance: {formatBnBalance(balance, { numberAfterComma: 2, withUnit: true }, network)}</span>
						<br />
						<span>
							Transferable Balance: {formatedBalance(transferableBalance.toString(), unit, 2)} {unit}
						</span>
					</div>
				}
			/>
			<span>:</span>
			<span className='ml-2 text-pink_primary'>
				{loading ? <SkeletonButton className='mr-0 h-4 w-[20px] p-0' /> : formatBnBalance(balance, { numberAfterComma: 2, withUnit: true }, network)}
			</span>
		</div>
	);
};

export default Balance;
