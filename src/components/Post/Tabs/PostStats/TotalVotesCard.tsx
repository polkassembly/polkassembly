// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React, { FC } from 'react';
import formatBnBalance from 'src/util/formatBnBalance';
import formatUSDWithUnits from 'src/util/formatUSDWithUnits';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { ResponsivePie } from '@nivo/pie';

interface ITotalVotesProps {
	ayeVotes?: BN;
	className?: string;
	nayVotes?: BN;
	ayesCount?: number;
	naysCount?: number;
	abstainCount?: number;
	abstainVotes?: BN;
}

const ZERO = new BN(0);

const TotalVotesCard: FC<ITotalVotesProps> = ({ ayeVotes, className, nayVotes, ayesCount, naysCount, abstainCount, abstainVotes }) => {
	const { network } = useNetworkSelector();

	const { resolvedTheme: theme } = useTheme();

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const highestVote = Math.max(bnToIntBalance(ayeVotes || ZERO), bnToIntBalance(nayVotes || ZERO), bnToIntBalance(abstainVotes || ZERO));

	const ayeColor = theme === 'dark' ? '#64A057' : '#2ED47A';
	const nayColor = theme === 'dark' ? '#BD2020' : '#E84865';
	const abstainColor = theme === 'dark' ? '#407BFF' : '#407BFF';

	const chartData = [
		{
			color: ayeColor,
			id: 'aye',
			label: 'Aye',
			value: ayesCount
		},
		{
			color: nayColor,
			id: 'nay',
			label: 'Nay',
			value: naysCount
		},
		{
			color: abstainColor,
			id: 'abstain',
			label: 'Abstain',
			value: abstainCount
		}
	];
	return (
		<div className='flex-1 rounded-xl border'>
			<h2 className='text-xl font-semibold'>Total Votes Casted</h2>
			<div className={`${className} relative -mt-7 flex h-[180px] items-center justify-center gap-x-2`}>
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
							itemTextColor: '#999',
							itemWidth: 60,
							itemsSpacing: 0,
							justify: false,
							symbolShape: 'circle',
							symbolSize: 6,
							translateX: 10,
							translateY: -10
						}
					]}
				/>
				<p className='absolute bottom-5 flex items-end gap-2 text-3xl font-bold dark:text-white'>
					{formatUSDWithUnits(highestVote.toString(), 1)} <span className='text-xl font-normal'>DOT</span>
				</p>
			</div>
		</div>
	);
};

export default TotalVotesCard;
