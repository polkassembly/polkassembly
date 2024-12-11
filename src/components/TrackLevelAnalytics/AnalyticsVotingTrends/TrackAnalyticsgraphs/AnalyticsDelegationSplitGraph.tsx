// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
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
import { IAnalyticsDelegationSplitGraph } from '../../types';
import { useTranslation } from 'next-i18next';

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

const AnalyticsDelegationSplitGraph = ({ delegationSplitData, isUsedInAccounts }: IAnalyticsDelegationSplitGraph) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');
	const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);
		setSelectedRange(calculateDefaultRange(delegationSplitData.length));
		setIsLoading(false);
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
		delegated: item.delegated,
		index: `${item.index}`,
		solo: item.solo
	}));

	const filteredChartData = delegationSplitData.slice(selectedRange[0], selectedRange[1] + 1).map((item) => ({
		index: `${item.index}`,
		...getDelegatedAndSoloVotes(item)
	}));

	const tickInterval = Math.ceil(filteredChartData.length / 10);
	const tickValues = filteredChartData.filter((_, index) => index % tickInterval === 0).map((item) => `${item.index}`);

	const minIndex = delegationSplitData[0]?.index;
	const maxIndex = delegationSplitData[delegationSplitData?.length - 1]?.index;
	const marks = {
		[0]: minIndex && minIndex.toString(),
		[delegationSplitData.length - 1]: maxIndex && maxIndex.toString()
	};

	return (
		<StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white'>
			{isLoading ? (
				<Skeleton />
			) : (
				<>
					<div className='flex items-center justify-between'>
						<h2 className='text-base font-semibold sm:text-xl'>{t('delegation_split')}</h2>
						<div className='-mt-2 hidden items-center gap-[14px] sm:flex'>
							<div className='flex items-center gap-1'>
								<div className='h-1 w-1 rounded-full bg-[#796EEC]'></div>
								<div className='text-xs font-medium text-[#576D8B] dark:text-[#747474]'>{t('delegated')}</div>
							</div>
							<div className='flex items-center gap-1'>
								<div className='h-1 w-1 rounded-full bg-[#B6B0FB]'></div>
								<div className='text-xs font-medium text-[#576D8B] dark:text-[#747474]'>{t('solo')}</div>
							</div>
						</div>
					</div>
					<div className='h-[250px]'>
						<ResponsiveBar
							data={isUsedInAccounts ? data : filteredChartData}
							keys={['solo', 'delegated']}
							indexBy='index'
							margin={{ bottom: 40, left: 50, right: 0, top: 10 }}
							padding={0.5}
							valueScale={{ type: 'linear' }}
							indexScale={{ round: true, type: 'band' }}
							colors={(bar) => colors[bar.id]}
							borderRadius={2}
							borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
							axisTop={null}
							axisRight={null}
							axisBottom={{
								tickPadding: 5,
								tickRotation: 0,
								tickSize: 5,
								tickValues: tickValues,
								truncateTickAt: 0
							}}
							axisLeft={{
								format: (value) => formatUSDWithUnits(value, 1),
								tickPadding: 5,
								tickRotation: 0,
								tickSize: 5
							}}
							enableLabel={false}
							labelSkipWidth={6}
							labelSkipHeight={12}
							labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
							role='application'
							legends={[]}
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
							valueFormat={(value) => (isUsedInAccounts ? `${value} ${t('voters')}` : `${formatUSDWithUnits(value.toString(), 1)} ${chainProperties[network]?.tokenSymbol}`)}
						/>
					</div>

					{delegationSplitData.length > 10 ? (
						<div className='ml-auto hidden w-[96%] sm:block'>
							<Slider
								range
								min={0}
								theme={theme as any}
								max={delegationSplitData.length - 1}
								value={selectedRange}
								onChange={onChange}
								marks={marks}
								included
								tooltip={{
									formatter: (value) => {
										if (value !== undefined && value >= 0 && value < delegationSplitData.length) {
											const dataIndex = delegationSplitData[value].index;
											return `${t('referenda')}: ${dataIndex}`;
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

export default AnalyticsDelegationSplitGraph;
