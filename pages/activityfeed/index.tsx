// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { getLatestActivityAllPosts } from 'pages/api/v1/latest-activity/all-posts';
import { getLatestActivityOffChainPosts } from 'pages/api/v1/latest-activity/off-chain-posts';
import { getLatestActivityOnChainPosts } from 'pages/api/v1/latest-activity/on-chain-posts';
import { getNetworkSocials } from 'pages/api/v1/network-socials';
import React, { useEffect, useState } from 'react';
import Gov2LatestActivity from './LatestActivity';
import { FaAngleRight } from 'react-icons/fa6';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { EGovType, OffChainProposalType, ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { IApiResponse, NetworkSocials } from '~src/types';
import { ErrorState } from '~src/ui-components/UIStates';
import styled from 'styled-components';
import { redisGet, redisSet } from '~src/auth/redis';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { useTheme } from 'next-themes';
import ProposalActionButtons from '~src/ui-components/ProposalActionButtons';
import Skeleton from '~src/basic-components/Skeleton';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import AboutActivity from './AboutActivity';
import ScoreTag from '~src/ui-components/ScoreTag';
import profileWithAddress, { getProfileWithAddress, IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import { use } from 'chai';
import axios from 'axios';

const TreasuryOverview = dynamic(() => import('~src/components/Home/TreasuryOverview'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const BatchVotingBadge = dynamic(() => import('~src/components/Home/LatestActivity/BatchVotingBadge'), {
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
	const { resolvedTheme: theme } = useTheme();
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;

	const [proposaldata, setProposalData] = useState({ discussions: 0, proposals: 0, votes: 0 });
	const [loading, setLoading] = useState(true);
	const [proposalerror, setProposalError] = useState<string | null>(null);

	useEffect(() => {
		async function getProposalData() {
			try {
				const response = await axios.post('/api/v1/posts/user-total-post-counts', {
					addresses: ['5GFE6fdDkd4wXyDvQayrs9DL7K8Fx9mBFRFwioCmE4yB2GCU'],
					userId: 22518
				});
				setProposalData(response.data);
			} catch (err) {
				setProposalError('Failed to fetch data');
			} finally {
				setLoading(false);
			}
		}

		getProposalData();
	}, []);
	console.log('proposaldata', proposaldata);

	// const address = localStorage.getItem('loginAddress');
	// useEffect(() => {
	// 	async function getuserData() {
	// 		const { data, error } = await profileWithAddress({ address: address });
	// 		const profileScore = data?.profile?.score;
	// 	}

	// 	getuserData();
	// }, [address]);

	useEffect(() => {
		if (!network) return;
		const address = localStorage.getItem('loginAddress') || '';
		async function getuserData() {
			// const { data, error } = await getProfileWithAddress({
			// 	address
			// });
			// const profileScore = data?.profile;
			// console.log('profileScore', profileScore);
		}
		getuserData();
	}, [network]);

	console.log('networkSocialsData', networkSocialsData);
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
			<div className='mx-2 w-full max-w-[1300px] '>
				<div className='mt-3 flex w-full items-center justify-between'>
					<h1 className='mx-2 -mb-[6px] text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>Activity Feed</h1>
					<div className='mr-[6px] flex justify-between'>
						<ProposalActionButtons isUsedInHomePage={true} />
					</div>
				</div>

				<div className='flex flex-col justify-between gap-5 xl:flex-row  '>
					<div className=''>
						{isOpenGovSupported(network) && isMobile && (window as any).walletExtension?.isNovaWallet && (
							<div className='mx-1 mt-8'>
								<BatchVotingBadge />
							</div>
						)}
					</div>
					<div className='mx-1 mt-8 max-w-[940px]'>
						<Gov2LatestActivity gov2LatestPosts={gov2LatestPosts} />
					</div>
					<div className='w-[450px]   '>
						<div className='mx-1 mt-2 md:mt-6'>
							{networkSocialsData && (
								<AboutActivity
									networkSocialsData={networkSocialsData?.data}
									showGov2Links
								/>
							)}
						</div>
						<div>
							<div className='mt-5 rounded-xxl bg-white p-5 text-[13px] drop-shadow-md dark:bg-section-dark-overlay md:p-5'>
								<div className='flex items-center justify-between gap-2'>
									<div className='flex gap-1'>
										<p className='font-semibold'>Voted Proposals</p>
										<FaAngleRight />
									</div>
									<p className='rounded-full bg-[#485F7D] bg-opacity-[5%] p-2 px-3 text-[9px]'>Last 15 days</p>
								</div>
							</div>
						</div>
						<div>
							{/* {!isNaN(profileScore) && (
								<ScoreTag
									score={profileScore}
									className='ml-1 px-1 pr-3'
									scale={1.1}
									iconWrapperClassName='ml-1.5 mt-[5.5px]'
								/>
							)} */}
						</div>
					</div>
				</div>
			</div>
			{/* <div className='flex flex-col px-3 xl:flex-row'>
				<div className='flex-1'>
					{isOpenGovSupported(network) && isMobile && (window as any).walletExtension?.isNovaWallet && (
						<div className='mx-1 mt-8'>
							<BatchVotingBadge />
						</div>
					)}

					<div className='mx-1 mt-8 '>
						<Gov2LatestActivity gov2LatestPosts={gov2LatestPosts} />
					</div>
				</div>
				<div className='w-full xl:w-[300px] xl:pl-6'>
					<div className='mx-1 mt-2 md:mt-6'>
						{networkSocialsData && (
							<AboutActivity
								networkSocialsData={networkSocialsData?.data}
								showGov2Links
							/>
						)}
					</div>
					<div>
						<div className='mt-5 rounded-xxl bg-white p-5 text-[13px] drop-shadow-md dark:bg-section-dark-overlay md:p-5'>
							<div className='flex items-center justify-between gap-2'>
								<div className='flex gap-1'>
									<p className='font-semibold'>Voted Proposals</p>
									<FaAngleRight />
								</div>
								<p className='rounded-full bg-[#485F7D] bg-opacity-[5%] p-2 px-3 text-[9px]'>Last 15 days</p>
							</div>
						</div>
					</div>
				</div>
			</div> */}
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
