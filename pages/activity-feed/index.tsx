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
import TopToggleButton from '~src/components/ActivityFeed/TopToggleButton';
import ActivitySidebar from '~src/components/ActivityFeed/ActivitySidebar';
import { Tab } from '~src/components/ActivityFeed/types/types';

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
	try {
		const network = getNetworkFromReqHeaders(req.headers);
		const networkRedirect = checkRouteNetworkWithRedirect(network);
		if (networkRedirect) return networkRedirect;

		if (!networkTrackInfo[network]) {
			return {
				props: {
					error: `Network '${network}' does not support OpenGov yet.`,
					network,
					networkSocialsData: null
				}
			};
		}

		const networkSocialsData = await getNetworkSocials({ network });

		return {
			props: {
				error: '',
				network,
				networkSocialsData
			}
		};
	} catch (error) {
		console.error('Error in getServerSideProps:', error);
		return {
			props: {
				error: 'An unexpected error occurred. Please try again later.',
				network: '',
				networkSocialsData: null
			}
		};
	}
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

	const [activeTab, setActiveTab] = useState<Tab>('explore' as Tab);
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
						<TopToggleButton
							activeTab={activeTab}
							setActiveTab={setActiveTab}
						/>
					</div>
					<div className='flex flex-col items-end gap-2 lg:flex-row xl:mr-[6px] xl:justify-end'>
						<ProposalActionButtons isUsedInHomePage={true} />
					</div>
				</div>

				<div className='flex flex-col justify-between gap-5 xl:flex-row'>
					<div className='mx-1 mt-[26px] flex-grow'>
						<div className=''>{activeTab === 'explore' ? <LatestActivity currentTab='explore' /> : <LatestActivity currentTab='following' />}</div>
					</div>
					<ActivitySidebar
						network={network}
						networkSocialsData={networkSocialsData || { data: null, error: '', status: 500 }}
						currentUser={currentUser}
						userRank={userRank}
						currentUserdata={currentUserdata}
						setLoginOpen={setLoginOpen}
						openLogin={openLogin}
						setSignupOpen={setSignupOpen}
						openSignup={openSignup}
					/>
				</div>
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
	}
	.ant-float-btn-group-circle {
		display: none !important;
	}
`;
