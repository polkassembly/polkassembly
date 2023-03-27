// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CaretDownOutlined, CaretUpOutlined, LoadingOutlined } from '@ant-design/icons';
import { DeriveBalancesAccount } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';
import { BN_MILLION, BN_ZERO, u8aConcat, u8aToHex } from '@polkadot/util';
import { Divider, Progress } from 'antd';
import BN from 'bn.js';
import { dayjs } from 'dayjs-init';
import React, { useContext, useEffect, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import { subscanApiHeaders } from 'src/global/apiHeaders';
import { chainProperties } from 'src/global/networkConstants';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import blockToDays from 'src/util/blockToDays';
import blockToTime from 'src/util/blockToTime';
import fetchTokenToUSDPrice from 'src/util/fetchTokenToUSDPrice';
import formatBnBalance from 'src/util/formatBnBalance';
import formatUSDWithUnits from 'src/util/formatUSDWithUnits';
import styled from 'styled-components';

import { NetworkContext } from '~src/context/NetworkContext';
import getDaysTimeObj from '~src/util/getDaysTimeObj';

const EMPTY_U8A_32 = new Uint8Array(32);

interface Result {
	value?: Balance;
	burn?: BN;
	spendPeriod: BN;
	treasuryAccount: Uint8Array;
}

interface Props{
	inTreasuryProposals?: boolean
	className?: string
}

const TreasuryOverview = ({ className, inTreasuryProposals }:Props) => {
	const { network } = useContext(NetworkContext);

	const { api, apiReady } = useContext(ApiContext);
	const [currentBlock, setCurrentBlock] = useState<BN>(new BN(0));
	const [treasuryBalance, setTreasuryBalance] = useState<
		DeriveBalancesAccount | undefined
	>(undefined);

	const blocktime:number = chainProperties?.[network]?.blockTime;

	const [result, setResult] = useState<Result>(() => ({
		spendPeriod: BN_ZERO,
		treasuryAccount: u8aConcat('modl', 'py/trsry', EMPTY_U8A_32).subarray(
			0,
			32
		)
	}));

	const [resultValue, setResultValue] = useState<string | undefined>(undefined);
	const [resultBurn, setResultBurn] = useState<string | undefined>(undefined);
	const [availableUSD, setAvailableUSD] = useState<string>('');
	const [nextBurnUSD, setNextBurnUSD] = useState<string>('');
	const [currentTokenPrice, setCurrentTokenPrice] = useState<string>('');
	const [priceWeeklyChange, setPriceWeeklyChange] = useState<string | number>('NA');
	const [spendPeriod, setSpendPeriod] = useState<{
		total: number;
		days: number;
		hours: number;
		minutes: number;
	}>();
	const [spendPeriodPercentage, setSpendPeriodPercentage] = useState<number>();

	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}

		api.derive.chain.bestNumber((number) => {
			setCurrentBlock(number);
		});

		api.derive.balances
			?.account(u8aToHex(result.treasuryAccount))
			.then((treasuryBalance) => {
				api.query.system.account(result.treasuryAccount).then(res => {
					const freeBalance = new BN(res?.data?.free) || BN_ZERO;
					treasuryBalance.freeBalance = freeBalance as Balance;
				})
					.catch(e => console.error(e))
					.finally(() => {
						setTreasuryBalance(treasuryBalance);
					});
			});

		if (treasuryBalance) {
			setResult(() => ({
				burn:
				treasuryBalance.freeBalance.gt(BN_ZERO) &&
					!api.consts.treasury.burn.isZero()
					? api.consts.treasury.burn
						.mul(treasuryBalance.freeBalance)
						.div(BN_MILLION)
					: BN_ZERO,
				spendPeriod: api.consts.treasury
					? api.consts.treasury.spendPeriod
					: BN_ZERO,
				treasuryAccount: u8aConcat(
					'modl',
					api.consts.treasury && api.consts.treasury.palletId
						? api.consts.treasury.palletId.toU8a(true)
						: 'py/trsry',
					EMPTY_U8A_32
				),
				value: treasuryBalance.freeBalance.gt(BN_ZERO)
					? treasuryBalance.freeBalance
					: undefined
			}));

			if (result.value) {
				setResultValue(result.value.toString());
			}

			if (result.burn) {
				setResultBurn(result.burn.toString());
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, treasuryBalance, currentBlock]);

	// set availableUSD and nextBurnUSD whenever they or current price of the token changes
	useEffect(() => {
		let cancel = false;
		if (cancel || !currentTokenPrice) return;

		if(resultValue) {
			// replace spaces returned in string by format function
			const availableVal: number = parseFloat(formatBnBalance(
				resultValue.toString(),
				{
					numberAfterComma: 2,
					withThousandDelimitor: false,
					withUnit: false
				},
				network
			));

			if(availableVal != 0) {
				setAvailableUSD(formatUSDWithUnits((availableVal * Number(currentTokenPrice)).toString()));
			}
		}

		if(resultBurn) {
			// replace spaces returned in string by format function
			const burnVal: number = parseFloat(formatBnBalance(
				resultBurn.toString(),
				{
					numberAfterComma: 2,
					withThousandDelimitor: false,
					withUnit: false
				},
				network
			));

			if(burnVal != 0) {
				setNextBurnUSD(formatUSDWithUnits((burnVal * Number(currentTokenPrice)).toString()));
			}
		}

		return () => { cancel = true; };
	}, [resultValue, resultBurn, currentTokenPrice, network]);

	// fetch current price of the token
	useEffect(() => {
		let cancel = false;
		if(cancel) return;

		fetchTokenToUSDPrice(network).then((formattedUSD) => {
			if(formattedUSD === 'N/A') return setCurrentTokenPrice(formattedUSD);

			setCurrentTokenPrice(parseFloat(formattedUSD).toFixed(2));
		});

		return () => {cancel = true;};
	}, [network]);

	// fetch a week ago price of the token and calc priceWeeklyChange
	useEffect(() => {
		let cancel = false;
		if(cancel || !currentTokenPrice) return;

		async function fetchWeekAgoTokenPrice() {
			if (cancel) return;
			const weekAgoDate = dayjs().subtract(7,'d').format('YYYY-MM-DD');

			try {
				const response = await fetch(
					`${chainProperties[network].subscanAPI}/api/scan/price/history`,
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
					const currentTokenPriceNum : number = parseFloat(currentTokenPrice);
					const weekAgoPriceNum : number = parseFloat(weekAgoPrice);
					if(weekAgoPriceNum == 0) return setPriceWeeklyChange('N/A');
					const percentChange = ((currentTokenPriceNum - weekAgoPriceNum) / weekAgoPriceNum) * 100;
					setPriceWeeklyChange(parseFloat(percentChange.toFixed(2)));
				}
			} catch(err) {
				setPriceWeeklyChange('N/A');
			}
		}

		fetchWeekAgoTokenPrice();
		return () => {cancel = true;};
	}, [currentTokenPrice, network]);

	useEffect(() => {
		if (!api || !apiReady || currentBlock.isZero()) {
			return;
		}
		if(result.spendPeriod){
			const spendPeriod = result.spendPeriod.toNumber();
			const totalSpendPeriod: number = blockToDays(spendPeriod, network, blocktime);
			const goneBlocks = currentBlock.toNumber() % spendPeriod;
			// const spendPeriodElapsed: number = blockToDays(goneBlocks, network, blocktime);
			// const spendPeriodRemaining: number = totalSpendPeriod - spendPeriodElapsed;
			const time = blockToTime(spendPeriod - goneBlocks, network, blocktime);
			const { d, h, m } = getDaysTimeObj(time);
			setSpendPeriod({
				days: d,
				hours: h,
				minutes: m,
				total: totalSpendPeriod
			});

			// spendPeriodElapsed/totalSpendPeriod for opposite
			const percentage = ((goneBlocks/spendPeriod) * 100).toFixed(0);
			setSpendPeriodPercentage(parseFloat(percentage));
		}
	}, [api, apiReady, currentBlock, blocktime, result.spendPeriod, network]);

	return (
		<div className={`${className} grid ${!['polymesh', 'polymesh-test'].includes(network) && 'grid-rows-2'} grid-cols-2 grid-flow-col gap-4 lg:flex`}>
			{/* Available */}
			<div className="flex-1 flex flex-col justify-between bg-white drop-shadow-md p-3 lg:p-6 rounded-md gap-y-2">
				{
					apiReady?
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
								{!apiReady
									? null
									: result.value ?
										<span>
											{formatUSDWithUnits(formatBnBalance(
												result.value.toString(),
												{
													numberAfterComma: 0,
													withThousandDelimitor: false,
													withUnit: false
												}, network
											))}
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
										{ apiReady && !resultValue ? 'N/A'
											: resultValue == '0' ? '$ 0' :
												availableUSD
													? `~ $${availableUSD}`
													: null
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
						apiReady?
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
									{currentTokenPrice === 'N/A' ? <span>N/A</span> : currentTokenPrice && !isNaN(Number(currentTokenPrice))
										? <span>${currentTokenPrice}</span>
										: null
									}
								</div>
								<div className="flex flex-col justify-center text-sidebarBlue font-medium gap-y-3">
									<Divider className='m-0 p-0' />
									<span className='flex items-center gap-x-1'>
										{priceWeeklyChange === 'N/A' ? 'N/A' : priceWeeklyChange ?
											<>
												<span>
										Weekly{' '}
													<span className='hidden xl:inline-block'>
											Change
													</span>
												</span>
												<span>
													{Math.abs(Number(priceWeeklyChange))}%
												</span>
												{typeof priceWeeklyChange === 'number' && priceWeeklyChange < 0 ? <CaretDownOutlined color='red' /> : <CaretUpOutlined color='green' /> }
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
						apiReady?
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
									{spendPeriod
										? spendPeriod?.total
											? <>
												{
													spendPeriod?.days?
														<>
															<span>{spendPeriod.days} </span>
															<span className='text-navBlue'>days </span>
														</>
														: null
												}
												<span>{spendPeriod.hours} </span>
												<span className='text-navBlue'>hrs </span>
												{
													!spendPeriod?.days?
														<>
															<span>{spendPeriod.minutes} </span>
															<span className='text-navBlue'>mins </span>
														</>
														: null
												}
												<span className="text-navBlue text-xs"> / {spendPeriod.total} days </span>
											</>
											: 'N/A'
										: null
									}
								</div>
								{
									spendPeriod && (
										<>
											<div className='flex flex-col justify-center text-sidebarBlue font-medium gap-y-3'>
												<Divider className='m-0 p-0' />
												{spendPeriod &&
										<span className='flex items-center'>
											<Progress className='m-0 p-0 flex items-center' percent={!isNaN(Number(spendPeriodPercentage)) ? spendPeriodPercentage : 0} strokeColor='#E5007A' size="small" />
										</span>
												}
											</div>
										</>
									)
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
						apiReady?
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
									{result.burn ? (
										<span>
											{formatUSDWithUnits(formatBnBalance(
												result.burn.toString(),
												{
													numberAfterComma: 0,
													withThousandDelimitor: false,
													withUnit: false
												},
												network
											))} <span className='text-navBlue'>{chainProperties[network]?.tokenSymbol}</span>
										</span>
									) : null
									}
								</div>
								<div className='flex flex-col justify-center text-sidebarBlue font-medium gap-y-3'>
									<Divider className='m-0 p-0' />
									<span className='mr-2 text-sidebarBlue font-medium'>
										{apiReady && !resultBurn ? 'N/A' :
											resultBurn == '0' ? '$ 0' :
												nextBurnUSD
													? `~ $${nextBurnUSD}`
													: null
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