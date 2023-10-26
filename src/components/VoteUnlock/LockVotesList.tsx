// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState } from 'react';
import { formatedBalance } from '~src/util/formatedBalance';
import { CheckCircleFilled } from '@ant-design/icons';
import { useNetworkSelector, useUserUnlockTokensDataSelector } from '~src/redux/selectors';
import { BN_MAX_INTEGER, formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import BN from 'bn.js';
import blockToTime from '~src/util/blockToTime';
import { network as AllNetworks } from '~src/global/networkConstants';
import { IUnlockTokenskData } from '~src/redux/tokenUnlocksData/@types';
import { handlePrevData } from '.';

import LockIcon from '~assets/icons/vote-lock.svg';
import UnlockIcon from '~assets/icons/unlock.svg';
import DownArrowIcon from '~assets/icons/down-arrow.svg';
interface Props {
	totalUnlockableBalance: BN;
	lockedBalance: BN;
	showBalances?: boolean;
	votesCollapsed?: boolean;
}

const LockVotesList = ({ totalUnlockableBalance, lockedBalance, showBalances = true, votesCollapsed = false }: Props) => {
	const { network } = useNetworkSelector();
	const unit = chainProperties[network]?.tokenSymbol;
	const { address, data } = useUserUnlockTokensDataSelector();
	const totalLockData = handlePrevData(data?.totalLockData);
	const totalOngoingData = handlePrevData(data?.totalOngoingData);
	const totalUnlockableData = handlePrevData(data?.totalUnlockableData);
	const [expandUnlocks, setExpandUnlocks] = useState<boolean>(!votesCollapsed);
	const [tokensData, setTokensData] = useState<IUnlockTokenskData[]>(totalLockData.concat(totalOngoingData));

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network]?.tokenDecimals,
			unit
		});
		setTokensData(
			[AllNetworks.MOONBEAM, AllNetworks.MOONBASE, AllNetworks.MOONRIVER].includes(network)
				? handlePrevData([...totalLockData, ...totalOngoingData, ...totalUnlockableData])
				: handlePrevData(totalLockData.concat(totalOngoingData))
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, data, address]);
	return (
		<div>
			{showBalances && (
				<div className='mt-4 flex items-center justify-between rounded-md bg-[#F6F7F9] p-3 text-sm tracking-[0.25%] text-lightBlue dark:border-separatorDark dark:bg-inactiveIconDark dark:text-white'>
					<span className='flex gap-2'>
						<CheckCircleFilled
							style={{ color: '#51D36E' }}
							className='rounded-full border-none bg-transparent text-base'
						/>
						Total Unlockable Balance
					</span>
					<span className='pr-[27px] text-base font-semibold text-bodyBlue dark:text-white'>
						{formatedBalance((totalUnlockableBalance.toString() || '0').toString(), unit, 2)} {unit}
					</span>
				</div>
			)}
			<div className={`${showBalances ? 'p-3' : 'px-3 py-0.5'} mt-4 rounded-md bg-[#F6F7F9] dark:border-separatorDark dark:bg-inactiveIconDark`}>
				{showBalances && (
					<div
						className={`flex items-center justify-between text-sm tracking-[0.25%] text-lightBlue dark:text-white ${
							tokensData.length > 0 && ' border-0 border-b-[1px] border-solid border-[#D2D8E0] pb-2'
						}`}
					>
						<span className='flex gap-2'>
							<LockIcon />
							Locked Balance
						</span>
						<span className='pr-[27px] text-base font-semibold text-bodyBlue dark:text-white'>
							{formatedBalance((lockedBalance.toString() || '0').toString(), unit, 2)} {unit}
						</span>
					</div>
				)}
				{tokensData.length > 0 && (
					<div className='mt-3'>
						<div className='flex items-start justify-between pb-1 text-sm tracking-[0.25%] text-lightBlue'>
							<div className='mt-1 flex gap-2'>
								<UnlockIcon />
								<span className='flex flex-col gap-0.5'>
									{totalLockData.length ? `Next unlock in ${blockToTime(totalLockData?.[0]?.endBlock, network).time}` : `Ongoing: #${totalOngoingData[0]?.refId}`}
								</span>
							</div>
							<span
								className='flex items-center text-base font-semibold text-bodyBlue'
								onClick={() => setExpandUnlocks(!expandUnlocks)}
							>
								<span className='flex flex-col items-end'>
									<span className={`flex flex-col items-end justify-end ${tokensData.length <= 1 && 'pr-[27px]'}`}>
										{totalLockData.length
											? `${formatedBalance((totalLockData?.[0]?.total.toString() || '0').toString(), unit, 2)} `
											: `${formatedBalance((totalOngoingData?.[0]?.total.toString() || '0').toString(), unit, 2)} `}
										{unit}
									</span>
									{tokensData.length > 1 && (
										<span className='flex justify-end text-xs font-normal text-pink_primary'>{expandUnlocks ? 'Hide All Unlocks' : 'View All Unlocks'}</span>
									)}
								</span>
								{tokensData.length > 1 && <DownArrowIcon className={`cursor-pointer ${expandUnlocks && 'pink-color rotate-180'} -mt-4 ml-1`} />}
							</span>
						</div>
						{expandUnlocks && (
							<div className='max-h-[150px] overflow-y-auto'>
								{tokensData.slice(1).map((lock, index) => (
									<div
										className='flex items-center justify-between border-0 border-t-[1px] border-dotted border-[#D2D8E0] border-[#D2D8E0] py-3 text-sm tracking-[0.25%] text-lightBlue'
										key={index}
									>
										<div className='flex items-center gap-2'>
											<UnlockIcon />
											<span className='flex flex-col gap-0.5'>
												{lock.endBlock.eq(BN_MAX_INTEGER) ? `Ongoing: #${lock?.refId}` : `Next unlock in ${blockToTime(lock?.endBlock, network).time}`}
											</span>
										</div>
										<span className='flex items-center pr-[27px] text-base font-semibold text-bodyBlue'>
											{formatedBalance((lock?.total.toString() || '0').toString(), unit, 2)} {unit}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
export default LockVotesList;
