// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from 'next-themes';

const VoteConvictions = ({ votesByConviction }: { votesByConviction: any[] }) => {
	const { resolvedTheme: theme } = useTheme();

	const colors: { [key: string]: string } = {
		abstain: '#407BFF',
		aye: '#6DE1A2',
		nay: '#FF778F'
	};
	const chartData = [
		{
			abstain: votesByConviction[0.1]?.abstain || 0,
			aye: votesByConviction[0.1]?.yes || 0,
			conviction: '0.1x',
			nay: votesByConviction[0.1]?.no || 0
		},
		{
			abstain: votesByConviction[1]?.abstain || 0,
			aye: votesByConviction[1]?.yes || 0,
			conviction: '1x',
			nay: votesByConviction[1]?.no || 0
		},
		{
			abstain: votesByConviction[2]?.abstain || 0,
			aye: votesByConviction[2]?.yes || 0,
			conviction: '2x',
			nay: votesByConviction[2]?.no || 0
		},
		{
			abstain: votesByConviction[3]?.abstain || 0,
			aye: votesByConviction[3]?.yes || 0,
			conviction: '3x',
			nay: votesByConviction[3]?.no || 0
		},
		{
			abstain: votesByConviction[4]?.abstain || 0,
			aye: votesByConviction[4]?.yes || 0,
			conviction: '4x',
			nay: votesByConviction[4]?.no || 0
		},
		{
			abstain: votesByConviction[5]?.abstain || 0,
			aye: votesByConviction[5]?.yes || 0,
			conviction: '5x',
			nay: votesByConviction[5]?.no || 0
		},
		{
			abstain: votesByConviction[6]?.abstain || 0,
			aye: votesByConviction[6]?.yes || 0,
			conviction: '6x',
			nay: votesByConviction[6]?.no || 0
		}
	];

	return (
		<div className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay dark:text-white lg:max-w-[512px]'>
			<h2 className='text-xl font-semibold'>Conviction used by Accounts</h2>
			<div className='h-[250px]'>
				<ResponsiveBar
					colors={(bar) => colors[bar.id]}
					data={chartData}
					indexBy='conviction'
					indexScale={{ round: true, type: 'band' }}
					keys={['aye', 'nay', 'abstain']}
					margin={{ bottom: 50, left: 30, right: 10, top: 10 }}
					padding={0.5}
					valueScale={{ type: 'linear' }}
					borderColor={{
						from: 'color',
						modifiers: [['darker', 1.6]]
					}}
					axisTop={null}
					axisRight={null}
					axisBottom={{
						tickPadding: 5,
						tickRotation: 0,
						tickSize: 5,
						truncateTickAt: 0
					}}
					axisLeft={{
						tickPadding: 5,
						tickRotation: 0,
						tickSize: 5,
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
							itemTextColor: theme === 'dark' ? '#fff' : '#576D8B',
							itemWidth: 50,
							itemsSpacing: 2,
							justify: false,
							symbolShape: 'circle',
							symbolSize: 6,
							translateX: 20,
							translateY: 50
						}
					]}
					role='application'
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
					ariaLabel='Nivo bar chart demo'
					barAriaLabel={(e) => e.id + ': ' + e.formattedValue + ' in conviction: ' + e.indexValue}
				/>
			</div>
		</div>
	);
};

export default VoteConvictions;
