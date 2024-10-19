// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Divider } from 'antd';
import HydrationIcon from '~assets/icons/hydration-icon.svg';
import { CaretDownOutlined, CaretUpOutlined, LoadingOutlined } from '@ant-design/icons';
import { BN, BN_ZERO, u8aConcat, u8aToHex } from '@polkadot/util';
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
import PolkadotIcon from '~assets/icons/polkadot-icon.svg';
import AssethubIcon from '~assets/icons/asset-hub-icon.svg';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { IMonthlyTreasuryTally } from 'pages/api/v1/treasury-amount-history';
import { poppins } from 'pages/_app';
import type { Balance } from '@polkadot/types/interfaces';
import useAssetHubApi from '~src/hooks/treasury/useAssetHubApi';
import useHydrationApi from '~src/hooks/treasury/useHydrationApi';
import ActivityFeedDataGraph from './ActivityFeedDataGraph';

const EMPTY_U8A_32 = new Uint8Array(32);

const ActivityFeedSidebar = () => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const dispatch = useDispatch();

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

	const [tokenValue, setTokenValue] = useState<number>(0);

	const { assethubApiReady, assethubValues, fetchAssetsAmount } = useAssetHubApi(network);
	const { hydrationApiReady, hydrationValues, fetchHydrationAssetsAmount } = useHydrationApi(network);
	const unit = chainProperties?.[network]?.tokenSymbol;

	const [graphData, setGraphData] = useState<IMonthlyTreasuryTally[]>([]);

	const BN_MILLION = new BN(10).pow(new BN(6));

	const assetValue = formatBnBalance(new BN(assethubValues.dotValue), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network);
	const assetValueUSDC = formatUSDWithUnits(new BN(assethubValues.usdcValue).div(BN_MILLION).toString());
	const assetValueUSDT = formatUSDWithUnits(new BN(assethubValues.usdtValue).div(BN_MILLION).toString());

	const hydrationValue = formatBnBalance(new BN(hydrationValues.dotValue), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network);
	const hydrationValueUSDC = formatUSDWithUnits(new BN(hydrationValues.usdcValue).div(BN_MILLION).toString());
	const hydrationValueUSDT = formatUSDWithUnits(new BN(hydrationValues.usdtValue).div(BN_MILLION).toString());

	const totalTreasuryValueUSD = formatUSDWithUnits(
		String(
			(tokenValue + parseFloat(assethubValues.dotValue.toString()) / 10000000000 + parseFloat(hydrationValues.dotValue.toString()) / 10000000000) *
				parseFloat(currentTokenPrice.value) +
				Number(assethubValues.usdcValue) / 1000000 +
				Number(assethubValues.usdtValue) / 1000000 +
				Number(hydrationValues.usdcValue) / 1000000 +
				Number(hydrationValues.usdtValue) / 1000000
		)
	);

	const fetchDataFromApi = async () => {
		try {
			const { data, error } = await nextApiClientFetch('/api/v1/treasury-amount-history/old-treasury-data');

			if (error) {
				console.error('Error fetching data:', error);
			}
			if (data) {
				return;
			}

			const { data: dailyData, error: dailyError } = await nextApiClientFetch('/api/v1/treasury-amount-history/daily-treasury-tally');

			if (dailyError) {
				console.error('Error fetching daily data:', dailyError);
			}
			if (dailyData) return;
		} catch (error) {
			console.error('Unexpected error:', error);
		}
	};

	const getGraphData = async () => {
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
		fetchDataFromApi();
		getGraphData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}

		setAvailable({
			isLoading: true,
			value: '',
			valueUSD: ''
		});

		setNextBurn({
			isLoading: true,
			value: '',
			valueUSD: ''
		});

		const treasuryAccount = u8aConcat(
			'modl',
			api.consts.treasury && api.consts.treasury.palletId ? api.consts.treasury.palletId.toU8a(true) : `${['polymesh', 'polymesh-test'].includes(network) ? 'pm' : 'pr'}/trsry`,
			EMPTY_U8A_32
		);

		api.derive.balances?.account(u8aToHex(treasuryAccount)).then((treasuryBalance) => {
			api.query.system
				.account(treasuryAccount)
				.then((res) => {
					const freeBalance = new BN(res?.data?.free) || BN_ZERO;
					treasuryBalance.freeBalance = freeBalance as Balance;
				})
				.catch((e) => {
					console.error(e);
					setAvailable({
						isLoading: false,
						value: '',
						valueUSD: ''
					});
				})
				.finally(() => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars

					let valueUSD = '';
					let value = '';
					{
						try {
							const burn =
								treasuryBalance.freeBalance.gt(BN_ZERO) && !api.consts.treasury.burn.isZero() ? api.consts.treasury.burn.mul(treasuryBalance.freeBalance).div(BN_MILLION) : BN_ZERO;

							if (burn) {
								// replace spaces returned in string by format function
								const nextBurnValueUSD = parseFloat(
									formatBnBalance(
										burn.toString(),
										{
											numberAfterComma: 2,
											withThousandDelimitor: false,
											withUnit: false
										},
										network
									)
								);
								if (nextBurnValueUSD && currentTokenPrice && currentTokenPrice.value) {
									valueUSD = formatUSDWithUnits((nextBurnValueUSD * Number(currentTokenPrice.value)).toString());
								}
								value = formatUSDWithUnits(
									formatBnBalance(
										burn.toString(),
										{
											numberAfterComma: 0,
											withThousandDelimitor: false,
											withUnit: false
										},
										network
									)
								);
							}
						} catch (error) {
							console.log(error);
						}
						setNextBurn({
							isLoading: false,
							value,
							valueUSD
						});
					}
					{
						const freeBalance = treasuryBalance.freeBalance.gt(BN_ZERO) ? treasuryBalance.freeBalance : undefined;

						let valueUSD = '';
						let value = '';

						if (freeBalance) {
							const availableValueUSD = parseFloat(
								formatBnBalance(
									freeBalance.toString(),
									{
										numberAfterComma: 2,
										withThousandDelimitor: false,
										withUnit: false
									},
									network
								)
							);
							setTokenValue(availableValueUSD);

							if (availableValueUSD && currentTokenPrice && currentTokenPrice.value !== 'N/A') {
								valueUSD = formatUSDWithUnits((availableValueUSD * Number(currentTokenPrice.value)).toString());
							}
							value = formatUSDWithUnits(
								formatBnBalance(
									freeBalance.toString(),
									{
										numberAfterComma: 0,
										withThousandDelimitor: false,
										withUnit: false
									},
									network
								)
							);
						}

						setAvailable({
							isLoading: false,
							value,
							valueUSD
						});
					}
				});
		});
		if (currentTokenPrice.value !== 'N/A') {
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
					const weekAgoPrice = responseJSON?.['data']?.['list']?.[0]?.['price'] ? responseJSON?.['data']?.['list']?.[0]?.['price'] : responseJSON?.['data']?.['ema7_average'];

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

	useEffect(() => {
		if (assethubApiReady) {
			fetchAssetsAmount();
		}
		if (hydrationApiReady) {
			fetchHydrationAssetsAmount();
		}
	}, [assethubApiReady, hydrationApiReady, fetchAssetsAmount, fetchHydrationAssetsAmount]);

	return (
		<div
			className={`${poppins.className} ${poppins.variable} ${
				!['polymesh', 'polymesh-test'].includes(network) ? 'md:grid-cols-1' : ''
			} mt-5 grid grid-cols-1 gap-x-8 gap-y-8 md:gap-y-0`}
		>
			<div className='dark:bg-section-dark-overlaysm:my-0 flex w-full flex-1 flex-col rounded-xxl border-[0.6px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#4B4B4B] dark:bg-section-dark-overlay lg:px-6 lg:py-4'>
				<div className={'flex w-full flex-1 flex-col rounded-xxl dark:bg-section-dark-overlay sm:my-0  '}>
					<div className=''>
						<div>
							{!available.isLoading ? (
								<>
									<div className='mb-2 justify-between sm:flex'>
										<div>
											<div className='my-1 flex items-center gap-x-[6px]'>
												<span className=' p-0 text-xs font-normal leading-5 text-lightBlue dark:text-blue-dark-medium'>Treasury</span>
												<HelperTooltip
													text='Funds collected through a portion of block production rewards, transaction fees, slashing, staking inefficiencies, etc.'
													className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
												/>
											</div>
											<div className='flex'>
												{available.value ? (
													<span className='text-lg font-medium text-bodyBlue dark:text-blue-dark-high'>
														{available.value} <span className='text-[18px] text-lightBlue dark:text-blue-dark-high'>{chainProperties[network]?.tokenSymbol}</span>
													</span>
												) : (
													<span>N/A</span>
												)}
												{totalTreasuryValueUSD && (
													<div className='flex items-baseline'>
														<span className={`${poppins.className} ${poppins.variable} text-xl font-semibold text-blue-light-high dark:text-blue-dark-high`}>
															~${totalTreasuryValueUSD}
														</span>
													</div>
												)}
											</div>
										</div>
									</div>
								</>
							) : (
								<div className={'flex min-h-[89px] w-full items-center justify-center'}>
									<LoadingOutlined />
								</div>
							)}
						</div>
						{/* // current Price */}
						{!['moonbase', 'polimec', 'rolimec', 'westend', 'laos-sigma'].includes(network) && (
							<div>
								{!(currentTokenPrice.isLoading || priceWeeklyChange.isLoading) ? (
									<div className='flex flex-col gap-2  '>
										<div className='flex items-baseline justify-start font-medium'>
											{available.value ? (
												<div className='flex items-center'>
													<PolkadotIcon />
													<div className='ml-1 flex items-baseline gap-1 whitespace-nowrap text-xs font-medium'>
														<span className='text-blue-light-medium dark:text-blue-dark-medium'>Polkadot</span>
														<span className='ml-1 text-xs text-bodyBlue dark:text-blue-dark-high'>{available.value}</span>
														<span className='text-xs text-blue-light-high dark:text-blue-dark-high'>{chainProperties[network]?.tokenSymbol}</span>
													</div>
												</div>
											) : (
												<span>N/A</span>
											)}
										</div>

										{chainProperties[network]?.assetHubTreasuryAddress && (
											<div className={`${poppins.className} ${poppins.variable} ml-0 flex flex-wrap `}>
												<div className='flex items-center gap-2 text-xs font-medium text-blue-light-medium dark:text-blue-dark-medium'>
													<AssethubIcon />
													<span className='whitespace-nowrap'>Asset Hub</span>
												</div>
												<div className='ml-2 flex items-center gap-1 text-[11px] font-medium text-blue-light-high dark:text-blue-dark-high'>
													<div className='whitespace-nowrap text-xs'>
														{formatUSDWithUnits(assetValue)} <span className='ml-[2px] font-normal'>{unit}</span>
													</div>
												</div>
												{chainProperties?.[network]?.supportedAssets?.[1] && (
													<>
														<Divider
															className='mx-[1px] ml-1 mt-1 bg-section-light-container p-0  dark:bg-separatorDark'
															type='vertical'
														/>
														<div className='text-xs text-blue-light-high dark:text-blue-dark-high'>
															{assetValueUSDC}
															<span className='ml-[3px] font-normal'>USDC</span>
														</div>
													</>
												)}
												{chainProperties?.[network]?.supportedAssets?.[2] && (
													<div className='ml-2 flex items-center gap-1 text-[11px] font-medium text-blue-light-high dark:text-blue-dark-high'>
														<Divider
															className='mx-[1px] bg-section-light-container p-0 dark:bg-separatorDark'
															type='vertical'
														/>
														<div className='text-xs'>
															{assetValueUSDT}
															<span className='ml-[3px] font-normal'>USDT</span>
														</div>
													</div>
												)}
											</div>
										)}
									</div>
								) : (
									<div className='flex min-h-[50px] w-full items-center justify-center'>
										<LoadingOutlined />
									</div>
								)}
								{!(currentTokenPrice.isLoading || priceWeeklyChange.isLoading) ? (
									<div className='mt-2 flex flex-col '>
										{chainProperties[network]?.hydrationTreasuryAddress && (
											<div className={`${poppins.className} ${poppins.variable} ml-0 flex flex-wrap`}>
												<div className='flex items-center gap-2 text-xs font-medium text-blue-light-medium dark:text-blue-dark-medium'>
													<HydrationIcon />
													<span className='whitespace-nowrap'>Hydration</span>
												</div>
												<div className='ml-2 flex items-center gap-1 text-[11px] font-medium text-blue-light-high dark:text-blue-dark-high'>
													<div className='whitespace-nowrap text-xs'>
														{formatUSDWithUnits(hydrationValue)} <span className='ml-[2px] font-normal'>{unit}</span>
													</div>
												</div>
												{chainProperties?.[network]?.supportedAssets?.[1] && (
													<>
														<Divider
															className='mx-[1px] ml-1 mt-1 bg-section-light-container p-0 dark:bg-separatorDark'
															type='vertical'
														/>
														<div className='text-xs text-blue-light-high dark:text-blue-dark-high'>
															{hydrationValueUSDC}
															<span className='ml-[3px] font-normal'>USDC</span>
														</div>
													</>
												)}
												{chainProperties?.[network]?.supportedAssets?.[2] && (
													<div className='ml-2 flex items-center gap-1 text-[11px] font-medium text-blue-light-high dark:text-blue-dark-high'>
														<Divider
															className='mx-[1px] bg-section-light-container p-0 dark:bg-separatorDark'
															type='vertical'
														/>
														<div className='text-xs'>
															{hydrationValueUSDT}
															<span className='ml-[3px] font-normal'>USDT</span>
														</div>
													</div>
												)}
											</div>
										)}
									</div>
								) : (
									<div className='flex min-h-[50px] w-full items-center justify-center'>
										<LoadingOutlined />
									</div>
								)}
							</div>
						)}
					</div>
					{/* graph */}
					<div>
						<ActivityFeedDataGraph
							graphData={graphData}
							currentTokenPrice={currentTokenPrice}
						/>
					</div>
				</div>
				<div className={`${poppins.className} ${poppins.variable} mx-4 my-4  flex flex-wrap items-baseline justify-center gap-x-1 rounded-lg bg-[#F9F9F9] py-2 dark:bg-[#343437]`}>
					<span className={' flex text-xs font-normal leading-5 text-lightBlue dark:text-white'}>{chainProperties[network]?.tokenSymbol} Price</span>
					<div className='flex items-center gap-x-1 text-lg font-semibold'>
						<div>
							{currentTokenPrice?.value === 'N/A' ? (
								<span className=' text-bodyBlue dark:text-blue-dark-high'>N/A</span>
							) : currentTokenPrice?.value && !isNaN(Number(currentTokenPrice?.value)) ? (
								<span className='ml-[2px] mt-1 text-bodyBlue dark:text-blue-dark-high'>${currentTokenPrice?.value}</span>
							) : null}
						</div>
						{priceWeeklyChange?.value !== 'N/A' && (
							<div className='-mb-[2px] ml-2 flex items-center'>
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
				{!['moonbeam', 'kilt', 'moonbase', 'moonriver', 'polymesh', 'polimec', 'rolimec']?.includes(network) && (
					<div>
						<div className='w-full gap-x-0 lg:flex'>
							{!nextBurn?.isLoading ? (
								<div className='items-start sm:flex sm:gap-2'>
									<div className='mt-2  h-12'>
										<div className={`${poppins.className} ${poppins.variable} flex flex-col text-xs`}>
											<div className=' flex items-center gap-x-[6px]'>
												<span className=' p-0 text-xs font-normal leading-5 text-lightBlue dark:text-blue-dark-medium'>Next Burn</span>
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
		</div>
	);
};

export default ActivityFeedSidebar;
