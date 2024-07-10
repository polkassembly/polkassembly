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
import formatBnBalance from '~src/util/formatBnBalance';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

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

	const formatNumberWithSuffix = (value: number) => {
		if (value >= 1e6) {
			return (value / 1e6).toFixed(2) + 'm';
		} else if (value >= 1e3) {
			return (value / 1e3).toFixed(2) + 'k';
		}
		return value.toFixed(2);
	};

	const getFormattedValue = (value: string) => {
		const numericValue = Number(formatBnBalance(value, { numberAfterComma: 1, withThousandDelimitor: false }, network));

		if (isNaN(Number(currentTokenPrice.value))) {
			return formatNumberWithSuffix(numericValue);
		}

		const tokenPrice = Number(currentTokenPrice.value);
		const dividedValue = numericValue / tokenPrice;

		return formatNumberWithSuffix(dividedValue);
	};

	const getDisplayValue = (value: string) => {
		if (currentTokenPrice.isLoading || isNaN(Number(currentTokenPrice.value))) {
			return `${getFormattedValue(value)} ${unit}`;
		}
		return `$${getFormattedValue(value)}`;
	};

	return (
		<div className='mt-4 rounded-3xl bg-white p-5 dark:bg-section-dark-overlay md:p-6'>
			{loading ? (
				<Skeleton active />
			) : (
				<div className='flex'>
					<div className='flex gap-6'>
						<div>
							<span className='font-pixelify text-[18px] font-semibold text-[#2D2D2D] dark:text-[#737373]'>Available Bounty pool</span>
							<div className='font-pixeboy text-[46px]'>{getDisplayValue(statsData.availableBountyPool)}</div>
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
							<div className='flex flex-col'>
								<span className='font-pixelify text-[18px] font-semibold text-[#2D2D2D] dark:text-[#737373]'>Active Bounties</span>
								<span className='font-pixeboy text-[28px] font-medium'>{statsData.activeBounties}</span>
							</div>
							<div className='flex flex-col'>
								<span className='font-pixelify text-[18px] font-semibold text-[#2D2D2D] dark:text-[#737373]'>No. of People Earned</span>
								<span className='font-pixeboy text-[28px] font-medium'>{statsData.peopleEarned}</span>
							</div>
							<div className='flex flex-col'>
								<span className='font-pixelify text-[18px] font-semibold text-[#2D2D2D] dark:text-[#737373]'>Total Rewarded</span>
								<span className='font-pixeboy text-[28px] font-medium'>{getDisplayValue(statsData.totalRewarded)}</span>
							</div>
							<div className='flex flex-col'>
								<span className='font-pixelify text-[18px] font-semibold text-[#2D2D2D] dark:text-[#737373]'>Total Bounty Pool</span>
								<span className='font-pixeboy text-[28px] font-medium'>{getDisplayValue(statsData.totalBountyPool)}</span>
							</div>
						</div>
					</div>

					<div className='items-between relative flex h-full flex-col justify-between'>
						<div className='absolute -top-6 left-1/2 h-10 w-20 rotate-180 rounded-t-full bg-[#f5f6f8] shadow-none dark:bg-[#1c1d1f]'></div>
						<ImageIcon
							src='/assets/bounty-icons/dashed-line.svg'
							alt='bounty icon'
							imgClassName='ml-[38px] mt-6'
							imgWrapperClassName='w-[3px] h-[209px]'
						/>
						<div className='absolute left-1/2 top-[237px] h-10 w-20 rounded-t-full bg-[#f5f6f8] shadow-none dark:bg-[#1c1d1f]'></div>
					</div>

					<div className='flex gap-x-10'>
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
				</div>
			)}
		</div>
	);
};

export default BountiesHeader;
