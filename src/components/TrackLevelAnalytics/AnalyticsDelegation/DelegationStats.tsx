// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React from 'react';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector, useTrackLevelAnalytics } from '~src/redux/selectors';

const DelegationStats = () => {
	const { network } = useNetworkSelector();
	const tokenSymbol = `${chainProperties[network]?.tokenSymbol}`;
	const { totalCapital, totalDelegates, totalDelegators, totalVotesBalance } = useTrackLevelAnalytics();
	const stats = [
		{ title: 'Delegatee', value: totalDelegates },
		{ title: 'Delegator', value: totalDelegators },
		{ title: 'Total Capital', value: parseBalance(totalCapital, 1, false, network) },
		{ title: 'Total Votes', value: parseBalance(totalVotesBalance, 1, false, network) }
	];
	return (
		<section className='grid grid-cols-2 gap-2 sm:flex sm:justify-between sm:px-4'>
			{stats.map((stat, index) => (
				<React.Fragment key={index}>
					<div className='flex flex-col items-center rounded-xl bg-[#D2D8E04F] pb-1 pt-2 dark:bg-[#1F1F20] sm:bg-transparent dark:sm:bg-transparent'>
						<div className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>{stat.title}</div>
						<div className=' text-center text-[22px] font-semibold text-blue-light-high dark:text-blue-dark-high sm:text-[24px]'>
							{stat.value}
							{typeof stat.value !== 'number' && (
								<span className='ml-[2px] text-base font-semibold text-blue-light-medium dark:text-blue-dark-medium sm:text-lg'>{tokenSymbol}</span>
							)}
						</div>
					</div>
					{index < stats.length - 1 && (
						<Divider
							className='h-[60px] bg-section-light-container dark:bg-separatorDark max-sm:hidden'
							type='vertical'
						/>
					)}
				</React.Fragment>
			))}
		</section>
	);
};

export default DelegationStats;
