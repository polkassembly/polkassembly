// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import AboutActivity from '~src/components/ActivityFeed/AboutActivity';
import RankCard from '~src/components/ActivityFeed/RankCard';
import ProposalCard from '~src/components/ActivityFeed/ProposalCard';
import FeaturesSection from '~src/components/ActivityFeed/FeaturesSection';
import { IApiResponse, NetworkSocials } from '~src/types';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import Skeleton from '~src/basic-components/Skeleton';
import dynamic from 'next/dynamic';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { isAssetHubSupportedNetwork } from '../Home/TreasuryOverview/utils/isAssetHubSupportedNetwork';

const ActivityTreasury = dynamic(() => import('~src/components/ActivityFeed/ActivityTreasury'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface ActivitySidebarProps {
	networkSocialsData: IApiResponse<NetworkSocials>;
}

const ActivitySidebar: React.FC<ActivitySidebarProps> = ({ networkSocialsData }) => {
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);

	return (
		<div className='hidden shrink-0 xl:block xl:max-w-[270px] 2xl:max-w-[305px]'>
			<div className='mx-1 mt-2 md:mt-6'>
				{networkSocialsData && (
					<AboutActivity
						networkSocialsData={networkSocialsData.data}
						showGov2Links
					/>
				)}
			</div>
			{currentUser?.username && (currentUser?.id || '') && <ProposalCard currentUser={currentUser} />}
			<RankCard setLoginOpen={setLoginOpen} />
			<div>
				<FeaturesSection />
			</div>
			{isAssetHubSupportedNetwork(network) && <ActivityTreasury />}
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

export default ActivitySidebar;
