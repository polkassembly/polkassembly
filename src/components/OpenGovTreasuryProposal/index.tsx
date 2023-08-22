// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect, useState } from 'react';
import BN from 'bn.js';
import { poppins } from 'pages/_app';
import styled from 'styled-components';
import { Button, Form, Modal, Steps } from 'antd';
import WriteProposal from './WriteProposal';
import CreatePreimage from './CreatePreimage';
import CreateProposal from './CreateProposal';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import TreasuryProposalSuccessPopup from './TreasuryProposalSuccess';
import { HexString } from '@polkadot/util/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import CloseIcon from '~assets/icons/close.svg';
import CreateProposalIcon from '~assets/openGovProposals/create_proposal.svg';
import { BN_HUNDRED } from '@polkadot/util';
import { CreatePropoosalIcon } from '~src/ui-components/CustomIcons';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import { UserDetailsContext } from '~src/context/UserDetailsContext';

interface Props{
  className?: string;
}

export interface ISteps{
  step: number;
  percent: number;
}

export enum EEnactment{
At_Block_No = 'at_block_number',
After_No_Of_Blocks = 'after_no_of_Blocks'
}

enum ESteps{
  Write_Proposal = 'Write a Proposal',
  Create_Preimage = 'Create Preimage',
  Create_Proposal = 'Create Proposal'
}

export interface IEnactment{
  key: EEnactment | null;
  value: BN | null;
}

