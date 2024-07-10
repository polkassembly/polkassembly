// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState, useCallback } from 'react';
// import Image from 'next/image';
import { Carousel } from 'antd';
import dayjs from 'dayjs';
import { useNetworkSelector } from '~src/redux/selectors';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import formatBnBalance from '~src/util/formatBnBalance';
import { IBountyUserActivity } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Skeleton from '~src/basic-components/Skeleton';
import NameLabel from '~src/ui-components/NameLabel';
import { chainProperties } from '~src/global/networkConstants';

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
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (!network) return;
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
	}, [network]);

	const formatNumberWithSuffix = (value: number) => {
		if (value >= 1e6) {
			return (value / 1e6).toFixed(1) + 'm';
		} else if (value >= 1e3) {
			return (value / 1e3).toFixed(1) + 'k';
		}
		return value.toFixed(1);
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
		<div className=' w-full'>
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
					{userActivities.map((activity, index) => (
						<div
							key={index}
							className='my-1 flex h-[50px] items-center gap-1 rounded-[14px] border bg-white px-3 py-2 dark:bg-section-light-overlay'
						>
							<NameLabel
								truncateUsername={true}
								defaultAddress={activity.address}
								usernameMaxLength={10}
							/>
							<span className='text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium'>claimed</span>
							<span className='text-sm font-normal text-pink_primary md:text-[20px]'>{getDisplayValue(activity?.amount)}</span>
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
