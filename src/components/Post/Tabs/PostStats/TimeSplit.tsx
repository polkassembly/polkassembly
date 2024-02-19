// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useTheme } from 'next-themes';

interface ITimeSplitProps {
	className?: string;
	votesByTimeSplit: any[];
}

const TimeSplit: FC<ITimeSplitProps> = ({ className, votesByTimeSplit }) => {
	const { resolvedTheme: theme } = useTheme();

	const chartData = [
		{
			color: '#4064FF',
			data: [
				{
					x: '0',
					y: votesByTimeSplit[0] || 0
				},
				{
					x: '7',
					y: votesByTimeSplit[7] || 0
				},
				{
					x: '10',
					y: votesByTimeSplit[10] || 0
				},
				{
					x: '14',
					y: votesByTimeSplit[14] || 0
				},
				{
					x: '20',
					y: votesByTimeSplit[20] || 0
				},
				{
					x: '24',
					y: votesByTimeSplit[24] || 0
				},
				{
					x: '28',
					y: votesByTimeSplit[28] || 0
				}
			],
			id: 'votes'
		}
	];

	return (
		<div className='mx-auto h-fit max-h-[500px] w-full flex-1 rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay'>
			<h2 className='text-xl font-semibold'>Time Split</h2>
			<div className={`${className} relative -mt-7 flex h-[180px] items-center justify-center gap-x-2`}>
				<ResponsiveLine
					data={chartData}
					margin={{ bottom: 20, left: 40, right: 10, top: 40 }}
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
					colors={['#4064FF']}
					axisTop={null}
					axisRight={null}
					pointSize={5}
					pointColor={{ theme: 'background' }}
					pointBorderWidth={2}
					pointBorderColor={{ from: 'serieColor' }}
					pointLabelYOffset={-12}
					useMesh={true}
					theme={{
						axis: {
							ticks: {
								text: {
									fill: theme === 'dark' ? '#fff' : '#576D8B',
									fontSize: 11,
									outlineColor: 'transparent',
									outlineWidth: 0
								}
							}
						},
						grid: {
							line: {
								stroke: '#D2D8E0',
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
		</div>
	);
};

export default TimeSplit;
