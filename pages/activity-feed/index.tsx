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
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { EGovType, OffChainProposalType, ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { IApiResponse, NetworkSocials } from '~src/types';
import { ErrorState } from '~src/ui-components/UIStates';
import styled from 'styled-components';
import { useTheme } from 'next-themes';
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
import FeaturesSection from '~src/components/ActivityFeed/FeaturesSection';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import Image from 'next/image';

const ActivityTreasury = dynamic(() => import('~src/components/ActivityFeed/ActivityTreasury'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const LatestActivity = dynamic(() => import('~src/components/ActivityFeed/LatestActivity'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface Gov2LatestPosts {
	allGov2Posts: any;
	discussionPosts: any;
	[key: string]: any;
}

interface Props {
	networkSocialsData?: IApiResponse<NetworkSocials>;
	gov2LatestPosts: Gov2LatestPosts;
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

const ActivityFeed = ({ error, network, networkSocialsData }: Props) => {
	const dispatch = useDispatch();
	const currentUser = useUserDetailsSelector();
	const { username } = currentUser;
	const { resolvedTheme: theme } = useTheme();

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
				treasuryBalance.freeBalance = freeBalance as Balance;

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
			const freeBalance = treasuryBalance.freeBalance.gt(BN_ZERO) ? treasuryBalance.freeBalance : 0;

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 5000);

		return () => clearTimeout(timer);
	}, []);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [username, selectedGov, network]);

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
					{/* Main content with flex-grow and shrink */}
					<div className='mx-1 mt-[26px] flex-grow'>
						<div className=''>{activeTab === 'explore' ? <LatestActivity currentTab='explore' /> : <LatestActivity currentTab='following' />}</div>
					</div>

					{/* Sidebar */}
					<div className='hidden shrink-0 xl:block xl:max-w-[270px] 2xl:max-w-[305px]'>
						<div className='mx-1 mt-2 md:mt-6'>
							{networkSocialsData && (
								<AboutActivity
									networkSocialsData={networkSocialsData?.data}
									showGov2Links
								/>
							)}
						</div>

						<>
							{currentUser?.username && currentUser?.id && (
								<div className='mt-5 rounded-xxl border-[0.6px] border-solid border-[#D2D8E0] bg-white p-5 text-[13px] dark:border-[#4B4B4B] dark:bg-section-dark-overlay md:p-5'>
									<div className='flex items-center justify-between gap-2'>
										<div className='flex items-center'>
											<div>
												<p className='whitespace-nowrap pt-3  font-semibold text-[#243A57] dark:text-white xl:text-[15px] 2xl:text-[18px]'>Voted Proposals</p>
											</div>
											<Image
												src={`${theme === 'dark' ? '/assets/activityfeed/arrow-dark.svg' : '/assets/activityfeed/arrow.svg'}`}
												alt=''
												className=' -mt-[4px] h-3 w-3 p-0 pl-1 text-[#485F7D] dark:text-[#9E9E9E]'
												width={1}
												height={1}
											/>
										</div>
										<div className='mt-[7px]'>
											<p className='whitespace-nowrap rounded-full bg-[#485F7D] bg-opacity-[5%] p-2 px-3 text-[11px] text-[#485F7DCC] text-opacity-[80%] dark:bg-[#3F3F4080] dark:bg-opacity-[50%] dark:text-[#9E9E9ECC] dark:text-opacity-[80%]'>
												Last 15 days
											</p>
										</div>
									</div>
									<div>
										<p className='text-[#485F7D] dark:text-[#9E9E9E]'>
											<span className='text-xl font-semibold text-[#E5007A]'>{proposaldata.votes}</span> out of{' '}
											<span className='text-md font-semibold text-[#485F7D] dark:text-[#9E9E9E]'>{proposaldata.proposals}</span> active proposals
										</p>
									</div>
								</div>
							)}
						</>

						{isLoading ? (
							<Skeleton
								active
								className='my-5'
							/>
						) : (
							<div className='relative mt-5 rounded-xxl text-[13px]'>
								<p className='absolute left-1/2 top-3 z-10 -translate-x-1/2 transform text-[14px] font-bold text-[#243A57]'>Rank {userRank ?? '#00'}</p>
								<div className='relative h-full w-full'>
									<Image
										src='/assets/rankcard1.svg'
										className='h-full w-full'
										alt='rankcard1'
										width={340}
										height={340}
									/>
									<div className='absolute left-1/2 z-20 w-full -translate-x-1/2 transform p-[0.2px] xl:-bottom-3 2xl:-bottom-2'>
										<Image
											src={theme === 'dark' ? '/assets/rankcard2-dark.svg' : '/assets/rankcard2.svg'}
											className='max-h-[100px] w-full'
											alt='rankcard2'
											width={340}
											height={340}
										/>
										{currentUser?.username && currentUser?.id ? (
											<div className='absolute bottom-3 left-0 right-0 flex items-center justify-between p-3'>
												<div className='flex items-center gap-2'>
													<Image
														src={currentUserdata?.image ? currentUserdata?.image : '/assets/rankcard3.svg'}
														className='h-10 w-10 rounded-full'
														alt='rankcard3'
														width={40}
														height={40}
													/>
													<p className='mt-2 font-semibold text-[#243A57] dark:text-white'>{username}</p>
												</div>
												<div className='flex items-center gap-4'>
													<ScoreTag score={currentUserdata?.profile_score} />
												</div>
											</div>
										) : (
											<div className='absolute bottom-4 left-0 right-0 flex justify-center'>
												<p className='text-center font-poppins text-[16px] font-semibold text-[#243A57] dark:text-white'>
													<span
														onClick={() => setLoginOpen(true)}
														className='cursor-pointer text-[#E5007A] underline'
													>
														Login
													</span>{' '}
													to see your rank.
												</p>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
						{/* Features Section */}
						<div>
							<FeaturesSection />
						</div>

						{/* Treasury Section */}
						{isAssetHubNetwork.includes(network) && (
							<ActivityTreasury
								currentTokenPrice={currentTokenPrice}
								available={available}
								priceWeeklyChange={priceWeeklyChange}
								spendPeriod={spendPeriod}
								nextBurn={nextBurn}
								tokenValue={tokenValue}
							/>
						)}
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
