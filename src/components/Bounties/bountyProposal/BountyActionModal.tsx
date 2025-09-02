// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Modal, Steps } from 'antd';
import dynamic from 'next/dynamic';
import { dmSans } from 'pages/_app';
import React, { useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { EEnactment, IEnactment, ISteps } from '~src/components/OpenGovTreasuryProposal';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import CreateProposalIcon from '~assets/openGovProposals/create_proposal.svg';
import CreateProposalIconDark from '~assets/openGovProposals/create_proposal_white.svg';
import { EAllowedCommentor } from '~src/types';
import BN from 'bn.js';
import { BN_HUNDRED } from '@polkadot/util';
import styled from 'styled-components';

const TreasuryProposalSuccessPopup = dynamic(() => import('~src/components/OpenGovTreasuryProposal/TreasuryProposalSuccess'), {
	ssr: false
});

const WriteProposal = dynamic(() => import('../../OpenGovTreasuryProposal/WriteProposal'), {
	ssr: false
});

const AddressConnectModal = dynamic(() => import('src/ui-components/AddressConnectModal'), {
	ssr: false
});

const CreateBounty = dynamic(() => import('./CreateBounty'), {
	ssr: false
});
const CreateReferendum = dynamic(() => import('./CreateReferendum'), {
	ssr: false
});

const ZERO_BN = new BN(0);

interface Props {
	referendaModal?: number;
	className?: string;
	openAddressLinkedModal?: boolean;
	setOpenAddressLinkedModal?: (pre: boolean) => void;
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	openLoginPrompt: boolean;
	setOpenLoginPrompt: (pre: boolean) => void;
	setProposerAddress: (pre: string) => void;
	proposerAddress: string;
	theme?: string;
}

enum ESteps {
	WRITE_PROPOSAL = 'Write a Proposal',
	CREATE_BOUNTY = 'Create Bounty',
	CREATE_REFERENDUM = 'Create Referendum'
}

const BountyActionModal = ({
	className,
	openAddressLinkedModal,
	setOpenAddressLinkedModal,
	openModal,
	setOpenModal,
	openLoginPrompt,
	setOpenLoginPrompt,
	proposerAddress,
	setProposerAddress,
	theme
}: Props) => {
	const [closeConfirm, setCloseConfirm] = useState<boolean>(false);
	const [steps, setSteps] = useState<ISteps>({ percent: 0, step: 0 });
	const [writeProposalForm] = Form.useForm();
	const [createBountyForm] = Form.useForm();
	const [createReferendumForm] = Form.useForm();
	const [title, setTitle] = useState<string>('');
	const [content, setContent] = useState<string>('');
	const [tags, setTags] = useState<string[]>([]);
	const [isDiscussionLinked, setIsDiscussionLinked] = useState<boolean | null>(null);
	const [discussionLink, setDiscussionLink] = useState<string>('');
	const [openSuccess, setOpenSuccess] = useState<boolean>(false);
	const [postId, setPostId] = useState<number | null>(null);
	const [selectedTrack, setSelectedTrack] = useState('');
	const [isPreimage, setIsPreimage] = useState<boolean | null>(null);
	const [preimageHash, setPreimageHash] = useState<string>('');
	const [preimageLength, setPreimageLength] = useState<number | null>(null);
	const [isBounty, setIsBounty] = useState<boolean | null>(null);
	const [allowedCommentors, setAllowedCommentors] = useState<EAllowedCommentor>(EAllowedCommentor.ALL);
	// const [preimage, setPreimage] = useState<IPreimage | undefined>();
	const [enactment, setEnactment] = useState<IEnactment>({ key: EEnactment.After_No_Of_Blocks, value: BN_HUNDRED });
	const [bountyAmount, setBountyAmount] = useState<BN>(ZERO_BN);
	const [bountyId, setBountyId] = useState<number | null>(null);

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
		setIsPreimage(null);
		setPreimageLength(0);
		setPreimageHash('');
		setSelectedTrack('');
		writeProposalForm.resetFields();
		setSteps({ percent: 0, step: 0 });
		setOpenModal(false);
		setCloseConfirm(false);
		setBountyAmount(ZERO_BN);
		setBountyId(null);
		setPostId(null);
	};

	return (
		<div className={className}>
			{openAddressLinkedModal && (
				<AddressConnectModal
					open={openAddressLinkedModal}
					setOpen={setOpenAddressLinkedModal as any}
					isProposalCreation
					closable
					linkAddressNeeded
					accountSelectionFormTitle='Select Proposer Address'
					onConfirm={(address: string) => {
						setOpenModal(true);
						setProposerAddress(address);
					}}
					walletAlertTitle={'Creating a Bounty Proposal'}
					accountAlertTitle='Please install a wallet and create an address to start creating a proposal.'
					localStorageWalletKeyName='treasuryProposalProposerWallet'
					localStorageAddressKeyName='treasuryProposalProposerAddress'
					usedInIdentityFlow={false}
				/>
			)}

			{/* cross button modal */}
			<Modal
				maskClosable={false}
				open={closeConfirm}
				onCancel={() => {
					setCloseConfirm(true);
					setOpenModal(false);
				}}
				footer={false}
				className={`${dmSans.className} ${dmSans.variable} opengov-proposals w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				closable={false}
				title={
					<div className='items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						Exit Proposal Creation
					</div>
				}
			>
				<div className='mt-6'>
					<span className='text-sm text-bodyBlue dark:text-blue-dark-high'>
						Your proposal information (Title, Description & Tags) would be lost. Are you sure you want to exit proposal creation process?{' '}
					</span>
					<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<CustomButton
							onClick={handleClose}
							buttonsize='sm'
							text='Yes, Exit'
							variant='solid'
						/>
						<CustomButton
							onClick={() => {
								setCloseConfirm(false);
								setOpenModal(true);
							}}
							height={40}
							width={200}
							text='No, Continue Editing'
							variant='solid'
						/>
					</div>
				</div>
			</Modal>

			{/* main modal */}
			<Modal
				open={openModal}
				maskClosable={false}
				onCancel={() => {
					setCloseConfirm(true);
					setOpenModal(false);
				}}
				footer={false}
				className={`${dmSans.className} ${dmSans.variable} opengov-proposals w-[720px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				closeIcon={<CloseIcon className='mt-2 text-lightBlue dark:text-icon-dark-inactive' />}
				title={
					<div className='flex items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						{theme === 'dark' ? <CreateProposalIconDark /> : <CreateProposalIcon />}
						Create Bounty Proposal
					</div>
				}
			>
				<div className='mt-6'>
					<Steps
						className='font-medium text-bodyBlue dark:text-blue-dark-high'
						percent={steps.percent}
						current={steps.step}
						size='default'
						labelPlacement='vertical'
						items={[
							{
								title: <span className='text-sm font-medium text-blue-light-high dark:text-blue-dark-high'>{ESteps.WRITE_PROPOSAL}</span>
							},
							{
								title: <span className='text-sm font-medium text-blue-light-high dark:text-blue-dark-high'>{ESteps.CREATE_BOUNTY}</span>
							},
							{
								title: <span className='text-sm font-medium text-blue-light-high dark:text-blue-dark-high'>{ESteps.CREATE_REFERENDUM}</span>
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
							setAllowedCommentors={setAllowedCommentors}
							allowedCommentors={allowedCommentors}
						/>
					)}
					{steps?.step === 1 && (
						<CreateBounty
							setSteps={setSteps}
							setIsBounty={setIsBounty}
							isBounty={isBounty}
							form={createBountyForm}
							proposerAddress={proposerAddress}
							bountyAmount={bountyAmount}
							setBountyAmount={setBountyAmount}
							bountyId={bountyId}
							title={title}
							content={content}
							setBountyId={setBountyId}
							allowedCommentors={allowedCommentors}
						/>
					)}
					{steps?.step === 2 && (
						<>
							<CreateReferendum
								setSteps={setSteps}
								form={createReferendumForm}
								isPreimage={isPreimage}
								setIsPreimage={setIsPreimage}
								enactment={enactment}
								setEnactment={setEnactment}
								selectedTrack={selectedTrack}
								setSelectedTrack={setSelectedTrack}
								setPostId={setPostId}
								setOpenModal={setOpenModal}
								setOpenSuccess={setOpenSuccess}
								proposerAddress={proposerAddress}
								discussionLink={discussionLink}
								allowedCommentors={allowedCommentors}
								preimageLength={preimageLength}
								preimageHash={preimageHash}
								tags={tags}
								content={content}
								title={title}
								setPreimageHash={setPreimageHash}
								bountyAmount={bountyAmount}
								setPreimageLength={setPreimageLength}
								setBountyAmount={setBountyAmount}
								bountyId={bountyId}
								postId={postId}
							/>
						</>
					)}
				</div>
			</Modal>
			<TreasuryProposalSuccessPopup
				open={openSuccess}
				onCancel={() => {
					setOpenSuccess(false);
					handleClose();
				}}
				postId={bountyId || undefined}
				selectedTrack={selectedTrack}
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

export default styled(BountyActionModal)`
	.opengov-proposals .ant-progress .ant-progress-inner:not(.ant-progress-circle-gradient) .ant-progress-circle-path {
		stroke: var(--pink_primary);
		stroke-width: 6px;
		background: red;
	}
	.opengov-proposals .ant-steps .ant-steps-item-wait .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon {
		font-size: 14px !important;
		color: #7788a1 !important;
		font-weight: 700 !important;
	}
	.opengov-proposals .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon {
		font-size: 14px !important;
		font-weight: 700 !important;
	}
	.opengov-proposals .ant-steps .ant-steps-item-wait .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
	.opengov-proposals .ant-steps .ant-steps-item-finish .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
	.opengov-proposals .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title {
		font-size: 14px !important;
		color: #96a4b6 !important;
		line-height: 21px !important;
		font-weight: 500 !important;
	}
	.opengov-proposals .ant-steps .ant-steps-item-finish .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
	.opengov-proposals .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title {
		color: var(--bodyBlue) !important;
	}
	.opengov-proposals .ant-steps .ant-steps-item-wait .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title {
		color: #96a4b6 !important;
	}
	.ant-steps .ant-steps-item .ant-steps-item-container .ant-steps-item-tail {
		top: 0px !important;
		padding: 4px 15px !important;
	}
	.opengov-proposals .ant-steps .ant-steps-item-wait > .ant-steps-item-container > .ant-steps-item-tail::after,
	.opengov-proposals .ant-steps .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-tail::after,
	.opengov-proposals .ant-steps .ant-steps-item-tail::after {
		background-color: #d2d8e0 !important;
	}
	.opengov-proposals .ant-steps.ant-steps-label-vertical .ant-steps-item-content {
		width: 100% !important;
		display: flex !important;
		margin-top: 8px;
	}
	.opengov-proposals .ant-steps .ant-steps-item-finish .ant-steps-item-icon {
		background: #51d36e;
		border: none !important;
	}
	.opengov-proposals .ant-steps .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
		color: white !important;
	}
	.opengov-proposals .ant-steps .ant-steps-item-finish .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
	.opengov-proposals .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title {
		color: ${(props) => (props.theme === 'dark' ? 'white' : '#243A57')} !important;
	}
	input::placeholder {
		color: #7c899b;
		font-weight: 400 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
	}
	.ant-steps .ant-steps-item-wait .ant-steps-item-icon {
		background-color: ${(props) => (props.theme === 'dark' ? '#dde4ed' : 'rgba(0, 0, 0, 0.06)')} !important;
	}
`;
