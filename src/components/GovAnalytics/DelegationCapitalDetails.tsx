// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ResponsiveBar } from '@nivo/bar';
import { Card } from 'antd';
import { useTheme } from 'next-themes';
import React, { FC } from 'react';
import styled from 'styled-components';
import { useNetworkSelector } from '~src/redux/selectors';
import { IDelegationCapitalDetails } from './types';
import { chainProperties } from '~src/global/networkConstants';
import formatBnBalance from '~src/util/formatBnBalance';
import BN from 'bn.js';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
const ZERO = new BN(0);

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

const DelegationCapitalDetails: FC<IDelegationCapitalDetails> = (props) => {
	const { delegationData } = props;
	const { network } = useNetworkSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;

	const { resolvedTheme: theme } = useTheme();

	const bnToIntBalance = (bnValue: string | number | BN): number => {
		const bn = BN.isBN(bnValue) ? bnValue : new BN(bnValue && bnValue.toString());
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const data = Object?.keys(delegationData || {}).map((key) => ({
		capital: bnToIntBalance(delegationData[key].totalCapital || ZERO) || 0,
		capitalColor: '#796EEC',
		trackName: key
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' '),
		votes: bnToIntBalance(delegationData[key].totalVotesBalance || ZERO) || 0,
		votesColor: '#B6B0FB'
	}));

	const nivoTheme = {
		axis: {
			legend: {
				text: {
					fill: theme === 'dark' ? '#909090' : 'black'
				}
			},
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
			<h2 className='text-base font-semibold sm:text-xl'>Track Delegation</h2>
			<div
				className='flex justify-start'
				style={{ height: '300px', width: '100%' }}
			>
				<ResponsiveBar
					data={data}
					keys={['votes', 'capital']}
					indexBy='trackName'
					margin={{ bottom: 80, left: 80, right: 0, top: 20 }}
					padding={0.6}
					enableGridY={false}
					enableLabel={false}
					valueScale={{ type: 'linear' }}
					indexScale={{ round: true, type: 'band' }}
					colors={({ id, data }) => (id === 'votes' ? data.votesColor : data.capitalColor)}
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
					tooltip={({ id, value, indexValue }) => (
						<div className='rounded bg-white px-2 py-1 text-bodyBlue drop-shadow-md dark:bg-[#323232] dark:text-white'>
							<strong>{id}</strong> - {indexValue}: {formatUSDWithUnits(value.toString(), 1)}
						</div>
					)}
					axisTop={null}
					axisRight={null}
					borderRadius={2}
					axisBottom={{
						legend: 'Tracks',
						legendOffset: 72,
						legendPosition: 'middle',
						tickPadding: 5,
						tickRotation: -26,
						tickSize: 5,
						truncateTickAt: 50
					}}
					axisLeft={{
						format: (value) => formatUSDWithUnits(value, 1),
						legend: `Amount (in ${unit}s)`,
						legendOffset: -66,
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

export default DelegationCapitalDetails;
