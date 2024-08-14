// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import styled from 'styled-components';
import { Card } from 'antd';
import { ResponsivePie } from '@nivo/pie';

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
	const data = [
		{
			color: '#da6087',
			id: 'java',
			label: 'java',
			value: 234
		},
		{
			color: '#dcc359',
			id: 'css',
			label: 'css',
			value: 368
		},
		{
			color: '#384d6c',
			id: 'stylus',
			label: 'stylus',
			value: 490
		},
		{
			color: '#e18d57',
			id: 'c',
			label: 'c',
			value: 20
		},
		{
			color: '#a59482',
			id: 'ruby',
			label: 'ruby',
			value: 420
		}
	];
	return (
		<StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white '>
			<h2 className='text-base font-semibold sm:text-xl'>Referendum count by Category</h2>
			<div
				className='flex justify-start'
				style={{ height: '300px', width: '100%' }}
			>
				<ResponsivePie
					data={data}
					margin={{
						bottom: 8,
						left: 0,
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
							direction: 'column',
							itemDirection: 'left-to-right',
							itemHeight: 34,
							itemWidth: -40,
							itemsSpacing: 1,
							justify: false,
							symbolSize: 12,
							translateX: 40,
							translateY: 0
						}
					]}
				/>
			</div>
		</StyledCard>
	);
};

export default AnalyticsReferendumCount;
