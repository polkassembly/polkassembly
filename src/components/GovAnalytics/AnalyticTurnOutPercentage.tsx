// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ResponsiveLine } from '@nivo/line';
import { Card, Spin } from 'antd';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNetworkSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { getTrackNameFromId } from '~src/util/trackNameFromId';
import { AnalyticsTrackInfo } from './types';

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

const CustomBarTooltip = ({ point }: any) => {
	return (
		<div className='border-1 rounded-[11px] border-solid border-[#F9F9F9] bg-white p-3 shadow-md dark:bg-[#000000]'>
			<div className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>{point?.data?.xFormatted}</div>
			<div className='text-xl font-medium dark:text-blue-dark-high'>{Number(point?.data?.yFormatted).toFixed(2)}%</div>
		</div>
	);
};

const AnalyticTurnOutPercentage = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [trackInfo, setTrackInfo] = useState<AnalyticsTrackInfo>();
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

	const getVoteData = async () => {
		setIsLoading(true);
		try {
			const { data } = await nextApiClientFetch<{ averageSupportPercentages: Record<string, number> }>('/api/v1/govAnalytics/allTracksAnalytics');
			if (data) {
				const updatedTrackInfo: AnalyticsTrackInfo = {};

				Object.entries(data.averageSupportPercentages).forEach(([key, value]) => {
					const trackName = getTrackNameFromId(network, parseInt(key));
					updatedTrackInfo[trackName] = value as number;
				});

				setTrackInfo(updatedTrackInfo);
				setIsLoading(false);
			}
		} catch (error) {
			console.error(error);
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getVoteData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const data = trackInfo
		? [
				{
					color: 'hsl(87, 70%, 50%)',
					data: Object.entries(trackInfo).map(([key, value]) => ({
						x: key
							.split('_')
							.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
							.join(' '),
						y: value
					})),
					id: 'Turnout'
				}
		  ]
		: [];
	return (
		<StyledCard className='mx-auto max-h-[276px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white '>
			<h2 className='text-base font-semibold sm:text-xl'>Average Turnout Percentage</h2>
			<Spin spinning={isLoading}>
				<div
					className='flex justify-start'
					style={{ height: '200px', width: '100%' }}
				>
					<ResponsiveLine
						data={data}
						margin={{ bottom: 11, left: 30, right: 10, top: 30 }}
						xScale={{ type: 'point' }}
						// eslint-disable-next-line sort-keys
						yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
						axisTop={null}
						axisRight={null}
						axisBottom={null}
						enablePoints={true}
						axisLeft={{
							format: (value) => `${value}%`,
							tickPadding: 0,
							tickRotation: 0,
							tickSize: 3
						}}
						tooltip={CustomBarTooltip}
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
						areaOpacity={0.1}
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
			</Spin>
		</StyledCard>
	);
};

export default AnalyticTurnOutPercentage;
