// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Card } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { Balance } from '@polkadot/types/interfaces';
import { BN_MILLION, BN_ZERO, u8aConcat, u8aToHex } from '@polkadot/util';
import BN from 'bn.js';
import { dayjs } from 'dayjs-init';
import { subscanApiHeaders } from 'src/global/apiHeaders';
import { chainProperties } from 'src/global/networkConstants';
import blockToDays from 'src/util/blockToDays';
import blockToTime from 'src/util/blockToTime';
import formatBnBalance from 'src/util/formatBnBalance';
import formatUSDWithUnits from 'src/util/formatUSDWithUnits';
import { useApiContext } from '~src/context';
import getDaysTimeObj from '~src/util/getDaysTimeObj';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import { useNetworkSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { setCurrentTokenPrice as setCurrentTokenPriceInRedux } from '~src/redux/currentTokenPrice';
import LatestTreasuryOverview from '../Home/overviewData/LatestTreasuryOverview';
import ImageIcon from '~src/ui-components/ImageIcon';
import { isAssetHubSupportedNetwork } from '../Home/TreasuryOverview/utils/isAssetHubSupportedNetwork';
import { useTranslation } from 'next-i18next';
import { network as AllNetworks } from '~src/global/networkConstants';

const EMPTY_U8A_32 = new Uint8Array(32);
export const isAssetHubNetwork = [AllNetworks.POLKADOT];

const StyledCard = styled(Card)`
	g[transform='translate(0,0)'] g:nth-child(even) {
		display: none !important;
	}
	div[style*='pointer-events: none;'] {
		visibility: hidden;
		animation: fadeIn 0.5s forwards;
	}

	@keyframes fadeIn {
		0% {
			visibility: hidden;
			opacity: 0;
		}
		100% {
			visibility: visible;
			opacity: 1;
		}
	}
	@media (max-width: 640px) {
		.ant-card-body {
			padding: 12px !important;
		}
	}
`;

const MonthlySpend = () => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { t } = useTranslation('common');

	const dispatch = useDispatch();
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
					let valueUSD = '';
					let value = '';
					{
						try {
							const burn =
								treasuryBalance.freeBalance.gt(BN_ZERO) && !api.consts.treasury.burn.isZero() ? api.consts.treasury.burn.mul(treasuryBalance.freeBalance).div(BN_MILLION) : BN_ZERO;

							if (burn) {
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

	return (
		<StyledCard className='mx-auto h-[276px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white '>
			<h2 className='text-base font-semibold sm:text-xl'>{t('monthly_spend')}</h2>
			{isAssetHubSupportedNetwork(network) ? (
				<div className='mt-[64px]'>
					<LatestTreasuryOverview
						currentTokenPrice={currentTokenPrice}
						available={available}
						priceWeeklyChange={priceWeeklyChange}
						spendPeriod={spendPeriod}
						nextBurn={nextBurn}
						tokenValue={tokenValue}
						isUsedInGovAnalytics={true}
					/>
				</div>
			) : (
				<div className='flex flex-col items-center justify-center'>
					<ImageIcon
						src='/assets/icons/no-graph.gif'
						alt={t('empty_state')}
						imgClassName='h-[165px] w-[241px]'
					/>
					<p className='m-0 p-0 text-sm text-bodyBlue dark:text-white'>{t('no_graph_available')}</p>
				</div>
			)}
		</StyledCard>
	);
};

export default MonthlySpend;
