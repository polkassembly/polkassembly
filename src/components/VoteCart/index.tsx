// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React from 'react';
import { useBatchVotesSelector } from '~src/redux/selectors';
import ProposalInfoCard from './ProposalInfoCard';

const VoteCart: React.FC = () => {
	const { vote_card_info_array } = useBatchVotesSelector();
	console.log(vote_card_info_array);
	return (
		<section>
			<article className='px-2'>
				<div className='h-[662px] w-full overflow-y-auto rounded-md bg-white p-2 shadow-md dark:bg-black'>
					<div className='my-4 flex items-center justify-start gap-x-2'>
						<h1 className='m-0 p-0 text-base font-semibold text-bodyBlue dark:text-white'>Voted Proposals</h1>
						<p className='m-0 p-0 text-sm text-bodyBlue dark:text-blue-dark-medium'>({vote_card_info_array?.length})</p>
					</div>
					{vote_card_info_array.map((voteCardInfo, index) => (
						<ProposalInfoCard
							key={index}
							voteInfo={voteCardInfo}
							index={index}
						/>
					))}
				</div>
			</article>
			<article
				className='h-[171px] w-full bg-white p-5 shadow-lg drop-shadow-lg dark:bg-black'
				style={{ borderRadius: '8px 8px 0 0' }}
			>
				<div className='flex flex-col gap-y-2'>
					<div className='flex h-[40px] items-center justify-between rounded-sm bg-transparent p-2'>
						<p className='m-0 p-0 text-sm text-lightBlue dark:text-white'>Total Proposals</p>
						<p className='m-0 p-0 text-base font-semibold text-bodyBlue dark:text-blue-dark-medium'>{vote_card_info_array?.length}</p>
					</div>
					<div className='flex h-[40px] items-center justify-between rounded-sm bg-[#F6F7F9] p-2 dark:bg-modalOverlayDark'>
						<p className='m-0 p-0 text-sm text-lightBlue dark:text-blue-dark-medium'>Gas Fees</p>
						<p className='m-0 p-0 text-base font-semibold text-bodyBlue dark:text-white'>27.4 DOT</p>
					</div>
					<Button className='flex h-[40px] items-center justify-center rounded-lg border-none bg-pink_primary text-base text-white'>Confirm Batch Voting</Button>
				</div>
			</article>
		</section>
	);
};

export default VoteCart;
