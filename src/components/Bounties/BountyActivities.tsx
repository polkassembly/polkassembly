// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState, useCallback } from 'react';
import { Carousel } from 'antd';
import dayjs from 'dayjs';
import { useNetworkSelector } from '~src/redux/selectors';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import { IBountyUserActivity } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Skeleton from '~src/basic-components/Skeleton';
import NameLabel from '~src/ui-components/NameLabel';
import { chainProperties } from '~src/global/networkConstants';
import { getDisplayValue } from './utils/formatBalanceUsd';

const BountyActivities = () => {
	const { network } = useNetworkSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const [userActivities, setUserActivities] = useState<IBountyUserActivity[]>([]);
	const [loading, setLoading] = useState(false);
	const [currentTokenPrice, setCurrentTokenPrice] = useState({
		isLoading: true,
		value: ''
	});

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
		if (!network) return;
		getData();
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<div className='w-full'>
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
					infinite
					className='flex items-center'
					easing='linear'
					slidesToShow={7}
				>
					{userActivities &&
						userActivities.map((activity, index) => (
							<div
								key={index}
								className='my-1 flex h-[50px] items-center gap-1 rounded-[14px] border bg-white px-3 py-2 dark:bg-section-light-overlay md:max-w-[450px]'
							>
								<NameLabel
									truncateUsername={true}
									defaultAddress={activity.address}
									usernameMaxLength={10}
								/>
								<span className='text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium'>claimed</span>
								<span className='font-pixeboy text-sm font-normal text-pink_primary md:text-[20px]'>{getDisplayValue(activity?.amount, network, currentTokenPrice, unit)}</span>
								<span className='text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium'>bounty</span>
								<div className='mx-2 h-[5px] w-[5px] rounded-full bg-[#485F7DB2] dark:bg-[#909090B2]'></div>
								<span className='rounded-full text-xs text-[#485F7DB2] dark:text-blue-dark-medium'>{dayjs(activity?.created_at).format("DD[th] MMM 'YY")}</span>
							</div>
						))}
				</Carousel>
			)}
		</div>
	);
};

export default BountyActivities;
