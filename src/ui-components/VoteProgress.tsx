// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
import BN from 'bn.js';
import { PieChart } from 'react-minimal-pie-chart';
import React, { FC } from 'react';
import formatBnBalance from 'src/util/formatBnBalance';

import { useNetworkContext } from '~src/context';

interface IVoteProgressProps {
	ayeVotes?: BN;
	className?: string;
	nayVotes?: BN;
	ayesNum?: number;
	naysNum?: number;
	turnoutPercentage?: number;
}

interface IVoteProgressLegacyProps {
	ayeVotes?: BN;
	className?: string;
	nayVotes?: BN;
	ayesNum?: number;
	naysNum?: number;
}

const ZERO = new BN(0);

export const VoteProgressLegacy = ({
	ayeVotes,
	className,
	nayVotes,
	ayesNum,
	naysNum,
}: IVoteProgressLegacyProps) => {
	const { network } = useNetworkContext();

	const bnToIntBalance = function (bn: BN): number {
		return Number(
			formatBnBalance(
				bn,
				{ numberAfterComma: 6, withThousandDelimitor: false },
				network,
			),
		);
	};

	const ayeVotesNumber =
		ayesNum === undefined
			? bnToIntBalance(ayeVotes || ZERO)
			: Number(ayesNum);
	const nayVotesNumber =
		naysNum === undefined
			? bnToIntBalance(nayVotes || ZERO)
			: Number(naysNum);
	const totalVotesNumber =
		ayesNum === undefined || naysNum === undefined
			? bnToIntBalance(ayeVotes?.add(nayVotes || ZERO) || ZERO)
			: Number(ayesNum) + Number(naysNum);
	const ayePercent = (ayeVotesNumber / totalVotesNumber) * 100;
	const nayPercent = 100 - ayePercent;

	return (
		<div
			className={`${className} flex flex-col items-center text-white text-base`}
		>
			<div
				id="bigCircle"
				className={`${
					ayeVotesNumber >= nayVotesNumber
						? 'bg-aye_green'
						: 'bg-nay_red'
				} rounded-full h-[110px] w-[110px] flex items-center justify-center z-10`}
			>
				{ayeVotesNumber == 0 && nayVotesNumber == 0
					? '0'
					: ayeVotesNumber >= nayVotesNumber
					? ayePercent.toFixed(1)
					: nayPercent.toFixed(1)}
				%
			</div>
			<div
				id="smallCircle"
				className={`${
					ayeVotesNumber < nayVotesNumber
						? 'bg-aye_green'
						: 'bg-nay_red'
				} -mt-8 border-2 border-white rounded-full h-[75px] w-[75px] flex items-center justify-center z-20`}
			>
				{ayeVotesNumber == 0 && nayVotesNumber == 0
					? '0'
					: ayeVotesNumber < nayVotesNumber
					? ayePercent.toFixed(1)
					: nayPercent.toFixed(1)}
				%
			</div>
		</div>
	);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VoteProgress: FC<IVoteProgressProps> = ({
	ayeVotes,
	className,
	nayVotes,
	ayesNum,
	naysNum,
	turnoutPercentage,
}) => {
	const { network } = useNetworkContext();

	const bnToIntBalance = function (bn: BN): number {
		return Number(
			formatBnBalance(
				bn,
				{ numberAfterComma: 6, withThousandDelimitor: false },
				network,
			),
		);
	};

	const ayeVotesNumber =
		ayesNum === undefined
			? bnToIntBalance(ayeVotes || ZERO)
			: Number(ayesNum);
	const totalVotesNumber =
		ayesNum === undefined || naysNum === undefined
			? bnToIntBalance(ayeVotes?.add(nayVotes || ZERO) || ZERO)
			: Number(ayesNum) + Number(naysNum);
	const ayePercent = (ayeVotesNumber / totalVotesNumber) * 100;
	const nayPercent = 100 - ayePercent;
	const isAyeNaN = isNaN(ayePercent);
	const isNayNaN = isNaN(nayPercent);
	return (
		<div
			className={`${className} flex justify-center items-end gap-x-2 relative -mt-7`}
		>
			<div className="mb-10 flex flex-col justify-center">
				<span className="text-[#2ED47A] text-[20px] leading-6 font-semibold">
					{isAyeNaN ? 50 : ayePercent.toFixed(1)}%
				</span>
				<span className="text-[#485F7D] font-medium text-xs leading-[18px] tracking-[0.01em]">
					Aye
				</span>
			</div>
			{/* {
				turnoutPercentage?
					<div className='absolute top-6 z-50 w-full flex items-center justify-center flex-col'>
						<p className='m-0 p-0 text-[#485F7D] font-medium text-xs leading-[22px]'>
					Threshold {turnoutPercentage?.toFixed(1)}%
						</p>
						<div className='h-[43px] border border-dashed border-navBlue'></div>
					</div>
					: null
			} */}
			<>
				<PieChart
					className="w-[60%]"
					center={[50, 75]}
					startAngle={-180}
					lengthAngle={180}
					rounded={true}
					lineWidth={15}
					data={[
						{
							color: '#6DE1A2',
							title: 'Aye',
							value: isAyeNaN ? 50 : ayePercent,
						},
						{
							color: '#FF778F',
							title: 'Nay',
							value: isNayNaN ? 50 : nayPercent,
						},
					]}
				/>
			</>
			<div className="mb-10 flex flex-col justify-center">
				<span className="text-[#E84865] text-[20px] leading-6 font-semibold">
					{isNayNaN ? 50 : nayPercent.toFixed(1)}%
				</span>
				<span className="text-[#485F7D] font-medium text-xs leading-[18px] tracking-[0.01em]">
					Nay
				</span>
			</div>
		</div>
	);
};

export default VoteProgress;
