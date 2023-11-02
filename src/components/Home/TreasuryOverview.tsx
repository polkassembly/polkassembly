// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CaretDownOutlined, CaretUpOutlined, LoadingOutlined } from '@ant-design/icons';
import type { Balance } from '@polkadot/types/interfaces';
import { BN_MILLION, BN_ZERO, u8aConcat, u8aToHex } from '@polkadot/util';
import { Divider, Progress } from 'antd';
import BN from 'bn.js';
import React, { FC, useEffect, useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import blockToDays from 'src/util/blockToDays';
import blockToTime from 'src/util/blockToTime';
import formatBnBalance from 'src/util/formatBnBalance';
import formatUSDWithUnits from 'src/util/formatUSDWithUnits';
import styled from 'styled-components';
import { useApiContext } from '~src/context';
import Available from '~assets/icons/available.svg';
import CurrentPrice from '~assets/icons/currentprice.svg';
import NextBurn from '~assets/icons/nextburn.svg';
import SpendPeriod from '~assets/icons/spendperiod.svg';
import getDaysTimeObj from '~src/util/getDaysTimeObj';
import { GetCurrentTokenPriceV2 } from '~src/util/getCurrentTokenPrice';
import { useNetworkSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { setCurrentTokenPrice as setCurrentTokenPriceInRedux } from '~src/redux/currentTokenPrice';
const EMPTY_U8A_32 = new Uint8Array(32);

interface ITreasuryOverviewProps {
	inTreasuryProposals?: boolean;
	className?: string;
}

const TreasuryOverview: FC<ITreasuryOverviewProps> = (props) => {
	const { className, inTreasuryProposals } = props;
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const blockTime: number = chainProperties?.[network]?.blockTime;
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
		dailyChange: '',
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
		api.derive.chain
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, currentTokenPrice, network]);

	// set availableUSD and nextBurnUSD whenever they or current price of the token changes

	// fetch current price of the token
	useEffect(() => {
		if (!network) return;
		(async () => {
			if (currentTokenPrice.dailyChange && currentTokenPrice.value && currentTokenPrice.dailyChange !== 'N/A' && currentTokenPrice.value !== 'N/A') return;
			try {
				const result = await GetCurrentTokenPriceV2(network);
				setCurrentTokenPrice(() => {
					return {
						dailyChange: result?.dailyChange,
						isLoading: false,
						value: result?.value
					};
				});
				if (currentTokenPrice.value !== 'N/A') {
					dispatch(setCurrentTokenPriceInRedux(currentTokenPrice.value.toString()));
				}
			} catch (error) {
				setCurrentTokenPrice(() => {
					return {
						dailyChange: 'N/A',
						isLoading: false,
						value: 'N/A'
					};
				});
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentTokenPrice.dailyChange, currentTokenPrice.value, network]);

	return (
		<div className={`${className} grid ${!['polymesh', 'polymesh-test'].includes(network) && 'grid-rows-2'} grid-flow-col grid-cols-2 xs:gap-6 sm:gap-8 xl:flex xl:gap-4`}>
			{/* Available */}
			<div className='flex w-full flex-1 rounded-xxl bg-white p-3 drop-shadow-md sm:my-0 lg:px-6 lg:py-3'>
				<div className='w-full flex-1 flex-col gap-x-0 lg:flex'>
					<div className='mb-1.5 flex w-full items-center justify-center lg:hidden'>
						<Available className='lg:hidden' />
					</div>
					{!available.isLoading ? (
						<>
							<div className='mb-4'>
								<div className='my-1 flex items-center'>
									<span className='mr-2 p-0 text-xs font-medium leading-5 text-lightBlue'>Available</span>
									<HelperTooltip
										text='Funds collected through a portion of block production rewards, transaction fees, slashing, staking inefficiencies, etc.'
										className='text-xs font-medium leading-5 text-lightBlue'
									/>
								</div>
								<div className='flex justify-between font-medium'>
									{available.value ? (
										<span className='text-lg font-medium text-bodyBlue'>
											{available.value} <span className='text-sm text-lightBlue'>{chainProperties[network]?.tokenSymbol}</span>
										</span>
									) : (
										<span>N/A</span>
									)}
								</div>
							</div>
							{!['polymesh', 'polymesh-test'].includes(network) && (
								<>
									<div className='flex flex-col justify-center gap-y-3 font-medium text-bodyBlue'>
										<Divider
											style={{
												background: '#D2D8E0'
											}}
											className='m-0 p-0'
										/>
										<span className='flex flex-col justify-center text-xs font-medium text-lightBlue'>{available.valueUSD ? `~ $${available.valueUSD}` : 'N/A'}</span>
									</div>
								</>
							)}
						</>
					) : (
						<div className='flex min-h-[89px] w-full items-center justify-center'>
							<LoadingOutlined />
						</div>
					)}
				</div>
				<div>
					<Available className='xs:hidden lg:block' />
				</div>
			</div>

			{/* CurrentPrice */}
			{network !== 'moonbase' && (
				<div className='flex w-full flex-1 rounded-xxl bg-white p-3 drop-shadow-md sm:my-0 lg:px-6 lg:py-3'>
					<div className='w-full flex-col gap-x-0 lg:flex'>
						<div className='mb-1.5 flex w-full items-center justify-center lg:hidden'>
							<CurrentPrice className='lg:hidden' />
						</div>
						{!currentTokenPrice.isLoading ? (
							<>
								<div className='mb-4'>
									<div className='my-1 flex items-center'>
										<span className='mr-2 hidden text-xs font-medium leading-5 text-lightBlue md:flex'>Current Price of {chainProperties[network]?.tokenSymbol}</span>
										<span className='flex text-xs font-medium text-lightBlue md:hidden'>Price {chainProperties[network]?.tokenSymbol}</span>
									</div>
									<div className='text-lg font-medium'>
										{currentTokenPrice.value === 'N/A' ? (
											<span>N/A</span>
										) : currentTokenPrice.value && !isNaN(Number(currentTokenPrice.value)) ? (
											<>
												<span className='text-lightBlue'>$ </span>
												<span className='text-bodyBlue'>{currentTokenPrice.value}</span>
											</>
										) : null}
									</div>
								</div>
								<div className='flex flex-col justify-center gap-y-3 overflow-hidden font-medium text-bodyBlue'>
									<Divider
										style={{
											background: '#D2D8E0'
										}}
										className='m-0 p-0'
									/>
									<div className='flex items-center text-xs text-lightBlue md:whitespace-pre'>
										{currentTokenPrice.dailyChange === 'N/A' ? (
											'N/A'
										) : currentTokenPrice.dailyChange ? (
											<>
												<span className='mr-1 sm:mr-2'>24hr Change</span>
												<div className='flex items-center'>
													<span className='font-semibold'>{Math.abs(Number(currentTokenPrice.dailyChange))}%</span>
													{Number(currentTokenPrice.dailyChange) < 0 ? (
														<CaretDownOutlined style={{ color: 'red', marginLeft: '1.5px' }} />
													) : (
														<CaretUpOutlined style={{ color: '#52C41A', marginLeft: '1.5px' }} />
													)}
												</div>
											</>
										) : null}
									</div>
								</div>
							</>
						) : (
							<div className='flex min-h-[89px] w-full items-center justify-center'>
								<LoadingOutlined />
							</div>
						)}
					</div>
					<div>
						<CurrentPrice className='xs:hidden lg:block' />
					</div>
				</div>
			)}

			{/* Next Burn */}
			{!['moonbeam', 'moonbase', 'moonriver', 'polymesh'].includes(network) && (
				<div className='flex w-full flex-1 rounded-xxl bg-white p-3 drop-shadow-md sm:my-0 lg:px-6 lg:py-3'>
					<div className='w-full flex-col gap-x-0 lg:flex'>
						<div className='mb-1.5 flex w-full items-center justify-center lg:hidden'>
							<NextBurn className='lg:hidden' />
						</div>
						{!nextBurn.isLoading ? (
							<>
								<div className='mb-4'>
									<div className='my-1 flex items-center text-xs text-lightBlue'>
										<span className='mr-2 text-xs font-medium leading-5 text-lightBlue'>Next Burn</span>

										<HelperTooltip text='If the Treasury ends a spend period without spending all of its funds, it suffers a burn of a percentage of its funds.' />
									</div>

									<div className='flex justify-between text-lg font-medium text-bodyBlue'>
										{nextBurn.value ? (
											<span>
												{nextBurn.value} <span className='text-sm text-lightBlue'>{chainProperties[network]?.tokenSymbol}</span>
											</span>
										) : null}
									</div>
								</div>
								<div className='flex flex-col justify-center gap-y-3 font-medium text-sidebarBlue'>
									<Divider
										style={{
											background: '#D2D8E0'
										}}
										className='m-0 p-0'
									/>
									<span className='mr-2 w-full text-xs font-medium text-lightBlue'>{nextBurn.valueUSD ? `~ $${nextBurn.valueUSD}` : 'N/A'}</span>
								</div>
							</>
						) : (
							<div className='flex min-h-[89px] w-full items-center justify-center'>
								<LoadingOutlined />
							</div>
						)}
					</div>
					<div>
						<NextBurn className='xs:hidden lg:block' />
					</div>
				</div>
			)}

			{/* Spend Period */}
			{!['polymesh', 'polymesh-test'].includes(network) && (
				<>
					{!inTreasuryProposals && (
						<div className='flex w-full flex-1 rounded-xxl bg-white p-3 drop-shadow-md sm:my-0 lg:px-6 lg:py-3'>
							<div className='w-full flex-col gap-x-0 lg:flex'>
								<div className='mb-1.5 flex w-full items-center justify-center lg:hidden'>
									<SpendPeriod className='lg:hidden' />
								</div>
								{!spendPeriod.isLoading ? (
									<>
										<div className='mb-5 sm:mb-4'>
											<div className='my-1 flex items-center'>
												<span className='mr-2 mt-1 text-xs font-medium leading-5 text-lightBlue lg:mt-0'>Spend Period</span>

												<HelperTooltip
													text='Funds held in the treasury can be spent by making a spending proposal that, if approved by the Council, will enter a spend period before distribution, it is subject to governance, with the current default set to 24 days.'
													className='text-xs font-medium leading-5 text-lightBlue'
												/>
											</div>

											<div className='mt-1 flex items-baseline whitespace-pre font-medium text-bodyBlue sm:mt-0'>
												{spendPeriod.value?.total ? (
													<>
														{spendPeriod.value?.days ? (
															<>
																<span className='text-base sm:text-lg'>{spendPeriod.value.days}&nbsp;</span>
																<span className='text-xs text-lightBlue'>days&nbsp;</span>
															</>
														) : null}
														<>
															<span className='text-base sm:text-lg'>{spendPeriod.value.hours}&nbsp;</span>
															<span className='text-xs text-lightBlue'>hrs&nbsp;</span>
														</>
														{!spendPeriod.value?.days ? (
															<>
																<span className='text-base sm:text-lg'>{spendPeriod.value.minutes}&nbsp;</span>
																<span className='text-xs text-lightBlue'>mins&nbsp;</span>
															</>
														) : null}
														<span className='text-[10px] text-lightBlue sm:text-xs'>/ {spendPeriod.value.total} days </span>
													</>
												) : (
													'N/A'
												)}
											</div>
										</div>
										{
											<div className='flex flex-col justify-center gap-y-3 font-medium'>
												<Divider
													style={{
														background: '#D2D8E0'
													}}
													className='m-0 p-0'
												/>
												<span className='flex items-center'>
													<Progress
														className='m-0 flex items-center p-0'
														percent={!isNaN(Number(spendPeriod.percentage)) ? spendPeriod.percentage : 0}
														trailColor='#E1E6EB'
														strokeColor='#E5007A'
														size='small'
													/>
												</span>
											</div>
										}
									</>
								) : (
									<div className='flex min-h-[89px] w-full items-center justify-center'>
										<LoadingOutlined />
									</div>
								)}
							</div>
							<div>
								<SpendPeriod className='mt-2 xs:hidden lg:block' />
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default styled(TreasuryOverview)`
	.ant-progress-text {
		color: #485f7d !important;
		font-size: 12px !important;
	}
	.ant-progress-outer {
		display: flex !important;
		align-items: center !important;
	}
`;
