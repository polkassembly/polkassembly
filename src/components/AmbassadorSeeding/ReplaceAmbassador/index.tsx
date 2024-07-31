// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import classNames from 'classnames';
import { Modal } from 'antd';
import { poppins } from 'pages/_app';
import CreateAmassadorPreimge from '../CreateAmassadorPreimge';
import getModalTitleFromSteps from '../utils/getModalTitleFromSteps';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import AmbassadorSuccess from '../AmbassadorSuccess';
import WriteAmbassadorProposal from '../CreateAmbassadorProposal';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useDispatch } from 'react-redux';
import { EAmbassadorActions } from '../types';
import { ambassadorSeedingActions } from '~src/redux/ambassadorSeeding';
import { EAmbassadorSeedingSteps } from '~src/redux/ambassadorSeeding/@types';
import { useAmbassadorSeedingSelector } from '~src/redux/selectors';
import ReplacementCall from './ReplacementCall';

interface IReplaceAmbassador {
	className?: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
}

const ReplaceAmbassador = ({ className, open, setOpen }: IReplaceAmbassador) => {
	const { replaceAmbassadorForm } = useAmbassadorSeedingSelector();
	const dispatch = useDispatch();
	const [openSuccessModal, setOpenSuccessModal] = useState(false);
	const [openWarningModal, setOpenWarningModal] = useState(false);

	const handleClose = () => {
		if (replaceAmbassadorForm?.step === EAmbassadorSeedingSteps.CREATE_PROPOSAL) {
			setOpenWarningModal(true);
		} else {
			dispatch(ambassadorSeedingActions.updateAmbassadorSteps({ type: EAmbassadorActions.REPLACE_AMBASSADOR, value: EAmbassadorSeedingSteps.CREATE_APPLICANT }));
		}
		setOpen(false);
	};

	return (
		<div className={className}>
			<Modal
				maskClosable={false}
				open={openWarningModal}
				onCancel={() => {
					setOpenWarningModal(false);
					dispatch(ambassadorSeedingActions.updateAmbassadorSteps({ type: EAmbassadorActions.REPLACE_AMBASSADOR, value: EAmbassadorSeedingSteps.CREATE_APPLICANT }));
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
								dispatch(ambassadorSeedingActions.updateAmbassadorSteps({ type: EAmbassadorActions.REPLACE_AMBASSADOR, value: EAmbassadorSeedingSteps.CREATE_APPLICANT }));
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
						{getModalTitleFromSteps(replaceAmbassadorForm?.step, EAmbassadorActions.REPLACE_AMBASSADOR)}
					</div>
				}
			>
				<div>
					{replaceAmbassadorForm?.step === EAmbassadorSeedingSteps.CREATE_APPLICANT && <ReplacementCall className='mt-6' />}
					{replaceAmbassadorForm?.step === EAmbassadorSeedingSteps.CREATE_PREIMAGE && (
						<CreateAmassadorPreimge
							className='mt-6'
							setOpenSuccessModal={setOpenSuccessModal}
							closeCurrentModal={() => setOpen(false)}
							action={EAmbassadorActions.REPLACE_AMBASSADOR}
							applicantAddress={replaceAmbassadorForm?.applicantAddress}
							proposer={replaceAmbassadorForm?.proposer}
							rank={replaceAmbassadorForm?.rank}
							xcmCallData={replaceAmbassadorForm?.xcmCallData}
							removingApplicantAddress={replaceAmbassadorForm.removingApplicantAddress || ''}
						/>
					)}
					{replaceAmbassadorForm?.step === EAmbassadorSeedingSteps.CREATE_PROPOSAL && (
						<WriteAmbassadorProposal
							setOpen={setOpen}
							openSuccessModal={() => setOpenSuccessModal(true)}
							className='mt-6'
							action={EAmbassadorActions.REPLACE_AMBASSADOR}
							ambassadorPreimage={replaceAmbassadorForm?.ambassadorPreimage}
							discussion={replaceAmbassadorForm?.discussion}
							proposer={replaceAmbassadorForm?.proposer}
						/>
					)}
				</div>
			</Modal>
			<AmbassadorSuccess
				open={openSuccessModal}
				setOpen={setOpenSuccessModal}
				openPrevModal={() => setOpen(true)}
				isPreimageSuccess={replaceAmbassadorForm?.step == EAmbassadorSeedingSteps.CREATE_PREIMAGE}
				action={EAmbassadorActions.REPLACE_AMBASSADOR}
				ambassadorPostIndex={replaceAmbassadorForm?.ambassadorPostIndex}
				ambassadorPreimage={replaceAmbassadorForm?.ambassadorPreimage}
				step={replaceAmbassadorForm?.step}
			/>
		</div>
	);
};

export default ReplaceAmbassador;
