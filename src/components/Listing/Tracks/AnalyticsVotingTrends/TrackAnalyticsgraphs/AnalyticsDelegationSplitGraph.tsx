// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */

import { ResponsiveBar } from '@nivo/bar';
import { Card, Slider } from 'antd';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNetworkSelector } from '~src/redux/selectors';
import formatBnBalance from '~src/util/formatBnBalance';
import BN from 'bn.js';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { chainProperties } from '~src/global/networkConstants';

interface IProps {
	delegationSplitData: { delegated: string | number; index: number; solo: string | number }[];
	isUsedInAccounts?: boolean;
}

const StyledCard = styled(Card)`
	g[transform='translate(0,0)'] g:nth-child(even) {
		display: none !important;
	}
	div[style*='pointer-events: none;'] {
		visibility: hidden;
		animation: fadeIn 0.5s forwards;
	}

	@keyframes fadeIn {
		0% {
			visibility: hidden;
			opacity: 0;
		}
		100% {
			visibility: visible;
			opacity: 1;
		}
	}
`;

const calculateDefaultRange = (dataLength: number): [number, number] => {
	if (dataLength > 50) {
		return [dataLength - 50, dataLength - 1];
	}
	return [0, dataLength - 1];
};

const AnalyticsDelegationSplitGraph = ({ delegationSplitData, isUsedInAccounts }: IProps) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0]);

	useEffect(() => {
		setSelectedRange(calculateDefaultRange(delegationSplitData.length));
	}, [delegationSplitData.length]);

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const colors: { [key: string]: string } = {
		delegated: '#796EEC',
		solo: '#B6B0FB'
	};

	const getDelegatedAndSoloVotes = (item: any) => {
		const delegated = bnToIntBalance(new BN(item?.delegated?.toString())) || 0;
		const solo = bnToIntBalance(new BN(item?.solo?.toString())) || 0;
		return { delegated, solo };
	};
	const onChange = (value: [number, number]) => {
		setSelectedRange(value);
	};
	const data = delegationSplitData.slice(selectedRange[0], selectedRange[1] + 1).map((item) => ({
		index: `${item.index}`,
		delegated: item.delegated,
		solo: item.solo
	}));

	const filteredChartData = delegationSplitData.slice(selectedRange[0], selectedRange[1] + 1).map((item) => ({
		index: `${item.index}`,
		...getDelegatedAndSoloVotes(item)
	}));

	const tickInterval = Math.ceil(filteredChartData.length / 10);
	const tickValues = filteredChartData.filter((_, index) => index % tickInterval === 0).map((item) => `${item.index}`);

	const minIndex = delegationSplitData[0].index;
	const maxIndex = delegationSplitData[delegationSplitData.length - 1].index;
	const marks = {
		[0]: minIndex.toString(),
		[delegationSplitData.length - 1]: maxIndex.toString()
	};

	return (
		<StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-[#D2D8E0] bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white'>
			<h2 className='text-xl font-semibold'>Delegation Split</h2>
			<div className='h-[250px]'>
				<ResponsiveBar
					data={isUsedInAccounts ? data : filteredChartData}
					keys={['delegated', 'solo']}
					indexBy='index'
					margin={{ bottom: 50, left: 50, right: 10, top: 10 }}
					padding={0.5}
					valueScale={{ type: 'linear' }}
					indexScale={{ type: 'band', round: true }}
					colors={(bar) => colors[bar.id]}
					borderRadius={3}
					borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
					axisTop={null}
					axisRight={null}
					axisBottom={{
						tickValues: tickValues,
						tickPadding: 5,
						tickRotation: 0,
						tickSize: 5,
						truncateTickAt: 0
					}}
					axisLeft={{
						format: (value) => formatUSDWithUnits(value, 1),
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0
					}}
					enableLabel={false}
					labelSkipWidth={6}
					labelSkipHeight={12}
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
							itemWidth: 100,
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
					valueFormat={(value) => `${formatUSDWithUnits(value.toString(), 1)}  ${isUsedInAccounts ? 'voters' : chainProperties[network]?.tokenSymbol}`}
				/>
				<Slider
					range
					min={0}
					max={delegationSplitData.length - 1}
					value={selectedRange}
					onChange={onChange}
					marks={marks}
					tooltip={{
						formatter: (value) => {
							if (value !== undefined && value >= 0 && value < delegationSplitData.length) {
								const dataIndex = delegationSplitData[value].index;
								return `Referenda: ${dataIndex}`;
							}
							return '';
						}
					}}
				/>
			</div>
		</StyledCard>
	);
};

export default AnalyticsDelegationSplitGraph;
