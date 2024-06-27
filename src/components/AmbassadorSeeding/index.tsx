// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Modal } from 'antd';
import { poppins } from 'pages/_app';
import { useAmbassadorSeedingSelector, useUserDetailsSelector } from '~src/redux/selectors';
import styled from 'styled-components';
import PromoteCall from './PromoteCall';
import { useDispatch } from 'react-redux';
import { ambassadorSeedingActions } from '~src/redux/ambassadorSeeding';
import { EAmbassadorSeedingSteps } from '~src/redux/ambassadorSeeding/@types';
import { EAmbassadorSeedingRanks, IAmbassadorSeeding } from './types';
import CreateAmassadorPreimge from './CreateAmassadorPreimge';
import getModalTitleFromSteps from './utils/getModalTitleFromSteps';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import AmbassadorSuccess from './AmbassadorSuccess';
import WriteAmbassadorProposal from './CreateAmbassadorProposal';
import CustomButton from '~src/basic-components/buttons/CustomButton';

const AmbassadorSeeding = ({ className, open, setOpen }: IAmbassadorSeeding) => {
	const dispatch = useDispatch();
	const { loginAddress } = useUserDetailsSelector();
	const { step } = useAmbassadorSeedingSelector();
	const [openSuccessModal, setOpenSuccessModal] = useState(false);
	const [openWarningModal, setOpenWarningModal] = useState(false);

	const handleClose = () => {
		if (step === EAmbassadorSeedingSteps.CREATE_PROPOSAL) {
			setOpenWarningModal(true);
		} else {
			console.log('hereee');
			dispatch(ambassadorSeedingActions.updateAmbassadorSteps(EAmbassadorSeedingSteps.PROMOTES_CALL));
		}
		setOpen(false);
	};

	useEffect(() => {
		dispatch(ambassadorSeedingActions.updateProposer(loginAddress));
		dispatch(ambassadorSeedingActions.updateAmbassadorSteps(EAmbassadorSeedingSteps.PROMOTES_CALL));
		dispatch(ambassadorSeedingActions.updateAmbassadorRank(EAmbassadorSeedingRanks.HEAD_AMBASSADOR));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className={className}>
			<Modal
				maskClosable={false}
				open={openWarningModal}
				onCancel={() => {
					setOpenWarningModal(false);
					dispatch(ambassadorSeedingActions.updateAmbassadorSteps(EAmbassadorSeedingSteps.PROMOTES_CALL));
				}}
				footer={false}
				className={`${poppins.className} ${poppins.variable} opengov-proposals w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				closable={false}
				title={
					<div className='-mx-6 items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						Exit Ambassador Proposal Creation
					</div>
				}
			>
				<div className='mt-6'>
					<span className='text-sm text-bodyBlue dark:text-blue-dark-high'>
						Your ambassador proposal information (Title, Description & Tags) would be lost. Are you sure you want to exit proposal creation process?{' '}
					</span>
					<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<CustomButton
							onClick={() => {
								dispatch(ambassadorSeedingActions.updateAmbassadorSteps(EAmbassadorSeedingSteps.PROMOTES_CALL));
								setOpen(false);
								setOpenWarningModal(false);
							}}
							buttonsize='sm'
							text='Yes, Exit'
							variant='default'
						/>
						<CustomButton
							onClick={() => {
								setOpen(true);
								setOpenWarningModal(false);
							}}
							height={40}
							width={200}
							text='No, Continue Editing'
							variant='primary'
						/>
					</div>
				</div>
			</Modal>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(className, poppins.className, poppins.variable, 'w-[600px]')}
				open={open}
				footer={false}
				maskClosable={false}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {
					handleClose();
				}}
				title={
					<div className='-mx-6 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-2 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
						{getModalTitleFromSteps(step)}
					</div>
				}
			>
				<div>
					{step === EAmbassadorSeedingSteps.PROMOTES_CALL && <PromoteCall className='mt-6' />}
					{step === EAmbassadorSeedingSteps.CREATE_PREIMAGE && (
						<CreateAmassadorPreimge
							className='mt-6'
							setOpenSuccessModal={setOpenSuccessModal}
							closeCurrentModal={() => setOpen(false)}
						/>
					)}
					{step === EAmbassadorSeedingSteps.CREATE_PROPOSAL && (
						<WriteAmbassadorProposal
							setOpen={setOpen}
							openSuccessModal={() => setOpenSuccessModal(true)}
							className='mt-6'
						/>
					)}
				</div>
			</Modal>
			<AmbassadorSuccess
				open={openSuccessModal}
				setOpen={setOpenSuccessModal}
				openPrevModal={() => setOpen(true)}
				isPreimageSuccess={step == EAmbassadorSeedingSteps.CREATE_PREIMAGE}
			/>
		</div>
	);
};

export default styled(AmbassadorSeeding)`
	.change-wallet-button {
		font-size: 10px !important;
	}
`;
