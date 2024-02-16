// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React, { FC } from 'react';
import formatBnBalance from 'src/util/formatBnBalance';
import { useNetworkSelector } from '~src/redux/selectors';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { ResponsivePie } from '@nivo/pie';

interface IVoteDelegationProps {
	delegatedVotesCount: number;
	combinedVotesCount: number;
	delegatedVotesBalance: BN;
	totalVotesBalance: BN;
	className?: string;
}

const ZERO = new BN(0);

const VotesDelegationCard: FC<IVoteDelegationProps> = ({ delegatedVotesCount, combinedVotesCount, className, delegatedVotesBalance, totalVotesBalance }) => {
	const { network } = useNetworkSelector();

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const soloVotesBalance = totalVotesBalance?.sub(delegatedVotesBalance);
	const highestVoteBalance = Math.max(bnToIntBalance(delegatedVotesBalance || ZERO), bnToIntBalance(soloVotesBalance || ZERO));

	const delegatedColor = '#796EEC';
	const soloColor = '#B6B0FB';

	const chartData = [
		{
			color: delegatedColor,
			id: 'delegated',
			label: 'Delegated',
			value: delegatedVotesCount
		},
		{
			color: soloColor,
			id: 'solo',
			label: 'Solo',
			value: combinedVotesCount - delegatedVotesCount
		}
	];
	return (
		<div className='flex-1 rounded-xl border'>
			<h2 className='text-xl font-semibold'>Delegated Vs Solo</h2>
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
							itemWidth: 85,
							itemsSpacing: 0,
							justify: false,
							symbolShape: 'circle',
							symbolSize: 6,
							translateX: 20,
							translateY: -10
						}
					]}
				/>
				<p className='absolute bottom-5 flex items-end gap-2 text-3xl font-bold dark:text-white'>
					{formatUSDWithUnits(highestVoteBalance.toString(), 1)} <span className='text-xl font-normal'>DOT</span>
				</p>
			</div>
		</div>
	);
};

export default VotesDelegationCard;
