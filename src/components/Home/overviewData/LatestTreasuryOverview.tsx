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
import { formatNumberWithSuffix } from '../../Bounties/utils/formatBalanceUsd';
import { useNetworkSelector } from '~src/redux/selectors';
import ProgressBar from '~src/basic-components/ProgressBar/ProgressBar';
import { useTheme } from 'next-themes';
import formatBnBalance from '~src/util/formatBnBalance';
import { ApiPromise, WsProvider } from '@polkadot/api';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import OverviewDataGraph from './OverviewDataGraph';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { IOverviewProps } from '~src/types';
import { IMonthlyTreasuryTally } from 'pages/api/v1/treasury-amount-history';

const LatestTreasuryOverview = ({ currentTokenPrice, available, priceWeeklyChange, spendPeriod, nextBurn }: IOverviewProps) => {
	const { network } = useNetworkSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const { resolvedTheme: theme } = useTheme();
	const trailColor = theme === 'dark' ? '#1E262D' : '#E5E5E5';
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
	const assetValueUSDC = formatBnBalance(assethubValues.usdcValue, { numberAfterComma: 0, withUnit: false }, network);
	const assetValueUSDT = formatBnBalance(assethubValues.usdtValue, { numberAfterComma: 0, withUnit: false }, network);
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
	const totalAmountUsd =
		graphBalanceDifference &&
		currentTokenPrice.value &&
		formatUSDWithUnits(
			formatBnBalance(
				String(graphBalanceDifference * parseFloat(currentTokenPrice.value)),
				{
					numberAfterComma: 0,
					withThousandDelimitor: false,
					withUnit: false
				},
				network
			)
		);
	const fetchAssetsAmount = async () => {
		if (!assethubApi || !assethubApiReady) return;

		if (assethubApiReady && chainProperties?.[network]?.assetHubTreasuryAddress) {
			try {
				// Fetching balance in token (DOT)
				const tokenResult: any = await assethubApi.query.system.account(chainProperties[network].assetHubTreasuryAddress);
				if (tokenResult?.data?.free) {
					const freeTokenBalance = tokenResult.data.free.toBigInt();
					setAssethubValues((values) => ({ ...values, dotValue: freeTokenBalance.toString() }));
				}

				// Fetch balance in USDC
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

				// Fetch balance in USDT
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
			const { data, error } = await nextApiClientFetch('/api/v1/treasury-amount-history/old-treasury-data', { network });

			if (error) {
				console.error('Error fetching data:', error);
			}
			if (data) {
				return;
			}

			// const { data: dailyData, error: dailyError } = await nextApiClientFetch('/api/v1/treasury-amount-history/old-treasury-data', {
			// 	network,
			// 	isDaily: true
			// });

			// if (dailyError) {
			// 	console.error('Error fetching daily data:', dailyError);
			// }
			// if (dailyData) {
			// }
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
				if (data.length >= 31) {
					const difference = parseFloat(graphData[graphData.length - 1].balance) - parseFloat(graphData[graphData.length - 30].balance);
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
		if (!assethubApi || !assethubApiReady) return;
		fetchAssetsAmount();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [assethubApi, assethubApiReady]);

	return (
		<div
			className={`${poppins.className} ${poppins.variable} ${!['polymesh', 'polymesh-test'].includes(network) ? 'md:grid-cols-2' : ''} grid grid-cols-1 gap-x-8 gap-y-8 md:gap-y-0`}
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
											<span className='rounded-lg bg-[#F4F5F6] px-[6px] py-[2px] text-xs font-medium text-[#485F7DCC] dark:bg-[#333843] dark:text-[#F4F5F6]'>Monthly</span>
										</div>
										{formatedBalanceDifference && (
											<>
												<span className={`${poppins.className} ${poppins.variable} text-xl font-semibold text-blue-light-high dark:text-blue-dark-high`}>
													{formatedBalanceDifference}
												</span>
												{totalAmountUsd && (
													<span className={`${poppins.className} ${poppins.variable} ml-[6px] text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium`}>
														~ ${totalAmountUsd}
													</span>
												)}
												<span className='ml-1 text-lg'>
													{Number(graphBalanceDifference) < 0 ? <CaretDownOutlined style={{ color: 'red' }} /> : <CaretUpOutlined style={{ color: '#52C41A' }} />}
												</span>
											</>
										)}
									</div>
									<div className={`${poppins.className} ${poppins.variable} flex items-baseline gap-x-1 self-end`}>
										<span className={' flex text-xs font-normal leading-5 text-lightBlue dark:text-blue-dark-medium'}>{chainProperties[network]?.tokenSymbol} Price</span>
										<div className='flex items-center gap-x-1 text-lg font-semibold'>
											<div>
												{currentTokenPrice.value === 'N/A' ? (
													<span className=' text-bodyBlue dark:text-blue-dark-high'>N/A</span>
												) : currentTokenPrice.value && !isNaN(Number(currentTokenPrice.value)) ? (
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
								</div>
							</>
						) : (
							<div className='flex min-h-[89px] w-full items-center justify-center'>
								<LoadingOutlined />
							</div>
						)}
					</div>
					{/* // current Price */}
					{!['moonbase', 'polimec', 'rolimec', 'westend'].includes(network) && (
						<div>
							{!(currentTokenPrice.isLoading || priceWeeklyChange.isLoading) ? (
								<div className='flex flex-col justify-between gap-2 xl:flex-row'>
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

									{chainProperties[network]?.assetHubTreasuryAddress && (
										<div className={`${poppins.className} ${poppins.variable} ml-0 flex items-center xl:ml-3`}>
											<span className='flex items-center gap-1 text-xs font-medium text-blue-light-medium dark:text-blue-dark-medium'>
												<AssethubIcon />
												Asset Hub
											</span>
											<div className='ml-2 flex gap-1 text-[11px] font-medium text-blue-light-high dark:text-blue-dark-high'>
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
															{Number(assetValueUSDC) / 100}M<span className='ml-[3px] font-normal'>USDC</span>
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
															{Number(assetValueUSDT) / 100}M<span className='ml-[3px] font-normal'>USDT</span>
														</div>
													</>
												)}
											</div>
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
					<OverviewDataGraph graphData={graphData} />
				</div>
			</div>
			<div className='flex w-full flex-1 flex-col gap-5 rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay sm:my-0 lg:px-6 lg:py-4'>
				{/* Current Price */}
				{['moonbase', 'polimec', 'rolimec'].includes(network) && (
					<>
						<div>
							{!(currentTokenPrice.isLoading || priceWeeklyChange.isLoading) ? (
								<div className='flex flex-col justify-between gap-2 xl:flex-row'>
									<div className='flex items-baseline justify-start font-medium xl:justify-between'>
										{available.value ? (
											<div className='flex items-baseline whitespace-nowrap'>
												<span className='text-lg font-medium text-bodyBlue dark:text-blue-dark-high'>{available.value}</span>
												<span className='ml-1 text-base font-medium text-blue-light-medium dark:text-blue-dark-medium'>{chainProperties[network]?.tokenSymbol}</span>
											</div>
										) : (
											<span>N/A</span>
										)}
										{!['polymesh', 'polymesh-test'].includes(network) && (
											<span className='ml-2 whitespace-nowrap text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>
												{available.valueUSD ? `~ $${available.valueUSD}` : 'N/A'}
											</span>
										)}
									</div>

									{chainProperties[network]?.assetHubTreasuryAddress && (
										<div className={`${poppins.className} ${poppins.variable} ml-0 flex items-center xl:ml-3`}>
											<span className='flex items-center gap-1 text-xs font-medium text-blue-light-medium dark:text-blue-dark-medium'>
												<AssethubIcon />
												Asset Hub
											</span>
											<div className='ml-2 flex gap-1 text-[11px] font-medium text-blue-light-high dark:text-blue-dark-high'>
												<div className=''>
													{formatNumberWithSuffix(Number(assetValue))} <span className='ml-[2px] font-normal'>{unit}</span>
												</div>
												<Divider
													className='mx-[1px] bg-section-light-container p-0 dark:bg-separatorDark'
													type='vertical'
												/>
												<div className=''>
													{Number(assetValueUSDC) / 100}m<span className='ml-[3px] font-normal'>USDC</span>
												</div>
												<Divider
													className='mx-[1px] bg-section-light-container p-0 dark:bg-separatorDark'
													type='vertical'
												/>
												<div className=''>
													{Number(assetValueUSDT) / 100}m<span className='ml-[3px] font-normal'>USDT</span>
												</div>
											</div>
										</div>
									)}
								</div>
							) : (
								<div className='flex min-h-[50px] w-full items-center justify-center'>
									<LoadingOutlined />
								</div>
							)}
						</div>
						<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
					</>
				)}

				{/* Spend Period */}
				{!['polymesh', 'polymesh-test'].includes(network) && (
					<>
						<div className='w-full flex-col gap-x-0 lg:flex'>
							{!spendPeriod.isLoading ? (
								<>
									<div className='sm:mb-2'>
										<div className='flex items-center'>
											<span className={`${poppins.className} ${poppins.variable} mr-2 text-xs font-normal leading-5 text-lightBlue dark:text-blue-dark-medium md:mt-1 lg:mt-0`}>
												Spend Period Remaining
											</span>

											<HelperTooltip
												text='Funds requested from the treasury are periodically distributed at the end of the spend period.'
												className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
											/>
										</div>

										<div className={`${poppins.className} ${poppins.variable} mt-1 flex items-baseline whitespace-pre font-medium text-bodyBlue dark:text-blue-dark-high sm:mt-0`}>
											{spendPeriod.value?.total ? (
												<>
													{spendPeriod.value?.days ? (
														<>
															<span className='text-base font-medium sm:text-lg'>{spendPeriod.value.days}&nbsp;</span>
															<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>days&nbsp;</span>
														</>
													) : null}
													<>
														<span className='text-base font-medium sm:text-lg'>{spendPeriod.value.hours}&nbsp;</span>
														<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>hrs&nbsp;</span>
													</>
													{!spendPeriod.value?.days ? (
														<>
															<span className='text-base font-medium sm:text-lg'>{spendPeriod.value.minutes}&nbsp;</span>
															<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>mins&nbsp;</span>
														</>
													) : null}
													<span className='text-xs text-lightBlue dark:text-blue-dark-medium sm:text-xs'>/ {spendPeriod.value.total} days </span>
												</>
											) : (
												'N/A'
											)}
										</div>
									</div>
									<span className='flex items-center'>
										<ProgressBar
											className='m-0 flex items-center p-0'
											percent={!isNaN(Number(spendPeriod.percentage)) ? spendPeriod.percentage : 0}
											trailColor={trailColor}
											strokeColor='#E5007A'
											size='small'
										/>
									</span>
								</>
							) : (
								<div className='flex min-h-[50px] w-full items-center justify-center'>
									<LoadingOutlined />
								</div>
							)}
						</div>
						<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
					</>
				)}

				{/* Next Burn */}
				{!['moonbeam', 'kilt', 'moonbase', 'moonriver', 'polymesh', 'polimec', 'rolimec'].includes(network) && (
					<div>
						<div className='w-full gap-x-0 lg:flex'>
							{!nextBurn.isLoading ? (
								<div className='items-start sm:flex sm:gap-2'>
									<div className='h-12'>
										<div className={`${poppins.className} ${poppins.variable} flex flex-col text-xs`}>
											<span className='text-xs font-normal leading-5 text-lightBlue dark:text-blue-dark-medium'>Next Burn</span>
											<div className='flex items-baseline gap-x-[6px]'>
												{nextBurn.value ? (
													<div className='flex items-baseline gap-x-[3px]'>
														<span className='text-lg font-medium'>{nextBurn.value}</span>
														<span className='text-base font-medium text-lightBlue dark:text-blue-dark-high'>{chainProperties[network]?.tokenSymbol}</span>
													</div>
												) : null}
												<span className='text-[12px] font-normal text-lightBlue dark:text-blue-dark-high'>{nextBurn.valueUSD ? `~ $${nextBurn.valueUSD}` : 'N/A'}</span>
											</div>
										</div>
									</div>
									<p
										className={`${poppins.className} ${poppins.variable} mt-2 flex-1 rounded-lg bg-[#F4F5F6] px-3 py-2 text-xs font-normal text-[#333843] dark:bg-[#333843] dark:text-[#F4F5F6] sm:mt-0`}
									>
										If the Treasury ends a spend period without spending all of its funds, it suffers a burn of a percentage of its funds.
									</p>
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

export default LatestTreasuryOverview;
