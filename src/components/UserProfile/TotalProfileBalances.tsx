// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import VoteUnlock, { votesUnlockUnavailableNetworks } from '../VoteUnlock';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { CheckCircleFilled } from '@ant-design/icons';
import LockIcon from '~assets/icons/vote-lock.svg';
import { Divider } from 'antd';
import { chainProperties } from '~src/global/networkConstants';
import styled from 'styled-components';
import userProfileBalances from '~src/util/userProfieBalances';
import BN from 'bn.js';
import { useApiContext } from '~src/context';
import { formatBalance } from '@polkadot/util';
import { formatedBalance } from '~src/util/formatedBalance';

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	selectedAddresses: string[];
}
const ZERO_BN = new BN(0);

const TotalProfileBalances = ({ className, selectedAddresses, userProfile, theme }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { id } = useUserDetailsSelector();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [transferableBalance, setTransferableBalance] = useState<BN>(ZERO_BN);
	const [totalLockedBalance, setTotalLockedBalance] = useState<BN>(ZERO_BN);

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: unit
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		(async () => {
			const promises = selectedAddresses.map(async (address) => {
				const balances = await userProfileBalances({ address, api, apiReady, network });
				return { locked: balances.lockedBalance, transferable: balances.transferableBalance };
			});
			let locked = ZERO_BN;
			let transferable = ZERO_BN;
			const resolves = await Promise.allSettled(promises);
			setTotalLockedBalance(ZERO_BN);
			setTransferableBalance(ZERO_BN);
			resolves.map((item) => {
				if (item.status === 'fulfilled') {
					locked = item?.value?.locked.add(totalLockedBalance);
					transferable = item?.value?.transferable.add(transferableBalance);
				}
			});
			setTotalLockedBalance(locked);
			setTransferableBalance(transferable);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, selectedAddresses, userProfile]);
	return (
		<div
			className={classNames(
				theme,
				className,
				'flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
			)}
		>
			<span className='flex items-center gap-1.5 text-xl font-semibold dark:text-blue-dark-high'>
				<Image
					src='/assets/profile/profile-balance.svg'
					alt=''
					width={24}
					height={24}
				/>
				Balance
			</span>
			{userProfile?.user_id === id && selectedAddresses.length > 0 && !votesUnlockUnavailableNetworks.includes(network) && <VoteUnlock addresses={selectedAddresses} />}
			{/* <div className='my-0 flex items-center gap-2 rounded-xl bg-[#D2D8E0] px-4 py-3 text-xs dark:bg-section-dark-garyBackground dark:bg-separatorDark max-md:gap-0.5 max-md:px-2'>
				<Image
					src={'/assets/profile/green-votes.svg'}
					height={22}
					width={22}
					alt=''
					className='rounded-sm bg-white max-md:hidden'
				/>
				<div className='flex flex-col'>
					<span className='text-lightBlue dark:text-blue-dark-medium'>VOTING POWER</span>
					<span className='text-base font-medium text-bodyBlue dark:text-blue-dark-high'>90 DOT</span>
				</div>
				<Image
					src='/assets/profile/equal.svg'
					alt=''
					width={32}
					height={32}
					className='darkmode-icons'
				/>
				<div className='flex flex-col'>
					<span className='flex items-center gap-1 text-lightBlue dark:text-blue-dark-medium'>
						<Image
							className='h-4 w-4 rounded-full object-contain'
							src={chainProperties[network]?.logo ? chainProperties[network].logo : chainLogo}
							alt='Logo'
							width={14}
							height={14}
						/>
						BALANCE
					</span>
					<span className='text-base font-medium text-bodyBlue dark:text-blue-dark-high'>90 DOT</span>
				</div>
				<div className='flex items-center'>
					<CloseIcon className='mx-2 text-xl' />
				</div>
				<div className='flex flex-col'>
					<span className='flex items-center gap-1 text-lightBlue dark:text-blue-dark-medium'>
						<Image
							src='/assets/icons/delegate-profile.svg'
							alt=''
							width={14}
							height={14}
						/>
						DELEGATED
					</span>
					<span className='text-base font-medium text-bodyBlue dark:text-blue-dark-high'>90 DOT</span>
				</div>
			</div> */}
			<div className=' text-light flex flex-col gap-4 text-sm font-normal tracking-wide dark:text-blue-dark-medium'>
				<span className='flex justify-between'>
					<span className='flex gap-2'>
						<CheckCircleFilled
							style={{ color: '#51D36E' }}
							className='rounded-full border-none bg-transparent text-base'
						/>
						Transferrable
					</span>
					<span>
						{formatedBalance(transferableBalance.toString(), unit, 2)} {unit}
					</span>
				</span>
				<Divider
					type='horizontal'
					className='my-0 bg-[#D2D8E0] dark:bg-separatorDark'
				/>
				<span className='flex justify-between'>
					<span className='flex gap-2'>
						<LockIcon />
						Locked
					</span>
					<span>
						{formatedBalance(totalLockedBalance.toString(), unit, 2)} {unit}
					</span>
				</span>
			</div>
		</div>
	);
};
export default styled(TotalProfileBalances)`
	.dark .darkmode-icons {
		filter: brightness(100%) saturate(0%) contrast(4) invert(100%) !important;
	}
`;
