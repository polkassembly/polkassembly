// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { useBatchVotesSelector, useUserDetailsSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';
import NameLabel from '~src/ui-components/NameLabel';

const VoteSuccessModal = () => {
	const user = useUserDetailsSelector();
	const { total_proposals_added_in_Cart } = useBatchVotesSelector();
	return (
		<section className='h-[250px] p-6'>
			<ImageIcon
				src='/assets/icons/success-icon.svg'
				alt='success-icon'
				imgWrapperClassName='mx-auto relative -top-[152px] left-[50px]'
			/>
			<div className='-mt-[116px] flex flex-col items-center justify-center'>
				<h1 className='m-0 p-0 text-xl font-semibold text-bodyBlue dark:text-white'>Batch Voted successfully </h1>
				<div className='mt-6 flex w-[216px] items-center justify-between'>
					<p className='m-0 mr-auto p-0 text-sm text-lightBlue dark:text-blue-dark-high'>Address:</p>
					<NameLabel
						username={user?.username || ''}
						usernameMaxLength={15}
						className='m-0 -mr-1.5 ml-auto whitespace-nowrap p-0'
						disableIdenticon={false}
						truncateUsername={false}
						isUsedInLeadership={true}
					/>
				</div>
				<div className='flex w-[216px] items-center justify-between'>
					<p className='m-0 mr-auto p-0 text-sm text-lightBlue dark:text-blue-dark-high'>proposal(s):</p>
					<p className='m-0 ml-auto p-0 text-sm text-bodyBlue dark:text-white'>{total_proposals_added_in_Cart}</p>
				</div>
			</div>
		</section>
	);
};

export default VoteSuccessModal;
