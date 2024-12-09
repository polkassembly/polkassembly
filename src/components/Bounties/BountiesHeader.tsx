// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import Skeleton from '~src/basic-components/Skeleton';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { IBountyStats } from '~src/types';
import ImageIcon from '~src/ui-components/ImageIcon';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { StatItem } from './utils/Statitem';
import { formatNumberWithSuffix, getDisplayValue } from './utils/formatBalanceUsd';
import formatBnBalance from '~src/util/formatBnBalance';
import { dmSans } from 'pages/_app';

const BountiesHeader = () => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const [statsData, setStatsData] = useState<IBountyStats>({
		activeBounties: '',
		availableBountyPool: '',
		peopleEarned: '',
		totalBountyPool: '',
		totalRewarded: ''
	});
	const [currentTokenPrice, setCurrentTokenPrice] = useState({
		isLoading: true,
		value: ''
	});
	const [loading, setLoading] = useState(false);

	const fetchStats = async () => {
		setLoading(true);
		try {
			const { data, error } = await nextApiClientFetch<IBountyStats>('/api/v1/bounty/stats');
			if (error || !data) {
				console.error(error);
			}
			if (data) {
				setStatsData(data);
			}
			setLoading(false);
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStats();
	}, []);

	useEffect(() => {
		if (!network) return;
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
	}, [network]);

	return (
		<div className='mt-4 rounded-3xl bg-white p-5 dark:bg-section-dark-overlay md:p-6'>
			{loading ? (
				<Skeleton active />
			) : (
				<div className='flex'>
					<div className='hidden gap-6 md:flex'>
						<div>
							<span className='font-pixelify text-[18px] font-semibold text-[#2D2D2D] dark:text-[#737373]'>Available Bounty pool</span>
							<div className='font-pixeboy text-[46px]'>
								{getDisplayValue(statsData.availableBountyPool, network, currentTokenPrice, unit)}
								{!isNaN(Number(currentTokenPrice.value)) && (
									<>
										<span className={`${dmSans.className} ${dmSans.variable} ml-2 text-[22px] font-medium `}>
											~{formatNumberWithSuffix(Number(formatBnBalance(statsData.availableBountyPool, { numberAfterComma: 1, withThousandDelimitor: false }, network)))}
										</span>
										<span className={`${dmSans.className} ${dmSans.variable} ml-1 text-[22px] font-medium`}>{unit}</span>
									</>
								)}
							</div>
							<div className='-mb-6 -ml-6 mt-4 flex h-[185px] w-[420px] items-end rounded-bl-3xl rounded-tr-[125px] bg-pink_primary'>
								<div className='mb-8 ml-6 flex items-end gap-3'>
									<ImageIcon
										src='/assets/bounty-icons/bounty-icon.svg'
										alt='bounty icon'
										imgWrapperClassName='w-[308px] h-[113px]'
									/>
									<ImageIcon
										src='/assets/bounty-icons/bounty-arrow-icon.svg'
										alt='arrow icon'
									/>
								</div>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-x-24 py-7'>
							<StatItem
								label='Active Bounties'
								value={statsData.activeBounties}
							/>
							<StatItem
								label='Claimants'
								value={statsData.peopleEarned}
							/>
							<StatItem
								label='Total Rewarded'
								value={getDisplayValue(statsData.totalRewarded, network, currentTokenPrice, unit)}
							/>
							<StatItem
								label='Total Bounty Pool'
								value={getDisplayValue(statsData.totalBountyPool, network, currentTokenPrice, unit)}
							/>
						</div>
					</div>

					<div className='items-between relative hidden h-full flex-col justify-between md:flex'>
						<div className='absolute -top-6 left-1/2 h-10 w-20 rotate-180 rounded-t-full bg-[#f5f6f8] shadow-none dark:bg-[#1c1d1f]'></div>
						<ImageIcon
							src='/assets/bounty-icons/dashed-line.svg'
							alt='bounty icon'
							imgClassName='ml-[38px] mt-6'
							imgWrapperClassName='w-[3px] h-[209px]'
						/>
						<div className='absolute left-1/2 top-[237px] h-10 w-20 rounded-t-full bg-[#f5f6f8] shadow-none dark:bg-[#1c1d1f]'></div>
					</div>

					<div className='hidden gap-x-10 md:flex'>
						<ImageIcon
							src={theme == 'dark' ? '/assets/bounty-icons/create-white.svg' : '/assets/bounty-icons/create.svg'}
							alt='bounty icon'
							imgClassName='ml-32 mt-6'
							imgWrapperClassName='h-[69px]'
						/>
						<ImageIcon
							src={theme == 'dark' ? '/assets/bounty-icons/barcode-white.svg' : '/assets/bounty-icons/bounty-barcode.svg'}
							alt='bounty icon'
							imgClassName='mt-6'
							imgWrapperClassName=''
						/>
					</div>
					<div className='flex flex-col gap-6 md:hidden'>
						<div>
							<span className='font-pixelify text-base text-[#2D2D2D] dark:text-[#737373]'>Available Bounty pool</span>
							<div className='font-pixeboy text-[46px]'>{getDisplayValue(statsData.availableBountyPool, network, currentTokenPrice, unit)}</div>
							<div className='grid grid-cols-2 gap-y-8  py-7 pr-4'>
								<StatItem
									label='Active Bounties'
									value={statsData.activeBounties}
								/>
								<StatItem
									label='No. of People Earned'
									value={statsData.peopleEarned}
								/>
								<StatItem
									label='Total Rewarded'
									value={getDisplayValue(statsData.totalRewarded, network, currentTokenPrice, unit)}
								/>
								<StatItem
									label='Total Bounty Pool'
									value={getDisplayValue(statsData.totalBountyPool, network, currentTokenPrice, unit)}
								/>
							</div>
							<div className='items-between relative -ml-6 flex items-center justify-between'>
								<div className='left-0 h-20 w-10 rounded-r-full bg-[#f5f6f8] shadow-none dark:bg-[#1c1d1f]'></div>
								<ImageIcon
									src='/assets/bounty-icons/dashed-horizontal-line.svg'
									alt='bounty icon'
									imgWrapperClassName='h-[3px] w-[209px]'
								/>
								<div className='first-letter  right-0 h-20 w-10 rounded-l-full bg-[#f5f6f8] shadow-none dark:bg-[#1c1d1f]'></div>
							</div>
							<div className='-ml-4 mt-12 flex w-full flex-col items-center gap-x-4'>
								<ImageIcon
									src={theme == 'dark' ? '/assets/bounty-icons/create-mb-white.svg' : '/assets/bounty-icons/create-mb.svg'}
									alt='bounty icon'
									imgClassName='scale-125'
									imgWrapperClassName='h-[24px]'
								/>
								<ImageIcon
									src={theme == 'dark' ? '/assets/bounty-icons/barcode-mb-white.svg' : '/assets/bounty-icons/barcode-mb.svg'}
									alt='bounty icon'
									imgClassName='mt-6 scale-125'
									imgWrapperClassName=''
								/>
							</div>
							<div className='-mb-6 -ml-6 mt-4 flex h-[185px] items-end rounded-bl-3xl rounded-tr-[125px] bg-pink_primary'>
								<div className='mb-8 flex items-end gap-3'>
									<ImageIcon
										src='/assets/bounty-icons/bounty-icon.svg'
										alt='bounty icon'
										className='scale-90'
										imgWrapperClassName='w-[308px] h-[113px]'
									/>
									<ImageIcon
										src='/assets/bounty-icons/bounty-arrow-icon.svg'
										alt='arrow icon'
										className='pr-2'
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BountiesHeader;
