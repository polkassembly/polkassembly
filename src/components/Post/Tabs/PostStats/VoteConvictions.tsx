// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import BN from 'bn.js';
import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from 'next-themes';
import { chainProperties } from 'src/global/networkConstants';
import formatBnBalance from 'src/util/formatBnBalance';
import { useNetworkSelector } from '~src/redux/selectors';
import formatUSDWithUnits from 'src/util/formatUSDWithUnits';
import { Card } from 'antd';
import styled from 'styled-components';

const ZERO = new BN(0);

interface IVoteConvictionProps {
	votesByConviction: any[];
	isUsedInAccounts?: boolean;
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
`;

const VoteConvictions: FC<IVoteConvictionProps> = ({ votesByConviction, isUsedInAccounts }) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const colors: { [key: string]: string } = {
		abstain: theme === 'dark' ? '#407BFF' : '#407BFF',
		aye: theme === 'dark' ? '#64A057' : '#2ED47A',
		nay: theme === 'dark' ? '#BD2020' : '#E84865'
	};

	const chartData = Array.from({ length: 7 }, (_, i) => {
		const conv = i === 0 ? 0.1 : i;
		return {
			abstain: bnToIntBalance(votesByConviction[conv]?.abstain || ZERO) || votesByConviction[conv]?.abstain || 0,
			aye: bnToIntBalance(votesByConviction[conv]?.yes || ZERO) || votesByConviction[conv]?.yes || 0,
			conviction: `${conv}x`,
			nay: bnToIntBalance(votesByConviction[conv]?.no || ZERO) || votesByConviction[conv]?.no || 0
		};
	});

	return (
		<StyledCard className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white lg:max-w-[512px]'>
			<h2 className='text-xl font-semibold'>Conviction used by Accounts</h2>
			<div className='h-[250px]'>
				<ResponsiveBar
					colors={(bar) => colors[bar.id]}
					data={chartData}
					indexBy='conviction'
					indexScale={{ round: true, type: 'band' }}
					keys={['aye', 'nay', 'abstain']}
					margin={{ bottom: 50, left: 50, right: 10, top: 10 }}
					padding={0.5}
					valueScale={{ type: 'linear' }}
					borderRadius={3}
					borderColor={{
						from: 'color',
						modifiers: [['darker', 1.6]]
					}}
					axisTop={null}
					axisRight={null}
					axisBottom={{
						tickPadding: 5,
						tickRotation: 0,
						tickSize: 5,
						truncateTickAt: 0
					}}
					axisLeft={{
						format: (value) => formatUSDWithUnits(value, 1),
						tickPadding: 5,
						tickRotation: 0,
						tickSize: 5,
						truncateTickAt: 0
					}}
					enableLabel={false}
					labelSkipWidth={6}
					labelSkipHeight={12}
					labelTextColor={{
						from: 'color',
						modifiers: [['darker', 1.6]]
					}}
					legends={[
						{
							anchor: 'bottom',
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
							itemTextColor: theme === 'dark' ? '#747474' : '#576D8B',
							itemWidth: 50,
							itemsSpacing: 2,
							justify: false,
							symbolShape: 'circle',
							symbolSize: 6,
							translateX: -20,
							translateY: 50
						}
					]}
					role='application'
					theme={{
						axis: {
							domain: {
								line: {
									stroke: theme === 'dark' ? '#3B444F' : '#D2D8E0',
									strokeWidth: 1
								}
							},
							ticks: {
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
					ariaLabel='Nivo bar chart demo'
					valueFormat={(value) => `${formatUSDWithUnits(value.toString(), 1)}  ${isUsedInAccounts ? 'voters' : chainProperties[network]?.tokenSymbol}`}
					barAriaLabel={(e) => e.id + ': ' + e.formattedValue + ' in conviction: ' + e.indexValue}
				/>
			</div>
		</StyledCard>
	);
};

export default VoteConvictions;
