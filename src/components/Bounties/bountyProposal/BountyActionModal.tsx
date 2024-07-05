// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Modal, Steps } from 'antd';
import dynamic from 'next/dynamic';
import { poppins } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { EEnactment, IEnactment, IPreimage, ISteps } from '~src/components/OpenGovTreasuryProposal';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import CreateProposalIcon from '~assets/openGovProposals/create_proposal.svg';
import CreateProposalIconDark from '~assets/openGovProposals/create_proposal_white.svg';
import { EAllowedCommentor } from '~src/types';
import BN from 'bn.js';
import { BN_HUNDRED } from '@polkadot/util';
// import { useTheme } from 'next-themes';

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

enum ESteps {
	WRITE_PROPOSAL = 'Write a Proposal',
	CREATE_BOUNTY = 'Create Bounty',
	CREATE_REFERENDUM = 'Create Referendum'
}

const BountyActionModal = ({
	referendaModal,
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
	const { network } = useNetworkSelector();
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
	const [postId, setPostId] = useState(0);
	const [selectedTrack, setSelectedTrack] = useState('');
	const [isPreimage, setIsPreimage] = useState<boolean | null>(null);
	const [preimageHash, setPreimageHash] = useState<string>('');
	const [preimageLength, setPreimageLength] = useState<number | null>(null);
	const [isBounty, setIsBounty] = useState<boolean | null>(null);
	const [allowedCommentors, setAllowedCommentors] = useState<EAllowedCommentor>(EAllowedCommentor.ALL);
	const [preimage, setPreimage] = useState<IPreimage | undefined>();
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
	};

	useEffect(() => {}, [network]);

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
				className={`${poppins.className} ${poppins.variable} opengov-proposals w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
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

			{/* main modal */}
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
				closeIcon={<CloseIcon className='mt-2 text-lightBlue dark:text-icon-dark-inactive' />}
				title={
					<div className='flex items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						{theme === 'dark' ? <CreateProposalIconDark /> : <CreateProposalIcon />}
						Create Bounty Proposal
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
							setBountyId={setBountyId}
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
							/>
						</>
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

export default BountyActionModal;
