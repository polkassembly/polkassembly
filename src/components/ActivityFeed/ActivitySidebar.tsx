// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import AboutActivity from '~src/components/ActivityFeed/AboutActivity';
import RankCard from '~src/components/ActivityFeed/RankCard';
import ProposalCard from '~src/components/ActivityFeed/ProposalCard';
import FeaturesSection from '~src/components/ActivityFeed/FeaturesSection';
import { IApiResponse, NetworkSocials } from '~src/types';
import { network as AllNetworks } from '~src/global/networkConstants';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import Skeleton from '~src/basic-components/Skeleton';
import dynamic from 'next/dynamic';

const ActivityTreasury = dynamic(() => import('~src/components/ActivityFeed/ActivityTreasury'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface ActivitySidebarProps {
	network: string;
	networkSocialsData: IApiResponse<NetworkSocials>;
	currentUser: any;
	userRank: number;
	currentUserdata: any;
	setLoginOpen: (open: boolean) => void;
	openLogin: boolean;
	setSignupOpen: (open: boolean) => void;
	openSignup: boolean;
}

export const isAssetHubNetwork = [AllNetworks.POLKADOT];

const ActivitySidebar: React.FC<ActivitySidebarProps> = ({
	network,
	networkSocialsData,
	currentUser,
	userRank,
	currentUserdata,
	setLoginOpen,
	openLogin,
	setSignupOpen,
	openSignup
}) => {
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
			{currentUser?.username && currentUser?.id && <ProposalCard currentUser={currentUser} />}
			<RankCard
				userRank={userRank}
				currentUser={currentUser}
				currentUserdata={currentUserdata}
				setLoginOpen={setLoginOpen}
			/>
			<div>
				<FeaturesSection />
			</div>
			{isAssetHubNetwork.includes(network) && <ActivityTreasury />}
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
