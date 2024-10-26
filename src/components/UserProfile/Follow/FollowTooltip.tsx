// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import Link from 'next/link';
import { poppins } from 'pages/_app';
import { FollowUserData } from 'pages/api/v1/fetch-follows/followersAndFollowingInfo';
import React from 'react';
import ImageComponent from '~src/components/ImageComponent';
import { useNetworkSelector } from '~src/redux/selectors';
import Loader from '~src/ui-components/Loader';
import FollowButton from './FollowButton';

const FollowTooltip = ({ users, isLoading, isUsedInFollowers }: { users: FollowUserData[]; isLoading: boolean; isUsedInFollowers?: boolean }) => {

	const { network } = useNetworkSelector();
	return (
		<div className={classNames('max-h-24 w-min overflow-y-auto', poppins.className, poppins.variable)}>
			{isLoading ? (
				<Loader className='h-7 w-7' />
			) : (
				<div>
					{users.map((user) => {
						return (
							<div
								key={user.username}
								className='mb-[6px] flex items-center justify-between gap-2'
							>
								<Link
									href={`https://${network}.polkassembly.io/user/${user.username}`}
									target='_blank'
									className='flex items-center gap-[6px]'
								>
									<ImageComponent
										src={user?.image}
										alt='User Picture'
										className='flex h-[20px] w-[20px] items-center justify-center bg-transparent'
										iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
									/>
									<span className='mr-2 text-xs font-medium text-blue-light-high hover:text-pink_primary dark:text-blue-dark-high'>{user.username || 'unknown'}</span>
								</Link>
								<FollowButton
									userId={isUsedInFollowers ? user.follower_user_id : user.followed_user_id}
									isUsedInProfileHeaders={true}
								/>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default FollowTooltip;
