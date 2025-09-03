// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { dmSans } from 'pages/_app';
import React from 'react';
import { useDispatch } from 'react-redux';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import DefaultVotingOptionsModal from '~src/components/Listing/Tracks/DefaultVotingOptionsModal';
import { batchVotesActions } from '~src/redux/batchVoting';
import { useBatchVotesSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import ImageIcon from '~src/ui-components/ImageIcon';

const BatchVotingBadge = () => {
	const dispatch = useDispatch();
	const user = useUserDetailsSelector();
	const { id } = user;
	const router = useRouter();
	const { show_default_options_modal } = useBatchVotesSelector();
	return (
		<>
			<section className='h-[128px] w-full rounded-[14px] bg-[#FFDC21] p-0'>
				<ImageIcon
					src='/assets/vote-badge.svg'
					alt='vote-badge'
					imgWrapperClassName='flex justify-center items-center'
					imgClassName='-mt-3'
				/>
				<Button
					className='relative -top-[70px] z-[100] mx-auto flex h-[30px] w-[96px] items-center justify-center rounded-[40px] bg-black text-xs font-semibold text-white'
					onClick={() => {
						dispatch(batchVotesActions.setShowDefaultOptionsModal(true));
					}}
				>
					Lets Begin
				</Button>
			</section>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(dmSans.className, dmSans.variable, 'w-[600px]')}
				open={show_default_options_modal}
				footer={
					id ? (
						<div className='-mx-6 mt-9 flex items-center justify-center gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
							<CustomButton
								type='default'
								text='Skip'
								buttonsize='sm'
								onClick={() => {
									router.push('/batch-voting');
									dispatch(batchVotesActions.setShowDefaultOptionsModal(false));
								}}
							/>
							<CustomButton
								type='primary'
								text='Next'
								buttonsize='sm'
								onClick={() => {
									router.push('/batch-voting');
									dispatch(batchVotesActions.setShowDefaultOptionsModal(false));
								}}
							/>
						</div>
					) : null
				}
				maskClosable={false}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {
					dispatch(batchVotesActions.setShowDefaultOptionsModal(false));
				}}
				title={
					<div className='-mx-6 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-2 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
						Set Defaults
					</div>
				}
			>
				<DefaultVotingOptionsModal />
			</Modal>
		</>
	);
};

export default BatchVotingBadge;
