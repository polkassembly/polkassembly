// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
import BN from 'bn.js';
import { PieChart } from 'react-minimal-pie-chart';
import React, { FC } from 'react';
import formatBnBalance from 'src/util/formatBnBalance';
import { useNetworkSelector } from '~src/redux/selectors';

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

export const VoteProgressLegacy = ({ ayeVotes, className, nayVotes, ayesNum, naysNum }: IVoteProgressLegacyProps) => {
	const { network } = useNetworkSelector();

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const ayeVotesNumber = ayesNum === undefined ? bnToIntBalance(ayeVotes || ZERO) : Number(ayesNum);
	const nayVotesNumber = naysNum === undefined ? bnToIntBalance(nayVotes || ZERO) : Number(naysNum);
	const totalVotesNumber = ayesNum === undefined || naysNum === undefined ? bnToIntBalance(ayeVotes?.add(nayVotes || ZERO) || ZERO) : Number(ayesNum) + Number(naysNum);
	const ayePercent = (ayeVotesNumber / totalVotesNumber) * 100;
	const nayPercent = 100 - ayePercent;

	return (
		<div className={`${className} flex flex-col items-center text-base text-white`}>
			<div
				id='bigCircle'
				className={`${ayeVotesNumber >= nayVotesNumber ? 'bg-aye_green' : 'bg-nay_red'} z-10 flex h-[110px] w-[110px] items-center justify-center rounded-full`}
			>
				{ayeVotesNumber == 0 && nayVotesNumber == 0 ? '0' : ayeVotesNumber >= nayVotesNumber ? ayePercent.toFixed(1) : nayPercent.toFixed(1)}%
			</div>
			<div
				id='smallCircle'
				className={`${
					ayeVotesNumber < nayVotesNumber ? 'bg-aye_green' : 'bg-nay_red'
				} z-20 -mt-8 flex h-[75px] w-[75px] items-center justify-center rounded-full border-2 border-white`}
			>
				{ayeVotesNumber == 0 && nayVotesNumber == 0 ? '0' : ayeVotesNumber < nayVotesNumber ? ayePercent.toFixed(1) : nayPercent.toFixed(1)}%
			</div>
		</div>
	);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VoteProgress: FC<IVoteProgressProps> = ({ ayeVotes, className, nayVotes, ayesNum, naysNum, turnoutPercentage }) => {
	const { network } = useNetworkSelector();

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const ayeVotesNumber = ayesNum === undefined ? bnToIntBalance(ayeVotes || ZERO) : Number(ayesNum);
	const totalVotesNumber = ayesNum === undefined || naysNum === undefined ? bnToIntBalance(ayeVotes?.add(nayVotes || ZERO) || ZERO) : Number(ayesNum) + Number(naysNum);
	const ayePercent = (ayeVotesNumber / totalVotesNumber) * 100;
	const nayPercent = 100 - ayePercent;
	const isAyeNaN = isNaN(ayePercent);
	const isNayNaN = isNaN(nayPercent);
	return (
		<div className={`${className} relative -mt-7 flex items-end justify-center gap-x-2`}>
			<div className='mb-10 flex flex-col justify-center'>
				<span className='text-[20px] font-semibold leading-6 text-[#2ED47A]'>{isAyeNaN ? 50 : ayePercent.toFixed(1)}%</span>
				<span className='text-xs font-medium leading-[18px] tracking-[0.01em] text-[#485F7D]'>Aye</span>
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
					className='w-[60%]'
					center={[50, 75]}
					startAngle={-180}
					lengthAngle={180}
					rounded={true}
					lineWidth={15}
					data={[
						{ color: '#6DE1A2', title: 'Aye', value: isAyeNaN ? 50 : ayePercent },
						{ color: '#FF778F', title: 'Nay', value: isNayNaN ? 50 : nayPercent }
					]}
				/>
			</>
			<div className='mb-10 flex flex-col justify-center'>
				<span className='text-[20px] font-semibold leading-6 text-[#E84865]'>{isNayNaN ? 50 : nayPercent.toFixed(1)}%</span>
				<span className='text-xs font-medium leading-[18px] tracking-[0.01em] text-[#485F7D]'>Nay</span>
			</div>
		</div>
	);
};

export default VoteProgress;
