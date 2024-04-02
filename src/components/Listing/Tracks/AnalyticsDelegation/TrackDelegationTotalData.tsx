// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import BN from 'bn.js';
import React from 'react';

interface IProps {
	totalCapital: string;
	totalVotesBalance: string;
	totalDelegates: number;
	totalDelegators: number;
}

const TrackDelegationTotalData = ({ totalCapital, totalVotesBalance, totalDelegates, totalDelegators }: IProps) => {
	const bnTotalCapital = new BN(totalCapital);
	const bnTotalVotesBalance = new BN(totalVotesBalance);
	return (
		<section className='flex justify-between px-10'>
			<div className='flex flex-col'>
				<div className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Delegatee</div>
				<span className='text-[28px] font-semibold dark:text-blue-dark-high'>{totalDelegates}</span>
			</div>
			<Divider
				className='h-[60px] bg-[#D2D8E0] dark:bg-separatorDark'
				type='vertical'
			/>

			<div className='flex flex-col'>
				<div className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Delegator</div>
				<span className='text-[28px] font-semibold dark:text-blue-dark-high'>{totalDelegators}</span>
			</div>
			<Divider
				className='h-[60px] bg-[#D2D8E0] dark:bg-separatorDark'
				type='vertical'
			/>

			<div className='flex flex-col'>
				<div className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Total Capital</div>
				<span className='text-[28px] font-semibold dark:text-blue-dark-high'>{Number(bnTotalCapital)}</span>
			</div>
			<Divider
				className='h-[60px] bg-[#D2D8E0] dark:bg-separatorDark'
				type='vertical'
			/>

			<div className='flex flex-col'>
				<div className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Total Votes</div>
				<span className='text-[28px] font-semibold dark:text-blue-dark-high'>{Number(bnTotalVotesBalance)}</span>
			</div>
		</section>
	);
};

export default TrackDelegationTotalData;
