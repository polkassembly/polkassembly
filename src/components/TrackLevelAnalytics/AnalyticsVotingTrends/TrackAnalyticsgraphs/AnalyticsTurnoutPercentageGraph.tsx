// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import React, { useEffect, useState } from 'react';
import { ResponsiveLine } from '@nivo/line';
import styled from 'styled-components';
import { Card } from 'antd';
import { useTheme } from 'next-themes';
import Slider from '~src/ui-components/Slider';
import { calculateDefaultRange } from '../../utils/calculateDefaultRange';
import { CustomTooltip } from '../../utils/CustomTooltip';
import Skeleton from '~src/basic-components/Skeleton';
import { IAnalyticsTurnoutPercentageGraph } from '../../types';
import NoVotesIcon from '~assets/icons/analytics/no-votes.svg';

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

const AnalyticsTurnoutPercentageGraph = ({ supportData }: IAnalyticsTurnoutPercentageGraph) => {
	const { resolvedTheme: theme } = useTheme();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0]);
	console.log('supportData', supportData);

	useEffect(() => {
		setIsLoading(true);
		setSelectedRange(calculateDefaultRange(supportData.length));
		console.log('supportDataLength', supportData.length);
		setIsLoading(false);
	}, [supportData.length]);

	const onChange = (value: [number, number]) => {
		setSelectedRange(value);
	};
	const data = [
		{
			id: 'Turnout',
			data: supportData.slice(selectedRange[0], selectedRange[1] + 1).map((item) => ({
				x: item.index,
				y: parseFloat(item.percentage).toFixed(2)
			}))
		}
	];
	const minIndex = supportData[0].index;
	const maxIndex = supportData[supportData.length - 1].index;
	const marks = {
		[0]: minIndex.toString(),
		[supportData.length - 1]: maxIndex.toString()
	};
	if (supportData.length <= 1) {
		return (
			<StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-[#D2D8E0] bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white '>
				<h2 className='text-base font-semibold sm:text-xl'>Average Turnout Percentage</h2>
				<div className='mt-5 flex flex-col items-center'>
					<NoVotesIcon />
					<div className='mt-2 text-blue-light-medium dark:text-[#9E9E9E]'>Not enough data available</div>
				</div>
			</StyledCard>
		);
	}

	return (
		<StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-[#D2D8E0] bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white '>
			<h2 className='text-base font-semibold sm:text-xl'>Average Turnout Percentage</h2>
			{isLoading ? (
				<Skeleton />
			) : (
				<>
					<div className='h-[250px]'>
						<ResponsiveLine
							data={data}
							margin={{ bottom: 30, left: 30, right: 0, top: 10 }}
							xScale={{ type: 'point' }}
							yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
							axisTop={null}
							axisRight={null}
							axisBottom={null}
							axisLeft={{
								tickSize: 3,
								tickPadding: 0,
								tickRotation: 0,
								format: (value) => `${value}%`
							}}
							tooltip={CustomTooltip}
							tooltipFormat={(value) => `${Number(value).toFixed(1)} %`}
							colors={['#978FED']}
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
					<div>
						{supportData.length > 10 ? (
							<div className='ml-auto hidden w-[96%] sm:block'>
								<Slider
									range
									min={0}
									theme={theme as any}
									max={supportData.length - 1}
									value={selectedRange}
									onChange={onChange}
									marks={marks}
									tooltip={{
										formatter: (value) => {
											if (value !== undefined && value >= 0 && value < supportData.length) {
												const dataIndex = supportData[value].index;
												return `Referenda: ${dataIndex}`;
											}
											return '';
										}
									}}
								/>
							</div>
						) : null}
					</div>
				</>
			)}
		</StyledCard>
	);
};

export default AnalyticsTurnoutPercentageGraph;
