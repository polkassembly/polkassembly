// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import Skeleton from '~src/basic-components/Skeleton';
import { useNetworkSelector } from '~src/redux/selectors';
import { IBountyStats } from '~src/types';
import ImageIcon from '~src/ui-components/ImageIcon';
import formatBnBalance from '~src/util/formatBnBalance';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const BountiesHeaderMb = () => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
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

	const getFormattedValue = (value: string) => {
		if (currentTokenPrice.isLoading || !currentTokenPrice.value) {
			return value;
		}
		const numericValue = Number(formatBnBalance(value, { numberAfterComma: 1, withThousandDelimitor: false }, network));
		const tokenPrice = Number(currentTokenPrice.value);
		const dividedValue = numericValue / tokenPrice;

		if (dividedValue >= 1e6) {
			return (dividedValue / 1e6).toFixed(2) + 'm';
		} else if (dividedValue >= 1e3) {
			return (dividedValue / 1e3).toFixed(2) + 'k';
		} else {
			return dividedValue.toFixed(2);
		}
	};

	return (
		<div className='mt-4 rounded-3xl bg-white p-5 dark:bg-section-dark-overlay md:p-6'>
			{loading ? (
				<Skeleton active />
			) : (
				<div className='flex'>
					<div className='flex flex-col gap-6'>
						<div>
							<span className='text-base text-[#2D2D2D] dark:text-white'>Available Bounty pool</span>
							<div className='text-[46px]'>${getFormattedValue(statsData.availableBountyPool)}</div>
							<div className='grid grid-cols-2 gap-y-8  py-7 pr-4'>
								<div className='flex flex-col'>
									<span className='text-sm'>Active Bounties</span>
									<span className='text-[20px]'>{statsData.activeBounties}</span>
								</div>
								<div className='flex flex-col'>
									<span className='text-sm'>No. of People Earned</span>
									<span className='text-[20px]'>{statsData.peopleEarned}</span>
								</div>
								<div className='flex flex-col'>
									<span className='text-sm'>Total Rewarded</span>
									<span className='text-[20px]'>${getFormattedValue(statsData.totalRewarded)}</span>
								</div>
								<div className='flex flex-col'>
									<span className='text-sm'>Total Bounty Pool</span>
									<span className='text-[20px]'>${getFormattedValue(statsData.totalBountyPool)}</span>
								</div>
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

export default BountiesHeaderMb;
