// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import formatUSDWithUnits from 'src/util/formatUSDWithUnits';
import { useTheme } from 'next-themes';
import { ResponsivePie } from '@nivo/pie';

interface ITotalVotesProps {
	ayeValue?: number;
	className?: string;
	nayValue?: number;
	abstainValue?: number;
	isCurrencyValue?: boolean;
}

const TotalVotesCard: FC<ITotalVotesProps> = ({ ayeValue, className, nayValue, abstainValue, isCurrencyValue }) => {
	const { resolvedTheme: theme } = useTheme();

	const maxValue = Math.max(Number(ayeValue), Number(nayValue), Number(abstainValue));

	const ayeColor = theme === 'dark' ? '#64A057' : '#2ED47A';
	const nayColor = theme === 'dark' ? '#BD2020' : '#E84865';
	const abstainColor = theme === 'dark' ? '#407BFF' : '#407BFF';

	const chartData = [
		{
			color: ayeColor,
			id: 'aye',
			label: 'Aye',
			value: ayeValue
		},
		{
			color: nayColor,
			id: 'nay',
			label: 'Nay',
			value: nayValue
		},
		{
			color: abstainColor,
			id: 'abstain',
			label: 'Abstain',
			value: abstainValue
		}
	];
	return (
		<div className='mx-auto h-fit max-h-[500px] w-full flex-1 rounded-xxl bg-white p-3 pb-0 drop-shadow-md dark:bg-section-dark-overlay lg:max-w-[512px]'>
			<h2 className='text-xl font-semibold'>Total Votes Casted</h2>
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
										itemTextColor: '#000'
									}
								}
							],
							itemDirection: 'left-to-right',
							itemHeight: 19,
							itemOpacity: 1,
							itemTextColor: theme === 'dark' ? '#fff' : '#576D8B',
							itemWidth: 60,
							itemsSpacing: 0,
							justify: false,
							symbolShape: 'circle',
							symbolSize: 6,
							translateX: 10,
							translateY: -10
						}
					]}
					theme={{
						tooltip: {
							container: {
								background: theme === 'dark' ? '#1E2126' : '#fff',
								color: theme === 'dark' ? '#fff' : '#576D8B',
								fontSize: 11
							}
						}
					}}
					valueFormat={(value) => formatUSDWithUnits(value.toString(), 1)}
				/>
				<p className='absolute bottom-5 flex items-end gap-2 text-3xl font-bold dark:text-white'>
					{formatUSDWithUnits(maxValue.toString(), 1)} {isCurrencyValue && <span className='text-xl font-normal'>DOT</span>}
				</p>
			</div>
		</div>
	);
};

export default TotalVotesCard;
