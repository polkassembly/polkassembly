// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { Balance } from '@polkadot/types/interfaces';
import { BN_MILLION, BN_ZERO, u8aConcat, u8aToHex } from '@polkadot/util';
import BN from 'bn.js';
import { dayjs } from 'dayjs-init';
import React, { FC, useEffect, useState } from 'react';
import { subscanApiHeaders } from 'src/global/apiHeaders';
import { chainProperties } from 'src/global/networkConstants';
import blockToDays from 'src/util/blockToDays';
import blockToTime from 'src/util/blockToTime';
import formatBnBalance from 'src/util/formatBnBalance';
import formatUSDWithUnits from 'src/util/formatUSDWithUnits';
import styled from 'styled-components';
import { useApiContext } from '~src/context';
import getDaysTimeObj from '~src/util/getDaysTimeObj';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import { useNetworkSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { setCurrentTokenPrice as setCurrentTokenPriceInRedux } from '~src/redux/currentTokenPrice';
import LatestTreasuryOverview from '../overviewData/LatestTreasuryOverview';
import AvailableTreasuryBalance from './AvailableTreasuryBalance';
import CurrentPrice from './CurrentPrice';
import NextBurn from './NextBurn';
import SpendPeriod from './SpendPeriod';
import { isAssetHubSupportedNetwork } from './utils/isAssetHubSupportedNetwork';

const EMPTY_U8A_32 = new Uint8Array(32);

interface ITreasuryOverviewProps {
	inTreasuryProposals?: boolean;
	className?: string;
	theme?: string;
}

const TreasuryOverview: FC<ITreasuryOverviewProps> = (props) => {
	const { className, inTreasuryProposals } = props;
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();

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
		api?.derive.chain
			.bestNumber((currentBlock) => {
				const spendPeriodConst = api.consts.treasury ? api.consts.treasury.spendPeriod : BN_ZERO;
				if (spendPeriodConst) {
					const spendPeriod = spendPeriodConst.toNumber();
					const totalSpendPeriod: number = blockToDays(spendPeriod, network, blockTime);
					const goneBlocks = currentBlock.toNumber() % spendPeriod;
					// const spendPeriodElapsed: number = blockToDays(goneBlocks, network, blockTime);
					// const spendPeriodRemaining: number = totalSpendPeriod - spendPeriodElapsed;
					const { time } = blockToTime(spendPeriod - goneBlocks, network, blockTime);
					const { d, h, m } = getDaysTimeObj(time);

					const percentage = ((goneBlocks / spendPeriod) * 100).toFixed(0);

					setSpendPeriod({
						isLoading: false,
						// spendPeriodElapsed/totalSpendPeriod for opposite
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

		api?.derive?.balances?.account(u8aToHex(treasuryAccount)).then((treasuryBalance) => {
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

	// set availableUSD and nextBurnUSD whenever they or current price of the token changes

	// fetch current price of the token
	useEffect(() => {
		if (!network) return;
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
	}, [network]);

	// fetch a week ago price of the token and calc priceWeeklyChange
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

	return (
		<section>
			{isAssetHubSupportedNetwork(network) ? (
				<>
					<LatestTreasuryOverview
						currentTokenPrice={currentTokenPrice}
						available={available}
						priceWeeklyChange={priceWeeklyChange}
						spendPeriod={spendPeriod}
						nextBurn={nextBurn}
						tokenValue={tokenValue}
					/>
				</>
			) : (
				<div
					className={`${className} grid ${
						!['polymesh', 'polymesh-test', 'polimec', 'rolimec'].includes(network) && 'grid-rows-2'
					} grid-flow-col grid-cols-2 xs:gap-6 sm:gap-8 xl:flex xl:gap-4`}
				>
					<AvailableTreasuryBalance available={available} />

					<CurrentPrice
						currentTokenPrice={currentTokenPrice}
						priceWeeklyChange={priceWeeklyChange}
					/>

					<NextBurn nextBurn={nextBurn} />

					<SpendPeriod
						inTreasuryProposals={inTreasuryProposals}
						spendPeriod={spendPeriod}
					/>
				</div>
			)}
		</section>
	);
};

export default styled(TreasuryOverview)`
	.ant-progress-text {
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#1E262D')} !important;
		font-size: 12px !important;
	}
	.ant-progress-outer {
		display: flex !important;
		align-items: center !important;
	}
`;
