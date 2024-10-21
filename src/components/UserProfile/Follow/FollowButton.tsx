// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Image from 'next/image';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useFollowStatus } from '~src/hooks/useFollowStatus';

const FollowButton = ({ userId, isUsedInProfileTab }: { userId: number; isUsedInProfileTab?: boolean }) => {
	const { id } = useUserDetailsSelector();
	const { isFollowing, loading, followUser, unfollowUser } = useFollowStatus(userId);

	const handleFollowClick = () => {
		if (isFollowing) {
			unfollowUser(userId);
		} else {
			followUser(userId);
		}
	};

	return (
		<div>
			{isUsedInProfileTab ? (
				<CustomButton
					shape='circle'
					variant='primary'
					className={`rounded-md border-none px-3 py-0 text-xs text-white ${!id && 'opacity-50'}`}
					onClick={handleFollowClick}
					disabled={!id || loading}
					height={28}
				>
					<Image
						src={'/assets/profile/profile-follow.svg'}
						className='mr-1 rounded-full'
						height={20}
						width={20}
						alt={isFollowing ? 'unfollow logo' : 'follow logo'}
					/>
					<span className='max-md:hidden'>{loading ? 'loading...' : isFollowing ? 'Unfollow' : 'Follow Back'}</span>
				</CustomButton>
			) : (
				<CustomButton
					shape='circle'
					variant='primary'
					className={`rounded-full border-none px-4 py-2.5 text-white max-md:p-3 ${!id && 'opacity-50'}`}
					onClick={handleFollowClick}
					disabled={!id || loading}
				>
					<Image
						src={'/assets/profile/profile-follow.svg'}
						className='mr-1 rounded-full'
						height={20}
						width={20}
						alt={isFollowing ? 'unfollow logo' : 'follow logo'}
					/>
					<span className='max-md:hidden'>{loading ? 'loading...' : isFollowing ? 'Unfollow' : 'Follow'}</span>
				</CustomButton>
			)}
		</div>
	);
};

export default FollowButton;
