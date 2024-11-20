// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal, Steps } from 'antd';
import React, { useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import classNames from 'classnames';
import { dmSans } from 'pages/_app';
import { CloseIcon, CreatePropoosalIcon } from '~src/ui-components/CustomIcons';
import { ESteps } from '~src/types';
import styled from 'styled-components';
import { useGov1treasuryProposal, useUserDetailsSelector } from '~src/redux/selectors';
import WriteProposal from './WriteProposal';
import { useDispatch } from 'react-redux';
import { updateGov1TreasuryProposal } from '~src/redux/gov1TreasuryProposal';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import CreateProposal from './CreateProposal';
import Gov1TreasuryProposalSuccess from './Gov1TreasuryProposalSuccess';
import CreateProposalWhiteIcon from '~assets/icons/CreateProposalWhite.svg';

interface Props {
	className?: string;
	isUsedInTreasuryPage?: boolean;
}

const Gov1TreasuryProposal = ({ className, isUsedInTreasuryPage }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useDispatch();
	const gov1proposalData = useGov1treasuryProposal();
	const { id: userId, loginAddress } = useUserDetailsSelector();
	const [step, setStep] = useState<number>(0);
	const { firstStepPercentage, secondStepPercentage } = gov1proposalData;
	const [open, setOpen] = useState<boolean>(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState(false);
	const [openLoginPrompt, setOpenLoginPrompt] = useState<boolean>(false);
	const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(false);

	const handleClick = () => {
		if (userId) {
			if (loginAddress.length) {
				setOpen(!open);
			} else {
				setOpenAddressLinkedModal(true);
				dispatch(updateGov1TreasuryProposal({ ...gov1proposalData, proposer: loginAddress }));
			}
		} else {
			setOpenLoginPrompt(true);
		}
	};

	return (
		<div className={theme}>
			<CustomButton
				variant={isUsedInTreasuryPage ? 'primary' : 'text'}
				onClick={handleClick}
				className={`${
					isUsedInTreasuryPage
						? 'flex gap-1'
						: 'ml-[-37px] flex min-w-[290px] cursor-pointer items-center justify-center gap-2 rounded-[8px] border-none bg-none align-middle text-[35px] text-lightBlue transition delay-150 duration-300 hover:bg-[#e5007a12] hover:text-bodyBlue dark:text-blue-dark-medium'
				}`}
			>
				{isUsedInTreasuryPage ? (
					<CreateProposalWhiteIcon className='mr-2' />
				) : (
					<CreatePropoosalIcon className={`${isUsedInTreasuryPage ? 'scale-200' : 'ml-[-31px] cursor-pointer'} text-3xl`} />
				)}
				<div className={isUsedInTreasuryPage ? 'ml-0' : 'ml-2.5'}>Create Treasury Proposal</div>
			</CustomButton>
			{openAddressLinkedModal && (
				<AddressConnectModal
					open={openAddressLinkedModal}
					setOpen={setOpenAddressLinkedModal}
					closable
					linkAddressNeeded
					accountSelectionFormTitle='Select Proposer Address'
					onConfirm={(address: string) => {
						setOpen(true);
						dispatch(updateGov1TreasuryProposal({ ...gov1proposalData, proposer: address }));
					}}
					walletAlertTitle='Treasury proposal creation'
					accountAlertTitle='Please install a wallet and create an address to start creating a proposal.'
					localStorageWalletKeyName='treasuryProposalProposerWallet'
					localStorageAddressKeyName='treasuryProposalProposerAddress'
					usedInIdentityFlow={false}
				/>
			)}
			<Modal
				open={open}
				onCancel={() => {
					setOpen(false);
					setStep(0);
				}}
				className={classNames(dmSans.className, dmSans.variable, theme, 'antSteps', 'w-[650px] px-6')}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				wrapClassName={`${className} dark:bg-modalOverlayDark ${theme} antSteps`}
				footer={false}
				title={
					<div className='-mx-6 flex items-center gap-1.5 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-2 text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
						<Image
							alt=''
							src={theme === 'dark' ? '/assets/openGovProposals/create_proposal_white.svg' : '/assets/openGovProposals/create_proposal.svg'}
							width={26}
							height={26}
						/>
						<span className='text-xl font-semibold'>Create Treasury Proposal</span>
					</div>
				}
			>
				<div className={theme}>
					<Steps
						className={classNames(theme, 'mt-6 font-medium text-bodyBlue dark:text-blue-dark-high')}
						percent={step === 0 ? firstStepPercentage : secondStepPercentage}
						current={step}
						size='default'
						labelPlacement='vertical'
						items={[
							{
								title: ESteps.Write_Proposal
							},
							{
								title: ESteps.Create_Proposal
							}
						]}
					/>
				</div>
				{step === 0 && <WriteProposal setStep={setStep} />}
				{step === 1 && firstStepPercentage === 100 && (
					<CreateProposal
						setStep={setStep}
						setOpenAddressLinkedModal={setOpenAddressLinkedModal}
						setOpen={setOpen}
						setOpenSuccessModal={setOpenSuccessModal}
					/>
				)}
			</Modal>

			{/* proposal success modal */}
			<Gov1TreasuryProposalSuccess
				open={openSuccessModal}
				setOpen={setOpenSuccessModal}
				setStep={setStep}
			/>

			<ReferendaLoginPrompts
				modalOpen={openLoginPrompt}
				setModalOpen={setOpenLoginPrompt}
				image='/assets/Gifs/login-treasury.gif'
				title='Join Polkassembly to Create a New proposal.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
		</div>
	);
};

export default styled(Gov1TreasuryProposal)`
	input::placeholder {
		color: #7c899b;
		font-weight: 400 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
	}
`;
