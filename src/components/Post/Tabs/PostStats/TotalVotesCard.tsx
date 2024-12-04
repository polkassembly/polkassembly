// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import formatUSDWithUnits from 'src/util/formatUSDWithUnits';
import { useTheme } from 'next-themes';
import { chainProperties } from 'src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { ResponsivePie } from '@nivo/pie';
import { Card } from 'antd';
import TotalVotesIcon from '~assets/icons/analytics/total-votes.svg';
import TotalVotesIconDark from '~assets/icons/analytics/total-votes-dark.svg';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

interface ITotalVotesProps {
	ayeValue?: number;
	className?: string;
	nayValue?: number;
	abstainValue?: number;
	isCurrencyValue?: boolean;
	isUsedInAccounts?: boolean;
}

const TotalVotesCard: FC<ITotalVotesProps> = ({ ayeValue, className, nayValue, abstainValue, isCurrencyValue, isUsedInAccounts }) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const { t } = useTranslation('common');

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
		<Card className='mx-auto max-h-[500px] w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white lg:max-w-[512px]'>
			<h2 className='flex items-center gap-1 text-base font-semibold'>
				{theme === 'dark' ? <TotalVotesIconDark /> : <TotalVotesIcon />} {t('total_votes_casted')}
			</h2>
			<div className={`${className} relative -mt-4 flex h-[180px] items-center justify-center gap-x-2 lg:-mt-7`}>
				<ResponsivePie
					data={chartData}
					margin={{ bottom: 0, left: 5, right: 5, top: 0 }}
					startAngle={-90}
					endAngle={90}
					innerRadius={0.85}
					padAngle={2}
					cornerRadius={45}
					activeOuterRadiusOffset={5}
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
							itemTextColor: theme === 'dark' ? '#747474' : '#576D8B',
							itemWidth: 60,
							itemsSpacing: 0,
							justify: false,
							symbolShape: 'circle',
							symbolSize: 6,
							translateX: 5,
							translateY: -10
						}
					]}
					theme={{
						legends: {
							text: {
								fontSize: 12
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
					valueFormat={(value) => `${formatUSDWithUnits(value.toString(), 1)}  ${isUsedInAccounts ? 'users' : chainProperties[network]?.tokenSymbol}`}
				/>
				<p className='absolute bottom-6 flex items-end gap-2 text-xl font-bold dark:text-white'>
					{formatUSDWithUnits(maxValue.toString(), 1)}{' '}
					{isCurrencyValue && <span className='mb-0.5 text-sm font-normal text-blue-light-medium dark:text-lightGreyTextColor'>{chainProperties[network]?.tokenSymbol}</span>}
				</p>
			</div>
		</Card>
	);
};

export default styled(TotalVotesCard)`
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
