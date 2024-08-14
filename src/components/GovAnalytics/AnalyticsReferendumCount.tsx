// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card, Spin } from 'antd';
import { ResponsivePie } from '@nivo/pie';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useNetworkSelector } from '~src/redux/selectors';
import { MessageType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface TrackInfo {
	trackId: number;
	group: string;
}

interface NetworkTrackInfo {
	[key: string]: TrackInfo;
}

interface GroupedTrackIds {
	[key: string]: number[];
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
	@media (max-width: 640px) {
		.ant-card-body {
			padding: 12px !important;
		}
	}
`;

const AnalyticsReferendumCount = () => {
	const { network } = useNetworkSelector();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [loading, setLoading] = useState<boolean>(false);
	const [categoryInfo, setCategoryInfo] = useState({
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
				// Check if group is defined
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
		try {
			const { data } = await nextApiClientFetch<any | MessageType>('/api/v1/govAnalytics/categoryWiseTotalProposalCount', {
				categoryIds: groupedTrackIds
			});
			if (data) {
				console.log(data);
				setCategoryInfo(data?.categoryCounts);
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
	}, []);

	const colors = ['#dcc359', '#384d6c', '#da6087', '#e18d57'];

	// Generate the pie chart data dynamically from categoryInfo
	const data = Object.keys(categoryInfo).map((category) => ({
		color: colors[Object.keys(categoryInfo).indexOf(category as keyof typeof categoryInfo)],
		id: category,
		label: category,
		value: categoryInfo[category as keyof typeof categoryInfo]
	}));

	return (
		<StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white '>
			<h2 className='text-base font-semibold sm:text-xl'>Referendum count by Category</h2>
			<Spin spinning={loading}>
				<div
					className='flex justify-start'
					style={{ height: '300px', width: '100%' }}
				>
					<ResponsivePie
						data={data}
						margin={{
							bottom: 8,
							left: 10,
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
						legends={[
							{
								anchor: 'right',
								data: data.map((item) => ({
									color: item.color,
									id: item.id,
									label: `${item.label} - ${item.value}`
								})),
								direction: 'column',
								itemDirection: 'left-to-right',
								itemHeight: 52,
								itemWidth: -60,
								itemsSpacing: 1,
								justify: false,
								symbolSize: 16,
								translateX: 40,
								translateY: 0
							}
						]}
					/>
				</div>
			</Spin>
		</StyledCard>
	);
};

export default AnalyticsReferendumCount;
