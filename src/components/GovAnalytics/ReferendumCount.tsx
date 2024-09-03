// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ResponsivePie } from '@nivo/pie';
import { Card, Spin } from 'antd';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNetworkSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { getTrackNameFromId } from '~src/util/trackNameFromId';
import { IReferendumCount } from './types';

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

const ReferendumCount = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [trackInfo, setTrackInfo] = useState<IReferendumCount>();
	const { resolvedTheme: theme } = useTheme();
	const [totalPosts, setTotalPosts] = useState(0);
	const { network } = useNetworkSelector();

	const getData = async () => {
		setLoading(true);
		try {
			const { data, error } = await nextApiClientFetch<{ totalProposals: number; data: IReferendumCount }>('/api/v1/govAnalytics/referendumCount');
			if (data) {
				setTotalPosts(data.totalProposals);

				const updatedTrackInfo: IReferendumCount = {};
				Object.entries(data?.data || {}).forEach(([key, value]) => {
					const trackName = getTrackNameFromId(network, parseInt(key));
					updatedTrackInfo[trackName] = value as number;
				});

				setTrackInfo(updatedTrackInfo);
				setLoading(false);
			} else {
				console.log(error || '');
				setLoading(false);
			}
		} catch (error) {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const data = trackInfo
		? Object?.entries(trackInfo).map(([key, value], index) => ({
				color: `hsl(${index * 30}, 70%, 50%)`,
				id: key,
				label: key,
				value: value
		  }))
		: [];

	const filteredLegends = data.slice(0, 5).map((item) => ({
		color: item.color,
		id: item.id,
		label: `${item.label.split('_').join(' ')}[${item.value}]: ${((item.value / totalPosts) * 100).toFixed(2)}% `
	}));

	const middleFilteredLegends = data.slice(5, 10).map((item) => ({
		color: item.color,
		id: item.id,
		label: `${item.label.split('_').join(' ')} [${item.value}]: ${((item.value / totalPosts) * 100).toFixed(2)}% `
	}));

	const lastFilteredLegends = data.slice(10).map((item) => ({
		color: item.color,
		id: item.id,
		label: `${item.label.split('_').join(' ')} [${item.value}]: ${((item.value / totalPosts) * 100).toFixed(2)}%`
	}));

	return (
		<StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white '>
			<h2 className='text-base font-semibold sm:text-xl'>Referendum Count</h2>
			<Spin spinning={loading}>
				<div
					className='flex justify-start'
					style={{ height: '300px', width: '100%' }}
				>
					<ResponsivePie
						data={data}
						margin={{
							bottom: 8,
							left: -520,
							right: 260,
							top: 20
						}}
						colors={{ datum: 'data.color' }}
						innerRadius={0.8}
						padAngle={0.7}
						cornerRadius={15}
						activeOuterRadiusOffset={8}
						borderWidth={1}
						borderColor={{
							from: 'color',
							modifiers: [['darker', 0.2]]
						}}
						enableArcLinkLabels={false}
						arcLinkLabelsSkipAngle={10}
						arcLinkLabelsTextColor='#333333'
						arcLinkLabelsThickness={2}
						arcLinkLabelsColor='#c93b3b'
						enableArcLabels={false}
						arcLabelsRadiusOffset={0.55}
						arcLabelsSkipAngle={10}
						arcLabelsTextColor={{
							from: 'color',
							modifiers: [['darker', 2]]
						}}
						defs={[
							{
								background: 'inherit',
								color: 'rgba(255, 255, 255, 0.3)',
								id: 'dots',
								padding: 1,
								size: 4,
								stagger: true,
								type: 'patternDots'
							},
							{
								background: 'inherit',
								color: 'rgba(255, 255, 255, 0.3)',
								id: 'lines',
								lineWidth: 6,
								rotation: -45,
								spacing: 10,
								type: 'patternLines'
							}
						]}
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
									fill: theme === 'dark' ? '#fff' : '#576D8B',
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
						legends={[
							{
								anchor: 'right',
								data: lastFilteredLegends,
								direction: 'column',
								itemDirection: 'left-to-right',
								itemHeight: 40,
								itemWidth: -60,
								itemsSpacing: 1,
								justify: false,
								symbolShape: 'circle',
								symbolSize: 8,
								translateX: -540,
								translateY: 0
							},
							{
								anchor: 'right',
								data: middleFilteredLegends,
								direction: 'column',
								itemDirection: 'left-to-right',
								itemHeight: 40,
								itemWidth: -60,
								itemsSpacing: 1,
								justify: false,
								symbolShape: 'circle',
								symbolSize: 8,
								translateX: -300,
								translateY: 0
							},
							{
								anchor: 'right',
								data: filteredLegends,
								direction: 'column',
								itemDirection: 'left-to-right',
								itemHeight: 40,
								itemWidth: -60,
								itemsSpacing: 1,
								justify: false,
								symbolShape: 'circle',
								symbolSize: 8,
								translateX: -30,
								translateY: 0
							}
						]}
					/>
				</div>
			</Spin>
		</StyledCard>
	);
};

export default ReferendumCount;
