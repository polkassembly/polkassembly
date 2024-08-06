// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import React from 'react';
import { useTheme } from 'next-themes';
import { ResponsiveLine } from '@nivo/line';
import { IHistoryItem } from 'pages/api/v1/treasury-amount-history/old-treasury-data';
import dayjs from 'dayjs';
import formatBnBalance from '~src/util/formatBnBalance';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { useNetworkSelector } from '~src/redux/selectors';

const CustomTooltip = ({ point }: any) => {
	return (
		<div className='border-1 rounded-[11px] border-solid border-[#F9F9F9] bg-white p-3 shadow-md dark:bg-[#000000]'>
			<div className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>{point.data.x}</div>
			<div className='text-xl font-medium dark:text-blue-dark-high'>{Number(point.data.y).toFixed(2)}M</div>
		</div>
	);
};

const OverviewDataGraph = ({ graphData }: { graphData: IHistoryItem[] }) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

	const filteredData = graphData.filter((item) => parseFloat(item.balance) !== 0);

	const firstMonth = dayjs(filteredData[0]?.date).format('MMM');
	const lastMonth = dayjs(filteredData[filteredData.length - 1]?.date).format('MMM');

	const formattedData = [
		{
			id: 'balance',
			data: filteredData.map((item) => ({
				x: dayjs(item.date).format('MMM'),
				y: formatUSDWithUnits(
					formatBnBalance(
						item.balance,
						{
							numberAfterComma: 0,
							withThousandDelimitor: false,
							withUnit: false
						},
						network
					)
				)
			}))
		}
	];

	if (filteredData.length === 0) {
		return <div>Oops, something went wrong. Please try again later.</div>;
	}

	return (
		<div style={{ height: '80px' }}>
			<ResponsiveLine
				data={formattedData}
				margin={{ bottom: 36, left: 0, right: 0, top: 15 }}
				xScale={{ type: 'point' }}
				yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
				axisTop={null}
				axisRight={null}
				axisBottom={{
					tickSize: 3,
					tickPadding: 20,
					tickRotation: 0,
					format: (value) => (value === firstMonth || value === lastMonth ? '' : value)
				}}
				axisLeft={null}
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
				areaOpacity={0.2}
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
