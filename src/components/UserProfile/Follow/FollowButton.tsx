// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Image from 'next/image';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useFollowStatus } from '~src/hooks/useFollowStatus';

const FollowButton = ({ userId, isUsedInProfileTab, isUsedInProfileHeaders }: { userId: number; isUsedInProfileTab?: boolean; isUsedInProfileHeaders?: boolean }) => {
	const { id } = useUserDetailsSelector();
	const { isFollowing, loading, followUser, unfollowUser } = useFollowStatus(userId);

	const handleFollowClick = () => {
		if (isFollowing) {
			unfollowUser(userId);
		} else {
			followUser(userId);
		}
	};

	const buttonClass = isUsedInProfileTab ? 'rounded-md border-none px-3 py-0 text-xs text-white' : 'rounded-full border-none px-4 py-2.5 text-white max-md:p-3';
	const buttonHeight = isUsedInProfileTab ? 28 : undefined;
	const buttonText = isFollowing ? 'Unfollow' : isUsedInProfileTab ? 'Follow Back' : 'Follow';

	return (
		<>
			{!isUsedInProfileHeaders ? (
				<CustomButton
					shape='circle'
					variant='primary'
					className={`${buttonClass} ${!id && 'opacity-50'}`}
					onClick={handleFollowClick}
					disabled={!id || loading}
					height={buttonHeight}
				>
					<Image
						src={'/assets/profile/profile-follow.svg'}
						className='mr-1 rounded-full'
						height={20}
						width={20}
						alt={isFollowing ? 'unfollow logo' : 'follow logo'}
					/>
					<span className='max-md:hidden'>{loading ? 'loading...' : buttonText}</span>
				</CustomButton>
			) : (
				<CustomButton
					shape='circle'
					variant='link'
					className={`w-min px-2 text-xs font-normal ${!id && 'opacity-50'}`}
					onClick={handleFollowClick}
					disabled={!id || loading}
					height={20}
					buttonsize={'10'}
				>
					<span className='text-center'>{loading ? 'loading...' : buttonText}</span>
				</CustomButton>
			)}
		</>
	);
};

export default FollowButton;
