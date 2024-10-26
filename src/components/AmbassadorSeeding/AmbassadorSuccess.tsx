// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Button, Modal, message } from 'antd';
import { poppins } from 'pages/_app';
import { useDispatch } from 'react-redux';
import { CloseIcon, CopyIcon } from '~src/ui-components/CustomIcons';
import SuccessIcon from '~assets/delegation-tracks/success-delegate.svg';
import { useNetworkSelector } from '~src/redux/selectors';
import copyToClipboard from '~src/util/copyToClipboard';
import Link from 'next/link';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { EAmbassadorActions } from './types';
import { EAmbassadorSeedingSteps } from '~src/redux/addAmbassadorSeeding/@types';
import { ambassadorSeedingActions } from '~src/redux/addAmbassadorSeeding';
import { ambassadorRemovalActions } from '~src/redux/removeAmbassador';
import { ambassadorReplacementActions } from '~src/redux/replaceAmbassador';

interface Props {
	open: boolean;
	setOpen: (pre: boolean) => void;
	className?: string;
	openPrevModal: () => void;
	isPreimageSuccess: boolean;
	action: EAmbassadorActions;
	ambassadorPostIndex: number | null;
	ambassadorPreimage: { hash: string; length: number };
	step: EAmbassadorSeedingSteps;
}

const AmbassadorSuccess = ({ className, open, setOpen, openPrevModal, isPreimageSuccess = false, action, ambassadorPostIndex, ambassadorPreimage, step }: Props) => {
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const [messageApi, contextHolder] = message.useMessage();

	const success = (message: string) => {
		messageApi.open({
			content: message,
			duration: 10,
			type: 'success'
		});
	};

	const copyLink = (address: string) => {
		copyToClipboard(address);
	};

	const handleAmbassadorStepChange = (step: EAmbassadorSeedingSteps) => {
		switch (action) {
			case EAmbassadorActions.ADD_AMBASSADOR:
				dispatch(ambassadorSeedingActions.updateAmbassadorSteps(step));
				break;
			case EAmbassadorActions.REMOVE_AMBASSADOR:
				dispatch(ambassadorRemovalActions.updateAmbassadorSteps(step));
				break;
			case EAmbassadorActions.REPLACE_AMBASSADOR:
				dispatch(ambassadorReplacementActions.updateAmbassadorSteps(step));
				break;
		}
	};
	const handleAmbassadorReset = () => {
		switch (action) {
			case EAmbassadorActions.ADD_AMBASSADOR:
				dispatch(ambassadorSeedingActions.resetAmbassadorSeeding());
				break;
			case EAmbassadorActions.REMOVE_AMBASSADOR:
				dispatch(ambassadorRemovalActions.resetAmbassadorRemovalSeeding());
				break;
			case EAmbassadorActions.REPLACE_AMBASSADOR:
				dispatch(ambassadorReplacementActions.resetAmbassadorReplacenentSeeding());
				break;
		}
	};

	return (
		<Modal
			zIndex={1000}
			open={open}
			className={`${poppins.variable} ${poppins.className}  dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			onCancel={() => {
				handleAmbassadorStepChange(EAmbassadorSeedingSteps.CREATE_PROPOSAL);
				setOpen(false);
				if (step === EAmbassadorSeedingSteps.CREATE_PROPOSAL) {
					handleAmbassadorReset();
				} else {
					openPrevModal();
				}
			}}
			footer={
				isPreimageSuccess ? (
					<div>
						<Button
							className='h-10 w-full border-none bg-pink_primary text-white'
							onClick={() => {
								handleAmbassadorStepChange(EAmbassadorSeedingSteps.CREATE_PROPOSAL);
								setOpen(false);
								openPrevModal();
							}}
						>
							Create Proposal
						</Button>
					</div>
				) : (
					<Link
						href={`https://${network}.polkassembly.io/referenda/${ambassadorPostIndex}`}
						className='-mt-2 flex items-center pb-2'
						target='_blank'
						rel='noopener noreferrer'
					>
						<CustomButton
							height={40}
							className='w-full rounded-[4px]'
							variant='primary'
							text='View Proposal'
						/>
					</Link>
				)
			}
		>
			<div className='-mt-[112px] flex flex-col items-center justify-center'>
				<div className='flex flex-col items-center justify-center'>
					<SuccessIcon />
					<h2 className='py-4 text-xl font-medium tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>
						{isPreimageSuccess ? 'Preimage created successfully!' : 'Proppsal created successfully!'}
					</h2>
				</div>
				{isPreimageSuccess && (
					<div className='pb-4'>
						<span
							className='text ml-1 flex cursor-pointer items-center justify-center text-bodyBlue dark:text-blue-dark-high'
							onClick={(e) => {
								e.preventDefault();
								copyLink(ambassadorPreimage?.hash);
								success('Preimage hash copied to clipboard');
							}}
						>
							Preimage: {ambassadorPreimage?.hash.slice(0, 20)}...
							{contextHolder}
							<CopyIcon className='ml-1 text-xl text-lightBlue dark:text-icon-dark-inactive' />
						</span>
					</div>
				)}
			</div>
		</Modal>
	);
};

export default AmbassadorSuccess;
