// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card, Spin } from 'antd';
import { ResponsivePie } from '@nivo/pie';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useNetworkSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useTheme } from 'next-themes';
import { GroupedTrackIds, IGetStatusWiseProposalCount, NetworkTrackInfo } from './types';

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

const LegendContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 4px 0;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	overflow-x: auto;
	white-space: nowrap;
	padding-top: 2px;
	margin-top: -32px;

	/* Hide scrollbar for all browsers */
	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */
	&::-webkit-scrollbar {
		display: none; /* Chrome, Safari, and Opera */
	}
`;

const AnalyticsReferendumCount = () => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const [loading, setLoading] = useState<boolean>(false);
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1260;
	const [categoryInfo, setCategoryInfo] = useState<Record<string, number>>({
		governance: 0,
		main: 0,
		treasury: 0,
		whiteList: 0
	});

	const groupedTrackIds: GroupedTrackIds = {};
	for (const key in networkTrackInfo[network] as NetworkTrackInfo) {
		if (networkTrackInfo[network]) {
			const group = networkTrackInfo[network][key].group;
			const trackId = networkTrackInfo[network][key].trackId;
			if (group) {
				if (group in groupedTrackIds) {
					groupedTrackIds[group].push(trackId);
				} else {
					groupedTrackIds[group] = [trackId];
				}
			}
		}
	}

	const getData = async () => {
		setLoading(true);

		const { data, error } = await nextApiClientFetch<IGetStatusWiseProposalCount>('/api/v1/govAnalytics/categoryWiseTotalProposalCount', {
			categoryIds: groupedTrackIds
		});
		if (!data) {
			console.log('something went wrong, ', error);
		}
		if (data) {
			setCategoryInfo(data?.categoryCounts);
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const colors = ['#dcc359', '#384d6c', '#da6087', '#e18d57'];

	// Generate the pie chart data dynamically from categoryInfo
	const data = Object.keys(categoryInfo).map((category) => ({
		color: colors[Object.keys(categoryInfo).indexOf(category as keyof typeof categoryInfo)],
		id: category.charAt(0).toUpperCase() + category.slice(1),
		label: category.charAt(0).toUpperCase() + category.slice(1),
		value: categoryInfo[category as keyof typeof categoryInfo]
	}));

	return (
		<StyledCard
			className={`mx-auto ${
				isMobile ? 'max-h-[525px]' : 'max-h-[500px]'
			} w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white`}
		>
			<h2 className='text-base font-semibold sm:text-xl'>Referendum count by Category</h2>
			<Spin spinning={loading}>
				<div
					className='flex justify-start'
					style={{ height: '300px', width: '100%' }}
				>
					<ResponsivePie
						data={data}
						margin={{
							bottom: isMobile ? 80 : 8,
							left: 10,
							right: isMobile ? 0 : 260,
							top: 20
						}}
						sortByValue={true}
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
								ticks: {
									text: {
										fill: theme === 'dark' ? '#fff' : '#333'
									}
								}
							},
							legends: {
								text: {
									fill: theme === 'dark' ? '#fff' : '#333',
									fontSize: 14
								}
							},
							tooltip: {
								container: {
									background: theme === 'dark' ? '#1E2126' : '#fff',
									color: theme === 'dark' ? '#fff' : '#333'
								}
							}
						}}
						legends={
							isMobile
								? []
								: [
										{
											anchor: 'right',
											data: data.map((item) => ({
												color: item.color,
												id: item.id,
												label: `${item.label} - ${item.value}`
											})),
											direction: 'column',
											itemDirection: 'left-to-right',
											itemHeight: 32,
											itemWidth: -60,
											itemsSpacing: 1,
											justify: false,
											symbolShape: 'circle',
											symbolSize: 8,
											translateX: 40,
											translateY: 0
										}
									]
						}
					/>
				</div>
				{isMobile && (
					<LegendContainer>
						{data.map((item) => (
							<div
								key={item.id}
								className='mb-2 mr-4 flex w-[50%] items-center justify-between text-xs text-bodyBlue dark:text-white'
							>
								<div className='flex items-center gap-x-1'>
									<div
										className='h-2 w-2 rounded-full'
										style={{ background: item.color }}
									></div>
									<p className='m-0 p-0'>{item.label}</p>
								</div>
								<p className='m-0 p-0'>{item.value}</p>
							</div>
						))}
					</LegendContainer>
				)}
			</Spin>
		</StyledCard>
	);
};

export default AnalyticsReferendumCount;
