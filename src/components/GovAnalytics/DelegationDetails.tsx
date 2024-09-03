// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ResponsiveBar } from '@nivo/bar';
import { Card } from 'antd';
import { useTheme } from 'next-themes';
import React, { FC } from 'react';

import styled from 'styled-components';
import { IDelegationDetails } from './types';
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

const DelegationDetails: FC<IDelegationDetails> = (props) => {
	const { delegationData } = props;
	const { resolvedTheme: theme } = useTheme();

	const data = Object?.keys(delegationData).map((key) => ({
		Delegatee: delegationData[key].totalDelegates,
		DelegateeColor: '#796EEC',
		Delegator: delegationData[key].totalDelegators,
		DelegatorColor: '#B6B0FB',
		trackName: `${key}`
	}));

	const nivoTheme = {
		axis: {
			ticks: {
				line: {
					stroke: theme === 'dark' ? 'white' : 'black'
				},
				text: {
					fill: theme === 'dark' ? 'white' : 'black'
				}
			}
		},
		legends: {
			text: {
				fill: theme === 'dark' ? 'white' : 'black'
			}
		},
		tooltip: {
			container: {
				background: theme === 'dark' ? '#333' : '#fff',
				color: theme === 'dark' ? 'white' : 'black'
			}
		}
	};

	return (
		<StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white '>
			<h2 className='text-base font-semibold sm:text-xl'>Delegation Split</h2>
			<div
				className='flex justify-start'
				style={{ height: '300px', width: '100%' }}
			>
				<ResponsiveBar
					data={data}
					keys={['Delegator', 'Delegatee']}
					indexBy='trackName'
					margin={{ bottom: 60, left: 60, right: 0, top: 20 }}
					padding={0.6}
					enableGridY={false}
					enableLabel={false}
					valueScale={{ type: 'linear' }}
					indexScale={{ round: true, type: 'band' }}
					colors={({ id, data }) => (id === 'Delegator' ? data.DelegatorColor : data.DelegateeColor)}
					defs={[
						{
							background: 'inherit',
							color: '#38bcb2',
							id: 'dots',
							padding: 1,
							size: 4,
							stagger: true,
							type: 'patternDots'
						},
						{
							background: 'inherit',
							color: '#eed312',
							id: 'lines',
							lineWidth: 6,
							rotation: -45,
							spacing: 10,
							type: 'patternLines'
						}
					]}
					borderColor={{
						from: 'color',
						modifiers: [['darker', 1.6]]
					}}
					axisTop={null}
					axisRight={null}
					borderRadius={2}
					axisBottom={{
						legend: '',
						legendOffset: 32,
						legendPosition: 'middle',
						tickPadding: 5,
						tickRotation: -26,
						tickSize: 5,
						truncateTickAt: 50
					}}
					axisLeft={{
						legend: '',
						legendOffset: -40,
						legendPosition: 'middle',
						tickPadding: 5,
						tickRotation: 0,
						tickSize: 5,
						truncateTickAt: 0
					}}
					labelSkipWidth={12}
					labelSkipHeight={12}
					labelTextColor={{
						from: 'color',
						modifiers: [['darker', 1.6]]
					}}
					theme={nivoTheme}
					legends={[
						{
							anchor: 'top-right',
							dataFrom: 'keys',
							direction: 'row',
							effects: [
								{
									on: 'hover',
									style: {
										itemOpacity: 1
									}
								}
							],
							itemDirection: 'left-to-right',
							itemHeight: 20,
							itemOpacity: 0.85,
							itemWidth: 85,
							itemsSpacing: 2,
							justify: false,
							symbolSize: 12,
							translateX: -10,
							translateY: -25
						}
					]}
					role='application'
					isFocusable={true}
					ariaLabel=''
					barAriaLabel={(e) => e.id + ': ' + e.formattedValue + ' in trackName: ' + e.indexValue}
				/>
			</div>
		</StyledCard>
	);
};

export default DelegationDetails;