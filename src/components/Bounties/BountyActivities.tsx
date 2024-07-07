// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Carousel } from 'antd';
import dayjs from 'dayjs';
import { useNetworkSelector } from '~src/redux/selectors';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import formatBnBalance from '~src/util/formatBnBalance';
import { chunkArray } from './utils/ChunksArr';
import { IBountyUserActivity } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Skeleton from '~src/basic-components/Skeleton';

const BountyActivities = () => {
	const { network } = useNetworkSelector();
	const [userActivities, setUserActivities] = useState<IBountyUserActivity[]>([]);
	const [loading, setLoading] = useState(false);
	const [currentTokenPrice, setCurrentTokenPrice] = useState({
		isLoading: true,
		value: ''
	});
	const [startIndex, setStartIndex] = useState(0);

	const getData = useCallback(async () => {
		setLoading(true);
		try {
			const { data } = await nextApiClientFetch<{ data: IBountyUserActivity[] }>('/api/v1/bounty/latest-user-activity');
			if (data) {
				setUserActivities(data.data);
			}
			setLoading(false);
		} catch (error) {
			console.error('Error fetching user activities:', error);
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (!network) return;
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
	}, [network]);

	useEffect(() => {
		if (!loading && userActivities.length > 0) {
			const interval = setInterval(() => {
				setStartIndex((prevIndex) => (prevIndex + 1) % userActivities.length);
			}, 3000);
			return () => clearInterval(interval);
		}
	}, [loading, userActivities.length]);

	const getFormattedValue = useCallback(
		(value: string) => {
			if (currentTokenPrice.isLoading || !currentTokenPrice.value) {
				return value;
			}
			const numericValue = Number(formatBnBalance(value, { numberAfterComma: 1, withThousandDelimitor: false }, network));
			const tokenPrice = Number(currentTokenPrice.value);
			const dividedValue = numericValue / tokenPrice;

			return dividedValue >= 1e6 ? (dividedValue / 1e6).toFixed(2) + 'm' : dividedValue >= 1e3 ? (dividedValue / 1e3).toFixed(2) + 'k' : dividedValue.toFixed(2);
		},
		[currentTokenPrice.isLoading, currentTokenPrice.value, network]
	);

	const activitiesToShow = userActivities.slice(startIndex, startIndex + 7);

	return (
		<div className='mt-1 flex h-[400px] w-full flex-col gap-[18px]'>
			{loading ? (
				<>
					<Skeleton />
					<Skeleton />
				</>
			) : (
				<Carousel
					vertical
					autoplay
					autoplaySpeed={3000}
					dots={false}
					infinite={false}
					easing='linear'
				>
					{chunkArray(activitiesToShow, 7).map((chunk, index) => (
						<div
							key={index}
							className='flex max-w-[500px] flex-col gap-2'
						>
							{chunk.map((activity, idx) => (
								<div
									key={idx}
									className='flex items-center gap-1 rounded-[14px] border bg-white px-3 py-2'
								>
									<Image
										src={'/assets/icons/user-profile.png'}
										width={16}
										height={16}
										alt='user image'
									/>
									<span className='inline-block text-[15px] font-semibold text-blue-light-high dark:text-blue-dark-high'>{activity?.address.slice(0, 5)}...</span>
									<span className='text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium'>claimed</span>
									<span className='text-[20px] font-normal text-pink_primary'>${getFormattedValue(activity?.amount)}</span>
									<span className='text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium'>bounty</span>
									<div className='mx-2 h-[5px] w-[5px] rounded-full bg-[#485F7DB2] dark:bg-[#909090B2]'></div>
									<span className='rounded-full text-xs text-[#485F7DB2] dark:text-blue-dark-medium'>{dayjs(activity?.created_at).format("DD[th] MMM 'YY")}</span>
								</div>
							))}
						</div>
					))}
				</Carousel>
			)}
		</div>
	);
};

export default BountyActivities;
