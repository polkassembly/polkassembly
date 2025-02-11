// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Divider } from 'antd';
import { CaretDownOutlined, CaretUpOutlined, LoadingOutlined } from '@ant-design/icons';
import { BN, BN_MILLION, BN_ZERO, u8aConcat } from '@polkadot/util';
import { ApiPromise } from '@polkadot/api';
import dayjs from 'dayjs';
import { setCurrentTokenPrice as setCurrentTokenPriceInRedux } from '~src/redux/currentTokenPrice';
import { useApiContext } from '~src/context';
import { useNetworkSelector } from '~src/redux/selectors';
import { chainProperties } from '~src/global/networkConstants';
import { subscanApiHeaders } from '~src/global/apiHeaders';
import formatBnBalance from '~src/util/formatBnBalance';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import ActivityFeedDataGraph from './ActivityFeedDataGraph';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { IMonthlyTreasuryTally } from 'pages/api/v1/treasury-amount-history';
import { dmSans } from 'pages/_app';
import Image from 'next/image';
import type { Balance } from '@polkadot/types/interfaces';
import { isPolymesh } from '~src/util/isPolymeshNetwork';
import { fetchTokenPrice } from '~src/util/fetchTokenPrice';
import TreasuryDetailsModal from '../Home/overviewData/TreasuryDetailsModal';
import useFetchTreasuryStats from '~src/hooks/treasury/useTreasuryStats';

const EMPTY_U8A_32 = new Uint8Array(32);

interface ITokenPrice {
	value: string;
	isLoading: boolean;
}

interface IPriceWeeklyChange {
	isLoading: boolean;
	value: string;
}

