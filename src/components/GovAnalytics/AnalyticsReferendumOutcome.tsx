// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card, MenuProps, Space, Spin } from 'antd';
import { ResponsivePie } from '@nivo/pie';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { Dropdown } from '~src/ui-components/Dropdown';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useNetworkSelector } from '~src/redux/selectors';
import { getTrackNameFromId } from '~src/util/trackNameFromId';
import { useTheme } from 'next-themes';
import { IGetStatusWiseRefOutcome } from './types';
import { ArrowDownIcon } from '~src/ui-components/CustomIcons';
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

const AnalyticsReferendumOutcome = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1260;

	const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
	const [trackIds, setTrackIds] = useState<number[]>([]);
	const { network } = useNetworkSelector();
	const [statusInfo, setStatusInfo] = useState<Record<string, number>>({
		approved: 0,
		cancelled: 0,
		ongoing: 0,
		rejected: 0,
		timeout: 0
	});
	const getAllTrackIds = () => {
		const trackArr: number[] = [];
		Object.entries(networkTrackInfo[network]).map(([, value]) => {
			if (!value?.fellowshipOrigin) {
				trackArr.push(value.trackId);
			}
		});
		setTrackIds(trackArr);
	};

	const getData = async () => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IGetStatusWiseRefOutcome>('/api/v1/govAnalytics/statuswiseRefOutcome', {
			trackId: selectedTrack === null ? null : trackIds[selectedTrack]
		});
		if (!data) {
			console.log('something went wrong, ', error);
		}
		if (data) {
			setStatusInfo(data.statusCounts);
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!network) return;
		getAllTrackIds();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

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
			label: (
				<p
					className='m-0 p-0 text-sm capitalize'
					style={{ color: theme === 'dark' ? '#fff' : '#000' }}
				>
					{t('all_tracks')}
				</p>
			),
			onClick: handleMenuClick
		},
		...trackIds.map((trackId, index) => ({
			key: `${index + 1}`,
			label: (
				<p
					className='m-0 p-0 text-sm capitalize'
					style={{ color: theme === 'dark' ? '#fff' : '#243a57' }}
				>
					{getTrackNameFromId(network, trackId)?.split('_').join(' ')}
				</p>
			),
			onClick: handleMenuClick
		}))
	];

	const data = [
		{
			color: '#ff0000',
			id: 'Timeout',
			label: t('timeout'),
			value: statusInfo?.timeout
		},
		{
			color: '#ff6000',
			id: 'Ongoing',
			label: t('ongoing'),
			value: statusInfo?.ongoing
		},
		{
			color: '#27d941',
			id: 'Approved',
			label: t('approved'),
			value: statusInfo?.approved
		},
		{
			color: '#6800ff',
			id: 'Rejected',
			label: t('rejected'),
			value: statusInfo?.rejected
		},
		{
			color: '#fdcc4a',
			id: 'Cancelled',
			label: t('cancelled'),
			value: statusInfo?.cancelled
		}
	];
	return (
		<StyledCard
			className={`mx-auto ${
				isMobile ? 'max-h-[525px]' : 'max-h-[500px]'
			} w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white`}
		>
			<div className={`${isMobile ? 'flex flex-col justify-start gap-y-2' : 'flex items-center justify-between'}`}>
				<h2 className='text-base font-semibold sm:text-xl'>{t('referendum_count_by_status')}</h2>
				<div
					className={
						'flex h-[30px] w-[112px] items-center justify-center overflow-x-hidden truncate rounded-md border border-solid border-[#D2D8E0] bg-transparent p-2 text-sm font-medium dark:border-blue-dark-medium'
					}
				>
					<Dropdown
						menu={{ items }}
						theme={theme}
					>
						<a onClick={(e) => e.preventDefault()}>
							<Space>
								{selectedTrack
									? getTrackNameFromId(network, trackIds[selectedTrack])
											.split('_')
											.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
											.join(' ')
											.slice(0, 5) + (getTrackNameFromId(network, trackIds[selectedTrack]).length > 5 ? '...' : '')
									: t('all_tracks')}
								<ArrowDownIcon className='dark:text-blue-dark-medium' />
							</Space>
						</a>
					</Dropdown>
				</div>
			</div>
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

export default AnalyticsReferendumOutcome;
