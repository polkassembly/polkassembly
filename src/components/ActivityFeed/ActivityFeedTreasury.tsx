// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Divider } from 'antd';
import { CaretDownOutlined, CaretUpOutlined, LoadingOutlined } from '@ant-design/icons';
import { BN, BN_MILLION, BN_ZERO, u8aConcat } from '@polkadot/util';
import { ApiPromise, WsProvider } from '@polkadot/api';
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
import PolkadotIcon from '~assets/icons/polkadot-icon.svg';
import AssethubIcon from '~assets/icons/asset-hub-icon.svg';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { IMonthlyTreasuryTally } from 'pages/api/v1/treasury-amount-history';
import { dmSans } from 'pages/_app';
import type { Balance } from '@polkadot/types/interfaces';

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
	const [available, setAvailable] = useState({ isLoading: true, value: '', valueUSD: '' });
	const [nextBurn, setNextBurn] = useState({ isLoading: true, value: '', valueUSD: '' });
	const [currentTokenPrice, setCurrentTokenPrice] = useState<ITokenPrice>({ isLoading: true, value: '' });
	const [priceWeeklyChange, setPriceWeeklyChange] = useState<IPriceWeeklyChange>({ isLoading: true, value: '' });
	const [tokenValue, setTokenValue] = useState<number>(0);
	const [assethubApi, setAssethubApi] = useState<ApiPromise | null>(null);
	const [assethubApiReady, setAssethubApiReady] = useState<boolean>(false);
	const [assethubValues, setAssethubValues] = useState({
		dotValue: '',
		usdcValue: '',
		usdtValue: ''
	});
	const [graphData, setGraphData] = useState<IMonthlyTreasuryTally[]>([]);
	const unit = chainProperties?.[network]?.tokenSymbol;
	const assetValue = formatBnBalance(assethubValues?.dotValue, { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network);
	const assetValueUSDC = formatUSDWithUnits(String(Number(assethubValues?.usdcValue) / 1000000));
	const assetValueUSDT = formatUSDWithUnits(String(Number(assethubValues?.usdtValue) / 1000000));
	const totalTreasuryValueUSD = formatUSDWithUnits(
		String(
			(tokenValue + parseFloat(assethubValues?.dotValue) / 10000000000) * parseFloat(currentTokenPrice?.value) +
				Number(assethubValues?.usdcValue) / 1000000 +
				Number(assethubValues?.usdtValue) / 1000000
		)
	);

	const fetchTreasuryData = async (api: ApiPromise, network: string, currentTokenPrice: ITokenPrice, setAvailable: Function, setNextBurn: Function) => {
		const treasuryAccount = u8aConcat(
			'modl',
			api.consts.treasury?.palletId ? api.consts.treasury.palletId.toU8a(true) : `${['polymesh', 'polymesh-test'].includes(network) ? 'pm' : 'pr'}/trsry`,
			new Uint8Array(32)
		);

		setAvailable({ isLoading: true, value: '', valueUSD: '' });
		setNextBurn({ isLoading: true, value: '', valueUSD: '' });

		try {
			const accountData = await api?.query?.system?.account(treasuryAccount);
			const freeBalance = new BN(accountData?.data?.free) || BN_ZERO;
			const treasuryBalance = { freeBalance: freeBalance as Balance };

			updateBurnValue(treasuryBalance, currentTokenPrice, setNextBurn);
			updateAvailableValue(treasuryBalance, currentTokenPrice, network, setAvailable);
		} catch (error) {
			console.error(error);
			setAvailable({ isLoading: false, value: '', valueUSD: '' });
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

		if (burn && currentTokenPrice?.value) {
			const nextBurnValueUSD = parseFloat(formatBnBalance(burn?.toString(), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: false }, network));
			valueUSD = formatUSDWithUnits((nextBurnValueUSD * Number(currentTokenPrice?.value))?.toString());
			value = formatUSDWithUnits(formatBnBalance(burn?.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network));
		}

		setNextBurn({ isLoading: false, value, valueUSD });
	};

	const updateAvailableValue = (treasuryBalance: any, currentTokenPrice: ITokenPrice, network: string, setAvailable: Function) => {
		const freeBalance = treasuryBalance?.freeBalance?.gt(BN_ZERO) ? treasuryBalance?.freeBalance : 0;
		let valueUSD = '';
		let value = '';

		if (freeBalance) {
			const availableValueUSD = parseFloat(formatBnBalance(freeBalance?.toString(), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: false }, network));
			setTokenValue(availableValueUSD);
			if (availableValueUSD && currentTokenPrice?.value !== 'N/A') {
				valueUSD = formatUSDWithUnits((availableValueUSD * Number(currentTokenPrice?.value))?.toString());
			}
			value = formatUSDWithUnits(formatBnBalance(freeBalance?.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network));
		}

		setAvailable({ isLoading: false, value, valueUSD });
	};

	const fetchWeekAgoTokenPrice = async (currentTokenPrice: ITokenPrice, network: string, setPriceWeeklyChange: (change: IPriceWeeklyChange) => void) => {
		if (!currentTokenPrice?.value || currentTokenPrice.isLoading) {
			setPriceWeeklyChange({ isLoading: false, value: 'N/A' });
			return;
		}

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

			const responseJSON = await response?.json();
			if (responseJSON['message'] === 'Success') {
				const weekAgoPrice = responseJSON['data']['ema7_average'];
				const currentTokenPriceNum = parseFloat(currentTokenPrice.value);
				const weekAgoPriceNum = parseFloat(weekAgoPrice);

				if (weekAgoPriceNum === 0) {
					setPriceWeeklyChange({ isLoading: false, value: 'N/A' });
					return;
				}

				const percentChange = ((currentTokenPriceNum - weekAgoPriceNum) / weekAgoPriceNum) * 100;
				setPriceWeeklyChange({ isLoading: false, value: percentChange?.toFixed(2) });
				return;
			}

			setPriceWeeklyChange({ isLoading: false, value: 'N/A' });
		} catch (err) {
			setPriceWeeklyChange({ isLoading: false, value: 'N/A' });
		}
	};

	const fetchAssetsAmount = async (assethubApi: ApiPromise, assethubApiReady: boolean, network: string, setAssethubValues: Function) => {
		if (!assethubApi || !assethubApiReady) return;

		try {
			if (chainProperties?.[network]?.assetHubTreasuryAddress) {
				const tokenResult: any = await assethubApi?.query?.system?.account(chainProperties[network]?.assetHubTreasuryAddress);
				if (tokenResult?.data?.free) {
					const freeTokenBalance = tokenResult?.data?.free?.toBigInt();
					setAssethubValues((values: any) => ({ ...values, dotValue: freeTokenBalance?.toString() }));
				}

				const usdcResult = (await assethubApi?.query?.assets?.account(
					chainProperties[network]?.supportedAssets?.[2]?.genralIndex,
					chainProperties[network]?.assetHubTreasuryAddress
				)) as any;
				if (!usdcResult.isNone) {
					const data = usdcResult?.unwrap();
					const freeUSDCBalance = data?.balance?.toBigInt()?.toString();
					setAssethubValues((values: { dotValue: string; usdcValue: string; usdtValue: string }) => ({ ...values, usdcValue: freeUSDCBalance }));
				}

				const usdtResult = (await assethubApi?.query?.assets?.account(
					chainProperties[network]?.supportedAssets?.[1]?.genralIndex,
					chainProperties[network]?.assetHubTreasuryAddress
				)) as any;
				if (!usdtResult.isNone) {
					const data = usdtResult?.unwrap();
					const freeUSDTBalance = data?.balance?.toBigInt()?.toString();
					setAssethubValues((values: { dotValue: string; usdcValue: string; usdtValue: string }) => ({ ...values, usdtValue: freeUSDTBalance }));
				}
			}
		} catch (e) {
			console.error('Error fetching asset balance:', e);
		}
	};

	const initAssetHubApi = async (network: string, setAssethubApi: Function, setAssethubApiReady: Function) => {
		const wsProvider = new WsProvider(chainProperties?.[network]?.assetHubRpcEndpoint);
		const apiPromise = await ApiPromise?.create({ provider: wsProvider });
		setAssethubApi(apiPromise);

		apiPromise?.isReady
			?.then(() => setAssethubApiReady(true))
			?.catch(async (error) => {
				await apiPromise?.disconnect();
				console.error(error);
			});

		setTimeout(async () => {
			await apiPromise?.disconnect();
		}, 60000);
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
		fetchTreasuryData(api, network, currentTokenPrice, setAvailable, setNextBurn);

		if (currentTokenPrice?.value !== 'N/A') {
			dispatch(setCurrentTokenPriceInRedux(currentTokenPrice.value.toString()));
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network, currentTokenPrice, dispatch]);

	useEffect(() => {
		fetchWeekAgoTokenPrice(currentTokenPrice, network, setPriceWeeklyChange);
	}, [currentTokenPrice, network]);

	useEffect(() => {
		if (assethubApi) {
			fetchAssetsAmount(assethubApi, assethubApiReady, network, setAssethubValues);
		}
	}, [assethubApi, assethubApiReady, network]);

	useEffect(() => {
		if (!network) return;
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
		fetchDataFromApi();
		getGraphData(setGraphData);
		initAssetHubApi(network, setAssethubApi, setAssethubApiReady);
	}, [network]);

	return (
		<div
			className={`${dmSans.className} ${dmSans.variable} ${
				!['polymesh', 'polymesh-test'].includes(network) ? 'md:grid-cols-1' : ''
			} mt-5 grid grid-cols-1 gap-x-8 gap-y-8 md:gap-y-0`}
		>
			<div className='dark:bg-section-dark-overlaysm:my-0 flex w-full flex-1 flex-col rounded-xxl border-[0.6px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#4B4B4B] dark:bg-section-dark-overlay lg:px-6 lg:py-4'>
				<div>
					<div>
						{!available?.isLoading ? (
							<>
								<div className='mb-2 justify-between sm:flex'>
									<div>
										<div className='my-1 flex items-center gap-x-[6px]'>
											<span className=' p-0 text-sm font-normal leading-5 text-lightBlue dark:text-blue-dark-medium'>Treasury</span>
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
													<span className={`${dmSans.className} ${dmSans.variable} text-xl font-semibold text-blue-light-high dark:text-blue-dark-high`}>
														~${totalTreasuryValueUSD}
													</span>
												</div>
											)}
										</div>
										{!['moonbase', 'polimec', 'rolimec', 'westend'].includes(network) && (
											<div>
												{!(currentTokenPrice?.isLoading || priceWeeklyChange?.isLoading) ? (
													<div className='mt-2 flex flex-col justify-between gap-2 '>
														<div className='flex items-baseline justify-start font-medium xl:justify-between'>
															{available?.value ? (
																<div className='flex items-center'>
																	<PolkadotIcon />
																	<div className='ml-1 flex items-baseline gap-1 whitespace-nowrap text-xs font-medium'>
																		<span className='text-blue-light-medium dark:text-blue-dark-medium'>Polkadot</span>
																		<span className='ml-1 text-xs text-bodyBlue dark:text-blue-dark-high'>{available?.value}</span>
																		<span className='text-[11px] text-blue-light-medium dark:text-blue-dark-medium'>{chainProperties[network]?.tokenSymbol}</span>
																	</div>
																</div>
															) : (
																<span>N/A</span>
															)}
														</div>
														<div>
															{chainProperties[network]?.assetHubTreasuryAddress && (
																<div className={`${dmSans.className} ${dmSans.variable} ml-0 flex flex-wrap `}>
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
				</div>
				<div>
					<ActivityFeedDataGraph
						graphData={graphData}
						currentTokenPrice={currentTokenPrice}
					/>
				</div>
				<div className={`${dmSans.className} ${dmSans.variable} mx-4 my-4  flex flex-wrap items-baseline justify-center gap-x-1 rounded-lg bg-[#F9F9F9] py-2 dark:bg-[#343437]`}>
					<span className={' flex text-xs font-normal leading-5 text-lightBlue dark:text-blue-dark-medium'}>{chainProperties[network]?.tokenSymbol} Price</span>
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
		</div>
	);
};

export default ActivityFeedSidebar;
