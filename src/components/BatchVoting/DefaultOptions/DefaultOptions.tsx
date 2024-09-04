// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import OptionWrapper from './OptionWrapper';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { ILastVote } from '~src/types';
import Alert from '~src/basic-components/Alert';
import { ProposalType } from '~src/global/proposalType';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useAppDispatch } from '~src/redux/store';
import { batchVotesActions } from '~src/redux/batchVoting';

interface IDefaultOptions {
	theme?: string;
	forSpecificPost?: boolean;
	postEdit?: any;
}

const DefaultOptions: FC<IDefaultOptions> = (props) => {
	const { forSpecificPost, postEdit } = props;
	const dispatch = useAppDispatch();
	const { loginAddress } = useUserDetailsSelector();
	const [lastVote, setLastVote] = useState<ILastVote | null>(null);
	const [address, setAddress] = useState<string>(loginAddress);
	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	return (
		<section className='h-full w-full items-center justify-start gap-x-3 rounded-xl bg-white dark:bg-black'>
			<header>
				<div className='mb-4 mt-4 h-[48px] border-0 border-b-[1px] border-solid border-section-light-container px-6 text-lg font-semibold tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
					Set Defaults
				</div>
			</header>
			<article className='-full w-full items-center justify-start gap-x-3 px-6'>
				{!forSpecificPost && (
					<Alert
						type='info'
						showIcon
						message={<span className='text-[13px] dark:text-black'>Select default values for votes. These can be edited before making a final transaction</span>}
					/>
				)}

				<OptionWrapper
					address={String(address)}
					onAccountChange={onAccountChange}
					proposalType={ProposalType.TREASURY_PROPOSALS}
					lastVote={lastVote as any}
					setLastVote={setLastVote}
					forSpecificPost={forSpecificPost}
					postEdit={postEdit}
				/>
			</article>
			<div className='mb-2 mt-9 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-4'>
				<CustomButton
					variant='default'
					text='Skip'
					buttonsize='sm'
					onClick={() => {
						dispatch(batchVotesActions.setIsDefaultSelected(false));
					}}
				/>
				<CustomButton
					variant='primary'
					text='Next'
					buttonsize='sm'
					onClick={() => {
						dispatch(batchVotesActions.setIsDefaultSelected(false));
					}}
				/>
			</div>
		</section>
	);
};

export default DefaultOptions;
