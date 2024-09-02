// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import type { Balance } from '@polkadot/types/interfaces';
import { getLatestActivityAllPosts } from 'pages/api/v1/latest-activity/all-posts';
import { getLatestActivityOffChainPosts } from 'pages/api/v1/latest-activity/off-chain-posts';
import { getLatestActivityOnChainPosts } from 'pages/api/v1/latest-activity/on-chain-posts';
import { getNetworkSocials } from 'pages/api/v1/network-socials';
import React, { useEffect, useState } from 'react';
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
import ProposalActionButtons from '~src/ui-components/ProposalActionButtons';
import Skeleton from '~src/basic-components/Skeleton';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import ScoreTag from '~src/ui-components/ScoreTag';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { subscanApiHeaders } from '~src/global/apiHeaders';
import { setCurrentTokenPrice as setCurrentTokenPriceInRedux } from '~src/redux/currentTokenPrice';
import { network as AllNetworks } from '~src/global/networkConstants';

import { chainProperties } from '~src/global/networkConstants';
import dayjs from 'dayjs';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import { useApiContext } from '~src/context';
import blockToDays from '~src/util/blockToDays';
import { BN_MILLION, BN_ZERO, u8aConcat, u8aToHex } from '@polkadot/util';
import blockToTime from '~src/util/blockToTime';
import getDaysTimeObj from '~src/util/getDaysTimeObj';
import { BN } from 'bn.js';
import formatBnBalance from '~src/util/formatBnBalance';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { GET_VOTES_COUNT_FOR_TIMESPAN_FOR_ADDRESS } from '~src/queries';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { LeaderboardResponse } from 'pages/api/v1/leaderboard';
import AboutActivity from '~src/components/ActivityFeed/AboutActivity';
import LatestActivityFollowing from '~src/components/ActivityFeed/LatestActivityFollowing';
import LatestActivityExplore from '~src/components/ActivityFeed/LatestActivityExplore';
import FeaturesSection from '~src/components/ActivityFeed/FeaturesSection';

