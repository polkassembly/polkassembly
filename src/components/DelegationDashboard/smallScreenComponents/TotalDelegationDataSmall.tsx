// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { formatBalance } from '@polkadot/util';
import { Divider, Spin } from 'antd';
import BN from 'bn.js';
import { useApiContext } from '~src/context';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IDelegationStats } from 'pages/api/v1/delegations/get-delegation-stats';
import { MessageType } from '~src/auth/types';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { dmSans } from 'pages/_app';
import Image from 'next/image';

const ZERO_BN = new BN(0);

const TotalDelegationDataSmall = ({ className }: { className: string; setOpenBecomeDelegateModal?: (pre: boolean) => void; setOpenLoginModal?: (pre: boolean) => void }) => {
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [totalSupply, setTotalSupply] = useState<BN>(ZERO_BN);
	const [totalStats, setTotalStats] = useState<IDelegationStats>({
		totalDelegatedBalance: '0',
		totalDelegatedVotes: 0,
		totalDelegates: 0,
		totalDelegators: 0
	});
	const [loading, setLoading] = useState<boolean>(false);

	const getData = async () => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IDelegationStats | MessageType>('/api/v1/delegations/get-delegation-stats');
		if (data) {
			setTotalStats(data as IDelegationStats);
			setLoading(false);
		} else if (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (!api || !apiReady) return;
		(async () => {
			const totalIssuance = await api?.query?.balances?.totalIssuance();
			const inactiveIssuance = await api?.query?.balances?.inactiveIssuance();
			setTotalSupply(totalIssuance.sub(inactiveIssuance));
		})();
		getData();
	}, [api, apiReady]);

	return (
		<section className={className}>
			<Spin spinning={loading}>
				<div className='flex flex-col rounded-[14px] border border-solid border-[#D2D8E0] bg-white p-3 dark:border-separatorDark dark:bg-section-dark-overlay'>
					<div>
						<div className='flex items-center justify-between'>
							{/* Total Delegatees */}
							<div className='flex flex-col items-center gap-[6px]'>
								<Image
									src='/assets/delegation-tracks/total-delegatees.svg'
									alt='Total delegatees icon'
									height={24}
									width={24}
								/>
								<span className={`${dmSans.variable} ${dmSans.className} mt-1 text-[10px] text-blue-light-medium dark:text-[#9E9E9EB2]`}>Total Delegatees</span>
								<span className={`${dmSans.variable} ${dmSans.className} font-semibold text-blue-light-high dark:text-blue-dark-high`}>{totalStats.totalDelegators}</span>
							</div>
							<Divider
								type='vertical'
								className='h-[64px] bg-section-light-container dark:bg-separatorDark'
							/>

							{/* Total Supply */}
							<div className='flex flex-col items-center gap-[6px]'>
								<Image
									src='/assets/delegation-tracks/polkadot-delegation.svg'
									alt='polkadot delegation icon'
									height={24}
									width={24}
								/>
								<span className={`${dmSans.variable} ${dmSans.className} mt-1 text-[10px] text-blue-light-medium dark:text-[#9E9E9EB2]`}>Total Supply</span>
								<span className={`${dmSans.variable} ${dmSans.className} font-semibold text-blue-light-high dark:text-blue-dark-high`}>
									{parseBalance(totalSupply.toString(), 1, true, network)}
								</span>
							</div>
							<Divider
								type='vertical'
								className='h-[64px] bg-section-light-container dark:bg-separatorDark'
							/>

							{/* Total Delegates */}
							<div className='flex flex-col items-center gap-[6px]'>
								<Image
									src='/assets/delegation-tracks/total-delegates.svg'
									alt='Total delegate icon'
									height={24}
									width={24}
								/>
								<span className={`${dmSans.variable} ${dmSans.className} mt-1 text-[10px] text-blue-light-medium dark:text-[#9E9E9EB2]`}>Total Delegates</span>
								<span className={`${dmSans.variable} ${dmSans.className} font-semibold text-blue-light-high dark:text-blue-dark-high`}>{totalStats.totalDelegates}</span>
							</div>
						</div>
					</div>
					<Divider
						type='horizontal'
						className='my-3 bg-section-light-container p-0 dark:bg-separatorDark'
					/>

					<div className='flex items-center justify-evenly'>
						{/* Total Delegated Votes */}
						<div className='flex flex-col items-center gap-[6px]'>
							<Image
								src='/assets/delegation-tracks/total-delegated-tokens.svg'
								alt='Total delegate tokens icon'
								height={24}
								width={24}
							/>
							<span className={`${dmSans.variable} ${dmSans.className} mt-1 text-[10px] text-blue-light-medium dark:text-[#9E9E9EB2]`}>Total Delegated Votes</span>
							<span className={`${dmSans.variable} ${dmSans.className} font-semibold text-blue-light-high dark:text-blue-dark-high`}>{totalStats.totalDelegatedVotes}</span>
						</div>
						<Divider
							type='vertical'
							className='h-[64px] bg-section-light-container dark:bg-separatorDark'
						/>

						{/* Delegated tokens */}
						<div className='flex flex-col items-center gap-[6px]'>
							<Image
								src='/assets/delegation-tracks/delegate-tokens.svg'
								alt='delegate tokens icon'
								height={24}
								width={24}
							/>
							<span className={`${dmSans.variable} ${dmSans.className} mt-1 text-[10px] text-blue-light-medium dark:text-[#9E9E9EB2]`}>Delegated Tokens</span>
							<span className={`${dmSans.variable} ${dmSans.className} font-semibold text-blue-light-high dark:text-blue-dark-high`}>
								{parseBalance(totalStats.totalDelegatedBalance, 1, true, network)}
							</span>
						</div>
					</div>
				</div>
			</Spin>
		</section>
	);
};
export default TotalDelegationDataSmall;
