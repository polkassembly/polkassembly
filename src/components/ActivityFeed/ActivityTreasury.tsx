// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import { CaretDownOutlined, CaretUpOutlined, LoadingOutlined } from '@ant-design/icons';
import { poppins } from 'pages/_app';
import type { Balance } from '@polkadot/types/interfaces';
import { setCurrentTokenPrice as setCurrentTokenPriceInRedux } from '~src/redux/currentTokenPrice';
import AssethubIcon from '~assets/icons/asset-hub-icon.svg';
import PolkadotIcon from '~assets/icons/polkadot-icon.svg';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import formatBnBalance from '~src/util/formatBnBalance';
import { ApiPromise, WsProvider } from '@polkadot/api';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import OverviewDataGraph from './OverviewDataGraph';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { IMonthlyTreasuryTally } from 'pages/api/v1/treasury-amount-history';
import { useApiContext } from '~src/context';
import { subscanApiHeaders } from '~src/global/apiHeaders';
import dayjs from 'dayjs';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import { useDispatch } from 'react-redux';
import { BN_MILLION, BN_ZERO, u8aConcat, u8aToHex } from '@polkadot/util';
import { BN } from 'bn.js';

interface TokenPrice {
	value: string;
	isLoading: boolean;
}

interface PriceWeeklyChange {
	isLoading: boolean;
	value: string;
}

