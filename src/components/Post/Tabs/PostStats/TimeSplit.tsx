// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { ResponsiveLine } from '@nivo/line';
import BN from 'bn.js';
import { useTheme } from 'next-themes';
import { useNetworkSelector } from '~src/redux/selectors';
import formatUSDWithUnits from 'src/util/formatUSDWithUnits';
import formatBnBalance from 'src/util/formatBnBalance';
import { chainProperties } from 'src/global/networkConstants';
import { Card } from 'antd';
import styled from 'styled-components';
import NoVotesIcon from '~assets/icons/analytics/no-votes.svg';
import { useTranslation } from 'next-i18next';

interface ITimeSplitProps {
	className?: string;
	votesByTimeSplit: any[];
	axisLabel?: string;
	isUsedInAccounts?: boolean;
	elapsedPeriod: number;
}

const ZERO = new BN(0);

const TimeSplit: FC<ITimeSplitProps> = ({ className, axisLabel, votesByTimeSplit, isUsedInAccounts, elapsedPeriod }) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const { t } = useTranslation('common');
	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const chartData = [
		{
			color: '#4064FF',
			data: Array.from({ length: elapsedPeriod + 1 }, (_, i) => ({
				x: i.toString(),
				y: bnToIntBalance(votesByTimeSplit[i] || ZERO) || votesByTimeSplit[i] || 0
			})),
			id: 'votes'
		}
	];

	return (
		<Card className='mx-auto h-fit max-h-[500px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white'>
			<h2 className='text-xl font-semibold'>{t('time_split')}</h2>
			{elapsedPeriod < 1 ? (
				<div className='flex flex-col items-center justify-center gap-5'>
					<NoVotesIcon />
					<p className='text-sm'>{t('not_enough_data_available_pls_check_back_after_1_day')}</p>
				</div>
			) : (
				<div className={`${className} relative -mt-7 flex h-[200px] items-center justify-center gap-x-2`}>
					<ResponsiveLine
						data={chartData}
						margin={{ bottom: 20, left: 50, right: 10, top: 40 }}
						xScale={{ type: 'point' }}
						yScale={{
							max: 'auto',
							min: 'auto',
							reverse: false,
							stacked: true,
							type: 'linear'
						}}
						yFormat=' >-.2f'
						enablePoints={false}
						enableGridX={false}
						colors={['#4064FF']}
						axisTop={null}
						axisRight={null}
						axisLeft={{
							format: (value) => formatUSDWithUnits(value, 1)
						}}
						axisBottom={{
							tickValues: elapsedPeriod >= 14 ? Array.from({ length: elapsedPeriod + 1 }, (_, i) => (i % 7 === 0 ? i : null)).filter((value) => value !== null) : undefined
						}}
						tooltip={({ point }) => {
							return (
								<div className={`flex gap-2 rounded-md bg-white capitalize dark:bg-[#1E2126] ${theme === 'dark' ? 'text-white' : 'text-[#576D8B]'} p-2 text-[11px] shadow-md`}>
									<span className='text-xs font-semibold'>Day: {point.data.xFormatted}</span>
									<span className='text-xs font-semibold'>
										{axisLabel ? `${axisLabel}: ` : 'votes: '}
										{formatUSDWithUnits(point.data.yFormatted.toString(), 1)} {isUsedInAccounts ? 'voters' : chainProperties[network]?.tokenSymbol}
									</span>
								</div>
							);
						}}
						pointSize={5}
						pointColor={{ theme: 'background' }}
						pointBorderWidth={2}
						pointBorderColor={{ from: 'serieColor' }}
						pointLabelYOffset={-12}
						useMesh={true}
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
							tooltip: {
								container: {
									background: theme === 'dark' ? '#1E2126' : '#fff',
									color: theme === 'dark' ? '#fff' : '#576D8B',
									fontSize: 11,
									textTransform: 'capitalize'
								}
							}
						}}
					/>
				</div>
			)}
		</Card>
	);
};

export default styled(TimeSplit)`
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
