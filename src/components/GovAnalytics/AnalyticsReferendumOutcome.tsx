// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card, MenuProps, Space, Spin } from 'antd';
import { ResponsivePie } from '@nivo/pie';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { MessageType } from '~src/auth/types';
import { Dropdown } from '~src/ui-components/Dropdown';
import { DownOutlined } from '@ant-design/icons';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useNetworkSelector } from '~src/redux/selectors';
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

const AnalyticsReferendumOutcome = () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [loading, setLoading] = useState<boolean>(false);
	const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
	const { network } = useNetworkSelector();
	const [statusInfo, setStatusInfo] = useState({
		approved: 0,
		cancelled: 0,
		ongoing: 0,
		rejected: 0,
		timeout: 0
	});
	const trackIds = [
		...Object.values(networkTrackInfo[network]).map((info) => {
			return info.trackId;
		})
	];

	const getData = async () => {
		setLoading(true);
		try {
			const { data } = await nextApiClientFetch<any | MessageType>('/api/v1/govAnalytics/statuswiseRefOutcome', {
				trackId: selectedTrack === null ? null : trackIds[selectedTrack]
			});
			if (data) {
				setStatusInfo(data.statusCounts);
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
	}, [selectedTrack]);

	const handleMenuClick = (e: any) => {
		const selectedTrackKey = e.key;
		if (selectedTrackKey === '0') {
			setSelectedTrack(null);
		} else {
			setSelectedTrack(parseInt(selectedTrackKey) - 1);
		}
	};

	const items: MenuProps['items'] = [
		{
			key: '0',
			label: <p className='m-0 p-0 text-sm capitalize text-sidebarBlue dark:text-section-light-overlay'>All Tracks</p>,
			onClick: handleMenuClick
		},
		...trackIds.map((trackId, index) => ({
			key: `${index + 1}`,
			label: <p className='m-0 p-0 text-sm capitalize text-sidebarBlue dark:text-section-light-overlay'>{getTrackNameFromId(network, trackId).split('_').join(' ')}</p>,
			onClick: handleMenuClick
		}))
	];

	const data = [
		{
			color: '#ff0000',
			id: 'timeout',
			label: 'Timeout',
			value: statusInfo?.timeout
		},
		{
			color: '#ff6000',
			id: 'ongoing',
			label: 'Ongoing',
			value: statusInfo?.ongoing
		},
		{
			color: '#27d941',
			id: 'approved',
			label: 'Approved',
			value: statusInfo?.approved
		},
		{
			color: '#6800ff',
			id: 'rejected',
			label: 'Rejected',
			value: statusInfo?.rejected
		},
		{
			color: '#fdcc4a',
			id: 'cancelled',
			label: 'Cancelled',
			value: statusInfo?.cancelled
		}
	];
	return (
		<StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white '>
			<div className='flex items-center justify-between'>
				<h2 className='text-base font-semibold sm:text-xl'>Referendum Outcome</h2>
				<Dropdown menu={{ items }}>
					<a onClick={(e) => e.preventDefault()}>
						<Space>
							{selectedTrack ? getTrackNameFromId(network, trackIds[selectedTrack]).split('_').join(' ') : 'All Tracks'}
							<DownOutlined />
						</Space>
					</a>
				</Dropdown>
			</div>
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

export default AnalyticsReferendumOutcome;
