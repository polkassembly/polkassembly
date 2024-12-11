// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
import BN from 'bn.js';
import { PieChart } from 'react-minimal-pie-chart';
import React, { FC } from 'react';
import formatBnBalance from 'src/util/formatBnBalance';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { useTranslation } from 'next-i18next';

interface IVoteSummaryProps {
	ayeVotes?: BN;
	className?: string;
	nayVotes?: BN;
	ayesNum?: number;
	naysNum?: number;
	turnoutPercentage?: number;
}

interface IVoteSummaryLegacyProps {
	ayeVotes?: BN;
	className?: string;
	nayVotes?: BN;
	ayesNum?: number;
	naysNum?: number;
}

const ZERO = new BN(0);

export const VoteSummaryLegacy = ({ ayeVotes, className, nayVotes, ayesNum, naysNum }: IVoteSummaryLegacyProps) => {
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
				} z-20 -mt-8 flex h-[75px] w-[75px] items-center justify-center rounded-full border-2 border-white dark:border-[#3B444F]`}
			>
				{ayeVotesNumber == 0 && nayVotesNumber == 0 ? '0' : ayeVotesNumber < nayVotesNumber ? ayePercent.toFixed(1) : nayPercent.toFixed(1)}%
			</div>
		</div>
	);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VoteSummary: FC<IVoteSummaryProps> = ({ ayeVotes, className, nayVotes, ayesNum, naysNum, turnoutPercentage }) => {
	const { network } = useNetworkSelector();
	const { t } = useTranslation('common');

	const { resolvedTheme: theme } = useTheme();

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const ayeVotesNumber = ayesNum === undefined ? bnToIntBalance(ayeVotes || ZERO) : Number(ayesNum);
	const totalVotesNumber = ayesNum === undefined || naysNum === undefined ? bnToIntBalance(ayeVotes?.add(nayVotes || ZERO) || ZERO) : Number(ayesNum) + Number(naysNum);
	const ayePercent = (ayeVotesNumber / totalVotesNumber) * 100;
	const nayPercent = 100 - ayePercent;
	const isAyeNaN = isNaN(ayePercent);
	const isNayNaN = isNaN(nayPercent);
	const ayeColor = theme === 'dark' ? '#64A057' : '#2ED47A';
	const nayColor = theme === 'dark' ? '#BD2020' : '#E84865';
	return (
		<div className={`${className} -mt-[48px] flex items-end justify-center gap-x-2`}>
			<div className='mb-10 flex flex-col justify-center'>
				<span className='text-[24px] font-semibold leading-6 text-aye_green dark:text-aye_green_Dark'>{isAyeNaN ? 50 : ayePercent.toFixed(1)}%</span>
				<span className='text-base font-medium leading-[18px] tracking-[0.01em] text-sidebarBlue dark:text-blue-dark-medium'>{t('aye')}</span>
			</div>
			<>
				<PieChart
					className='w-[47%] xl:w-[49%]'
					center={[50, 75]}
					startAngle={-180}
					lengthAngle={180}
					rounded={true}
					lineWidth={15}
					data={[
						{ color: ayeColor, title: 'Aye', value: isAyeNaN ? 50 : ayePercent },
						{ color: nayColor, title: 'Nay', value: isNayNaN ? 50 : nayPercent }
					]}
				/>
			</>
			<div className='mb-10 flex flex-col justify-center'>
				<span className='text-[24px] font-semibold leading-6 text-nay_red dark:text-nay_red_Dark'>{isNayNaN ? 50 : nayPercent.toFixed(1)}%</span>
				<span className='text-base font-medium leading-[18px] tracking-[0.01em] text-sidebarBlue dark:text-blue-dark-medium'>{t('nay')}</span>
			</div>
		</div>
	);
};

export default VoteSummary;
