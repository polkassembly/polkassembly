// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { spaceGrotesk } from 'pages/_app';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IBountyUserActivity } from '~src/types';
import { useNetworkSelector } from '~src/redux/selectors';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import formatBnBalance from '~src/util/formatBnBalance';
import { Carousel, Spin } from 'antd';
import { chunkArray } from './utils/ChunksArr';
import dayjs from 'dayjs';

const BountyActivities = () => {
	const { network } = useNetworkSelector();
	const [userActivities, setUserActivities] = useState<IBountyUserActivity[]>([]);
	const [loading, setLoading] = useState(false);
	const [currentTokenPrice, setCurrentTokenPrice] = useState({
		isLoading: true,
		value: ''
	});
	const [startIndex, setStartIndex] = useState(0);

	const getData = async () => {
		setLoading(true);
		try {
			const { data } = await nextApiClientFetch<{ data: IBountyUserActivity[] }>('/api/v1/bounty/latest-user-activity');
			if (data) {
				setUserActivities(data?.data);
			}
			setLoading(false);
		} catch (error) {
			console.log('Error fetching user activities:', error);
			setLoading(false);
		}
	};

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

	useEffect(() => {
		getData();
	}, []);

	useEffect(() => {
		if (!network) return;
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
	}, [network]);

	useEffect(() => {
		if (!loading) {
			const interval = setInterval(() => {
				setStartIndex((prevIndex) => (prevIndex + 1) % userActivities.length);
			}, 3000);
			return () => clearInterval(interval);
		}
	}, [loading, userActivities.length]);

	const activitiesToShow = [];
	for (let i = 0; i < 7; i++) {
		const index = (startIndex + i) % userActivities.length;
		activitiesToShow.push(userActivities[index]);
	}

	return (
		<div className='mt-1 flex h-[400px] w-full flex-col gap-[18px]'>
			<Spin spinning={loading}>
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
							{chunk.map((activity, index) => {
								const date = dayjs(activity?.created_at).format("DD[th] MMM 'YY");
								return (
									<div
										key={index}
										className={` ${spaceGrotesk.className} ${spaceGrotesk.variable} flex items-center gap-1 rounded-[14px] border border-solid border-section-light-container bg-white px-3 py-2 dark:border-section-dark-container dark:bg-section-dark-overlay`}
									>
										<Image
											src={'/assets/icons/user-profile.png'}
											width={16}
											height={16}
											className='-mt-[2px]'
											alt='user image'
										/>
										<span className='inline-block text-[15px] font-semibold text-blue-light-high dark:text-blue-dark-high'>{activity?.address.slice(0, 5)}...</span>
										<span className='text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium'>claimed</span>
										<span className='text-[20px] font-normal text-pink_primary'>${getFormattedValue(activity?.amount)}</span>
										<span className='text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium'>bounty</span>
										<div className='mx-2 h-[5px] w-[5px] rounded-full bg-[#485F7DB2] dark:bg-[#909090B2]'></div>
										<span className='rounded-full text-xs text-[#485F7DB2] dark:text-blue-dark-medium'>{date}</span>
									</div>
								);
							})}
						</div>
					))}
				</Carousel>
			</Spin>
		</div>
	);
};

export default BountyActivities;
