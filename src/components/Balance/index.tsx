// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-tabs */
import { useEffect, useState } from 'react';
import BN from 'bn.js';
import { poppins } from 'pages/_app';
import { useApiContext, usePeopleChainApiContext, usePostDataContext } from 'src/context';
import formatBnBalance from 'src/util/formatBnBalance';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import { ProposalType } from '~src/global/proposalType';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { formatedBalance } from '~src/util/formatedBalance';
import { useNetworkSelector } from '~src/redux/selectors';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';

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
	const [lockBalance, setLockBalance] = useState<BN>(ZERO_BN);
	const [loading, setLoading] = useState(true);
	const { network } = useNetworkSelector();
	const { postData } = usePostDataContext();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const isReferendum = [ProposalType.REFERENDUMS, ProposalType.REFERENDUM_V2, ProposalType.FELLOWSHIP_REFERENDUMS].includes(postData?.postType);
	const isDemocracyProposal = [ProposalType.DEMOCRACY_PROPOSALS].includes(postData?.postType);

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
		if (['genshiro'].includes(network)) {
			api.query.eqBalances
				.account(address, { '0': 1734700659 })
				.then((result: any) => {
					setBalance(result.toHuman()?.Positive?.toString() || '0');
					setAvailableBalance?.(result.toHuman()?.Positive?.toString() || '0');
					onChange?.(result.toHuman()?.Positive?.toString() || '0');
				})
				.catch((e) => console.error(e));
		} else if (['equilibrium'].includes(network)) {
			api?.query.system
				.account(address)
				.then((result: any) => {
					const locked = new BN(result.toHuman().data?.V0?.lock?.toString().replaceAll(',', ''));
					if (isReferendum) {
						setBalance(result.toHuman().data?.V0?.balance?.[0]?.[1]?.Positive?.toString().replaceAll(',', '') || '0');
						setAvailableBalance?.(result.toHuman().data?.V0?.balance?.[0]?.[1]?.Positive?.toString().replaceAll(',', '') || '0');
						onChange?.(result.toHuman().data?.V0?.balance?.[0]?.[1]?.Positive?.toString().replaceAll(',', '') || '0');
					} else {
						const locked = result.toHuman().data?.V0?.lock?.toString().replaceAll(',', '') || '0';
						const positive = result.toHuman().data?.V0?.balance?.[0]?.[1]?.Positive?.toString().replaceAll(',', '') || '0';
						if (new BN(positive).cmp(new BN(locked))) {
							setBalance(new BN(positive).sub(new BN(locked)).toString() || '0');
							setAvailableBalance?.(new BN(positive).sub(new BN(locked)).toString() || '0');
							onChange?.(new BN(positive).sub(new BN(locked)).toString() || '0');
						} else {
							setBalance(positive);
							setAvailableBalance?.(positive);
							onChange?.(positive);
						}
					}
					setLockBalance(locked);
				})
				.catch((e) => console.error(e));
		} else {
			(usedInIdentityFlow ? peopleChainApi ?? api : api).query.system
				.account(address)
				.then((result: any) => {
					const frozen = result.data?.miscFrozen?.toBigInt() || result.data?.frozen?.toBigInt() || BigInt(0);
					const reserved = result.data?.reserved?.toBigInt() || BigInt(0);
					const locked = new BN(result.data?.frozen?.toBigInt().toString());
					if ((isReferendum && isVoting) || isDelegating) {
						setBalance(result.data?.free?.toString() || '0');
						setAvailableBalance?.(result.data?.free?.toString() || '0');
						onChange?.(result.data?.free?.toString() || '0');
					} else if (isDemocracyProposal && result.data.free && result.data?.free?.toBigInt() >= frozen) {
						setBalance((result.data?.free?.toBigInt() + reserved).toString() || '0');
						setAvailableBalance && setAvailableBalance((result.data?.free?.toBigInt() + reserved - frozen).toString() || '0');
						onChange?.((result.data?.free?.toBigInt() + reserved).toString() || '0');
					} else if (result.data.free && result.data?.free?.toBigInt() >= frozen) {
						setBalance((result.data?.free?.toBigInt() - frozen).toString() || '0');
						setAvailableBalance?.((result.data?.free?.toBigInt() - frozen).toString() || '0');
						onChange?.((result.data?.free?.toBigInt() - frozen).toString() || '0');
					} else {
						setBalance('0');
						setAvailableBalance && setAvailableBalance('0');
						onChange?.('0');
					}
					setLockBalance(locked);
				})
				.catch((e) => console.error(e));
		}
		setLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady, isReferendum, isBalanceUpdated, peopleChainApi, peopleChainApiReady, usedInIdentityFlow]);

	return (
		<div className={`${poppins.className} ${poppins.variable} mr-[2px] text-xs font-normal tracking-[0.0025em] text-[#576D8B] dark:text-blue-dark-medium msm:ml-auto ${classname}`}>
			<span>Free Balance</span>
			<HelperTooltip
				className='mx-1'
				text={
					<div>
						<span>Free Balance: {formatBnBalance(balance, { numberAfterComma: 2, withUnit: true }, network)}</span>
						<br />
						<span>
							Locked Balance: {formatedBalance(lockBalance.toString(), unit, 2)} {unit}
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
