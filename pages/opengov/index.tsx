// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { getLatestActivityAllPosts } from 'pages/api/v1/latest-activity/all-posts';
import { getLatestActivityOffChainPosts } from 'pages/api/v1/latest-activity/off-chain-posts';
import { getLatestActivityOnChainPosts } from 'pages/api/v1/latest-activity/on-chain-posts';
import { getNetworkSocials } from 'pages/api/v1/network-socials';
import React, { useEffect, useState } from 'react';
import Gov2LatestActivity from 'src/components/Gov2Home/Gov2LatestActivity';
import AboutNetwork from 'src/components/Home/AboutNetwork';
import News from 'src/components/Home/News';
import UpcomingEvents from 'src/components/Home/UpcomingEvents';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useApiContext } from '~src/context';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { EGovType, OffChainProposalType, ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { IApiResponse, NetworkSocials } from '~src/types';
import { ErrorState } from '~src/ui-components/UIStates';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import styled from 'styled-components';
import { redisGet, redisSet } from '~src/auth/redis';
import getEncodedAddress from '~src/util/getEncodedAddress';
import IdentityCaution from '~assets/icons/identity-caution.svg';
import { onchainIdentitySupportedNetwork } from '~src/components/AppLayout';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';

const TreasuryOverview = dynamic(() => import('~src/components/Home/TreasuryOverview'), {
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
	const LATEST_POSTS_LIMIT = 8;

	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	if (process.env.IS_CACHING_ALLOWED == '1') {
		const redisData = await redisGet(`${network}_latestActivity_OpenGov`);
		if (redisData) {
			const props = JSON.parse(redisData);
			if (!props.error) {
				return { props };
			}
		}
	}
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
			proposalType: networkTrackInfo[network][trackName]?.fellowshipOrigin ? ProposalType.FELLOWSHIP_REFERENDUMS : ProposalType.OPEN_GOV,
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

	if (process.env.IS_CACHING_ALLOWED == '1') {
		await redisSet(`${network}_latestActivity_OpenGov`, JSON.stringify(props));
	}

	return { props };
};

const Gov2Home = ({ error, gov2LatestPosts, network, networkSocialsData }: Props) => {
	const dispatch = useDispatch();
	const { api, apiReady } = useApiContext();
	const { id: userId } = useUserDetailsSelector();
	const [isIdentityUnverified, setIsIdentityUnverified] = useState<Boolean>(false);
	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		dispatch(setNetwork(network));
		if (!api || !apiReady) return;

		let unsubscribe: () => void;
		const address = localStorage.getItem('identityAddress');
		const identityForm = localStorage.getItem('identityForm');

		const encoded_addr = address ? getEncodedAddress(address, network) : '';
		if (!identityForm || !JSON.parse(identityForm)?.setIdentity) return;

		api.derive.accounts
			.info(encoded_addr, (info: DeriveAccountInfo) => {
				const infoCall = info.identity?.judgements.filter(([, judgement]): boolean => judgement.isFeePaid);
				const judgementProvided = infoCall?.some(([, judgement]): boolean => judgement.isFeePaid);
				setIsIdentityUnverified(judgementProvided || !info?.identity?.judgements?.length);
				if (!(judgementProvided || !info?.identity?.judgements?.length)) {
					localStorage.removeItem('identityForm');
				}
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, apiReady, userId]);

	if (error) return <ErrorState errorMessage={error} />;

	return (
		<>
			<SEOHead
				title='OpenGov'
				desc={`Join the future of blockchain with ${network}'s revolutionary governance system on Polkassembly`}
				network={network}
			/>
			<div className='mr-2 flex justify-between'>
				<h1 className='mx-2 text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>Overview</h1>
				{isIdentityUnverified && onchainIdentitySupportedNetwork.includes(network) && (
					<div className='flex items-center rounded-md border-[1px] border-solid border-[#FFACAC] bg-[#FFF1EF] py-2 pl-3 pr-8 text-sm text-[#E91C26] max-sm:hidden '>
						<IdentityCaution />
						<span className='ml-2'>Social verification incomplete</span>
					</div>
				)}
			</div>
			<div className='mx-1 mt-6'>
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
		</>
	);
};

export default styled(Gov2Home)`
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
