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
import styled from 'styled-components';
import userProfileBalances from '~src/util/userProfileBalances';
import BN from 'bn.js';
import { useApiContext } from '~src/context';
import { parseBalance } from '../Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	selectedAddresses: string[];
}
export interface IDelegateBalance {
	delegateBalance: string;
	votingPower: string;
}

const ZERO_BN = new BN(0);

const TotalProfileBalances = ({ className, selectedAddresses, userProfile, theme }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { id } = useUserDetailsSelector();
	const [transferableBalance, setTransferableBalance] = useState<BN>(ZERO_BN);
	const [totalLockedBalance, setTotalLockedBalance] = useState<BN>(ZERO_BN);
	const [refreshKey, setRefreshKey] = useState(false);

	useEffect(() => {
		setTotalLockedBalance(ZERO_BN);
		setTransferableBalance(ZERO_BN);
		if (!api || !apiReady || !network || !selectedAddresses.length) return;
		(async () => {
			const promises = selectedAddresses.map(async (address) => {
				const balances = await userProfileBalances({ address, api, apiReady, network });
				return { free: balances.freeBalance, locked: balances.lockedBalance, transferable: balances.transferableBalance };
			});
			let locked = ZERO_BN;
			let transferable = ZERO_BN;
			const resolves = await Promise.allSettled(promises);

			let free = ZERO_BN;
			resolves.map((item) => {
				if (item.status === 'fulfilled') {
					locked = item?.value?.locked.add(locked);
					transferable = item?.value?.transferable.add(transferable);
					free = item?.value?.free.add(free);
				}
			});
			setTransferableBalance(transferable);
			setTotalLockedBalance(locked);
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, selectedAddresses, userProfile, network, refreshKey]);

	return (
		<div
			className={classNames(
				theme,
				className,
				'flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
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
			{userProfile?.user_id === id && selectedAddresses.length > 0 && !votesUnlockUnavailableNetworks.includes(network) && (
				<VoteUnlock
					refreshKey={refreshKey}
					setRefreshKey={setRefreshKey}
					addresses={selectedAddresses}
				/>
			)}
			<div className=' text-light flex flex-col gap-4 text-sm font-normal tracking-wide dark:text-blue-dark-medium '>
				<span className='flex justify-between'>
					<span className='flex gap-2'>
						<CheckCircleFilled
							style={{ color: '#51D36E' }}
							className='rounded-full border-none bg-transparent text-base'
						/>
						Transferrable
					</span>
					<span className='font-medium'>{parseBalance(transferableBalance.toString(), 2, true, network)}</span>
				</span>
				<Divider
					type='horizontal'
					className='my-0 bg-section-light-container dark:bg-separatorDark'
				/>
				<span className='flex justify-between'>
					<span className='flex gap-2'>
						<LockIcon />
						Locked
					</span>
					<span className='font-medium'>{parseBalance(totalLockedBalance.toString(), 2, true, network)}</span>
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
