// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { Divider, Popover } from 'antd';
import { poppins } from 'pages/_app';
import { FollowersResponse } from 'pages/api/v1/fetch-follows/followersAndFollowingInfo';
import React, { useEffect, useState } from 'react';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import FollowTooltip from './FollowTooltip';

const FollowersAndFollowing = ({ userId }: { userId: number }) => {
	const [isLoading, setIsLoading] = useState<{ loading: boolean; error: string | null }>({
		loading: false,
		error: null
	});
	const [data, setData] = useState<FollowersResponse>();

	const fetchFollowers = async () => {
		setIsLoading({ loading: true, error: null });

		try {
			const { data, error } = await nextApiClientFetch<FollowersResponse>('/api/v1/fetch-follows/followersAndFollowingInfo', { userId });
			if (error) {
				setIsLoading({ loading: false, error: 'Failed to fetch followers' });
			} else if (data) {
				setData(data);
				setIsLoading({ loading: false, error: null });
			}
		} catch (err) {
			setIsLoading({ loading: false, error: 'An error occurred while fetching followers.' });
		}
	};

	useEffect(() => {
		fetchFollowers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	return (
		<>
			<div className='flex gap-1'>
				{data?.followers && (
					<>
						<Divider
							type='vertical'
							className='mt-1 bg-[#e1e6eb] p-0 dark:bg-separatorDark'
						/>
						<div className={`${poppins.variable} ${poppins.className} flex items-center gap-1 text-xs tracking-wide text-blue-light-medium dark:text-blue-dark-medium `}>
							Followers:
							<Popover
								placement='bottomLeft'
								content={
									<FollowTooltip
										users={data.followers}
										isLoading={isLoading.loading}
										isUsedInFollowers={true}
									/>
								}
							>
								<span className='cursor-pointer font-medium text-pink_primary hover:underline'>{data?.followers?.length ?? 0}</span>
							</Popover>
						</div>
					</>
				)}

				{data?.following && (
					<>
						<Divider
							type='vertical'
							className='mt-1 bg-[#e1e6eb] p-0 dark:bg-separatorDark'
						/>
						<div className={`${poppins.variable} ${poppins.className} flex items-center gap-1 text-xs tracking-wide text-blue-light-medium dark:text-blue-dark-medium `}>
							Following:{' '}
							<Popover
								placement='bottomLeft'
								content={
									<FollowTooltip
										users={data?.following}
										isLoading={isLoading.loading}
									/>
								}
							>
								<span className='cursor-pointer font-medium text-pink_primary hover:underline'>{data?.following?.length ?? 0}</span>
							</Popover>
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default FollowersAndFollowing;
