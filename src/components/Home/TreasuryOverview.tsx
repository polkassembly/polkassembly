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
import PiggyBankIcon from '~assets/icons/piggyBankIcon.svg';
import CharacterIcon from '~assets/icons/character-icon.svg';
import CurrencyIcon from '~assets/icons/currency-icon.svg';
import ElipseIcon from '~assets/icons/elipse-icon.svg';
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
			<div className="flex-1 flex  justify-between  drop-shadow-md p-3 lg:p-6 rounded-[14px] gap-y-2 bg-white ">
				<div className=' flex-1 flex flex-col justify-around gap-x-0'>
					{
						!available.isLoading ?
							<>
								<div className=" text-xs flex items-center ">
									<span className="mr-2 text-[#485F7D] font-semibold">
									Available
									</span>
								</div>
								<div className=" font-semibold text-lg leading-6 tracking-normal">
									{
										available.value ?
											<span className='flex gap-2'>
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
								<LoadingOutlined  />
							</div>
					}
				</div>
				<PiggyBankIcon className=' scale-120' />
			</div>

			{/* CurrentPrice */}
			{network !== 'moonbase' &&
				<div className="flex-1 flex flex-col justify-between drop-shadow-md p-0 lg:p-6 rounded-[14px] gap-y-2 bg-white">
					<div>

						<div className=' flex justify-around'>
							{
								!(currentTokenPrice.isLoading || priceWeeklyChange.isLoading)?
									<div className=' flex-1 flex flex-col justify-around'>
										<div className="text-[#485F7D] font-semibold font-poppins items-center">
											<span className='hidden md:block md:break-keep'>
							Current Price of {chainProperties[network]?.tokenSymbol}
											</span>
											<span className='flex md:hidden'>
							Price {chainProperties[network]?.tokenSymbol}
											</span>
										</div>
										<div className="text-sidebarBlue font-semibold text-[18px] ">
											{currentTokenPrice.value === 'N/A' ? <span>N/A</span> : currentTokenPrice.value && !isNaN(Number(currentTokenPrice.value))
												? <span>${currentTokenPrice.value}</span>
												: null
											}
										</div>

									</div>
									:  <div className='min-h-[89px] w-full flex items-center justify-center'>
										<LoadingOutlined />
									</div>
							}
							<div className='-mr-3 -ml-2'>
								<CharacterIcon />
							</div>
						</div>

					</div>
					<div className="flex flex-col justify-center text-sidebarBlue font-medium gap-y-3">

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
				</div>
			}

			{/* Spend Period */}
			{!['polymesh', 'polymesh-test'].includes(network) && <>
				{!inTreasuryProposals &&
				<div className="flex-1 flex flex-col justify-around bg-white drop-shadow-md p-3 lg:p-6 rounded-[14px] gap-y-2">
					<div className='flex'>
						<div>
							{
								!spendPeriod.isLoading?
									<>
										<div className="text-navBlue text-xs flex items-center gap-x-2 mb-2">
											<span className='text-[#485F7D] font-semibold font-poppins'>
										Spend Period Remaining
											</span>
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

												</>
												: 'N/A'
											}

										</div>
									</>
									:  <div className='min-h-[89px] w-full flex items-center justify-center'>
										<LoadingOutlined />
									</div>
							}
						</div>
						<ElipseIcon />
					</div>
					<div className="font-poppins font-semibold text-base leading-6 text-[#334D6E;] text-[14px]">
						{spendPeriod.value?.total
							? <>
								{
									spendPeriod.value?.days?
										<>
											<span>{((spendPeriod.value.total)-(spendPeriod.value.days))/(spendPeriod.value.days)*100}</span>
											<span className='font-poppins font-semibold text-base leading-6 text-[#334D6E;]'>% Completed </span>
										</>
										: null
								}
							</>
							: null
						}
					</div>
				</div>
				}
			</>}

			{/* Next Burn */}
			{!['moonbeam', 'moonbase', 'moonriver'].includes(network) &&
				<div className="flex-1 flex flex-col justify-between  drop-shadow-md lg:p-6 rounded-[14px] gap-y-2 bg-white ">
					<div>
						<div className='flex-1 flex  justify-between'>
							{
								!nextBurn.isLoading?
									<div className='flex flex-col justify-around'>
										<div className="text-[#485F7D] font-semibold font-poppins flex items-center">
											<span className="mr-2">
										Next Burn
											</span>

										</div>

										<div className="text-[#485F7D] font-semibold font-poppins text-lg ">
											{
												nextBurn.value ? (
													<span>
														{nextBurn.value} <span className='text-navBlue'>{chainProperties[network]?.tokenSymbol}</span>
													</span>
												) : null
											}
										</div>

										<div className='flex flex-col justify-center text-sidebarBlue font-medium gap-y-3'>

											<span className='mr-2 text-sidebarBlue font-medium'>
												{
													nextBurn.valueUSD
														? `~ $${nextBurn.valueUSD}`
														: 'N/A'
												}
											</span>
										</div>
									</div>
									: <div className='min-h-[89px] w-full flex items-center justify-center'>
										<LoadingOutlined/>
									</div>
							}
							<CurrencyIcon className='scale-130'/>
						</div>
					</div>
					{
						<div className='flex flex-col justify-center text-sidebarBlue font-medium gap-y-3'>

							<span className='flex items-center'>
								<Progress className='m-0 p-0 flex items-center' percent={!isNaN(Number(spendPeriod.percentage)) ? spendPeriod.percentage : 0} strokeColor='#E5007A' size="small" />
							</span>
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