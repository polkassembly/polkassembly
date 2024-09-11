// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import { CaretDownOutlined, CaretUpOutlined, LoadingOutlined } from '@ant-design/icons';
import { poppins } from 'pages/_app';
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
import { IOverviewProps, IDailyTreasuryTallyData } from '~src/types';
import { IMonthlyTreasuryTally } from 'pages/api/v1/treasury-amount-history';

const monthOrder = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const ActivityTreasury = ({ currentTokenPrice, available, priceWeeklyChange, nextBurn, tokenValue }: IOverviewProps) => {
	const { network } = useNetworkSelector();
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

	const [graphBalanceDifference, setGraphBalanceDifference] = useState<number | null>(null);
	const formatedBalanceDifference =
		graphBalanceDifference &&
		formatUSDWithUnits(
			formatBnBalance(
				graphBalanceDifference.toString(),
				{
					numberAfterComma: 0,
					withThousandDelimitor: false,
					withUnit: true
				},
				network
			)
		);

	const sortedGraphData = graphData
		.filter((item) => parseFloat(item.balance) !== 0)
		.sort((a, b) => monthOrder.indexOf(a.month.toLowerCase()) - monthOrder.indexOf(b.month.toLowerCase()));

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

	const getDifferenceData = async () => {
		try {
			const { data, error } = await nextApiClientFetch<IDailyTreasuryTallyData>('/api/v1/treasury-amount-history/get-daily-tally-data');

			if (error) {
				console.error('Error fetching daily tally data:', error);
			}

			if (data) {
				if (sortedGraphData.length > 0) {
					const lastGraphBalance = parseFloat(sortedGraphData[sortedGraphData.length - 1]?.balance);

					const apiBalance = parseFloat(data.balance);
					const difference = apiBalance - lastGraphBalance;

					setGraphBalanceDifference(difference);
				}
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
		getDifferenceData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, graphData.length]);

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
			<div className='flex w-full flex-1 flex-col rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay sm:my-0 lg:px-6 lg:py-4'>
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
											{formatedBalanceDifference && (
												<div className='flex items-baseline'>
													<span className={`${poppins.className} ${poppins.variable} ml-1 mt-1 text-sm font-normal text-blue-light-high dark:text-blue-dark-high`}>
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
																		<AssethubIcon />
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
