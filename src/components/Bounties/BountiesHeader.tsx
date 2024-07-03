// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { useNetworkSelector } from '~src/redux/selectors';
import { IBountyStats } from '~src/types';
import ImageIcon from '~src/ui-components/ImageIcon';
import formatBnBalance from '~src/util/formatBnBalance';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const BountiesHeader = () => {
	const { network } = useNetworkSelector();
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

	const fetchStats = async () => {
		try {
			const { data, error } = await nextApiClientFetch<IBountyStats>('/api/v1/bounty/stats');
			if (error || !data) {
				console.error(error);
			}
			if (data) {
				setStatsData(data);
			}
		} catch (error) {
			console.log(error);
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
			<div className='flex'>
				<div className='flex gap-6'>
					<div>
						<span className='text-base   text-[#2D2D2D] dark:text-white'>Available Bounty pool</span>
						<div className='text-[46px]'>${getFormattedValue(statsData.availableBountyPool)}</div>
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
							<span className='text-base'>Active Bounties</span>
							<span className='text-[28px]'>{statsData.activeBounties}</span>
						</div>
						<div className='flex flex-col'>
							<span className='text-base'>No. of People Earned</span>
							<span className='text-[28px]'>{statsData.peopleEarned}</span>
						</div>
						<div className='flex flex-col'>
							<span className='text-base'>Total Rewarded</span>
							<span className='text-[28px]'>${getFormattedValue(statsData.totalRewarded)}</span>
						</div>
						<div className='flex flex-col'>
							<span className='text-base'>Total Bounty Pool</span>
							<span className='text-[28px]'>${getFormattedValue(statsData.totalBountyPool)}</span>
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
						src='/assets/bounty-icons/create.svg'
						alt='bounty icon'
						imgClassName='ml-32 mt-6'
						imgWrapperClassName=' h-[69px]'
					/>
					<ImageIcon
						src='/assets/bounty-icons/bounty-barcode.svg'
						alt='bounty icon'
						imgClassName='mt-6'
						imgWrapperClassName=''
					/>
				</div>
			</div>
		</div>
	);
};

export default BountiesHeader;
