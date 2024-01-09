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

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
}

const ProfileTabs = ({ className, theme, userProfile }: Props) => {
	const { network } = useNetworkSelector();
	const tabItems = [
		{
			children: <ProfileOverview userProfile={userProfile} />,
			key: 'Overview',
			label: 'Overview'
		}
	];
	if (!votesHistoryUnavailableNetworks.includes(network)) {
		tabItems.push({
			children: <VotesHistory userAddresses={userProfile?.addresses || []} />,
			key: 'Votes',
			label: 'Votes'
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

export default ProfileTabs;
