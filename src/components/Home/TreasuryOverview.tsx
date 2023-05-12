// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CaretDownOutlined, CaretUpOutlined, LoadingOutlined } from '@ant-design/icons';
import type { Balance } from '@polkadot/types/interfaces';
import { BN_MILLION, BN_ZERO, u8aConcat, u8aToHex } from '@polkadot/util';
import { Divider, Progress } from 'antd';
import BN from 'bn.js';
import { dayjs } from 'dayjs-init';
import React, { FC, useEffect, useState } from 'react';
import { subscanApiHeaders } from 'src/global/apiHeaders';
import { chainProperties } from 'src/global/networkConstants';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import blockToDays from 'src/util/blockToDays';
import blockToTime from 'src/util/blockToTime';
import fetchTokenToUSDPrice from 'src/util/fetchTokenToUSDPrice';
import formatBnBalance from 'src/util/formatBnBalance';
import formatUSDWithUnits from 'src/util/formatUSDWithUnits';
import styled from 'styled-components';
import { useApiContext, useNetworkContext } from '~src/context';

import getDaysTimeObj from '~src/util/getDaysTimeObj';

const EMPTY_U8A_32 = new Uint8Array(32);

interface ITreasuryOverviewProps{
	inTreasuryProposals?: boolean
	className?: string
}

