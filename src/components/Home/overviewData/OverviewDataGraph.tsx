// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import React from 'react';
import { useTheme } from 'next-themes';
import { ResponsiveLine } from '@nivo/line';
import { IHistoryItem } from 'pages/api/v1/treasury-amount-history/old-treasury-data';

const CustomTooltip = ({ point }: any) => {
	return (
		<div className='border-1 rounded-[11px] border-solid border-[#F9F9F9] bg-white p-3 shadow-md dark:bg-[#000000]'>
			<div className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>{point.data.x}</div>
			<div className='text-xl font-medium dark:text-blue-dark-high'>{Number(point.data.y).toFixed(2)}</div>
		</div>
	);
};

const OverviewDataGraph = ({ graphData }: { graphData: IHistoryItem[] }) => {
	const { resolvedTheme: theme } = useTheme();

	const filteredData = graphData.filter((item) => parseFloat(item.balance) !== 0);

	const formattedData = [
		{
			id: 'balance',
			data: filteredData.slice(0, -1).map((item) => ({
				x: item.date,
				y: parseFloat(item.balance)
			}))
		}
	];

	if (filteredData.length == 0) {
		return <div>Oops , something went wrong , Please try after sometime</div>;
	}

	return (
		<div style={{ height: '100px' }}>
			<ResponsiveLine
				data={formattedData}
				margin={{ bottom: 10, left: 30, right: 0, top: 10 }}
				xScale={{ type: 'point' }}
				yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
				axisTop={null}
				axisRight={null}
				axisBottom={null}
				axisLeft={{
					tickSize: 3,
					tickPadding: 0,
					tickRotation: 0,
					legend: 'Balance',
					legendOffset: -40,
					format: (value) => `${value}`
				}}
				tooltip={CustomTooltip}
				tooltipFormat={(value) => `${Number(value).toFixed(2)}`}
				colors={['#ADC2F9']}
				pointSize={10}
				pointColor={{ theme: 'background' }}
				pointBorderWidth={2}
				pointBorderColor={{ from: 'serieColor' }}
				pointLabelYOffset={-12}
				useMesh={true}
				enableGridX={false}
				enableGridY={false}
				curve='monotoneX'
				enableArea={true}
				areaOpacity={0.1}
				enablePoints={false}
				theme={{
					axis: {
						domain: {
							line: {
								stroke: 'transparent',
								strokeWidth: 1
							}
						},
						ticks: {
							line: {
								stroke: 'transparent'
							},
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
							stroke: theme === 'dark' ? '#3B444F' : '#D2D8E0',
							strokeDasharray: '2 2',
							strokeWidth: 1
						}
					},
					legends: {
						text: {
							fontSize: 12,
							textTransform: 'capitalize'
						}
					}
				}}
			/>
		</div>
	);
};

export default OverviewDataGraph;
