// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Image from 'next/image';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { ProfileDetailsResponse } from '~src/auth/types';
import { useFollowStatus } from '~src/hooks/useFollowStatus';

const FollowButton = ({ userProfile }: { userProfile: ProfileDetailsResponse }) => {
	const { id } = useUserDetailsSelector();
	const { isFollowing, loading, error, followUser, unfollowUser } = useFollowStatus(userProfile.user_id);

	const handleFollowClick = () => {
		if (isFollowing) {
			unfollowUser(userProfile.user_id);
		} else {
			followUser(userProfile.user_id);
		}
	};

	return (
		<div>
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
				<span className='max-md:hidden'>{loading ? (isFollowing ? 'Unfollowing...' : 'Following...') : isFollowing ? 'Unfollow' : 'Follow'}</span>
			</CustomButton>
			{error && <p className='text-red-500'>{error}</p>}
		</div>
	);
};

export default FollowButton;