const ActivityFeedSidebar = () => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const dispatch = useDispatch();
	const { data: treasuryData, loading: treasuryLoading } = useFetchTreasuryStats();
	const [nextBurn, setNextBurn] = useState({ isLoading: true, value: '', valueUSD: '' });
	const [currentTokenPrice, setCurrentTokenPrice] = useState<ITokenPrice>({ isLoading: true, value: '' });
	const [priceWeeklyChange, setPriceWeeklyChange] = useState<IPriceWeeklyChange>({ isLoading: true, value: '' });
	const [graphData, setGraphData] = useState<IMonthlyTreasuryTally[]>([]);
	const unit = chainProperties?.[network]?.tokenSymbol;
	const [tokenPrice, setTokenPrice] = useState<string | null>(null);
	const [tokenLoading, setTokenLoading] = useState<boolean>(false);
	const [isModalVisible, setIsModalVisible] = useState(false);

	useEffect(() => {
		const getTokenPrice = async () => {
			setTokenLoading(true);
			const priceData = await fetchTokenPrice(network);
			if (priceData) {
				setTokenPrice(priceData.price);
			}
			setTokenLoading(false);
		};

		if (network) {
			getTokenPrice();
		}
	}, [network]);

	const fetchTreasuryData = async (api: ApiPromise, network: string, currentTokenPrice: ITokenPrice, setNextBurn: Function) => {
		const treasuryAccount = u8aConcat(
			'modl',
			api?.consts?.treasury?.palletId ? api?.consts?.treasury?.palletId.toU8a(true) : `${isPolymesh(network) ? 'pm' : 'pr'}/trsry`,
			EMPTY_U8A_32
		);

		setNextBurn({ isLoading: true, value: '', valueUSD: '' });

		try {
			const accountData = await api?.query?.system?.account(treasuryAccount);
			const freeBalance = new BN(accountData?.data?.free) || BN_ZERO;
			const treasuryBalance = { freeBalance: freeBalance as Balance };

			updateBurnValue(treasuryBalance, currentTokenPrice, setNextBurn);
		} catch (error) {
			console.error(error);
			setNextBurn({ isLoading: false, value: '', valueUSD: '' });
		}
	};

	const updateBurnValue = (treasuryBalance: any, currentTokenPrice: ITokenPrice, setNextBurn: Function) => {
		const burn =
			treasuryBalance?.freeBalance?.gt(BN_ZERO) && api && !api?.consts?.treasury?.burn?.isZero()
				? api?.consts?.treasury?.burn?.mul(treasuryBalance.freeBalance)?.div(BN_MILLION)
				: BN_ZERO;

		let valueUSD = '';
		let value = '';

		if (burn) {
			const nextBurnValueUSD = parseFloat(formatBnBalance(burn?.toString(), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: false }, network));
			valueUSD = formatUSDWithUnits((nextBurnValueUSD * Number(!tokenLoading && tokenPrice ? tokenPrice : currentTokenPrice?.value))?.toString());
			value = formatUSDWithUnits(formatBnBalance(burn?.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network));
		}

		setNextBurn({ isLoading: false, value, valueUSD });
	};

	const fetchWeekAgoTokenPrice = async (currentTokenPrice: ITokenPrice, network: string, setPriceWeeklyChange: (change: IPriceWeeklyChange) => void) => {
		const weekAgoDate = dayjs()?.subtract(7, 'd')?.format('YYYY-MM-DD');
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
			if (responseJSON['message'] === 'Success') {
				const weekAgoPrice = responseJSON?.['data']?.['list']?.[0]?.['price'] ? responseJSON?.['data']?.['list']?.[0]?.['price'] : responseJSON?.['data']?.['ema7_average'];

				const priceString = network === 'polkadot' ? (tokenPrice !== null && tokenPrice !== undefined ? tokenPrice : currentTokenPrice.value) : currentTokenPrice.value;

				const currentTokenPriceNum = parseFloat(priceString ?? '0');
				const weekAgoPriceNum = parseFloat(weekAgoPrice ?? '0');
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
	};

	const fetchDataFromApi = async () => {
		try {
			const { data: oldTreasuryData, error: oldTreasuryError } = await nextApiClientFetch('/api/v1/treasury-amount-history/old-treasury-data');
			if (oldTreasuryError) {
				console.error('Error fetching old treasury data:', oldTreasuryError);
				return;
			}
			if (oldTreasuryData) return oldTreasuryData;

			const { data: dailyTreasuryData, error: dailyTreasuryError } = await nextApiClientFetch('/api/v1/treasury-amount-history/daily-treasury-tally');
			if (dailyTreasuryError) {
				console.error('Error fetching daily treasury data:', dailyTreasuryError);
				return;
			}
			return dailyTreasuryData;
		} catch (error) {
			console.error('Unexpected error:', error);
		}
	};

	const getGraphData = async (setGraphData: Function) => {
		try {
			const { data, error } = await nextApiClientFetch<IMonthlyTreasuryTally[]>('/api/v1/treasury-amount-history');
			if (error) {
				console.error('Error fetching data:', error);
			}
			if (data) {
				setGraphData(data);
			}
		} catch (error) {
			console.error('Unexpected error:', error);
		}
	};

	useEffect(() => {
		if (!api || !apiReady) return;
		fetchTreasuryData(api, network, currentTokenPrice, setNextBurn);

		if (currentTokenPrice?.value !== 'N/A') {
			dispatch(setCurrentTokenPriceInRedux(currentTokenPrice.value.toString()));
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network, tokenLoading, currentTokenPrice, dispatch]);

	useEffect(() => {
		fetchWeekAgoTokenPrice(currentTokenPrice, network, setPriceWeeklyChange);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentTokenPrice, network, tokenLoading]);

	useEffect(() => {
		if (!network) return;
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
		fetchDataFromApi();
		getGraphData(setGraphData);
	}, [network]);

	const closeModal = () => setIsModalVisible(false);

	const totalUsd =
		!tokenLoading && tokenPrice
			? formatUSDWithUnits(String(Number(treasuryData?.total?.totalDot) * Number(tokenPrice) + Number(treasuryData?.total?.totalUsdc) + Number(treasuryData?.total?.totalUsdt)))
			: null;

	const totalDots = treasuryData?.total?.totalUsdc && formatUSDWithUnits(String(treasuryData?.total?.totalDot));
	const MythBalance = treasuryData?.relayChain?.myth && formatUSDWithUnits(treasuryData?.relayChain?.myth, 1);
	const totalUsdcPrice = treasuryData?.total?.totalUsdc && formatUSDWithUnits(treasuryData?.total?.totalUsdc).toString();
	const totalUsdtPrice = treasuryData?.total?.totalUsdt && formatUSDWithUnits(treasuryData?.total?.totalUsdt).toString();

	return (
		<div className={`${dmSans.className} ${dmSans.variable} ${!isPolymesh(network) ? 'md:grid-cols-1' : ''} mt-5 grid grid-cols-1 gap-x-8 gap-y-8 md:gap-y-0`}>
			<div className='dark:bg-section-dark-overlaysm:my-0 flex w-full flex-1 flex-col rounded-xxl border-[0.6px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#4B4B4B] dark:bg-section-dark-overlay lg:px-6 lg:py-4'>
				<div>
					{!treasuryLoading ? (
						<>
							<div className='mb-2'>
								<div>
									{' '}
									<div className='flex items-center justify-between'>
										<div className='my-1 flex items-center gap-x-[6px]'>
											<span className=' p-0 text-sm font-normal leading-5 text-lightBlue dark:text-blue-dark-medium'>Treasury</span>
											<HelperTooltip
												text='Funds collected through a portion of block production rewards, transaction fees, slashing, staking inefficiencies, etc.'
												className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
											/>
										</div>
										{treasuryData && (
											<div
												className='cursor-pointer text-xs font-medium text-pink_primary'
												onClick={() => setIsModalVisible(true)}
											>
												Details
												<Image
													alt='arrow icon'
													width={16}
													height={16}
													src={'/assets/treasury/arrow-icon.svg'}
													className='-mt-[2px]'
												/>
											</div>
										)}
									</div>
									<div className='flex w-full'>
										{totalUsd && (
											<div className='ml-[2px] flex items-baseline'>
												<span className={`${dmSans.className} ${dmSans.variable} text-xl font-semibold text-blue-light-high dark:text-blue-dark-high`}>~${totalUsd}</span>
											</div>
										)}
									</div>
									{!['moonbase', 'polimec', 'rolimec', 'westend'].includes(network) && (
										<div>
											{!(currentTokenPrice?.isLoading || priceWeeklyChange?.isLoading) ? (
												<div className='mt-1 items-center '>
													<div className='flex items-center '>
														<div className='no-wrap flex items-center gap-1 text-xs'>
															<Image
																alt='relay icon'
																width={16}
																height={16}
																src={'/assets/treasury/dot-icon.svg'}
																className='-mt-[2px]'
															/>
															<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>{totalDots}</span>
															{unit}
															<Divider
																type='vertical'
																className='border-l-1 mx-1 mt-[1px] border-[#90A0B7] dark:border-icon-dark-inactive '
															/>
														</div>
														<div className='no-wrap flex items-center gap-[4px] text-xs '>
															<Image
																alt='relay icon'
																width={16}
																height={16}
																src={'/assets/treasury/usdc-icon.svg'}
																className='-mt-[2px] ml-[3px]'
															/>
															<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>{totalUsdcPrice}</span>
															USDC
															<Divider
																type='vertical'
																className='border-l-1 mx-1 mt-[2px] border-[#90A0B7] dark:border-icon-dark-inactive max-sm:hidden'
															/>
														</div>
													</div>

													<div className=' mt-1 flex items-center '>
														<div className='no-wrap flex items-center gap-[4px] text-xs'>
															<Image
																alt='relay icon'
																width={16}
																height={16}
																src={'/assets/treasury/usdt-icon.svg'}
																className='-mt-[2px]'
															/>
															<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>{totalUsdtPrice}</span>
															USDt
															<Divider
																type='vertical'
																className='border-l-1 mx-1 mt-[1px] border-[#90A0B7] dark:border-icon-dark-inactive '
															/>
														</div>

														<div className='no-wrap mt-1 flex items-center gap-[4px] sm:mt-0'>
															<Image
																src={'/assets/treasury/myth-icon.svg'}
																width={15}
																height={15}
																alt='icon'
																className='-mt-[2px] ml-[3px]'
															/>
															<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>{MythBalance} MYTH</span>
														</div>
													</div>
												</div>
											) : (
												<div className='flex min-h-[50px] w-full items-center justify-center'>
													<LoadingOutlined />
												</div>
											)}
										</div>
									)}
								</div>
							</div>
						</>
					) : (
						<div className='flex min-h-[89px] w-full items-center justify-center'>
							<LoadingOutlined />
						</div>
					)}
				</div>
				<div>
					<ActivityFeedDataGraph
						graphData={graphData}
						currentTokenPrice={currentTokenPrice}
					/>
				</div>
				<div className={`${dmSans.className} ${dmSans.variable} mx-4 my-3  flex flex-wrap items-baseline justify-center gap-x-1 rounded-lg bg-[#F9F9F9] py-2 dark:bg-[#343437]`}>
					<span className={' flex text-xs font-normal leading-5 text-lightBlue dark:text-blue-dark-medium'}>{chainProperties[network]?.tokenSymbol} Price</span>
					<div className='flex items-center gap-x-1 text-lg font-semibold'>
						<div>
							{!tokenLoading && tokenPrice ? (
								<span className='ml-[2px] mt-1 text-bodyBlue dark:text-blue-dark-high'>${tokenPrice}</span>
							) : currentTokenPrice?.value && !isNaN(Number(currentTokenPrice?.value)) ? (
								<span className='ml-[2px] mt-1 text-bodyBlue dark:text-blue-dark-high'>${currentTokenPrice?.value}</span>
							) : null}
						</div>
						{priceWeeklyChange?.value !== 'N/A' && (
							<div className='-mb-[2px] ml-1 flex items-center'>
								<span className={`text-xs font-medium ${Number(priceWeeklyChange?.value) < 0 ? 'text-[#F53C3C]' : 'text-[#52C41A]'} `}>
									{Math.abs(Number(priceWeeklyChange?.value))}%
								</span>
								<span>
									{Number(priceWeeklyChange?.value) < 0 ? (
										<CaretDownOutlined style={{ color: 'red', marginBottom: '0px', marginLeft: '1.5px' }} />
									) : (
										<CaretUpOutlined style={{ color: '#52C41A', marginBottom: '10px', marginLeft: '1.5px' }} />
									)}
								</span>
							</div>
						)}
					</div>
				</div>
				<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
				{!['moonbeam', 'kilt', 'moonbase', 'moonriver', 'polymesh', 'polymesh-test', 'polimec', 'rolimec']?.includes(network) && (
					<div>
						<div className='w-full gap-x-0 lg:flex'>
							{!nextBurn?.isLoading ? (
								<div className='items-start sm:flex sm:gap-2'>
									<div className='mt-2  h-12'>
										<div className={`${dmSans.className} ${dmSans.variable} flex flex-col text-xs`}>
											<div className=' flex items-center gap-x-[6px]'>
												<span className=' p-0 text-sm font-normal leading-5 text-lightBlue dark:text-blue-dark-medium'>Next Burn</span>
												<HelperTooltip
													text=''
													className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
												/>
											</div>
											<div className='m-0 flex flex-wrap items-baseline gap-x-[6px]'>
												{nextBurn?.value ? (
													<div className='m-0 flex items-baseline gap-x-[3px]'>
														<span className='text-lg font-medium'>{nextBurn?.value}</span>
														<span className='text-base font-medium text-lightBlue dark:text-[#595959]'>{chainProperties[network]?.tokenSymbol}</span>
													</div>
												) : null}
												<span className='text-[12px] font-normal text-lightBlue dark:text-blue-dark-high'>{nextBurn?.valueUSD ? `~ $${nextBurn?.valueUSD}` : 'N/A'}</span>
											</div>
										</div>
									</div>
								</div>
							) : (
								<div className='flex min-h-[50px] w-full items-center justify-center'>
									<LoadingOutlined />
								</div>
							)}
						</div>
					</div>
				)}
			</div>
			<TreasuryDetailsModal
				visible={isModalVisible}
				onClose={closeModal}
				unit={unit}
				currentTokenPrice={!tokenLoading && tokenPrice ? String(tokenPrice) : currentTokenPrice.value}
			/>
		</div>
	);
};

export default ActivityFeedSidebar;
