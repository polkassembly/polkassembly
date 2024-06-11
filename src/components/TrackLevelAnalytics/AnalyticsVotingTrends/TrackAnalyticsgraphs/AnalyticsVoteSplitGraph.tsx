// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */

import { ResponsiveBar } from '@nivo/bar';
import { Card } from 'antd';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNetworkSelector } from '~src/redux/selectors';
import formatBnBalance from '~src/util/formatBnBalance';
import BN from 'bn.js';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { chainProperties } from '~src/global/networkConstants';
import Slider from '~src/ui-components/Slider';
import { calculateDefaultRange } from '../../utils/calculateDefaultRange';
import Skeleton from '~src/basic-components/Skeleton';
import { IAnalyticsVoteSplitGraph } from '../../types';

const ZERO = new BN(0);

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
	@media (max-width: 640px) {
		.ant-card-body {
			padding: 12px !important;
		}
	}
`;

const AnalyticsVoteSplitGraph = ({ votesSplitData, isUsedInAccounts, isSmallScreen }: IAnalyticsVoteSplitGraph) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);
		setSelectedRange(calculateDefaultRange(votesSplitData.length));
		setIsLoading(false);
	}, [votesSplitData.length]);

	const bnToIntBalance = (bnValue: string | number | BN): number => {
		const bn = BN.isBN(bnValue) ? bnValue : new BN(bnValue && bnValue.toString());
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const data = votesSplitData.slice(selectedRange[0], selectedRange[1] + 1).map((item) => ({
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

	const chartData = votesSplitData.slice(selectedRange[0], selectedRange[1] + 1).map((item) => {
		return {
			abstain: bnToIntBalance(item.abstain || ZERO) || 0,
			aye: bnToIntBalance(item.aye || ZERO) || 0,
			nay: bnToIntBalance(item.nay || ZERO) || 0,
			index: item.index
		};
	});

	const onChange = (value: [number, number]) => {
		setSelectedRange(value);
	};

	const tickvalueDivisor = isSmallScreen ? 10 : 20;
	const tickInterval = Math.ceil(chartData.length / tickvalueDivisor);
	const tickValues = chartData.filter((_, index) => index % tickInterval === 0).map((item) => `${item.index}`);

	const minIndex = votesSplitData[0]?.index;
	const maxIndex = votesSplitData[votesSplitData?.length - 1]?.index;
	const marks = {
		[0]: minIndex && minIndex.toString(),
		[votesSplitData.length - 1]: maxIndex && maxIndex.toString()
	};

	return (
		<StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white'>
			<div className='flex items-center justify-between'>
				<h2 className='text-base font-semibold sm:text-xl'>Vote Split</h2>
				<div className='-mt-2 hidden items-center gap-2 sm:flex sm:gap-[14px]'>
					<div className='flex items-center gap-1'>
						<div className='h-1 w-1 rounded-full bg-[#6DE1A2]'></div>
						<div className='text-xs font-medium text-[#576D8B] dark:text-[#747474]'>Aye</div>
					</div>
					<div className='flex items-center gap-1'>
						<div className='h-1 w-1 rounded-full bg-[#FF778F]'></div>
						<div className='text-xs font-medium text-[#576D8B] dark:text-[#747474]'>Nay</div>
					</div>
					<div className='flex items-center gap-1'>
						<div className='h-1 w-1 rounded-full bg-[#407BFF]'></div>
						<div className='text-xs font-medium text-[#576D8B] dark:text-[#747474]'>Abstain</div>
					</div>
				</div>
			</div>
			{isLoading ? (
				<Skeleton />
			) : (
				<>
					<div className='h-[250px]'>
						<ResponsiveBar
							data={isUsedInAccounts ? data : chartData}
							keys={['aye', 'nay', 'abstain']}
							indexBy='index'
							margin={{ bottom: 40, left: 50, right: 0, top: 10 }}
							padding={0.5}
							valueScale={{ type: 'linear' }}
							borderRadius={2}
							colors={(bar) => colors[bar.id]}
							defs={[
								{ id: 'dots', type: 'patternDots', background: 'inherit', color: 'rgba(255, 255, 255, 0.3)', size: 4, padding: 1, stagger: true },
								{ id: 'lines', type: 'patternLines', background: 'inherit', color: 'rgba(255, 255, 255, 0.3)', rotation: -45, lineWidth: 6, spacing: 10 }
							]}
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
								tickPadding: 5,
								tickRotation: 0,
								tickSize: 5,
								truncateTickAt: 0
							}}
							labelSkipWidth={6}
							labelSkipHeight={12}
							enableLabel={false}
							labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
							legends={[]}
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
							animate={true}
							groupMode='stacked'
							valueFormat={(value) => (isUsedInAccounts ? `${value} voters` : `${formatUSDWithUnits(value.toString(), 1)} ${chainProperties[network]?.tokenSymbol}`)}
						/>
					</div>
					{votesSplitData.length > 10 ? (
						<div className=' ml-auto hidden w-[98%] sm:block'>
							<Slider
								range
								min={0}
								theme={theme as any}
								max={votesSplitData.length - 1}
								value={selectedRange}
								onChange={onChange}
								marks={marks}
								tooltip={{
									formatter: (value) => {
										if (value !== undefined && value >= 0 && value < votesSplitData.length) {
											const dataIndex = votesSplitData[value].index;
											return `Referenda: ${dataIndex}`;
										}
										return '';
									}
								}}
							/>
						</div>
					) : null}
				</>
			)}
		</StyledCard>
	);
};

export default AnalyticsVoteSplitGraph;