const TreasuryOverview: FC<ITreasuryOverviewProps> = (props) => {
	const { className, inTreasuryProposals } = props;
	const { network } = useNetworkContext();

	const { api, apiReady } = useApiContext();

	const blockTime:number = chainProperties?.[network]?.blockTime;
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
		api.derive.chain.bestNumber((currentBlock) => {
			const spendPeriodConst = api.consts.treasury
				? api.consts.treasury.spendPeriod
				: BN_ZERO;
			if(spendPeriodConst){
				const spendPeriod = spendPeriodConst.toNumber();
				const totalSpendPeriod: number = blockToDays(spendPeriod, network, blockTime);
				const goneBlocks = currentBlock.toNumber() % spendPeriod;
				// const spendPeriodElapsed: number = blockToDays(goneBlocks, network, blockTime);
				// const spendPeriodRemaining: number = totalSpendPeriod - spendPeriodElapsed;
				const time = blockToTime(spendPeriod - goneBlocks, network, blockTime);
				const { d, h, m } = getDaysTimeObj(time);

				const percentage = ((goneBlocks/spendPeriod) * 100).toFixed(0);

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
		}).catch(() => {
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
	},[api, apiReady, blockTime, network]);

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
			api.consts.treasury && api.consts.treasury.palletId
				? api.consts.treasury.palletId.toU8a(true)
				: 'py/trsry',
			EMPTY_U8A_32
		);
		api.derive.balances
			?.account(u8aToHex(treasuryAccount))
			.then((treasuryBalance) => {
				api.query.system.account(treasuryAccount).then(res => {
					const freeBalance = new BN(res?.data?.free) || BN_ZERO;
					treasuryBalance.freeBalance = freeBalance as Balance;
				})
					.catch(e => {
						console.error(e);
						setAvailable({
							isLoading: false,
							value: '',
							valueUSD: ''
						});
					})
					.finally(() => {
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						{
							const burn =
							treasuryBalance.freeBalance.gt(BN_ZERO) &&
								!api.consts.treasury.burn.isZero()
								? api.consts.treasury.burn
									.mul(treasuryBalance.freeBalance)
									.div(BN_MILLION)
								: BN_ZERO;

							let valueUSD = '';
							let value = '';

							if(burn) {
								// replace spaces returned in string by format function
								const nextBurnValueUSD = parseFloat(formatBnBalance(
									burn.toString(),
									{
										numberAfterComma: 2,
										withThousandDelimitor: false,
										withUnit: false
									},
									network
								));
								if (nextBurnValueUSD && currentTokenPrice && currentTokenPrice.value) {
									valueUSD = formatUSDWithUnits((nextBurnValueUSD * Number(currentTokenPrice.value)).toString());
								}
								value = formatUSDWithUnits(formatBnBalance(
									burn.toString(),
									{
										numberAfterComma: 0,
										withThousandDelimitor: false,
										withUnit: false
									},
									network
								));
							}

							setNextBurn({
								isLoading: false,
								value,
								valueUSD
							});
						}
						{
							const freeBalance = treasuryBalance.freeBalance.gt(BN_ZERO)
								? treasuryBalance.freeBalance
								: undefined;

							let valueUSD = '';
							let value = '';

							if (freeBalance) {
								const availableValueUSD = parseFloat(formatBnBalance(
									freeBalance.toString(),
									{
										numberAfterComma: 2,
										withThousandDelimitor: false,
										withUnit: false
									},
									network
								));
								if (availableValueUSD && currentTokenPrice && currentTokenPrice.value !== 'N/A') {
									valueUSD = formatUSDWithUnits((availableValueUSD * Number(currentTokenPrice.value)).toString());
								}
								value = formatUSDWithUnits(formatBnBalance(
									freeBalance.toString(),
									{
										numberAfterComma: 0,
										withThousandDelimitor: false,
										withUnit: false
									}, network
								));
							}

							setAvailable({
								isLoading: false,
								value,
								valueUSD
							});
						}
					});
			});

	}, [api, apiReady, currentTokenPrice, network]);

	// set availableUSD and nextBurnUSD whenever they or current price of the token changes

	// fetch current price of the token
	useEffect(() => {
		let cancel = false;
		if(cancel) return;

		setCurrentTokenPrice({
			isLoading: true,
			value: ''
		});
		fetchTokenToUSDPrice(network).then((formattedUSD) => {
			if(formattedUSD === 'N/A') {
				setCurrentTokenPrice({
					isLoading: false,
					value: formattedUSD
				});
				return;
			}

			setCurrentTokenPrice({
				isLoading: false,
				value: parseFloat(formattedUSD).toFixed(2)
			});
		}).catch(() => {
			setCurrentTokenPrice({
				isLoading: false,
				value: 'N/A'
			});
		});

		return () => {cancel = true;};
	}, [network]);

	// fetch a week ago price of the token and calc priceWeeklyChange
	useEffect(() => {
		let cancel = false;
		if(cancel || !currentTokenPrice.value || currentTokenPrice.isLoading) return;

		setPriceWeeklyChange({
			isLoading: true,
			value: ''
		});
		async function fetchWeekAgoTokenPrice() {
			if (cancel) return;
			const weekAgoDate = dayjs().subtract(7,'d').format('YYYY-MM-DD');
			try {
				const response = await fetch(
					`${chainProperties[network].externalLinks}/api/scan/price/history`,
					{
						body: JSON.stringify({
							end: weekAgoDate,
							start: weekAgoDate
						}),
						headers: subscanApiHeaders,
						method: 'POST'
					}
				);
				const responseJSON = await response.json();
				if (responseJSON['message'] == 'Success') {
					const weekAgoPrice = responseJSON['data']['average'];
					const currentTokenPriceNum : number = parseFloat(currentTokenPrice.value);
					const weekAgoPriceNum : number = parseFloat(weekAgoPrice);
					if(weekAgoPriceNum == 0) {
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
			} catch(err) {
				setPriceWeeklyChange({
					isLoading: false,
					value: 'N/A'
				});
			}
		}

		fetchWeekAgoTokenPrice();
		return () => {cancel = true;};
	}, [currentTokenPrice, network]);

	return (
		<div className={`${className} grid ${!['polymesh', 'polymesh-test'].includes(network) && 'grid-rows-2'} grid-cols-2 grid-flow-col gap-4 lg:flex`}>
			{/* Available */}
			<div className="flex-1 flex flex-col justify-between bg-white drop-shadow-md p-3 lg:p-6 rounded-md gap-y-2">
				{
					!available.isLoading ?
						<>
							<div className="text-navBlue text-xs flex items-center">
								<span className="mr-2">
									Available
								</span>

								<HelperTooltip
									text='Funds collected through a portion of block production rewards, transaction fees, slashing, staking inefficiencies, etc.'
								/>
							</div>
							<div className="text-sidebarBlue font-medium text-lg">
								{
									available.value ?
										<span>
											{available.value}
											{' '}
											<span className='text-navBlue'>
												{chainProperties[network]?.tokenSymbol}
											</span>
										</span>
										: <span>N/A</span>
								}
							</div>
							{!['polymesh', 'polymesh-test'].includes(network) && <>
								<div className='flex flex-col justify-center text-sidebarBlue font-medium gap-y-3'>
									<Divider className='m-0 p-0' />
									<span className='flex flex-col justify-center text-sidebarBlue font-medium'>
										{
											available.valueUSD
												? `~ $${available.valueUSD}`
												: 'N/A'
										}
									</span>
								</div>
							</>}
						</>
						: <div className='min-h-[89px] w-full flex items-center justify-center'>
							<LoadingOutlined />
						</div>
				}
			</div>

			{/* CurrentPrice */}
			{network !== 'moonbase' &&
				<div className="flex-1 flex flex-col justify-between bg-white drop-shadow-md p-3 lg:p-6 rounded-md gap-y-2">
					{
						!(currentTokenPrice.isLoading || priceWeeklyChange.isLoading)?
							<>
								<div className="text-navBlue text-xs flex items-center">
									<span className='hidden md:flex'>
							Current Price of {chainProperties[network]?.tokenSymbol}
									</span>
									<span className='flex md:hidden'>
							Price {chainProperties[network]?.tokenSymbol}
									</span>
								</div>
								<div className="text-sidebarBlue font-medium text-lg">
									{currentTokenPrice.value === 'N/A' ? <span>N/A</span> : currentTokenPrice.value && !isNaN(Number(currentTokenPrice.value))
										? <span>${currentTokenPrice.value}</span>
										: null
									}
								</div>
								<div className="flex flex-col justify-center text-sidebarBlue font-medium gap-y-3">
									<Divider className='m-0 p-0' />
									<span className='flex items-center gap-x-1'>
										{priceWeeklyChange.value === 'N/A' ? 'N/A' : priceWeeklyChange.value ?
											<>
												<span>
													Weekly{' '}
													<span className='hidden xl:inline-block'>
														Change
													</span>
												</span>
												<span>
													{Math.abs(Number(priceWeeklyChange.value))}%
												</span>
												{typeof priceWeeklyChange.value === 'number' && priceWeeklyChange.value < 0 ? <CaretDownOutlined color='red' /> : <CaretUpOutlined color='green' /> }
											</>
											: null
										}
									</span>
								</div>
							</>
							:  <div className='min-h-[89px] w-full flex items-center justify-center'>
								<LoadingOutlined />
							</div>
					}
				</div>
			}

			{/* Spend Period */}
			{!['polymesh', 'polymesh-test'].includes(network) && <>
				{!inTreasuryProposals &&
				<div className="flex-1 flex flex-col justify-between bg-white drop-shadow-md p-3 lg:p-6 rounded-md gap-y-2">
					{
						!spendPeriod.isLoading?
							<>
								<div className="text-navBlue text-xs flex items-center gap-x-2">
									<span>
										Spend Period
									</span>

									<HelperTooltip
										text='Funds held in the treasury can be spent by making a spending proposal that, if approved by the Council, will enter a spend period before distribution, it is subject to governance, with the current default set to 24 days.'
									/>
								</div>

								<div className="text-sidebarBlue font-medium text-lg">
									{spendPeriod.value?.total
										? <>
											{
												spendPeriod.value?.days?
													<>
														<span>{spendPeriod.value.days} </span>
														<span className='text-navBlue'>days </span>
													</>
													: null
											}
											<span>{spendPeriod.value.hours} </span>
											<span className='text-navBlue'>hrs </span>
											{
												!spendPeriod.value?.days?
													<>
														<span>{spendPeriod.value.minutes} </span>
														<span className='text-navBlue'>mins </span>
													</>
													: null
											}
											<span className="text-navBlue text-xs"> / {spendPeriod.value.total} days </span>
										</>
										: 'N/A'
									}
								</div>
								{
									<div className='flex flex-col justify-center text-sidebarBlue font-medium gap-y-3'>
										<Divider className='m-0 p-0' />
										<span className='flex items-center'>
											<Progress className='m-0 p-0 flex items-center' percent={!isNaN(Number(spendPeriod.percentage)) ? spendPeriod.percentage : 0} strokeColor='#E5007A' size="small" />
										</span>
									</div>
								}
							</>
							:  <div className='min-h-[89px] w-full flex items-center justify-center'>
								<LoadingOutlined />
							</div>
					}
				</div>
				}
			</>}

			{/* Next Burn */}
			{!['moonbeam', 'moonbase', 'moonriver'].includes(network) &&
				<div className="flex-1 flex flex-col justify-between bg-white drop-shadow-md p-3 lg:p-6 rounded-md gap-y-2">
					{
						!nextBurn.isLoading?
							<>
								<div className="text-navBlue text-xs flex items-center">
									<span className="mr-2">
										Next Burn
									</span>

									<HelperTooltip
										text='If the Treasury ends a spend period without spending all of its funds, it suffers a burn of a percentage of its funds.'
									/>
								</div>

								<div className="text-sidebarBlue font-medium text-lg">
									{
										nextBurn.value ? (
											<span>
												{nextBurn.value} <span className='text-navBlue'>{chainProperties[network]?.tokenSymbol}</span>
											</span>
										) : null
									}
								</div>
								<div className='flex flex-col justify-center text-sidebarBlue font-medium gap-y-3'>
									<Divider className='m-0 p-0' />
									<span className='mr-2 text-sidebarBlue font-medium'>
										{
											nextBurn.valueUSD
												? `~ $${nextBurn.valueUSD}`
												: 'N/A'
										}
									</span>
								</div>
							</>
							: <div className='min-h-[89px] w-full flex items-center justify-center'>
								<LoadingOutlined />
							</div>
					}
				</div>
			}
		</div>
	);
};

export default styled(TreasuryOverview)`

.ant-progress-text{
	color: #90A0B7 !important;
}
.ant-progress-outer {
	display: flex !important;
	align-items: center !important;
}

`;