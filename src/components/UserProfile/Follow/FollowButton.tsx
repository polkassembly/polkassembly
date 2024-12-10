// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Image from 'next/image';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useFollowStatus } from '~src/hooks/useFollowStatus';
import { FollowUserData } from 'pages/api/v1/fetch-follows/followersAndFollowingInfo';
import { useDispatch, useSelector } from 'react-redux';
import { addFollowingId, isFollowing, removeFollowingId } from '~src/redux/follow';

const FollowButton = ({
	userId,
	isUsedInProfileTab,
	isUsedInProfileHeaders,
	addToFollowing,
	removeFromFollowing,
	user,
	isUsedInCommunityTab
}: {
	userId: number;
	isUsedInProfileTab?: boolean;
	isUsedInProfileHeaders?: boolean;
	addToFollowing?: (user: FollowUserData) => void;
	removeFromFollowing?: (userId: number) => void;
	user?: FollowUserData;
	isUsedInCommunityTab?: boolean;
}) => {
	const { id } = useUserDetailsSelector();
	const { loading, followUser, unfollowUser, setIsFollowing } = useFollowStatus(userId);
	const dispatch = useDispatch();
	const isUserFollowing = useSelector((state: any) => isFollowing(state.follow, userId));

	const handleFollowClick = () => {
		if (isUserFollowing) {
			dispatch(removeFollowingId(userId));
			unfollowUser(userId);
			removeFromFollowing?.(userId);
		} else {
			followUser(userId);
			dispatch(addFollowingId(userId));
			user && addToFollowing?.(user);
		}
		setIsFollowing(!isFollowing);
	};

	const buttonClass = isUsedInProfileTab
		? 'rounded-md border-none px-3 py-0 text-xs text-white'
		: `rounded-full border-none py-2.5 text-white ${isUsedInCommunityTab ? 'px-3 max-md:p-2' : 'px-4 max-md:p-3'}`;
	const buttonHeight = isUsedInProfileTab ? 28 : isUsedInCommunityTab ? 30 : undefined;
	const buttonText = isUserFollowing ? 'Unfollow' : isUsedInProfileTab ? 'Follow Back' : 'Follow';

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
						alt={isUserFollowing ? 'unfollow logo' : 'follow logo'}
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
