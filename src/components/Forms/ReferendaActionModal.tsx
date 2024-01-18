// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Loader from '~src/ui-components/Loader';
import dynamic from 'next/dynamic';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { Form, Modal, Steps } from 'antd';
import { poppins } from 'pages/_app';
import { CloseIcon, CreatePropoosalIcon } from '~src/ui-components/CustomIcons';
import CreateProposalIcon from '~assets/openGovProposals/create_proposal.svg';
import CreateProposalIconDark from '~assets/openGovProposals/create_proposal_white.svg';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ISteps } from '../OpenGovTreasuryProposal';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';

const AddressConnectModal = dynamic(() => import('src/ui-components/AddressConnectModal'), {
	ssr: false
});

const CancelReferendaForm = dynamic(() => import('../Forms/CancelReferendaForm'), {
	loading: () => <Loader />,
	ssr: false
});

const KillReferendaForm = dynamic(() => import('../Forms/KillReferendaForm'), {
	loading: () => <Loader />,
	ssr: false
});

const CreateReferendaForm = dynamic(() => import('../Forms/CreateReferendaForm'), {
	loading: () => <Loader />,
	ssr: false
});

const WriteProposal = dynamic(() => import('../OpenGovTreasuryProposal/WriteProposal'), {
	ssr: false
});

enum ESteps {
	Write_Proposal = 'Write a Proposal',
	Create_Proposal = 'Create a Referenda',
	Cancel_Proposal = 'Cancel a Referenda',
	Kill_Proposal = 'Kill a Referenda'
}

interface Props {
	referendaModal: number;
	className?: string;
	openAddressLinkedModal?: boolean;
	setOpenAddressLinkedModal?: (pre: boolean) => void;
}

