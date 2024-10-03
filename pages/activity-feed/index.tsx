// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { getNetworkSocials } from 'pages/api/v1/network-socials';
import React, { useEffect, useState } from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import SEOHead from '~src/global/SEOHead';
import { IApiResponse, NetworkSocials } from '~src/types';
import { ErrorState } from '~src/ui-components/UIStates';
import styled from 'styled-components';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import ProposalActionButtons from '~src/ui-components/ProposalActionButtons';
import Skeleton from '~src/basic-components/Skeleton';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { network as AllNetworks } from '~src/global/networkConstants';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { LeaderboardResponse } from 'pages/api/v1/leaderboard';
import AboutActivity from '~src/components/ActivityFeed/AboutActivity';
import FeaturesSection from '~src/components/ActivityFeed/FeaturesSection';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import RankCard from '~src/components/ActivityFeed/RankCard';
import ProposalCard from '~src/components/ActivityFeed/ProposalCard';

const ActivityTreasury = dynamic(() => import('~src/components/ActivityFeed/ActivityTreasury'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const LatestActivity = dynamic(() => import('~src/components/ActivityFeed/LatestActivity'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface Props {
	networkSocialsData?: IApiResponse<NetworkSocials>;
	network: string;
	error: string;
}

export const isAssetHubNetwork = [AllNetworks.POLKADOT];

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;
	const networkSocialsData = await getNetworkSocials({ network });
	if (!networkTrackInfo[network]) {
		return { props: { error: 'Network does not support OpenGov yet.' } };
	}
	const props: Props = {
		error: '',
		network,
		networkSocialsData
	};

	return { props };
};

const ActivityFeed = ({ error, network, networkSocialsData }: Props) => {
	const dispatch = useDispatch();
	const currentUser = useUserDetailsSelector();
	const { username } = currentUser;

	const [currentUserdata, setCurrentUserdata] = useState<any | null>(null);
	const [userRank, setUserRank] = useState<number | 0>(0);
	const getUserProfile = async (username: string) => {
		try {
			const { data: userProfileData, error: userProfileError } = await nextApiClientFetch<any>(`api/v1/auth/data/userProfileWithUsername?username=${username}`);
			if (userProfileError) {
				console.error('Error fetching user profile:', userProfileError);
				return;
			}
			if (userProfileData) {
				setCurrentUserdata(userProfileData);

				const { data: leaderboardData, error: leaderboardError } = await nextApiClientFetch<LeaderboardResponse>('api/v1/leaderboard', { username });
				if (leaderboardError) {
					console.error('Error fetching leaderboard data:', leaderboardError);
					return;
				}

				if (leaderboardData && leaderboardData?.data && leaderboardData?.data?.length > 0) {
					const userRank = leaderboardData.data[0].rank;
					setUserRank(userRank);
					setCurrentUserdata((prevData: any) => ({
						...prevData
					}));
				} else {
					console.log('User rank not found.');
				}
			}
		} catch (err) {
			console.error('An unexpected error occurred:', err);
		}
	};

	useEffect(() => {
		if (username) {
			getUserProfile(username.toString());
		} else {
			console.error('Username is not available');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [username, network]);

	useEffect(() => {
		dispatch(setNetwork(network));
	}, [network, dispatch]);

	const [activeTab, setActiveTab] = useState('explore');
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);

	if (error) return <ErrorState errorMessage={error} />;

	return (
		<>
			<SEOHead
				title='OpenGov'
				desc={`Join the future of blockchain with ${network}'s revolutionary governance system on Polkassembly`}
				network={network}
			/>
			<div className=' w-full font-poppins  '>
				<div className='flex w-full justify-between lg:mt-3 xl:items-center'>
					<div className='flex flex-col lg:flex-row  xl:h-12 xl:gap-2'>
						<div>
							<h1 className='mx-2 text-xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high lg:mt-3 lg:text-2xl'>Activity Feed</h1>
						</div>
						<div className='mt-2 flex h-9 items-center gap-1 rounded-lg bg-[#ECECEC] p-2 dark:bg-white dark:bg-opacity-[12%] md:gap-2 md:p-2  md:pt-5'>
							<p
								onClick={() => setActiveTab('explore')}
								className={`mt-4 cursor-pointer rounded-md px-2 py-[3px] text-[15px] font-semibold  md:mt-1 md:px-4 md:py-[5px] md:text-[16px] ${
									activeTab === 'explore' ? 'bg-[#FFFFFF] text-[#E5007A] dark:bg-[#0D0D0D]' : 'text-[#485F7D] dark:text-[#DADADA]'
								}`}
							>
								Explore
							</p>
							<p
								onClick={() => setActiveTab('following')}
								className={`mt-4 cursor-pointer rounded-lg px-2 py-[3px] text-[15px] font-semibold md:mt-1 md:px-4 md:py-[5px] md:text-[16px] ${
									activeTab === 'following' ? 'bg-[#FFFFFF] text-[#E5007A] dark:bg-[#0D0D0D]' : 'text-[#485F7D] dark:text-[#DADADA]'
								}`}
							>
								Subscribed
							</p>
						</div>
					</div>
					<div className='flex flex-col items-end gap-2 lg:flex-row xl:mr-[6px] xl:justify-end'>
						<ProposalActionButtons isUsedInHomePage={true} />
					</div>
				</div>

				<div className='flex flex-col justify-between gap-5 xl:flex-row'>
					{/* Main content */}
					<div className='mx-1 mt-[26px] flex-grow'>
						<div className=''>{activeTab === 'explore' ? <LatestActivity currentTab='explore' /> : <LatestActivity currentTab='following' />}</div>
					</div>

					{/* Sidebar */}
					<div className='hidden shrink-0 xl:block xl:max-w-[270px] 2xl:max-w-[305px]'>
						{/* About Activity Section */}
						<div className='mx-1 mt-2 md:mt-6'>
							{networkSocialsData && (
								<AboutActivity
									networkSocialsData={networkSocialsData?.data}
									showGov2Links
								/>
							)}
						</div>

						{/* Proposal Section */}
						{currentUser?.username && currentUser?.id && <ProposalCard currentUser={currentUser} />}

						{/* Rank Section */}
						<RankCard
							userRank={userRank}
							currentUser={currentUser}
							currentUserdata={currentUserdata}
							setLoginOpen={setLoginOpen}
						/>

						{/* Features Section */}
						<div>
							<FeaturesSection />
						</div>

						{/* Treasury Section */}
						{isAssetHubNetwork.includes(network) && <ActivityTreasury />}
					</div>
				</div>

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
		</>
	);
};

export default styled(ActivityFeed)`
	.docsbot-wrapper {
		z-index: 1 !important;
		margin-left: 250px;
		pointer-events: none !important;
	}
	.floating-button {
		display: none !important;
	}
	.docsbot-chat-inner-container {
		z-index: 1 !important;
		margin-right: 250px !important;
		pointer-events: none !important;
		background-color: red;
	}
	.ant-float-btn-group-circle {
		display: none !important;
	}
`;