export interface IPreimage{
  encodedProposal: HexString | null ;
  notePreimageTx: SubmittableExtrinsic<'promise'> | null ;
  preimageHash: string;
	preimageLength : number;
	storageFee:BN;
}
const ZERO_BN = new BN(0);
const OpenGovTreasuryProposal = ({ className }: Props) => {

	const [openModal, setOpenModal] = useState<boolean>(false);
	const [steps, setSteps] = useState<ISteps>({ percent: 0, step: 0 });
	const [isDiscussionLinked, setIsDiscussionLinked] = useState<boolean | null>(null);
	const [isPreimage, setIsPreimage] = useState<boolean | null>(null);
	const [discussionLink, setDiscussionLink] = useState<string>('');
	const [preimageHash, setPreimageHash] = useState<string>('');
	const [preimageLength, setPreimageLength] = useState<number | null>(null);
	const [proposerAddress, setProposerAddress] = useState<string>('');
	const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>('');
	const [fundingAmount, setFundingAmount] = useState<BN>(ZERO_BN);
	const [tags, setTags] = useState<string[]>([]);
	const [content, setContent] = useState<string>('');
	const [title, setTitle] = useState<string>('');
	const [selectedTrack, setSelectedTrack] = useState('');
	const [enactment, setEnactment] = useState<IEnactment>({ key: EEnactment.After_No_Of_Blocks , value: BN_HUNDRED });
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const [preimage, setPreimage] = useState<IPreimage | undefined>();
	const [writeProposalForm] = Form.useForm();
	const [createPreimageForm] = Form.useForm();
	const [closeConfirm, setCloseConfirm] = useState<boolean>(false);
	const [openSuccess, setOpenSuccess] = useState<boolean>(false);
	const [postId, setPostId] = useState<number>(0);
	const { id } = useContext(UserDetailsContext);
	const [openLoginPrompt, setOpenLoginPrompt] = useState<boolean>(false);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);

	const handleClose = () => {
		setProposerAddress('');
		setPreimage(undefined);
		setIsDiscussionLinked(null);
		setDiscussionLink('');
		setTitle('');
		setTags([]);
		setContent('');
		setIsPreimage(null);
		setPreimageLength(0);
		setPreimageHash('');
		setPreimage(undefined);
		setSelectedTrack('');
		setEnactment({ key: null, value: null });
		localStorage.removeItem('treasuryProposalProposerAddress');
		localStorage.removeItem('treasuryProposalProposerWallet');
		localStorage.removeItem('treasuryProposalData');
		writeProposalForm.resetFields();
		createPreimageForm.resetFields();
		setSteps({ percent: 0, step: 0 });
		setOpenModal(false);
		setCloseConfirm(false);
	};

	useEffect(() => {
		const address = localStorage.getItem('treasuryProposalProposerAddress') || '';
		setProposerAddress(address);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [title]);

	const handleClick = () => {
		if(id){
			proposerAddress.length > 0 ? setOpenModal(!openModal) : setOpenAddressLinkedModal(true);
		}else{
			setOpenLoginPrompt(true);
		}
	};

	return <div className={className}>
		<div className='ml-[-37px] flex justify-center text-[35px] items-center align-middle text-lightBlue hover:text-blue-light-high dark:text-blue-dark-high hover:bg-[#e5007a12] transition duration-300 delay-150 min-w-[290px] rounded-[8px] cursor-pointer'
			onClick={ handleClick }
		>
			<CreatePropoosalIcon className='cursor-pointer ml-[-31px]' />
			<p className='ml-4 mt-2.5 mb-3 font-medium text-sm leading-5 tracking-[1.25%] '>Create Treasury Proposal</p>
		</div>
		<AddressConnectModal localStorageWalletKeyName='treasuryProposalProposerWallet' linkAddressNeeded closable localStorageAddressKeyName ='treasuryProposalProposerAddress' open={openAddressLinkedModal} setOpen={setOpenAddressLinkedModal} onConfirm={() => setOpenModal(true)} />
		<Modal
			maskClosable={false}
			open={closeConfirm}
			onCancel={() => {setCloseConfirm(true); setOpenModal(false);}}
			footer={false}
			className={`${poppins.className} ${poppins.variable} w-[600px] opengov-proposals`}
			wrapClassName={className}
			closable={false}
			title={<div className='text-lg font-semibold text-blue-light-high dark:text-blue-dark-high items-center gap-2 border-0 border-b-[1px] px-6 pb-4 border-solid border-[#D2D8E0]'>
        Exit Treasury Proposal Creation
			</div>}>
			<div className='px-6 mt-6'>
				<span className='text-blue-light-high dark:text-blue-dark-high text-sm'>Your treasury proposal information (Title, Description & Tags) would be lost. Are you sure you want to exit proposal creation process? </span>
				<div className='flex justify-end mt-6 -mx-6 border-0 border-solid border-t-[1px] border-[#D2D8E0] px-6 pt-4 gap-4'>
					<Button onClick={handleClose} className='font-medium tracking-[0.05em] text-pink_primary border-pink_primary text-sm w-[145px] h-[38px] rounded-[4px]'>Yes, Exit</Button>
					<Button onClick={() => {setCloseConfirm(false); setOpenModal(true);}} className={'bg-pink_primary text-white font-medium tracking-[0.05em] text-sm h-[40px] rounded-[4px] w-[200px]'}>No, Continue Editing</Button>
				</div>
			</div>
		</Modal>
		<TreasuryProposalSuccessPopup
			open={openSuccess}
			onCancel={() => {setOpenSuccess(false); handleClose();}}
			selectedTrack={selectedTrack}
			proposerAddress={proposerAddress}
			beneficiaryAddress={beneficiaryAddress}
			fundingAmount={fundingAmount}
			preimageHash={preimageHash}
			preimageLength={preimageLength}
			postId={postId}
		/>

		<Modal
			open={openModal}
			maskClosable={false}
			onCancel={() => {setCloseConfirm(true); setOpenModal(false);}}
			footer={false}
			className={`${poppins.className} ${poppins.variable} w-[600px] opengov-proposals`}
			wrapClassName={className}
			closeIcon={<CloseIcon/>}
			title={<div className='text-lg font-semibold flex text-blue-light-high dark:text-blue-dark-high items-center gap-2 border-0 border-b-[1px] px-6 pb-4 border-solid border-[#D2D8E0]'>
				<CreateProposalIcon/>Create Treasury Proposal
			</div>}
		>
			<div className='px-6 mt-6'>
				<Steps
					className='font-medium text-blue-light-high dark:text-blue-dark-high'
					percent={steps.percent}
					current={steps.step}
					size='default'
					labelPlacement='vertical'
					items={[{
						title: ESteps.Write_Proposal
					},
					{
						title: ESteps.Create_Preimage
					},
					{
						title: ESteps.Create_Proposal
					}]}
				/>
				{steps?.step === 0 && <WriteProposal
					form={writeProposalForm}
					setSteps={setSteps} title={title}
					content={content}
					tags={tags}
					isDiscussionLinked={isDiscussionLinked}
					setIsDiscussionLinked={setIsDiscussionLinked}
					discussionLink={discussionLink}
					setDiscussionLink={setDiscussionLink}
					setTags={setTags}
					setContent={setContent}
					setTitle={setTitle}
				/>}

				{steps?.step === 1 && <CreatePreimage
					availableBalance={availableBalance}
					setAvailableBalance={setAvailableBalance}
					preimageLength={preimageLength}
					setPreimageLength={setPreimageLength}
					preimage={preimage}
					form={createPreimageForm}
					setPreimage={setPreimage}
					setSteps={setSteps}
					setIsPreimage={setIsPreimage}
					isPreimage={isPreimage}
					preimageHash={preimageHash}
					setPreimageHash={setPreimageHash}
					proposerAddress={proposerAddress}
					beneficiaryAddress={beneficiaryAddress}
					setBeneficiaryAddress={setBeneficiaryAddress}
					fundingAmount={fundingAmount}
					setFundingAmount={setFundingAmount}
					selectedTrack={selectedTrack}
					setSelectedTrack={setSelectedTrack}
					enactment={enactment}
					setEnactment={setEnactment}
				/>}

				{(steps.step === 2) && <CreateProposal
					discussionLink={discussionLink}
					availableBalance={availableBalance}
					title={title}
					content={content}
					tags={tags}
					postId={postId}
					setPostId={setPostId}
					setOpenSuccess={setOpenSuccess}
					setOpenModal={setOpenModal}
					beneficiaryAddress={beneficiaryAddress}
					enactment={enactment}
					isPreimage={Boolean(isPreimage)}
					proposerAddress={proposerAddress}
					fundingAmount={fundingAmount}
					selectedTrack={selectedTrack}
					preimageHash={preimageHash}
					preimageLength={preimageLength} />}
			</div>
		</Modal>

		<ReferendaLoginPrompts
			modalOpen={openLoginPrompt}
			setModalOpen={setOpenLoginPrompt}
			image="/assets/referenda-endorse.png"
			title="Join Polkassembly to start creating a proposal."
			subtitle="Please login with a desktop computer to start creating a proposal."
		/>

	</div>;
};
export default styled(OpenGovTreasuryProposal)`
.opengov-proposals .ant-modal-content{
	padding: 16px 0px !important;
}
.opengov-proposals .ant-modal-close{
	margin-top: 2px;
}
.opengov-proposals .ant-progress .ant-progress-inner:not(.ant-progress-circle-gradient) .ant-progress-circle-path{
	stroke: var(--pink_primary);
	stroke-width: 6px;
	background: red;
}
.opengov-proposals .ant-steps .ant-steps-item-wait .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon{
	font-size: 14px !important;
	color: #7788a1 !important;
	font-weight: 700 !important;
}
.opengov-proposals .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon{
	font-size: 14px !important;
	font-weight: 700 !important;
}
.opengov-proposals .ant-steps .ant-steps-item-wait .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
.opengov-proposals .ant-steps .ant-steps-item-finish .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
.opengov-proposals .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title{
	font-size: 14px !important;
	color: #96A4B6 !important;
	line-height: 21px !important;
	font-weight: 500 !important;
}
.opengov-proposals .ant-steps .ant-steps-item-finish .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
.opengov-proposals .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title{
	color: var(--bodyBlue) !important;
}
.opengov-proposals .ant-steps .ant-steps-item-wait .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title{
	color: #96A4B6 !important;
}
.ant-steps .ant-steps-item .ant-steps-item-container .ant-steps-item-tail{
	top:0px !important;
	padding: 4px 15px !important;
}
.opengov-proposals .ant-steps .ant-steps-item-wait>.ant-steps-item-container>.ant-steps-item-tail::after,
.opengov-proposals .ant-steps .ant-steps-item-process>.ant-steps-item-container>.ant-steps-item-tail::after,
.opengov-proposals .ant-steps .ant-steps-item-tail::after{
	background-color: #D2D8E0 !important;
}
.opengov-proposals .ant-steps.ant-steps-label-vertical .ant-steps-item-content{
	width: 100% !important;
	display: flex !important;
	margin-top: 8px;
}
.opengov-proposals .ant-steps .ant-steps-item-finish .ant-steps-item-icon{
	background: #51D36E;
	border: none !important;
}
.opengov-proposals .ant-steps .ant-steps-item-finish .ant-steps-item-icon >.ant-steps-icon {
	color:white !important;
}
.ant-input{
   color:var(--bodyBlue) !important;
   font-weight: 400;
}
input::placeholder {
	color:#7c899b;
	font-weight: 400 !important;
	font-size: 14px !important;
	line-height: 21px !important;
	letter-spacing: 0.0025em !important;
}
`;