const ReferendaActionModal = ({ referendaModal, className, openAddressLinkedModal, setOpenAddressLinkedModal }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const { id } = currentUser;
	const { network } = useNetworkSelector();
	// const { beneficiaries } = useTreasuryProposalSelector();
	// const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const [proposerAddress, setProposerAddress] = useState<string>('');
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [closeConfirm, setCloseConfirm] = useState<boolean>(false);
	const [openLoginPrompt, setOpenLoginPrompt] = useState<boolean>(false);
	const [steps, setSteps] = useState<ISteps>({ percent: 0, step: 0 });
	const [writeProposalForm] = Form.useForm();
	const [title, setTitle] = useState<string>('');
	const [content, setContent] = useState<string>('');
	const [tags, setTags] = useState<string[]>([]);
	const [isDiscussionLinked, setIsDiscussionLinked] = useState<boolean | null>(null);
	const [discussionLink, setDiscussionLink] = useState<string>('');

	const handleClick = () => {
		if (id) {
			if (proposerAddress.length > 0) {
				setOpenModal(!openModal);
			} else if (setOpenAddressLinkedModal) {
				setOpenAddressLinkedModal(true);
			}
		} else {
			setOpenLoginPrompt(true);
		}
	};

	const handleClose = () => {
		setProposerAddress('');
		setIsDiscussionLinked(null);
		setDiscussionLink('');
		setTitle('');
		setTags([]);
		setContent('');
		localStorage.removeItem('treasuryProposalProposerAddress');
		localStorage.removeItem('treasuryProposalProposerWallet');
		localStorage.removeItem('treasuryProposalData');
		writeProposalForm.resetFields();
		setSteps({ percent: 0, step: 0 });
		setOpenModal(false);
		setCloseConfirm(false);
	};

	useEffect(() => {}, [network]);

	return (
		<div className={className}>
			<div
				className='ml-[-37px] flex min-w-[290px] cursor-pointer items-center justify-center rounded-[8px] align-middle text-[35px] text-lightBlue transition delay-150 duration-300 hover:bg-[#e5007a12] hover:text-bodyBlue dark:text-blue-dark-medium'
				onClick={handleClick}
			>
				<CreatePropoosalIcon className='ml-[-31px] cursor-pointer' />
				<p className='mb-3 ml-4 mt-2.5 text-sm font-medium leading-5 tracking-[1.25%] dark:text-blue-dark-medium'>
					{referendaModal === 1 ? 'Create Referenda' : referendaModal === 2 ? 'Cancel Referenda' : referendaModal === 3 ? 'Kill Referenda' : 'Create Treasury Proposal'}
				</p>
			</div>
			{openAddressLinkedModal && (
				<AddressConnectModal
					open={openAddressLinkedModal}
					setOpen={setOpenAddressLinkedModal}
					isProposalCreation
					closable
					linkAddressNeeded
					accountSelectionFormTitle='Select Proposer Address'
					onConfirm={(address: string) => {
						setOpenModal(true);
						setProposerAddress(address);
					}}
					walletAlertTitle='Treasury proposal creation'
					accountAlertTitle='Please install a wallet and create an address to start creating a proposal.'
					localStorageWalletKeyName='treasuryProposalProposerWallet'
					localStorageAddressKeyName='treasuryProposalProposerAddress'
				/>
			)}
			<Modal
				maskClosable={false}
				open={closeConfirm}
				onCancel={() => {
					setCloseConfirm(true);
					setOpenModal(false);
				}}
				footer={false}
				className={`${poppins.className} ${poppins.variable} opengov-proposals w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				closable={false}
				title={
					<div className='items-center gap-2 border-0 border-b-[1px] border-solid border-[#D2D8E0] px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						Exit Treasury Proposal Creation
					</div>
				}
			>
				<div className='mt-6 px-6'>
					<span className='text-sm text-bodyBlue dark:text-blue-dark-high'>
						Your treasury proposal information (Title, Description & Tags) would be lost. Are you sure you want to exit proposal creation process?{' '}
					</span>
					<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-[#D2D8E0] px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<CustomButton
							onClick={handleClose}
							buttonsize='sm'
							text='Yes, Exit'
							variant='default'
						/>
						<CustomButton
							onClick={() => {
								setCloseConfirm(false);
								setOpenModal(true);
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
				open={openModal}
				maskClosable={false}
				onCancel={() => {
					setCloseConfirm(true);
					setOpenModal(false);
				}}
				footer={false}
				className={`${poppins.className} ${poppins.variable} opengov-proposals w-[720px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				title={
					<div className='flex items-center gap-2 border-0 border-b-[1px] border-solid border-[#D2D8E0] px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						{theme === 'dark' ? <CreateProposalIconDark /> : <CreateProposalIcon />}
						{referendaModal === 1 ? 'Create Referenda' : referendaModal === 2 ? 'Cancel Referenda' : referendaModal === 3 ? 'Kill Referenda' : 'Create Treasury Proposal'}
					</div>
				}
			>
				<div className='mt-6 px-6'>
					<Steps
						className='font-medium text-bodyBlue dark:text-blue-dark-high'
						percent={steps.percent}
						current={steps.step}
						size='default'
						labelPlacement='vertical'
						items={[
							{
								title: ESteps.Write_Proposal
							},
							{
								title: referendaModal === 1 ? ESteps.Create_Proposal : referendaModal === 2 ? ESteps.Cancel_Proposal : referendaModal === 3 ? ESteps.Kill_Proposal : ''
							}
						]}
					/>
					{steps?.step === 0 && (
						<WriteProposal
							form={writeProposalForm}
							setSteps={setSteps}
							title={title}
							content={content}
							tags={tags}
							isDiscussionLinked={isDiscussionLinked}
							setIsDiscussionLinked={setIsDiscussionLinked}
							discussionLink={discussionLink}
							setDiscussionLink={setDiscussionLink}
							setTags={setTags}
							setContent={setContent}
							setTitle={setTitle}
						/>
					)}

					{steps?.step === 1 && (
						<div className='mt-4 flex items-center justify-center'>
							{referendaModal === 1 && <CreateReferendaForm />}
							{referendaModal === 2 && <CancelReferendaForm />}
							{referendaModal === 3 && <KillReferendaForm />}
						</div>
					)}
				</div>
			</Modal>
			<ReferendaLoginPrompts
				modalOpen={openLoginPrompt}
				setModalOpen={setOpenLoginPrompt}
				image='/assets/referenda-endorse.png'
				title='Join Polkassembly to start creating a proposal.'
				subtitle='Please login with a desktop computer to start creating a proposal.'
			/>
		</div>
	);
};

export default ReferendaActionModal;
