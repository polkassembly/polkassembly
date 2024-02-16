// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

const VoteDelegationsByConviction = ({ votesByDelegation }: { votesByDelegation: any[] }) => {
	const colors: { [key: string]: string } = {
		delegated: '#796EEC',
		solo: '#B6B0FB'
	};

	const chartData = [
		{
			conviction: '0.1x',
			delegated: votesByDelegation[0.1]?.delegated || 0,
			solo: votesByDelegation[0.1]?.solo || 0
		},
		{
			conviction: '1x',
			delegated: votesByDelegation[1]?.delegated || 0,
			solo: votesByDelegation[1]?.solo || 0
		},
		{
			conviction: '2x',
			delegated: votesByDelegation[2]?.delegated || 0,
			solo: votesByDelegation[2]?.solo || 0
		},
		{
			conviction: '3x',
			delegated: votesByDelegation[3]?.delegated || 0,
			solo: votesByDelegation[3]?.solo || 0
		},
		{
			conviction: '4x',
			delegated: votesByDelegation[4]?.delegated || 0,
			solo: votesByDelegation[4]?.solo || 0
		},
		{
			conviction: '5x',
			delegated: votesByDelegation[5]?.delegated || 0,
			solo: votesByDelegation[5]?.solo || 0
		},
		{
			conviction: '6x',
			delegated: votesByDelegation[6]?.delegated || 0,
			solo: votesByDelegation[6]?.solo || 0
		}
	];

	return (
		<div className='h-[280px] w-full max-w-xl'>
			<ResponsiveBar
				data={chartData}
				keys={['delegated', 'solo']}
				indexBy='conviction'
				margin={{ top: 50, right: 10, bottom: 50, left: 60 }}
				padding={0.5}
				valueScale={{ type: 'linear' }}
				indexScale={{ type: 'band', round: true }}
				colors={(bar) => colors[bar.id]}
				borderColor={{
					from: 'color',
					modifiers: [['darker', 1.6]]
				}}
				axisTop={null}
				axisRight={null}
				axisBottom={{
					tickSize: 5,
					tickPadding: 5,
					tickRotation: 0,
					truncateTickAt: 0
				}}
				axisLeft={{
					tickSize: 5,
					tickPadding: 5,
					tickRotation: 0,
					truncateTickAt: 0
				}}
				enableLabel={false}
				labelSkipWidth={6}
				labelSkipHeight={12}
				labelTextColor={{
					from: 'color',
					modifiers: [['darker', 1.6]]
				}}
				legends={[
					{
						dataFrom: 'keys',
						anchor: 'bottom-center',
						direction: 'row',
						justify: false,
						translateX: 80,
						translateY: 210,
						itemsSpacing: 2,
						itemWidth: 100,
						itemHeight: 20,
						itemDirection: 'left-to-right',
						itemOpacity: 0.85,
						symbolSize: 6,
						symbolShape: 'circle',
						effects: [
							{
								on: 'hover',
								style: {
									itemOpacity: 1
								}
							}
						]
					}
				]}
				role='application'
				ariaLabel='Nivo bar chart demo'
				barAriaLabel={(e) => e.id + ': ' + e.formattedValue + ' in conviction: ' + e.indexValue}
			/>
		</div>
	);
};

export default VoteDelegationsByConviction;
