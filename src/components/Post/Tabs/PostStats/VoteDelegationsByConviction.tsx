// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import BN from 'bn.js';
import { useTheme } from 'next-themes';
import formatBnBalance from 'src/util/formatBnBalance';
import { useNetworkSelector } from '~src/redux/selectors';
import formatUSDWithUnits from 'src/util/formatUSDWithUnits';
import { Card } from 'antd';

const ZERO = new BN(0);

const VoteDelegationsByConviction = ({ votesByDelegation }: { votesByDelegation: any[] }) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const colors: { [key: string]: string } = {
		delegated: '#796EEC',
		solo: '#B6B0FB'
	};

	const getDelegatedAndSoloVotes = (conviction: number) => {
		const delegated = bnToIntBalance(votesByDelegation[conviction]?.delegated || ZERO) || votesByDelegation[conviction]?.delegated || 0;
		const solo = bnToIntBalance(votesByDelegation[conviction]?.solo || ZERO) || votesByDelegation[conviction]?.solo || 0;
		return { delegated, solo };
	};

	const chartData = Array.from({ length: 7 }, (_, i) => {
		const conv = i === 0 ? 0.1 : i;
		return {
			conviction: `${conv}x`,
			...getDelegatedAndSoloVotes(conv)
		};
	});

	return (
		<Card className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl bg-white p-0 drop-shadow-md dark:bg-section-dark-overlay dark:text-white lg:max-w-[512px]'>
			<h2 className='text-xl font-semibold'>Votes for Delegated VS Solo</h2>
			<div className='h-[250px]'>
				<ResponsiveBar
					data={chartData}
					keys={['delegated', 'solo']}
					indexBy='conviction'
					margin={{ bottom: 50, left: 50, right: 10, top: 10 }}
					padding={0.5}
					valueScale={{ type: 'linear' }}
					indexScale={{ round: true, type: 'band' }}
					colors={(bar) => colors[bar.id]}
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
						format: (value) => formatUSDWithUnits(value, 1),
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
							itemWidth: 100,
							itemsSpacing: 2,
							justify: false,
							symbolShape: 'circle',
							symbolSize: 6,
							translateX: 30,
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
					valueFormat={(value) => formatUSDWithUnits(value.toString(), 1)}
					barAriaLabel={(e) => e.id + ': ' + e.formattedValue + ' in conviction: ' + e.indexValue}
				/>
			</div>
		</Card>
	);
};

export default VoteDelegationsByConviction;
