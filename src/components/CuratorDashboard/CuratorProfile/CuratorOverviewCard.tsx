// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { spaceGrotesk } from 'pages/_app';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { ResponsiveLine } from '@nivo/line';
import dayjs from 'dayjs';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { useNetworkSelector } from '~src/redux/selectors';
import { chainProperties } from '~src/global/networkConstants';
import { CuratorData } from '../types/types';
import BN from 'bn.js';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import formatBnBalance from '~src/util/formatBnBalance';
import { useTranslation } from 'next-i18next';

const ZERO_BN = new BN(0);

const getLastSixMonths = () => {
	const months = [];
	for (let i = 5; i >= 0; i--) {
		months?.push(dayjs()?.subtract(i, 'month')?.format('MMM'));
	}
	return months?.reverse();
};

const CuratorOverviewCard = ({ curatorData }: { curatorData: CuratorData }) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const { t } = useTranslation('common');

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const getLastSixMonthsData = (curatorData: any) => {
		const lastSixMonths = getLastSixMonths();
		const monthKeys = lastSixMonths
			?.map((_, idx) => {
				return dayjs()?.subtract(idx, 'month')?.format('YYYY-MM');
			})
			?.reverse();
		const lastSixMonthData = monthKeys?.map((month) => ({
			x: dayjs(month)?.format('MMM'),
			y: curatorData?.lastSixMonthGraphData?.[month] ? bnToIntBalance(curatorData?.lastSixMonthGraphData?.[month] || ZERO_BN) : 0
		}));

		return lastSixMonthData;
	};

	const lastSixMonthsData = getLastSixMonthsData(curatorData);
	console.log({ curatorData });

	const getTotalDisbursedAmount = (): BN => {
		let amount = ZERO_BN;
		Object.entries(curatorData?.lastSixMonthGraphData || {})?.map(([, value]) => {
			amount = amount.add(new BN(value || '0'));
		});

		return amount;
	};

	const chartData = [
		{
			color: '#4064FF',
			data: lastSixMonthsData,
			id: 'amount'
		}
	];

	return (
		<>
			{curatorData?.allBounties?.count > 0 || curatorData?.childBounties?.count > 0 ? (
				<div className='mt-5 rounded-lg border-[0.7px] border-solid border-section-light-container bg-white px-5 pt-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]'>
					<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-xl font-bold text-lightBlue dark:text-lightWhite`}>{t('overview')}</p>
					<div className='flex items-center justify-between'>
						<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-base font-medium text-bodyBlue dark:text-blue-dark-medium`}>{t('amount_disbursed')}</p>

						<div className=' rounded-full bg-lightBlue bg-section-light-container bg-opacity-[5%] p-1 px-2 dark:bg-[#262627] dark:text-blue-dark-medium'>
							<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable} p-1 text-sm font-medium text-lightBlue text-opacity-[80%] dark:text-blue-dark-high `}>
								{t('last_6_months')}
							</span>
						</div>
					</div>
					<div className='-mt-5 flex gap-3'>
						<p className='font-pixeboy text-4xl text-lightBlue dark:text-blue-dark-high'>{parseBalance(getTotalDisbursedAmount()?.toString(), 2, true, network)}</p>
					</div>

					<div className='relative -mt-10 flex h-[200px] items-center justify-center gap-x-2'>
						<ResponsiveLine
							data={chartData}
							margin={{ bottom: 40, left: 10, right: 40, top: 0 }}
							xScale={{ type: 'point' }}
							yScale={{
								max: 'auto',
								min: 'auto',
								reverse: false,
								stacked: true,
								type: 'linear'
							}}
							yFormat=' >-.2f'
							enablePoints={false}
							enableGridX={false}
							colors={['#EE7F10']}
							axisTop={null}
							axisRight={{
								format: (value) => formatUSDWithUnits(value, 1),
								tickPadding: 5,
								tickRotation: 0,
								tickSize: 5,
								tickValues: 5
							}}
							axisLeft={null}
							axisBottom={{
								format: (value) => value,
								tickPadding: 5,
								tickRotation: 0,
								tickSize: 5,
								tickValues: getLastSixMonths()
							}}
							tooltip={({ point }) => (
								<div className={`flex gap-2 rounded-md bg-white capitalize dark:bg-[#1E2126] ${theme === 'dark' ? 'text-white' : 'text-[#576D8B]'} p-2 text-[11px] shadow-md`}>
									<span className='text-xs font-semibold'>{point?.data?.xFormatted}</span>
									<span className='text-xs font-semibold'>
										{formatUSDWithUnits(point.data.yFormatted.toString(), 1)} {chainProperties[network]?.tokenSymbol}
									</span>
								</div>
							)}
							pointSize={5}
							pointColor={{ theme: 'background' }}
							pointBorderWidth={2}
							pointBorderColor={{ from: 'serieColor' }}
							pointLabelYOffset={-12}
							useMesh={true}
							theme={{
								axis: {
									domain: {
										line: {
											stroke: theme === 'dark' ? '#3B444F' : '#EE7F10',
											strokeWidth: 1
										}
									},
									ticks: {
										text: {
											fill: theme === 'dark' ? '#fff' : '#EE7F10',
											fontSize: 11,
											outlineColor: 'transparent',
											outlineWidth: 0
										}
									}
								},
								grid: {
									line: {
										stroke: theme === 'dark' ? '#3B444F' : '#EE7F10',
										strokeDasharray: '2 2',
										strokeWidth: 1
									}
								},
								tooltip: {
									container: {
										background: theme === 'dark' ? '#1E2126' : '#fff',
										color: theme === 'dark' ? '#fff' : '#576D8B',
										fontSize: 11,
										textTransform: 'capitalize'
									}
								}
							}}
						/>
					</div>

					<div className=' flex items-center justify-between'>
						<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-base font-bold text-lightBlue dark:text-blue-dark-medium`}>{t('active_bounties')}</p>
						<p className=' font-pixeboy text-2xl text-lightBlue dark:text-blue-dark-high'>
							{curatorData?.activeBounties?.count}{' '}
							<span className='text-base text-lightBlue dark:text-blue-dark-high'>({parseBalance(String(curatorData?.activeBounties?.amount || '0'), 2, true, network)})</span>
						</p>
					</div>
					<div className='flex items-center justify-between'>
						<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} flex items-center gap-1 text-base font-bold text-lightBlue dark:text-blue-dark-medium`}>
							<Image
								src='/assets/bounty-icons/bounty-proposals.svg'
								alt='bounty icon'
								style={{
									filter: 'brightness(0) saturate(100%) invert(35%) sepia(56%) saturate(307%) hue-rotate(174deg) brightness(90%) contrast(91%)'
								}}
								width={20}
								height={20}
								className={theme == 'dark' ? 'dark-icons' : ''}
							/>
							{t('number_of_bounties')}
						</p>
						<p className='font-pixeboy text-2xl text-lightBlue  dark:text-blue-dark-high'>
							{curatorData?.allBounties?.count}{' '}
							<span className='text-base text-lightBlue dark:text-blue-dark-high'>({parseBalance(String(curatorData?.allBounties?.amount || '0'), 2, true, network)})</span>
						</p>
					</div>
					<div className='-mt-5 flex items-center justify-between gap-1'>
						<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} flex items-center gap-x-1 text-base font-bold text-lightBlue dark:text-blue-dark-medium`}>
							<Image
								src='/assets/bounty-icons/child-bounty-icon.svg'
								alt='bounty icon'
								style={{
									filter: 'brightness(0) saturate(100%) invert(35%) sepia(56%) saturate(307%) hue-rotate(174deg) brightness(90%) contrast(91%)'
								}}
								width={20}
								height={20}
								className={theme == 'dark' ? 'dark-icons' : ''}
							/>
							{t('child_bounties_disbursed')}
						</p>
						<div className='flex gap-2 '>
							<p className=' font-pixeboy text-2xl text-lightBlue dark:text-blue-dark-high'>
								{curatorData?.childBounties?.count}{' '}
								<span className='text-base text-lightBlue dark:text-blue-dark-high'>
									({parseBalance(String(curatorData?.childBounties?.totalAmount || '0'), 2, true, network)})
								</span>
							</p>{' '}
							{parseFloat(curatorData?.childBounties?.unclaimedAmount) > 0 && (
								<div>
									<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-lg bg-[#FF3C5F] px-3 py-1 text-sm text-white`}>
										Unclaimed: {parseBalance(String(curatorData?.childBounties?.unclaimedAmount || '0'), 2, true, network)}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			) : (
				<div
					className={
						'mt-5 flex h-[600px] flex-col  items-center rounded-xl border border-solid border-section-light-container bg-white px-5 pt-5 dark:border-[#4B4B4B] dark:bg-[#0D0D0D] md:pt-10'
					}
				>
					{' '}
					<Image
						src='/assets/Gifs/watering.gif'
						alt={t('empty_state')}
						className='m-0 -mt-16  p-0'
						width={500}
						height={500}
					/>
					<span className='-mt-28 text-xl font-semibold text-bodyBlue dark:text-white'>{t('nothing_to_see')}</span>
					<span className='pt-3 text-center text-bodyBlue dark:text-white'>{t('curate_bounties_message')}</span>
				</div>
			)}
		</>
	);
};

export default CuratorOverviewCard;
