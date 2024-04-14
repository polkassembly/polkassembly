// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import React, { useEffect, useState } from 'react';
import { PointTooltipProps, ResponsiveLine } from '@nivo/line';
import styled from 'styled-components';
import { Card, Slider } from 'antd';
import { useTheme } from 'next-themes';

interface IProps {
	supportData: { percentage: string; index: number }[];
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

const CustomTooltip = ({ point }: PointTooltipProps) => {
	return (
		<div className='rounded-md bg-white p-4 shadow-md dark:bg-[#1E2126]'>
			<div className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Referenda #{point.data.xFormatted}</div>
			<div className='text-xl font-medium dark:text-blue-dark-high'>{Number(point.data.yFormatted).toFixed(1)}%</div>
		</div>
	);
};

const calculateDefaultRange = (dataLength: number): [number, number] => {
	if (dataLength > 50) {
		return [dataLength - 50, dataLength - 1];
	}
	return [0, dataLength - 1];
};

const AnalyticsTurnoutPercentageGraph = ({ supportData }: IProps) => {
	const { resolvedTheme: theme } = useTheme();

	const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0]);

	useEffect(() => {
		setSelectedRange(calculateDefaultRange(supportData.length));
	}, [supportData.length]);

	const onChange = (value: [number, number]) => {
		setSelectedRange(value);
	};
	const data = [
		{
			id: 'Turnout',
			data: supportData.slice(selectedRange[0], selectedRange[1] + 1).map((item) => ({
				x: item.index,
				y: parseFloat(item.percentage)
			}))
		}
	];
	const minIndex = supportData[0].index;
	const maxIndex = supportData[supportData.length - 1].index;
	const marks = {
		[0]: minIndex.toString(),
		[supportData.length - 1]: maxIndex.toString()
	};

	return (
		<StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-[#D2D8E0] bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white '>
			<h2 className='text-xl font-semibold'>Average Turnout Percentage</h2>
			<div className='h-[250px]'>
				<ResponsiveLine
					data={data}
					margin={{ bottom: 30, left: 35, right: 0, top: 10 }}
					xScale={{ type: 'point' }}
					yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
					axisTop={null}
					axisRight={null}
					axisBottom={null}
					// axisBottom={{
					// tickSize: 5,
					// tickPadding: 8,
					// tickRotation: 0,
					// legend: '',
					// legendOffset: 36,
					// legendPosition: 'middle'
					// }}
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
			{supportData.length > 10 ? (
				<div className='ml-auto w-[96%]'>
					<Slider
						range
						min={0}
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
		</StyledCard>
	);
};

export default AnalyticsTurnoutPercentageGraph;
