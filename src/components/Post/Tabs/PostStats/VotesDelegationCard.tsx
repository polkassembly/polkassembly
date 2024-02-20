// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { ResponsivePie } from '@nivo/pie';
import { useTheme } from 'next-themes';
import { Card } from 'antd';

interface IVoteDelegationProps {
	delegatedValue: number;
	soloValue: number;
	className?: string;
	isCurrencyValue?: boolean;
}

const VotesDelegationCard: FC<IVoteDelegationProps> = ({ delegatedValue, soloValue, className, isCurrencyValue }) => {
	const { resolvedTheme: theme } = useTheme();

	const maxValue = Math.max(Number(delegatedValue), Number(soloValue));

	const delegatedColor = '#796EEC';
	const soloColor = '#B6B0FB';

	const chartData = [
		{
			color: delegatedColor,
			id: 'delegated',
			label: 'Delegated',
			value: delegatedValue
		},
		{
			color: soloColor,
			id: 'solo',
			label: 'Solo',
			value: soloValue
		}
	];
	return (
		<Card className='mx-auto h-fit max-h-[500px] w-full flex-1 rounded-xxl bg-white p-0 drop-shadow-md dark:bg-section-dark-overlay dark:text-white lg:max-w-[512px]'>
			<h2 className='text-xl font-semibold'>Delegated Vs Solo</h2>
			<div className={`${className} relative -mt-4 flex h-[180px] items-center justify-center gap-x-2 lg:-mt-7`}>
				<ResponsivePie
					data={chartData}
					margin={{ bottom: 10, left: 0, right: 0, top: 10 }}
					startAngle={-90}
					endAngle={90}
					innerRadius={0.85}
					padAngle={2}
					cornerRadius={45}
					activeOuterRadiusOffset={8}
					borderWidth={1}
					colors={({ data }) => data.color}
					borderColor={{
						from: 'color',
						modifiers: [['darker', 0.2]]
					}}
					enableArcLabels={false}
					enableArcLinkLabels={false}
					legends={[
						{
							anchor: 'bottom',
							direction: 'row',
							effects: [
								{
									on: 'hover',
									style: {
										itemTextColor: '#808080'
									}
								}
							],
							itemDirection: 'left-to-right',
							itemHeight: 19,
							itemOpacity: 1,
							itemTextColor: theme === 'dark' ? '#fff' : '#576D8B',
							itemWidth: 85,
							itemsSpacing: 0,
							justify: false,
							symbolShape: 'circle',
							symbolSize: 6,
							translateX: 20,
							translateY: -10
						}
					]}
					theme={{
						tooltip: {
							container: {
								background: theme === 'dark' ? '#1E2126' : '#fff',
								color: theme === 'dark' ? '#fff' : '#576D8B',
								fontSize: 11,
								textTransform: 'capitalize'
							}
						}
					}}
					valueFormat={(value) => formatUSDWithUnits(value.toString(), 1)}
				/>
				<p className='absolute bottom-5 flex items-end gap-2 text-3xl font-bold dark:text-white'>
					{formatUSDWithUnits(maxValue.toString(), 1)} {isCurrencyValue && <span className='text-xl font-normal'>DOT</span>}
				</p>
			</div>
		</Card>
	);
};

export default VotesDelegationCard;