const ActivityTreasury = dynamic(() => import('~src/components/ActivityFeed/ActivityTreasury'), {
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

export const isAssetHubNetwork = [AllNetworks.POLKADOT];

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
	const currentUser = useUserDetailsSelector();
	const { username } = currentUser;

	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;

	const [proposaldata, setProposalData] = useState({ proposals: 0, votes: 0 });
	const { api, apiReady } = useApiContext();
	const selectedGov = isOpenGovSupported(network) ? EGovType.OPEN_GOV : EGovType.GOV1;

	const blockTime: number = chainProperties?.[network]?.blockTime;
	const [available, setAvailable] = useState({
		isLoading: true,
		value: '',
		valueUSD: ''
	});
	const [nextBurn, setNextBurn] = useState({
		isLoading: true,
		value: '',
		valueUSD: ''
	});
	const [currentTokenPrice, setCurrentTokenPrice] = useState({
		isLoading: true,
		value: ''
	});
	const [priceWeeklyChange, setPriceWeeklyChange] = useState({
		isLoading: true,
		value: ''
	});
	const [spendPeriod, setSpendPeriod] = useState({
		isLoading: true,
		percentage: 0,
		value: {
			days: 0,
			hours: 0,
			minutes: 0,
			total: 0
		}
	});

	const [tokenValue, setTokenValue] = useState<number>(0);

	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}

		setSpendPeriod({
			isLoading: true,
			percentage: 0,
			value: {
				days: 0,
				hours: 0,
				minutes: 0,
				total: 0
			}
		});
		api.derive.chain
			.bestNumber((currentBlock) => {
				const spendPeriodConst = api.consts.treasury ? api.consts.treasury.spendPeriod : BN_ZERO;
				if (spendPeriodConst) {
					const spendPeriod = spendPeriodConst.toNumber();
					const totalSpendPeriod: number = blockToDays(spendPeriod, network, blockTime);
					const goneBlocks = currentBlock.toNumber() % spendPeriod;
					const { time } = blockToTime(spendPeriod - goneBlocks, network, blockTime);
					const { d, h, m } = getDaysTimeObj(time);
					const percentage = ((goneBlocks / spendPeriod) * 100).toFixed(0);
					setSpendPeriod({
						isLoading: false,
						percentage: parseFloat(percentage),
						value: {
							days: d,
							hours: h,
							minutes: m,
							total: totalSpendPeriod
						}
					});
				}
			})
			.catch(() => {
				setSpendPeriod({
					isLoading: false,
					percentage: 0,
					value: {
						days: 0,
						hours: 0,
						minutes: 0,
						total: 0
					}
				});
			});
	}, [api, apiReady, blockTime, network]);

	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}

		const EMPTY_U8A_32 = new Uint8Array(32);

		const treasuryAccount = u8aConcat(
			'modl',
			api.consts.treasury?.palletId ? api.consts.treasury.palletId.toU8a(true) : `${['polymesh', 'polymesh-test'].includes(network) ? 'pm' : 'pr'}/trsry`,
			EMPTY_U8A_32
		);

		const fetchTreasuryData = async () => {
			setAvailable({ isLoading: true, value: '', valueUSD: '' });
			setNextBurn({ isLoading: true, value: '', valueUSD: '' });

			try {
				const treasuryBalance = await api.derive.balances?.account(u8aToHex(treasuryAccount));
				const accountData = await api.query.system.account(treasuryAccount);

				const freeBalance = new BN(accountData?.data?.free) || BN_ZERO;
				treasuryBalance.freeBalance = freeBalance as any;

				updateBurnValue(treasuryBalance);
				updateAvailableValue(treasuryBalance);
			} catch (error) {
				console.error(error);
				setAvailable({ isLoading: false, value: '', valueUSD: '' });
				setNextBurn({ isLoading: false, value: '', valueUSD: '' });
			}
		};

		const updateBurnValue = (treasuryBalance: any) => {
			let valueUSD = '';
			let value = '';
			const burn =
				treasuryBalance.freeBalance.gt(BN_ZERO) && !api.consts.treasury.burn.isZero() ? api.consts.treasury.burn.mul(treasuryBalance.freeBalance).div(BN_MILLION) : BN_ZERO;

			if (burn) {
				const nextBurnValueUSD = parseFloat(formatBnBalance(burn.toString(), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: false }, network));

				if (nextBurnValueUSD && currentTokenPrice?.value) {
					valueUSD = formatUSDWithUnits((nextBurnValueUSD * Number(currentTokenPrice.value)).toString());
				}

				value = formatUSDWithUnits(formatBnBalance(burn.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network));
			}

			setNextBurn({ isLoading: false, value, valueUSD });
		};

		const updateAvailableValue = (treasuryBalance: any) => {
			let valueUSD = '';
			let value = '';
			const freeBalance = treasuryBalance.freeBalance.gt(BN_ZERO) ? treasuryBalance.freeBalance : undefined;

			if (freeBalance) {
				const availableValueUSD = parseFloat(formatBnBalance(freeBalance.toString(), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: false }, network));

				setTokenValue(availableValueUSD);

				if (availableValueUSD && currentTokenPrice?.value !== 'N/A') {
					valueUSD = formatUSDWithUnits((availableValueUSD * Number(currentTokenPrice.value)).toString());
				}

				value = formatUSDWithUnits(formatBnBalance(freeBalance.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network));
			}

			setAvailable({ isLoading: false, value, valueUSD });
		};

		fetchTreasuryData();

		if (currentTokenPrice?.value !== 'N/A') {
			dispatch(setCurrentTokenPriceInRedux(currentTokenPrice.value.toString()));
		}
	}, [api, apiReady, currentTokenPrice, network]);

	useEffect(() => {
		if (!network) return;
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
	}, [network]);

	useEffect(() => {
		let cancel = false;
		if (cancel || !currentTokenPrice.value || currentTokenPrice.isLoading || !network) return;

		setPriceWeeklyChange({
			isLoading: true,
			value: ''
		});
		async function fetchWeekAgoTokenPrice() {
			if (cancel) return;
			const weekAgoDate = dayjs().subtract(7, 'd').format('YYYY-MM-DD');
			try {
				const response = await fetch(`${chainProperties[network].externalLinks}/api/scan/price/history`, {
					body: JSON.stringify({
						end: weekAgoDate,
						start: weekAgoDate
					}),
					headers: subscanApiHeaders,
					method: 'POST'
				});
				const responseJSON = await response.json();
				if (responseJSON['message'] == 'Success') {
					const weekAgoPrice = responseJSON['data']['ema7_average'];
					const currentTokenPriceNum: number = parseFloat(currentTokenPrice.value);
					const weekAgoPriceNum: number = parseFloat(weekAgoPrice);
					if (weekAgoPriceNum == 0) {
						setPriceWeeklyChange({
							isLoading: false,
							value: 'N/A'
						});
						return;
					}
					const percentChange = ((currentTokenPriceNum - weekAgoPriceNum) / weekAgoPriceNum) * 100;
					setPriceWeeklyChange({
						isLoading: false,
						value: percentChange.toFixed(2)
					});
					return;
				}
				setPriceWeeklyChange({
					isLoading: false,
					value: 'N/A'
				});
			} catch (err) {
				setPriceWeeklyChange({
					isLoading: false,
					value: 'N/A'
				});
			}
		}

		fetchWeekAgoTokenPrice();
		return () => {
			cancel = true;
		};
	}, [currentTokenPrice, network]);
	const [currentUserdata, setCurrentUserdata] = useState<any | null>(null);
	const [userRank, setUserRank] = useState<number | 0>(0);
	useEffect(() => {
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

					if (leaderboardData && leaderboardData.data && leaderboardData.data.length > 0) {
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

		async function getProposalData() {
			if (!currentUserdata) return;
			const fifteenDaysAgo = dayjs().subtract(15, 'days').toISOString();

			try {
				let encodedAddresses;
				if (Array.isArray(currentUserdata?.addresses)) {
					encodedAddresses = currentUserdata.addresses
						.map((address: string) => {
							if (typeof address === 'string') {
								return getEncodedAddress(address, network);
							} else {
								console.error('Address is not a string:', address);
								return null;
							}
						})
						.filter(Boolean);
				} else if (typeof currentUserdata?.addresses === 'string') {
					encodedAddresses = [getEncodedAddress(currentUserdata.addresses, network)];
				} else {
					console.error('Unexpected address format:', currentUserdata?.addresses);
					encodedAddresses = null;
				}

				if (!encodedAddresses || encodedAddresses.length === 0) {
					throw new Error('Failed to encode addresses');
				}

				const payload = {
					addresses: encodedAddresses,
					type: selectedGov === EGovType.OPEN_GOV ? 'ReferendumV2' : 'Referendum'
				};
				const votecountresponse = await fetchSubsquid({
					network: network || 'polkadot',
					query: GET_VOTES_COUNT_FOR_TIMESPAN_FOR_ADDRESS,
					variables: {
						addresses: payload.addresses,
						createdAt_gt: fifteenDaysAgo,
						voteType: payload.type
					}
				});

				const voteCount = votecountresponse?.data?.flattenedConvictionVotesConnection?.totalCount || 0;
				const { data, error } = await nextApiClientFetch<any>('/api/v1/posts/user-total-post-counts', payload);
				if (error) {
					throw new Error(error);
				}
				setProposalData({
					proposals: data.proposals || 0,
					votes: voteCount
				});
			} catch (err) {
				console.error('Failed to fetch proposal data:', err);
			}
		}

		if (username) {
			getUserProfile(username.toString());
		} else {
			console.error('Username is not available');
		}

		if (currentUserdata) {
			getProposalData();
		}
	}, [username, currentUserdata, selectedGov, network]);

	useEffect(() => {
		dispatch(setNetwork(network));
	}, [network, dispatch]);
	const [activeTab, setActiveTab] = useState('explore');
	if (error) return <ErrorState errorMessage={error} />;

	return (
		<>
			<SEOHead
				title='OpenGov'
				desc={`Join the future of blockchain with ${network}'s revolutionary governance system on Polkassembly`}
				network={network}
			/>
			<div className=' w-full  '>
				<div className='mt-3 flex w-full items-center justify-between'>
					<div className='flex h-12 gap-5'>
						<h1 className='mx-2 mt-2 text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>Activity Feed</h1>
						<div className='mt-2 flex items-center gap-2 rounded-lg bg-[#ECECEC] p-2 pt-5 text-[14px]'>
							<p
								onClick={() => setActiveTab('following')}
								className={`cursor-pointer rounded-lg p-1 px-2 font-semibold ${activeTab === 'following' ? 'bg-[#FFFFFF] text-[#E5007A]' : 'text-[#485F7D]'}`}
							>
								Following
							</p>
							<p
								onClick={() => setActiveTab('explore')}
								className={`cursor-pointer rounded-lg p-1 px-2 font-semibold ${activeTab === 'explore' ? 'bg-[#FFFFFF] text-[#E5007A]' : 'text-[#485F7D]'}`}
							>
								Explore
							</p>
						</div>
					</div>
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
						<div className='mx-1 mt-8 max-w-[940px]'>
							{activeTab === 'explore' ? (
								<LatestActivityExplore
									gov2LatestPosts={gov2LatestPosts}
									currentUserdata={currentUserdata}
								/>
							) : (
								<LatestActivityFollowing gov2LatestPosts={gov2LatestPosts} />
							)}
						</div>
					</div>
					<div className=' w-[340px]  '>
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
								<div>
									<p className='text-[#485F7D]'>
										<span className='text-xl font-semibold text-[#E5007A]'>{proposaldata.votes}</span> out of{' '}
										<span className='text-md font-semibold text-black'>{proposaldata.proposals}</span> active proposals
									</p>
								</div>
							</div>
						</div>
						<div>
							<div className='relative mt-5 rounded-xxl  text-[13px] drop-shadow-md dark:bg-section-dark-overlay '>
								<p className='absolute left-1/2 top-3 z-10 -translate-x-1/2 transform text-[14px] font-bold text-black'>Rank {userRank ? userRank : 0}</p>
								<div className='relative h-full w-full'>
									<img
										src='/rankcard1.svg'
										className='h-full w-full'
										alt='rankcard1'
									/>

									<div className='absolute bottom-[0.3px] left-1/2 z-20 w-[100%] -translate-x-1/2 transform  p-[0.2px]'>
										<img
											src='/rankcard2.svg'
											className='max-h-[100px] w-full '
											alt='rankcard2'
										/>

										<div className='absolute -bottom-1 left-0 right-0 flex items-center justify-between p-3'>
											<div className='flex items-center gap-2'>
												<img
													src={currentUserdata?.image ? currentUserdata?.image : '/rankcard3.svg'}
													className='h-10 w-10 rounded-full '
													alt='rankcard3'
												/>
												<p className='mt-2 font-semibold text-black'>{username}</p>
											</div>
											<div className='flex items-center gap-4'>
												<ScoreTag score={currentUserdata?.profile_score} />
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div>
							<FeaturesSection />
						</div>
						<div>
							{isAssetHubNetwork.includes(network) && (
								<>
									<ActivityTreasury
										currentTokenPrice={currentTokenPrice}
										available={available}
										priceWeeklyChange={priceWeeklyChange}
										spendPeriod={spendPeriod}
										nextBurn={nextBurn}
										tokenValue={tokenValue}
									/>
								</>
							)}
						</div>
					</div>
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
