// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { Divider, Popover } from 'antd';
import { poppins } from 'pages/_app';
import { FollowersResponse, FollowUserData } from 'pages/api/v1/fetch-follows/followersAndFollowingInfo';
import React, { useEffect, useState } from 'react';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import FollowTooltip from './FollowTooltip';
import { IFollowState } from 'pages/api/v1/fetch-follows/following-list';
import { useFollowSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { setFollowingIds } from '~src/redux/follow';

const FollowersAndFollowing = ({ userId }: { userId: number }) => {
	const { id } = useUserDetailsSelector();
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState<{ loading: boolean; error: string | null }>({
		loading: false,
		error: null
	});
	const [data, setData] = useState<FollowersResponse>();
	const { followingIds } = useFollowSelector();

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

	const fetchfollowing = async () => {
		try {
			const { data, error } = await nextApiClientFetch<IFollowState>('/api/v1/fetch-follows/following-list');
			if (error) {
				console.log('Error while fetchinf following data', error);
			}
			if (data?.followingIds) {
				const ids = data.followingIds;
				console.log('ids', ids);

				dispatch(setFollowingIds(ids));
			}
		} catch (err) {
			setIsLoading({ loading: false, error: 'An error occurred while fetching following.' });
		}
	};

	const addToFollowing = (user: FollowUserData) => {
		setData(
			(prev) =>
				({
					...prev, // Retain other fields
					following: [...(prev?.following || []), user], // Add the new user to the following list
					message: prev?.message || '',
					followers: prev?.followers || []
				}) as FollowersResponse
		);
	};

	// Remove a user from the following list by `followed_user_id`
	const removeFromFollowing = (followedUserId: number) => {
		setData(
			(prev) =>
				({
					...prev, // Retain other fields
					following: prev?.following?.filter((user) => user.followed_user_id !== followedUserId) || [],
					message: prev?.message || '',
					followers: prev?.followers || []
				}) as FollowersResponse
		);
	};

	useEffect(() => {
		fetchFollowers();
		if (id) fetchfollowing();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId, id, followingIds.length]);

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
										addToFollowing={addToFollowing}
										removeFromFollowing={removeFromFollowing}
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
										addToFollowing={addToFollowing}
										removeFromFollowing={removeFromFollowing}
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
