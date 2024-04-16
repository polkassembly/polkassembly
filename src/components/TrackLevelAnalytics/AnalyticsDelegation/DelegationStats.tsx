// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React from 'react';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { useNetworkSelector } from '~src/redux/selectors';
import { IDelegationStats } from '../types';

const DelegationStats = ({ totalCapital, totalVotesBalance, totalDelegates, totalDelegators }: IDelegationStats) => {
	const { network } = useNetworkSelector();
	const stats = [
		{ title: 'Delegatee', value: totalDelegates },
		{ title: 'Delegator', value: totalDelegators },
		{ title: 'Total Capital', value: parseBalance(totalCapital, 1, true, network) },
		{ title: 'Total Votes', value: parseBalance(totalVotesBalance, 1, true, network) }
	];
	return (
		<section className='grid grid-cols-2 gap-2 sm:flex sm:justify-between sm:px-4'>
			{stats.map((stat, index) => (
				<React.Fragment key={index}>
					<div className='flex flex-col items-center rounded-xl bg-[#D2D8E04F] pb-1 pt-2 sm:bg-transparent'>
						<div className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>{stat.title}</div>
						<span className='text-[28px] font-semibold text-blue-light-high dark:text-blue-dark-high'>{stat.value}</span>
					</div>
					{index < stats.length - 1 && (
						<Divider
							className='h-[60px] bg-[#D2D8E0] dark:bg-separatorDark max-sm:hidden'
							type='vertical'
						/>
					)}
				</React.Fragment>
			))}
		</section>
	);
};

export default DelegationStats;
