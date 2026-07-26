// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import ActivityFeedRankCard from '~src/components/ActivityFeed/ActivityFeedRankCard';
import ActivityFeedProposalCard from '~src/components/ActivityFeed/ActivityFeedProposalCard';
import ActivityFeedFeaturesSection from '~src/components/ActivityFeed/ActivityFeedFeaturesSection';
import { IApiResponse, NetworkSocials } from '~src/types';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import Skeleton from '~src/basic-components/Skeleton';
import dynamic from 'next/dynamic';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { isAssetHubSupportedNetwork } from '../Home/TreasuryOverview/utils/isAssetHubSupportedNetwork';
import AboutNetwork from '../Home/AboutNetwork';
import ActivityFeedCalendar from './ActivityFeedCalendar';

const ActivityFeedTreasury = dynamic(() => import('~src/components/ActivityFeed/ActivityFeedTreasury'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface IActivitySidebarProps {
	networkSocialsData: IApiResponse<NetworkSocials>;
}

const ActivityFeedSidebar: React.FC<IActivitySidebarProps> = ({ networkSocialsData }) => {
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);

	return (
		<div className='hidden shrink-0 xl:block xl:max-w-[270px] 2xl:max-w-[305px]'>
			<div className='mx-1 mt-2 md:mt-6'>
				{networkSocialsData && (
					<AboutNetwork
						networkSocialsData={networkSocialsData.data}
						showGov2Links
					/>
				)}
			</div>
			{currentUser?.username && (currentUser?.id || '') && <ActivityFeedProposalCard currentUser={currentUser} />}
			<ActivityFeedRankCard setLoginOpen={setLoginOpen} />
			<div>
				<ActivityFeedCalendar />
				<ActivityFeedFeaturesSection />
			</div>
			{isAssetHubSupportedNetwork(network) && <ActivityFeedTreasury />}
			<SignupPopup
				setLoginOpen={setLoginOpen}
				modalOpen={openSignup}
				setModalOpen={setSignupOpen}
				isModal={true}
			/>
			<LoginPopup
				setSignupOpen={setSignupOpen}
				modalOpen={openLogin}
				setModalOpen={setLoginOpen}
				isModal={true}
			/>
		</div>
	);
};

export default ActivityFeedSidebar;
