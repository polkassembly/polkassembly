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
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { chainProperties } from '~src/global/networkConstants';
import { CuratorData } from '../types/types';

const CuratorOverviewCard = ({ curatorData }: { curatorData: CuratorData }) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const getLastSixMonths = () => {
		const months = [];
		for (let i = 5; i >= 0; i--) {
			months?.push(dayjs()?.subtract(i, 'month')?.format('MMM'));
		}
		return months?.reverse();
	};

	const getLastSixMonthsData = (curatorData: any) => {
		const lastSixMonths = getLastSixMonths();
		const monthKeys = lastSixMonths
			?.map((month, idx) => {
				return dayjs()?.subtract(idx, 'month')?.format('YYYY-MM');
			})
			?.reverse();
		const lastSixMonthData = monthKeys?.map((month) => ({
			x: dayjs(month)?.format('MMM'),
			y: curatorData?.lastSixMonthGraphData?.[month] ? parseFloat(parseBalance(curatorData?.lastSixMonthGraphData[month], 2, false, network)) : 0
		}));

		return lastSixMonthData;
	};

	const calculateHikePercentage = (data: { x: string; y: number }[]) => {
		const firstMonthValue = data[0]?.y;
		const lastMonthValue = data[data?.length - 1]?.y;

		if (firstMonthValue === 0) {
			if (lastMonthValue > 0) {
				return 100;
			} else if (lastMonthValue < 0) {
				return -100;
			} else {
				return 0;
			}
		}

		return ((lastMonthValue - firstMonthValue) / firstMonthValue) * 100;
	};

	const lastSixMonthsData = getLastSixMonthsData(curatorData);
	const totalDisbursed = lastSixMonthsData?.reduce((acc, monthData) => acc + monthData?.y, 0);
	const hikePercentage = calculateHikePercentage(lastSixMonthsData);

	const chartData = [
		{
			color: '#4064FF',
			data: lastSixMonthsData,
			id: 'amount'
		}
	];

	return (
		<>
			{curatorData?.allBounties?.count > 0 || curatorData?.childBounties?.count > 0 || curatorData?.activeBounties?.count > 0 ? (
				<div className='mt-5 rounded-lg border-[0.7px] border-solid border-[#D2D8E0] bg-white px-5 pt-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]'>
					<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-[24px] font-bold text-blue-light-medium dark:text-lightWhite`}>Overview</p>
					<div className='flex items-center justify-between'>
						<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-[17px] font-medium text-blue-light-medium dark:text-icon-dark-inactive`}>Amount Disbursed</p>
						<div className=' rounded-full bg-[#485F7D] bg-opacity-[5%] p-1 px-2 dark:bg-[#262627] dark:text-[#868686] '>
							<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable}   p-1 text-[14px] font-medium text-blue-light-medium  text-opacity-[80%] `}>Last 6 months</span>
						</div>
					</div>
					<div className='-mt-5 flex gap-3'>
						<p className='font-pixeboy text-[60px] text-[#2D2D2D] dark:text-icon-dark-inactive'>{`${totalDisbursed?.toFixed(2)} ${chainProperties[network]?.tokenSymbol}`}</p>
						<div className='mt-5'>
							{hikePercentage > 0 ? (
								<div className='flex items-center gap-2 rounded-full bg-[#75c486] px-5 py-2 text-white'>
									<UpOutlined />
									<span className='font-pixeboy text-[20px] '>{hikePercentage?.toFixed(2)}%</span>
								</div>
							) : (
								<div className='flex items-center gap-2 rounded-full bg-[#FF5D7A] px-5 py-2 text-white'>
									<DownOutlined />
									<span className='font-pixeboy text-[20px] '>{hikePercentage?.toFixed(2)}%</span>
								</div>
							)}
						</div>
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
								format: (value) => `${value}`,
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
									<span className='text-xs font-semibold'>{`${parseFloat(String(point?.data?.yFormatted))?.toFixed(2)} ${chainProperties[network]?.tokenSymbol}`}</span>
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
						<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-[17px] font-bold text-blue-light-medium dark:text-icon-dark-inactive`}>Active Bounties</p>
						<p className=' font-pixeboy text-[30px] text-[#2D2D2D]  dark:text-icon-dark-inactive'>
							{curatorData?.activeBounties?.count}{' '}
							<span className='text-[17px] text-blue-light-medium'>({parseBalance(String(curatorData?.activeBounties?.amount || '0'), 2, true, network)})</span>
						</p>
					</div>
					<div className='-mt-6 flex items-center justify-between'>
						<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-[17px] font-bold text-blue-light-medium dark:text-icon-dark-inactive`}>
							<Image
								src='/assets/bounty-icons/bounty-proposals.svg'
								alt='bounty icon'
								className='mr-1'
								style={{
									filter: 'brightness(0) saturate(100%) invert(35%) sepia(56%) saturate(307%) hue-rotate(174deg) brightness(90%) contrast(91%)'
								}}
								width={24}
								height={24}
							/>
							Number of Bounties
						</p>
						<p className=' font-pixeboy text-[30px] text-[#2D2D2D]  dark:text-icon-dark-inactive'>
							{curatorData?.allBounties?.count}{' '}
							<span className='text-[17px] text-blue-light-medium'>({parseBalance(String(curatorData?.allBounties?.amount || '0'), 2, true, network)})</span>
						</p>
					</div>
					<div className='-mt-5 flex items-center justify-between'>
						<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-[17px] font-bold text-blue-light-medium dark:text-icon-dark-inactive`}>
							<Image
								src='/assets/bounty-icons/child-bounty-icon.svg'
								alt='bounty icon'
								className='mr-1'
								style={{
									filter: 'brightness(0) saturate(100%) invert(35%) sepia(56%) saturate(307%) hue-rotate(174deg) brightness(90%) contrast(91%)'
								}}
								width={24}
								height={24}
							/>
							Child Bounties Disbursed
						</p>
						<div className='flex gap-2 '>
							<p className=' font-pixeboy text-[30px] text-[#2D2D2D] dark:text-icon-dark-inactive'>
								{curatorData?.childBounties?.count}{' '}
								<span className='text-[17px] text-blue-light-medium'>({parseBalance(String(curatorData?.childBounties?.totalAmount || '0'), 2, true, network)})</span>
							</p>{' '}
							{parseFloat(curatorData?.childBounties?.unclaimedAmount) > 0 && (
								<div>
									<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-lg bg-[#FF3C5F] p-3 text-[14px] text-white`}>
										Unclaimed:{parseBalance(String(curatorData?.childBounties?.unclaimedAmount || '0'), 2, true, network)}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			) : (
				<div
					className={
						'mt-5 flex h-[600px] flex-col  items-center rounded-xl border border-solid border-[#D2D8E0] bg-white px-5 pt-5 dark:border-[#4B4B4B] dark:bg-[#0D0D0D] md:pt-10'
					}
				>
					{' '}
					<Image
						src='/assets/Gifs/watering.gif'
						alt='empty state'
						className='m-0 h-96 w-96 p-0'
						width={350}
						height={350}
					/>
					<span className='-mt-14 text-xl font-semibold text-[#243A57] dark:text-white'>Nothing to see here</span>
					<span className='pt-3 text-center text-[#243A57] dark:text-white'>Curate bounties to view data here</span>
				</div>
			)}
		</>
	);
};

export default CuratorOverviewCard;
