// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */

import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from 'next-themes';
import React from 'react';
import { useNetworkSelector } from '~src/redux/selectors';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';


interface IProps {
	delegationSplitData: { delegated: string | number; index: number; solo: string | number }[];
}

const AnalyticsDelegationSplitGraph = ({ delegationSplitData }: IProps) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	console.log('delegationSplitData', delegationSplitData);

	const data = delegationSplitData.map((item) => ({
		delegated: Number(item.delegated),
		index: `${item.index}`,
		solo: Number(item.solo)
	}));

	const colors: { [key: string]: string } = {
		delegated: '#796EEC',
		solo: '#B6B0FB'
	};

	return (
		<div style={{ height: 400 }}>
			<ResponsiveBar
				data={data}
				keys={['delegated', 'solo']}
				indexBy='index'
				margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
				padding={0.5}
				valueScale={{ type: 'linear' }}
				indexScale={{ round: true, type: 'band' }}
				colors={(bar) => colors[bar.id]}
				borderRadius={3}
				borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
				axisTop={null}
				axisRight={null}
				axisBottom={{
					tickPadding: 5,
					tickRotation: 0,
					tickSize: 5,
					legend: 'Index',
					legendOffset: 32,
					legendPosition: 'middle'
				}}
				axisLeft={{
					format: (value) => formatUSDWithUnits(value, 1),
					tickPadding: 5,
					tickRotation: 0,
					tickSize: 5,
					truncateTickAt: 0
				}}
				enableLabel={false}
				labelSkipWidth={6}
				labelSkipHeight={12}
				labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
				legends={[
					{
						anchor: 'bottom-right',
						dataFrom: 'keys',
						direction: 'column',
						effects: [
							{
								on: 'hover',
								style: {
									itemOpacity: 1
								}
							}
						],
						itemDirection: 'left-to-right',
						itemsSpacing: 2,
						itemHeight: 20,
						itemOpacity: 0.85,
						itemTextColor: '#999',
						itemWidth: 100,
						justify: false,
						symbolSize: 20,
						translateY: 0,
						translateX: 120
					}
				]}
				role='application'
				theme={{
					axis: {
						domain: {
							line: {
								stroke: theme === 'dark' ? '#3B444F' : '#D2D8E0',
								strokeWidth: 1
							}
						},
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
				animate={true}
			/>
		</div>
	);
};

export default AnalyticsDelegationSplitGraph;
