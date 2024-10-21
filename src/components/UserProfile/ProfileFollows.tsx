// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { Divider, Spin } from 'antd';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import { ClockCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageComponent from '../ImageComponent';
import FollowButton from './Follow/FollowButton';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { ProfileFollowIcon } from '~src/ui-components/CustomIcons';
import Link from 'next/link';
import Image from 'next/image';
import useImagePreloader from '~src/hooks/useImagePreloader';

interface FollowerData {
	follower_user_id: number;
	followed_user_id: number;
	created_at: Date;
	username: string;
	image: string | null;
}

interface FollowerResponse {
	message: string;
	followers: FollowerData[];
}

const ProfileFollows = ({ className }: { className: string }) => {
	const [followers, setFollowers] = useState<FollowerData[]>([]);
	const [isLoading, setIsLoading] = useState<{ loading: boolean; error: string | null }>({
		loading: false,
		error: null
	});
	const isGifLoaded = useImagePreloader('/assets/Gifs/search.gif');

	const fetchFollowers = async () => {
		setIsLoading({ loading: true, error: null });

		try {
			const { data, error } = await nextApiClientFetch<FollowerResponse>('/api/v1/fetch-follows');
			if (error) {
				setIsLoading({ loading: false, error: 'Failed to fetch followers' });
			} else if (data) {
				setFollowers(data.followers);
				setIsLoading({ loading: false, error: null });
			}
		} catch (err) {
			setIsLoading({ loading: false, error: 'An error occurred while fetching followers.' });
		}
	};

	useEffect(() => {
		fetchFollowers();
	}, []);

	return (
		<div
			className={classNames(
				className,
				'mt-6 flex min-h-[280px] flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
			)}
		>
			<Spin spinning={isLoading.loading}>
				<div className={'flex items-center justify-between gap-4 px-6 '}>
					<div className='flex items-center gap-2 text-xl font-medium max-md:justify-start'>
						<ProfileFollowIcon className='active-icon text-2xl text-lightBlue dark:text-[#9E9E9E]' />
						<div className='flex items-baseline gap-1 text-bodyBlue dark:text-white'>
							Connections<span className='text-xs text-blue-light-medium dark:text-blue-dark-medium'>({followers.length})</span>
						</div>
					</div>
				</div>

				<div className='mt-6 px-6'>
					{isLoading.error && <div className='text-red-500'>{isLoading.error}</div>}
					{isLoading.loading ? (
						<div className='flex items-center justify-center'>
							<Image
								src={!isGifLoaded ? '/assets/Gifs/search.svg' : '/assets/Gifs/search.gif'}
								alt='search-icon'
								width={274}
								height={274}
								className='-my-[40px]'
								priority={true}
							/>
						</div>
					) : followers.length == 0 ? (
						<div className='flex flex-col items-center pb-10'>
							<Image
								src={!isGifLoaded ? '/assets/Gifs/search.svg' : '/assets/Gifs/search.gif'}
								alt='search-icon'
								width={274}
								height={274}
								className='-my-[40px]'
								priority={true}
							/>
							<span className='font-medium text-blue-light-medium dark:text-blue-dark-medium'>Oops! Nothing to show please come back later</span>
						</div>
					) : (
						<>
							{followers.map((follower, index) => (
								<div key={follower.follower_user_id}>
									<div className={`${poppins.variable} ${poppins.className} mb-4 mt-3 flex items-start gap-3`}>
										<ImageComponent
											src={follower.image || '/assets/icons/user-profile.png'}
											alt={follower.username}
											className='h-9 w-9 rounded-full'
											iconClassName='h-9 w-9'
										/>
										<div className='flex flex-col gap-2'>
											<div className='flex items-center gap-[6px]'>
												<Link
													href={`/user/${follower.username}`}
													className='cursor-pointer'
												>
													<span className='text-sm font-semibold text-blue-light-high dark:text-blue-dark-high'>{follower.username}</span>
												</Link>
												<span className='text-xs text-blue-light-medium dark:text-blue-dark-medium'>followed you</span>
											</div>

											<span className='text-xs text-blue-light-medium dark:text-blue-dark-medium'>
												<ClockCircleOutlined className='mr-[6px]' />
												{getRelativeCreatedAt(new Date(follower.created_at))}
											</span>
										</div>
										<FollowButton
											userId={follower.follower_user_id}
											isUsedInProfileTab={true}
										/>
									</div>

									{index !== followers.length - 1 && (
										<Divider
											type='horizontal'
											className='my-0 bg-[#D2D8E0B2] dark:bg-separatorDark'
										/>
									)}
								</div>
							))}
						</>
					)}
				</div>
			</Spin>
		</div>
	);
};

export default ProfileFollows;
