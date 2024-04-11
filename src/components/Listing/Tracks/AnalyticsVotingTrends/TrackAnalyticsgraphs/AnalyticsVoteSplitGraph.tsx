// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */

import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from 'next-themes';
import React from 'react';

interface IProps {
	votesSplitData: { abstain: string | number; aye: string | number; nay: string | number; index: number }[];
}

const AnalyticsVoteSplitGraph = ({ votesSplitData }: IProps) => {
	const { resolvedTheme: theme } = useTheme();
	const data = votesSplitData.map((item) => ({
		abstain: item.abstain,
		aye: item.aye,
		index: item.index,
		nay: item.nay
	}));
	const colors: { [key: string]: string } = {
		abstain: theme === 'dark' ? '#407BFF' : '#407BFF',
		aye: theme === 'dark' ? '#64A057' : '#2ED47A',
		nay: theme === 'dark' ? '#BD2020' : '#E84865'
	};
	console.log('votesSplitData', votesSplitData);
	return (
		<div style={{ height: 500 }}>
			<ResponsiveBar
				data={data}
				keys={['aye', 'nay', 'abstain']}
				indexBy='index'
				margin={{ bottom: 50, left: 50, right: 10, top: 10 }}
				padding={0.5}
				valueScale={{ type: 'linear' }}
				borderRadius={3}
				colors={(bar) => colors[bar.id]}
				defs={[
					{ id: 'dots', type: 'patternDots', background: 'inherit', color: 'rgba(255, 255, 255, 0.3)', size: 4, padding: 1, stagger: true },
					{ id: 'lines', type: 'patternLines', background: 'inherit', color: 'rgba(255, 255, 255, 0.3)', rotation: -45, lineWidth: 6, spacing: 10 }
				]}
				borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
				axisTop={null}
				axisRight={null}
				axisBottom={{
					tickPadding: 5,
					tickRotation: 0,
					tickSize: 5,
					truncateTickAt: 0
				}}
				axisLeft={{
					tickSize: 5,
					tickPadding: 5,
					tickRotation: 0,
					legend: 'vote count',
					legendPosition: 'middle',
					legendOffset: -40
				}}
				labelSkipWidth={6}
				labelSkipHeight={12}
				enableLabel={false}
				labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
				legends={[
					{
						anchor: 'bottom',
						dataFrom: 'keys',
						direction: 'row',
						effects: [
							{
								on: 'hover',
								style: {
									itemOpacity: 1
								}
							}
						],
						itemDirection: 'left-to-right',
						itemHeight: 20,
						itemOpacity: 0.85,
						itemTextColor: theme === 'dark' ? '#747474' : '#576D8B',
						itemWidth: 50,
						itemsSpacing: 2,
						justify: false,
						symbolShape: 'circle',
						symbolSize: 6,
						translateX: -20,
						translateY: 50
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
				groupMode='stacked'
			/>
		</div>
	);
};

export default AnalyticsVoteSplitGraph;
