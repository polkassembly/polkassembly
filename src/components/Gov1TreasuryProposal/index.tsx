// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal, Steps } from 'antd';
import React, { useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
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
import { useTranslation } from 'next-i18next';

interface Props {
	className?: string;
	isUsedInTreasuryPage?: boolean;
}
const Gov1TreasuryProposal = ({ className, isUsedInTreasuryPage }: Props) => {
	const { t } = useTranslation('common');
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
				<div className={isUsedInTreasuryPage ? 'ml-0' : 'ml-2.5'}>{t('create_treasury_proposal')}</div>
			</CustomButton>
			{openAddressLinkedModal && (
				<AddressConnectModal
					open={openAddressLinkedModal}
					setOpen={setOpenAddressLinkedModal}
					closable
					linkAddressNeeded
					accountSelectionFormTitle={t('select_proposer_address')}
					onConfirm={(address: string) => {
						setOpen(true);
						dispatch(updateGov1TreasuryProposal({ ...gov1proposalData, proposer: address }));
					}}
					walletAlertTitle={t('treasury_proposal_creation')}
					accountAlertTitle={t('wallet_creation_prompt')}
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
				className={classNames(poppins.className, poppins.variable, theme, 'gov1proposal', 'w-[650px] px-6')}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				wrapClassName={`${className} dark:bg-modalOverlayDark ${theme} gov1proposal`}
				footer={false}
				title={
					<div className='-mx-6 flex items-center gap-1.5 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-2 text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
						<Image
							alt=''
							src={theme === 'dark' ? '/assets/openGovProposals/create_proposal_white.svg' : '/assets/openGovProposals/create_proposal.svg'}
							width={26}
							height={26}
						/>
						<span className='text-xl font-semibold'>{t('create_treasury_proposal')}</span>
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
				title={t('join_polkassembly')}
				subtitle={t('join_polkassembly_subtitle')}
			/>
		</div>
	);
};

export default styled(Gov1TreasuryProposal)`
	.gov1proposal .ant-steps .ant-steps-item-wait .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon {
		font-size: 14px !important;
		color: #7788a1 !important;
		font-weight: 700 !important;
	}
	.gov1proposal .ant-progress .ant-progress-inner:not(.ant-progress-circle-gradient) .ant-progress-circle-path {
		stroke: var(--pink_primary);
		stroke-width: 6px;
		background: red;
	}
	.gov1proposal .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon {
		font-size: 14px !important;
		font-weight: 700 !important;
	}

	.gov1proposal .ant-steps .ant-steps-item-finish .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title {
		color: var(--bodyBlue) !important;
	}
	.dark .gov1proposal .ant-steps .ant-steps-item-wait .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
	.dark .gov1proposal .ant-steps .ant-steps-item-finish .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
	.dark .gov1proposal .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title {
		font-size: 14px !important;
		color: #96a4b6 !important;
		line-height: 21px !important;
		font-weight: 500 !important;
	}
	.gov1proposal .ant-steps .ant-steps-item-wait .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title {
		color: #96a4b6 !important;
	}
	.ant-steps .ant-steps-item .ant-steps-item-container .ant-steps-item-tail {
		top: 0px !important;
		padding: 4px 15px !important;
	}
	.gov1proposal .ant-steps .ant-steps-item-wait > .ant-steps-item-container > .ant-steps-item-tail::after,
	.gov1proposal .ant-steps .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-tail::after,
	.gov1proposal .ant-steps .ant-steps-item-tail::after {
		background-color: #d2d8e0 !important;
	}
	.gov1proposal .ant-steps.ant-steps-label-vertical .ant-steps-item-content {
		width: 100% !important;
		display: flex !important;
		margin-top: 8px;
	}
	.gov1proposal .ant-steps .ant-steps-item-finish .ant-steps-item-icon {
		background: #51d36e;
		border: none !important;
	}
	.gov1proposal .ant-steps .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
		color: white !important;
	}

	.gov1proposal .ant-steps .ant-steps-item-finish .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
	.gov1proposal .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title {
		color: #243a57 !important;
	}

	.dark .ant-steps .ant-steps-item-finish .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
	.dark .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title {
		color: white !important;
	}

	input::placeholder {
		color: #7c899b;
		font-weight: 400 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
	}
	.ant-steps .ant-steps-item-wait .ant-steps-item-icon {
		background-color: rgba(0, 0, 0, 0.06) !important;
	}
	.dark .ant-steps .ant-steps-item-wait .ant-steps-item-icon {
		background-color: #dde4ed !important;
	}
`;
