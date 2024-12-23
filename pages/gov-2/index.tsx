// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { getLatestActivityAllPosts } from 'pages/api/v1/latest-activity/all-posts';
import { getLatestActivityOffChainPosts } from 'pages/api/v1/latest-activity/off-chain-posts';
import { getLatestActivityOnChainPosts } from 'pages/api/v1/latest-activity/on-chain-posts';
import { getNetworkSocials } from 'pages/api/v1/network-socials';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Gov2LatestActivity from 'src/components/Gov2Home/Gov2LatestActivity';
import AboutNetwork from 'src/components/Home/AboutNetwork';
import News from 'src/components/Home/News';
import UpcomingEvents from 'src/components/Home/UpcomingEvents';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { EGovType, OffChainProposalType, ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import { IApiResponse, NetworkSocials } from '~src/types';
import { ErrorState } from '~src/ui-components/UIStates';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useTheme } from 'next-themes';
import Skeleton from '~src/basic-components/Skeleton';

const TreasuryOverview = dynamic(() => import('~src/components/Home/TreasuryOverview/index'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface Props {
	networkSocialsData?: IApiResponse<NetworkSocials>;
	gov2LatestPosts: Object;
	network: string;
	error: string;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;
	if ((isOpenGovSupported(network) && !req.headers.referer) || network === 'polkadot') {
		return {
			props: {},
			redirect: {
				destination: '/opengov'
			}
		};
	}

	const LATEST_POSTS_LIMIT = 8;

	const networkSocialsData = await getNetworkSocials({ network });

	if (!networkTrackInfo[network]) {
		return { props: { error: 'Network does not support OpenGov yet.' } };
	}

	const fetches = {
		allGov2Posts: getLatestActivityAllPosts({
			govType: EGovType.OPEN_GOV,
			listingLimit: LATEST_POSTS_LIMIT,
			network
		}),
		discussionPosts: getLatestActivityOffChainPosts({
			listingLimit: LATEST_POSTS_LIMIT,
			network,
			proposalType: OffChainProposalType.DISCUSSIONS
		})
	};

	for (const trackName of Object.keys(networkTrackInfo[network])) {
		fetches[trackName as keyof typeof fetches] = getLatestActivityOnChainPosts({
			listingLimit: LATEST_POSTS_LIMIT,
			network,
			proposalType: ProposalType.OPEN_GOV,
			trackNo: networkTrackInfo[network][trackName].trackId
		});
	}

	const responseArr = await Promise.all(Object.values(fetches));

	const gov2LatestPosts = {
		allGov2Posts: responseArr[Object.keys(fetches).indexOf('allGov2Posts')],
		discussionPosts: responseArr[Object.keys(fetches).indexOf('discussionPosts')]
	};

	for (const trackName of Object.keys(networkTrackInfo[network])) {
		(gov2LatestPosts as any)[trackName as keyof typeof gov2LatestPosts] = responseArr[Object.keys(fetches).indexOf(trackName as keyof typeof fetches)];
	}

	const props: Props = {
		error: '',
		gov2LatestPosts,
		network,
		networkSocialsData
	};

	return { props };
};

const Gov2Home = ({ error, gov2LatestPosts, network, networkSocialsData }: Props) => {
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	if (error) return <ErrorState errorMessage={error} />;

	return (
		<>
			<SEOHead
				title='OpenGov'
				desc={`Join the future of blockchain with ${network}'s revolutionary governance system on Polkassembly`}
				network={network}
			/>

			<div className='mx-1 mt-2 md:mt-6'>
				{networkSocialsData && (
					<AboutNetwork
						networkSocialsData={networkSocialsData?.data}
						showGov2Links
					/>
				)}
			</div>

			<div className='mx-1 mt-8'>
				<TreasuryOverview theme={theme} />
			</div>

			<div className='mx-1 mt-8'>
				<Gov2LatestActivity gov2LatestPosts={gov2LatestPosts} />
			</div>

			<div className='mx-1 mt-8 flex flex-col items-center justify-between gap-4 xl:flex-row'>
				<div className='w-full xl:w-[60%]'>
					<UpcomingEvents />
				</div>

				<div className='w-full xl:w-[40%]'>
					<News twitter={networkSocialsData?.data?.twitter || ''} />
				</div>
			</div>
			{/* <ChatFloatingModal /> */}
		</>
	);
};

export default Gov2Home;
