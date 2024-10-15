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

const CuratorOverviewCard = ({ curatorData }: { curatorData: any }) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const getLastSixMonths = () => {
		const months = [];
		for (let i = 5; i >= 0; i--) {
			months.push(dayjs().subtract(i, 'month').format('MMM'));
		}
		return months;
	};

	const chartData = [
		{
			color: '#4064FF',
			data: getLastSixMonths().map((month) => ({
				x: month,
				y: Math.floor(Math.random() * 10000 + 1000)
			})),
			id: 'amount'
		}
	];
	return (
		<div className='mt-5 rounded-lg border-[0.7px] border-solid border-[#D2D8E0] bg-white px-5 pt-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]'>
			<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-[24px] font-bold text-blue-light-medium dark:text-lightWhite`}>Overview</p>
			<div className='flex items-center justify-between'>
				<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-[17px] font-medium text-blue-light-medium dark:text-icon-dark-inactive`}>Amount Disbursed</p>
				<div className=' rounded-full bg-[#485F7D] bg-opacity-[5%] p-1 px-2 dark:bg-[#262627] dark:text-[#868686] '>
					<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable}   p-1 text-[14px] font-medium text-blue-light-medium  text-opacity-[80%] `}>Last 6 months</span>
				</div>
			</div>
			<p className=' -mt-5 font-pixeboy text-[60px] text-[#2D2D2D] dark:text-icon-dark-inactive'>
				<span className='font-pixelify text-[46px] font-bold'>$</span>250
			</p>
			<div className='relative -mt-14 flex h-[200px] items-center justify-center gap-x-2'>
				<ResponsiveLine
					data={chartData}
					margin={{ bottom: 40, left: 0, right: 40, top: 30 }}
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
							<span className='text-xs font-semibold'>{point.data.xFormatted}</span>
							<span className='text-xs font-semibold'>${point.data.yFormatted}</span>
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
								stroke: theme === 'dark' ? '#3B444F' : '##EE7F10',
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
					{curatorData?.childBounties?.unclaimedAmount > 0 && (
						<div>
							<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-lg bg-[#FF3C5F] p-3 text-[14px] text-white`}>
								Unclaimed:{parseBalance(String(curatorData?.childBounties?.unclaimedAmount || '0'), 2, true, network)}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CuratorOverviewCard;
