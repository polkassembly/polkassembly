// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import classNames from 'classnames';
import { ProfileDetailsResponse } from '~src/auth/types';
import { Tabs } from '~src/ui-components/Tabs';
import ProfileOverview from './ProfileOverview';
import { votesHistoryUnavailableNetworks } from 'pages/user/[username]';
import { useNetworkSelector } from '~src/redux/selectors';
import VotesHistory from '~src/ui-components/VotesHistory';
import Image from 'next/image';
import styled from 'styled-components';
import ProfilePosts from './ProfilePosts';
import { IUserPostsListingResponse } from 'pages/api/v1/listing/user-posts';
interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	selectedAddresses: string[];
	setSelectedAddresses: (pre: string[]) => void;
	userPosts: IUserPostsListingResponse;
}

const ProfileTabs = ({ className, theme, userProfile, addressWithIdentity, selectedAddresses, setSelectedAddresses, userPosts }: Props) => {
	const { network } = useNetworkSelector();
	const tabItems = [
		{
			children: (
				<ProfileOverview
					userProfile={userProfile}
					addressWithIdentity={addressWithIdentity}
					theme={theme}
					selectedAddresses={selectedAddresses}
					setSelectedAddresses={setSelectedAddresses}
				/>
			),
			key: 'Overview',
			label: (
				<div className='flex items-center gap-2'>
					<Image
						src='/assets/profile/profile-overview.svg'
						alt=''
						width={18}
						height={18}
						className='active-icon'
					/>
					Overview
				</div>
			)
		},
		{
			children: (
				<ProfilePosts
					userProfile={userProfile}
					addressWithIdentity={addressWithIdentity}
					theme={theme}
					userPosts={userPosts}
				/>
			),
			key: 'Posts',
			label: (
				<div className='flex items-center gap-2'>
					<Image
						src='/assets/profile/profile-clipboard.svg'
						alt=''
						width={18}
						height={18}
						className='active-icon'
					/>
					Posts
				</div>
			)
		}
	];
	if (!votesHistoryUnavailableNetworks.includes(network)) {
		tabItems.splice(1, 0, {
			children: (
				<VotesHistory
					userProfile={userProfile}
					theme={theme}
				/>
			),
			key: 'Votes',
			label: (
				<div className='flex items-center gap-2'>
					<Image
						src='/assets/profile/profile-votes.svg'
						alt=''
						width={20}
						height={20}
						className='active-icon'
					/>
					Votes
				</div>
			)
		});
	}
	return (
		<div className={classNames(className, 'rounded-[18px]')}>
			<Tabs
				theme={theme}
				type='card'
				className='ant-tabs-tab-bg-white font-medium text-bodyBlue  dark:bg-transparent dark:text-blue-dark-high'
				items={tabItems}
			/>
		</div>
	);
};

export default styled(ProfileTabs)`
	.ant-tabs-tab-active .active-icon {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}
	//dark mode icon color change
	// .dark .darkmode-icons {
	// filter: brightness(100%) saturate(0%) contrast(4) invert(100%) !important;
	// }
`;
