// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import Loader from '~src/ui-components/Loader';
import dynamic from 'next/dynamic';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { Form, Modal, Steps } from 'antd';
import { dmSans } from 'pages/_app';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import CreateProposalIcon from '~assets/openGovProposals/create_proposal.svg';
import CreateProposalIconDark from '~assets/openGovProposals/create_proposal_white.svg';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ISteps } from '../OpenGovTreasuryProposal';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import styled from 'styled-components';
import TreasuryProposalSuccessPopup from '~src/components/OpenGovTreasuryProposal/TreasuryProposalSuccess';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { CreatePostResponseType } from '~src/auth/types';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus, PostOrigin, EReferendumType, EKillOrCancel, EAllowedCommentor } from '~src/types';

const AddressConnectModal = dynamic(() => import('src/ui-components/AddressConnectModal'), {
	ssr: false
});

const CancelOrKillReferendaForm = dynamic(() => import('./CancelOrKillReferendaForm'), {
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
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	openLoginPrompt: boolean;
	setOpenLoginPrompt: (pre: boolean) => void;
	setProposerAddress: (pre: string) => void;
	proposerAddress: string;
	theme?: string;
}

const getDiscussionIdFromLink = (discussion: string) => {
	const splitedArr = discussion?.split('/');
	return splitedArr[splitedArr.length - 1];
};

const ReferendaActionModal = ({
	referendaModal,
	className,
	openAddressLinkedModal,
	setOpenAddressLinkedModal,
	openModal,
	setOpenModal,
	openLoginPrompt,
	setOpenLoginPrompt,
	setProposerAddress,
	proposerAddress,
	theme
}: Props) => {
	const { network } = useNetworkSelector();
	const [closeConfirm, setCloseConfirm] = useState<boolean>(false);
	const [steps, setSteps] = useState<ISteps>({ percent: 0, step: 0 });
	const [writeProposalForm] = Form.useForm();
	const [title, setTitle] = useState<string>('');
	const [content, setContent] = useState<string>('');
	const [tags, setTags] = useState<string[]>([]);
	const [isDiscussionLinked, setIsDiscussionLinked] = useState<boolean | null>(null);
	const [discussionLink, setDiscussionLink] = useState<string>('');
	const [openSuccess, setOpenSuccess] = useState<boolean>(false);
	const { id: userId } = useUserDetailsSelector();
	const [postId, setPostId] = useState(0);
	const [selectedTrack, setSelectedTrack] = useState('');
	const [isPreimage, setIsPreimage] = useState<boolean | null>(null);
	const [preimageHash, setPreimageHash] = useState<string>('');
	const [preimageLength, setPreimageLength] = useState<number | null>(null);
	const [allowedCommentors, setAllowedCommentors] = useState<EAllowedCommentor>(EAllowedCommentor.ALL);

	const handleCreateDiscussion = async (postId: number) => {
		setPostId(postId);
		const discussionId = discussionLink ? getDiscussionIdFromLink(discussionLink) : null;
		const { data, error: apiError } = await nextApiClientFetch<CreatePostResponseType>('api/v1/auth/actions/createTreasuryProposal', {
			allowedCommentors: allowedCommentors ? [allowedCommentors] : [EAllowedCommentor.ALL],
			content,
			discussionId: discussionId || null,
			postId,
			proposerAddress,
			tags,
			title,
			typeOfReferendum: referendaModal === 3 ? EReferendumType.KILL : referendaModal === 2 ? EReferendumType.CANCEL : EReferendumType.OTHER,
			userId
		});

		if (apiError || !data?.post_id) {
			queueNotification({
				header: 'Error',
				message: apiError,
				status: NotificationStatus.ERROR
			});
			console.error(apiError);
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
		setIsPreimage(null);
		setPreimageLength(0);
		setPreimageHash('');
		setSelectedTrack('');
		writeProposalForm.resetFields();
		setSteps({ percent: 0, step: 0 });
		setOpenModal(false);
		setCloseConfirm(false);
	};

	useEffect(() => {}, [network]);

	const successPopupProps = {
		isCancelReferendaForm: referendaModal === 2,
		isCreateReferendumForm: referendaModal === 1,
		isKillReferendumForm: referendaModal === 3
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
					walletAlertTitle={
						referendaModal === 1
							? 'Creating a Referendum'
							: referendaModal === 2
								? 'Cancelling a Referendum'
								: referendaModal === 3
									? 'Killing a Referendum'
									: 'Treasury Proposal Creation'
					}
					accountAlertTitle='Please install a wallet and create an address to start creating a proposal.'
					localStorageWalletKeyName='treasuryProposalProposerWallet'
					localStorageAddressKeyName='treasuryProposalProposerAddress'
					usedInIdentityFlow={false}
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
				className={`${dmSans.className} ${dmSans.variable} opengov-proposals w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				closable={false}
				title={
					<div className='items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						Exit Proposal Creation
					</div>
				}
			>
				<div className='mt-6 px-6'>
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
			<Modal
				open={openModal}
				maskClosable={true}
				onCancel={() => {
					setCloseConfirm(true);
					setOpenModal(false);
				}}
				footer={false}
				className={`${dmSans.className} ${dmSans.variable} opengov-proposals w-[720px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				title={
					<div className='flex items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
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
							setAllowedCommentors={setAllowedCommentors}
							allowedCommentors={allowedCommentors}
							setTitle={setTitle}
						/>
					)}

					{steps?.step === 1 && (
						<>
							{referendaModal === 1 && (
								<CreateReferendaForm
									setSteps={setSteps}
									setOpenSuccess={setOpenSuccess}
									handleClose={handleClose}
									afterProposalCreated={handleCreateDiscussion}
									selectedTrack={selectedTrack}
									setSelectedTrack={setSelectedTrack}
									isPreimage={isPreimage}
									setIsPreimage={setIsPreimage}
									preimageHash={preimageHash}
									setPreimageHash={setPreimageHash}
									preimageLength={preimageLength}
									setPreimageLength={setPreimageLength}
								/>
							)}
							{referendaModal === 2 && (
								<CancelOrKillReferendaForm
									setSteps={setSteps}
									type={EKillOrCancel.CANCEL}
									setOpenSuccess={setOpenSuccess}
									handleClose={handleClose}
									afterProposalCreated={handleCreateDiscussion}
								/>
							)}
							{referendaModal === 3 && (
								<CancelOrKillReferendaForm
									setSteps={setSteps}
									type={EKillOrCancel.KILL}
									setOpenSuccess={setOpenSuccess}
									handleClose={handleClose}
									afterProposalCreated={handleCreateDiscussion}
								/>
							)}
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
				postId={postId}
				selectedTrack={referendaModal === 3 ? PostOrigin.REFERENDUM_KILLER : referendaModal === 2 ? PostOrigin.REFERENDUM_CANCELLER : selectedTrack}
				{...successPopupProps}
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

export default styled(ReferendaActionModal)`
	.opengov-proposals .ant-modal-content {
		padding: 16px 0px !important;
	}
	.opengov-proposals .ant-modal-close {
		margin-top: 2px;
	}
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
