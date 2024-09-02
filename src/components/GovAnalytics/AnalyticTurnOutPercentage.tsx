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

interface TrackInfo {
	[key: string]: number;
}

const AnalyticTurnOutPercentage = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [trackInfo, setTrackInfo] = useState<TrackInfo>();
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

	const getVoteData = async () => {
		setIsLoading(true);
		try {
			const { data } = await nextApiClientFetch<{ averageSupportPercentages: Record<string, number> }>('/api/v1/govAnalytics/allTracksAnalytics');
			if (data) {
				const updatedTrackInfo: TrackInfo = {};

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
						x: key,
						y: value
					})),
					id: 'Turnout'
				}
		  ]
		: [];
	return (
		<StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white '>
			<h2 className='text-base font-semibold sm:text-xl'>Average Turnout Percentage</h2>
			<Spin spinning={isLoading}>
				<div
					className='flex justify-start'
					style={{ height: '300px', width: '100%' }}
				>
					<ResponsiveLine
						data={data}
						colors={['#978FED']}
						margin={{
							bottom: 90,
							left: 60,
							right: 20,
							top: 60
						}}
						xScale={{ type: 'point' }}
						yScale={{
							max: 'auto',
							min: 'auto',
							reverse: false,
							stacked: true,
							type: 'linear'
						}}
						yFormat=' >-.2f'
						axisTop={null}
						axisRight={null}
						axisBottom={{
							legend: '',
							legendOffset: 46,
							legendPosition: 'middle',
							tickPadding: 20,
							tickRotation: -56,
							tickSize: 3,
							truncateTickAt: 10
						}}
						axisLeft={{
							legend: 'percentage',
							legendOffset: -50,
							legendPosition: 'middle',
							tickPadding: 10,
							tickRotation: 0,
							tickSize: 5,
							truncateTickAt: 0
						}}
						enableGridX={false}
						enableGridY={false}
						pointSize={8}
						pointColor={{ theme: 'background' }}
						pointBorderWidth={2}
						pointBorderColor={{ from: 'serieColor' }}
						enablePointLabel={true}
						pointLabel='data.yFormatted'
						pointLabelYOffset={-12}
						enableCrosshair={false}
						legends={[]}
						useMesh={true}
						debugMesh={false}
						theme={{
							axis: {
								ticks: {
									line: {
										stroke: theme === 'dark' ? '#fff' : '#333'
									},
									text: {
										fill: theme === 'dark' ? '#fff' : '#333'
									}
								}
							},
							legends: {
								text: {
									fill: theme === 'dark' ? '#fff' : '#333'
								}
							},
							tooltip: {
								container: {
									background: theme === 'dark' ? '#1E2126' : '#fff',
									color: theme === 'dark' ? '#fff' : '#333'
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