const ActivityTreasury = () => {
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

	let cancel = false;

	// Function to fetch the price from a week ago
	async function fetchWeekAgoTokenPrice(currentTokenPrice: TokenPrice, network: string, setPriceWeeklyChange: (change: PriceWeeklyChange) => void) {
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
			if (responseJSON['message'] === 'Success') {
				const weekAgoPrice = responseJSON['data']['ema7_average'];
				const currentTokenPriceNum = parseFloat(currentTokenPrice.value);
				const weekAgoPriceNum = parseFloat(weekAgoPrice);
				if (weekAgoPriceNum === 0) {
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
	useEffect(() => {
		setPriceWeeklyChange({
			isLoading: true,
			value: ''
		});

		if (!currentTokenPrice.value || currentTokenPrice.isLoading || !network) {
			setPriceWeeklyChange({
				isLoading: false,
				value: 'N/A'
			});
			return;
		}

		fetchWeekAgoTokenPrice(currentTokenPrice, network, setPriceWeeklyChange);

		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			cancel = true;
		};
	}, [currentTokenPrice, network, setPriceWeeklyChange]);

	const unit = chainProperties?.[network]?.tokenSymbol;
	const [assethubApi, setAssethubApi] = useState<ApiPromise | null>(null);
	const [assethubApiReady, setAssethubApiReady] = useState<boolean>(false);
	const [assethubValues, setAssethubValues] = useState<{
		dotValue: string;
		usdcValue: string;
		usdtValue: string;
	}>({
		dotValue: '',
		usdcValue: '',
		usdtValue: ''
	});
	const [graphData, setGraphData] = useState<IMonthlyTreasuryTally[]>([]);

	const assetValue = formatBnBalance(assethubValues.dotValue, { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network);
	const assetValueUSDC = formatUSDWithUnits(String(Number(assethubValues.usdcValue) / 1000000));
	const assetValueUSDT = formatUSDWithUnits(String(Number(assethubValues.usdtValue) / 1000000));

	const totalTreasuryValueUSD = formatUSDWithUnits(
		String(
			(tokenValue + parseFloat(assethubValues.dotValue) / 10000000000) * parseFloat(currentTokenPrice.value) +
				Number(assethubValues.usdcValue) / 1000000 +
				Number(assethubValues.usdtValue) / 1000000
		)
	);

	const fetchAssetsAmount = async () => {
		if (!assethubApi || !assethubApiReady) return;

		if (assethubApiReady && chainProperties?.[network]?.assetHubTreasuryAddress) {
			try {
				const tokenResult: any = await assethubApi.query.system.account(chainProperties[network].assetHubTreasuryAddress);
				if (tokenResult?.data?.free) {
					const freeTokenBalance = tokenResult.data.free.toBigInt();
					setAssethubValues((values) => ({ ...values, dotValue: freeTokenBalance.toString() }));
				}
				if (chainProperties[network]?.supportedAssets?.[2].genralIndex) {
					const usdcResult = (await assethubApi.query.assets.account(
						chainProperties[network]?.supportedAssets?.[2].genralIndex,
						chainProperties[network].assetHubTreasuryAddress
					)) as any;

					if (usdcResult.isNone) {
						console.log('No data found for the USDC assets');
					} else {
						const data = usdcResult.unwrap();
						const freeUSDCBalance = data.balance.toBigInt().toString();
						setAssethubValues((values) => ({ ...values, usdcValue: freeUSDCBalance }));
					}
				}
				if (chainProperties[network]?.supportedAssets?.[1].genralIndex) {
					const usdtResult = (await assethubApi.query.assets.account(
						chainProperties[network]?.supportedAssets?.[1].genralIndex,
						chainProperties[network].assetHubTreasuryAddress
					)) as any;

					if (usdtResult.isNone) {
						console.log('No data found for the USDT assets');
					} else {
						const data = usdtResult.unwrap();
						const freeUSDTBalance = data.balance.toBigInt().toString();
						setAssethubValues((values) => ({ ...values, usdtValue: freeUSDTBalance }));
					}
				}
				return;
			} catch (e) {
				console.error('Error fetching asset balance:', e);
			}
		}

		return;
	};

	const fetchDataFromApi = async () => {
		try {
			const { data: oldTreasuryData, error: oldTreasuryError } = await nextApiClientFetch('/api/v1/treasury-amount-history/old-treasury-data');
			if (oldTreasuryError) {
				console.error('Error fetching old treasury data:', oldTreasuryError);
				return;
			}

			if (oldTreasuryData) {
				return oldTreasuryData;
			}
			const { data: dailyTreasuryData, error: dailyTreasuryError } = await nextApiClientFetch('/api/v1/treasury-amount-history/daily-treasury-tally');
			if (dailyTreasuryError) {
				console.error('Error fetching daily treasury data:', dailyTreasuryError);
				return;
			}

			if (dailyTreasuryData) {
				return dailyTreasuryData;
			}
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
		(async () => {
			const wsProvider = new WsProvider(chainProperties?.[network]?.assetHubRpcEndpoint);
			const apiPromise = await ApiPromise.create({ provider: wsProvider });
			setAssethubApi(apiPromise);
			const timer = setTimeout(async () => {
				await apiPromise.disconnect();
			}, 60000);

			apiPromise?.isReady
				.then(() => {
					clearTimeout(timer);
					setAssethubApiReady(true);
				})
				.catch(async (error) => {
					clearTimeout(timer);
					await apiPromise.disconnect();
					console.error(error);
				});
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		fetchDataFromApi();
		getGraphData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (!assethubApi || !assethubApiReady) return;
		fetchAssetsAmount();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [assethubApi, assethubApiReady]);

	return (
		<div
			className={`${poppins.className} ${poppins.variable} ${
				!['polymesh', 'polymesh-test'].includes(network) ? 'md:grid-cols-1' : ''
			} mt-5 grid grid-cols-1 gap-x-8 gap-y-8 md:gap-y-0`}
		>
			<div className='dark:bg-section-dark-overlaysm:my-0 flex w-full flex-1 flex-col rounded-xxl border-[0.6px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#4B4B4B] dark:bg-section-dark-overlay lg:px-6 lg:py-4'>
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
										{!['moonbase', 'polimec', 'rolimec', 'westend'].includes(network) && (
											<div>
												{!(currentTokenPrice.isLoading || priceWeeklyChange.isLoading) ? (
													<div className='mt-2 flex flex-col justify-between gap-2 '>
														<div className='flex items-baseline justify-start font-medium xl:justify-between'>
															{available.value ? (
																<div className='flex items-center'>
																	<PolkadotIcon />
																	<div className='ml-1 flex items-baseline gap-1 whitespace-nowrap text-xs font-medium'>
																		<span className='text-blue-light-medium dark:text-blue-dark-medium'>Polkadot</span>
																		<span className='ml-1 text-xs text-bodyBlue dark:text-blue-dark-high'>{available.value}</span>
																		<span className='text-[11px] text-blue-light-medium dark:text-blue-dark-medium'>{chainProperties[network]?.tokenSymbol}</span>
																	</div>
																</div>
															) : (
																<span>N/A</span>
															)}
														</div>
														<div>
															{chainProperties[network]?.assetHubTreasuryAddress && (
																<div className={`${poppins.className} ${poppins.variable} ml-0 flex items-center`}>
																	<span className='flex items-center gap-2 text-xs font-medium text-blue-light-medium dark:text-blue-dark-medium'>
																		<div>
																			<AssethubIcon />
																		</div>
																		<span>Asset Hub</span>
																	</span>
																	<div className='ml-2 flex flex-wrap gap-1 text-[11px] font-medium text-blue-light-high dark:text-blue-dark-high'>
																		<div className='text-xs'>
																			{formatUSDWithUnits(assetValue)} <span className='ml-[2px] font-normal'>{unit}</span>
																		</div>
																		{chainProperties?.[network]?.supportedAssets?.[1] && (
																			<>
																				<Divider
																					className='mx-[1px] bg-section-light-container p-0 dark:bg-separatorDark'
																					type='vertical'
																				/>
																				<div className='text-xs'>
																					{assetValueUSDC}
																					<span className='ml-[3px] font-normal'>USDC</span>
																				</div>
																			</>
																		)}
																		{chainProperties?.[network]?.supportedAssets?.[2] && (
																			<>
																				<Divider
																					className='mx-[1px] bg-section-light-container p-0 dark:bg-separatorDark'
																					type='vertical'
																				/>
																				<div className='text-xs'>
																					{assetValueUSDT}
																					<span className='ml-[3px] font-normal'>USDT</span>
																				</div>
																			</>
																		)}
																	</div>
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

									{/* */}
								</div>
							</>
						) : (
							<div className='flex min-h-[89px] w-full items-center justify-center'>
								<LoadingOutlined />
							</div>
						)}
					</div>
				</div>
				{/* graph */}
				<div>
					<OverviewDataGraph
						graphData={graphData}
						currentTokenPrice={currentTokenPrice}
					/>
				</div>
				<div className={`${poppins.className} ${poppins.variable} mx-4 my-4  flex flex-wrap items-baseline justify-center gap-x-1 rounded-lg bg-[#F9F9F9] py-2 dark:bg-[#343437]`}>
					<span className={' flex text-xs font-normal leading-5 text-lightBlue dark:text-blue-dark-medium'}>{chainProperties[network]?.tokenSymbol} Price</span>
					<div className='flex items-center gap-x-1 text-lg font-semibold'>
						<div>
							{currentTokenPrice?.value === 'N/A' ? (
								<span className=' text-bodyBlue dark:text-blue-dark-high'>N/A</span>
							) : currentTokenPrice?.value && !Number?.isNaN(Number(currentTokenPrice.value)) ? (
								<span className='ml-[2px] mt-1 text-bodyBlue dark:text-blue-dark-high'>${currentTokenPrice.value}</span>
							) : null}
						</div>
						<div className='-mb-[2px] ml-2 flex items-center'>
							<span className={`text-xs font-medium ${Number(priceWeeklyChange.value) < 0 ? 'text-[#F53C3C]' : 'text-[#52C41A]'} `}>
								{Math.abs(Number(priceWeeklyChange.value))}%
							</span>
							<span>
								{Number(priceWeeklyChange.value) < 0 ? (
									<CaretDownOutlined style={{ color: 'red', marginBottom: '0px', marginLeft: '1.5px' }} />
								) : (
									<CaretUpOutlined style={{ color: '#52C41A', marginBottom: '10px', marginLeft: '1.5px' }} />
								)}
							</span>
						</div>
					</div>
				</div>
				<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />

				{!['moonbeam', 'kilt', 'moonbase', 'moonriver', 'polymesh', 'polimec', 'rolimec'].includes(network) && (
					<div>
						<div className='w-full gap-x-0 lg:flex'>
							{!nextBurn.isLoading ? (
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
												{nextBurn.value ? (
													<div className='m-0 flex items-baseline gap-x-[3px]'>
														<span className='text-lg font-medium'>{nextBurn.value}</span>
														<span className='text-base font-medium text-lightBlue dark:text-[#595959]'>{chainProperties[network]?.tokenSymbol}</span>
													</div>
												) : null}
												<span className='text-[12px] font-normal text-lightBlue dark:text-blue-dark-high'>{nextBurn.valueUSD ? `~ $${nextBurn.valueUSD}` : 'N/A'}</span>
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

export default ActivityTreasury;
