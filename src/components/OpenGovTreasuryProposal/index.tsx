// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useReducer, useState } from 'react';
import BN from 'bn.js';
import { poppins } from 'pages/_app';
import styled from 'styled-components';
import { Button, Form, Modal, Steps } from 'antd';
import WriteProposal from './WriteProposal';
import CreatePreimage from './CreatePreimage';
import CreateProposal from './CreateProposal';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import { HexString } from '@polkadot/util/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import CreateProposalIcon from '~assets/openGovProposals/create_proposal.svg';
import CreateProposalIconDark from '~assets/openGovProposals/create_proposal_white.svg';
import { BN_HUNDRED } from '@polkadot/util';
import { CloseIcon, CreatePropoosalIcon } from '~src/ui-components/CustomIcons';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import { useApiContext } from '~src/context';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';
import { useTheme } from 'next-themes';
import { IBeneficiary } from '~src/types';
import TreasuryProposalSuccessPopup from './TreasuryProposalSuccess';
interface Props {
	className?: string;
	theme?: string;
}

export interface ISteps {
	step: number;
	percent: number;
}

export enum EEnactment {
	At_Block_No = 'at_block_number',
	After_No_Of_Blocks = 'after_no_of_Blocks'
}

enum ESteps {
	Write_Proposal = 'Write a Proposal',
	Create_Preimage = 'Create Preimage',
	Create_Proposal = 'Create Proposal'
}

export interface IEnactment {
	key: EEnactment | null;
	value: BN | null;
}

export interface IPreimage {
	encodedProposal: HexString | null;
	notePreimageTx: SubmittableExtrinsic<'promise'> | null;
	preimageHash: string;
	preimageLength: number;
	storageFee: BN;
}
const ZERO_BN = new BN(0);

export enum EBeneficiaryAddressesActionType {
	UPDATE_ADDRESS,
	UPDATE_AMOUNT,
	REMOVE_ALL,
	REPLACE_ALL_WITH_ONE,
	REPLACE_STATE,
	ADD
}

export interface EBeneficiaryAddressesAction {
	type: EBeneficiaryAddressesActionType;
	payload: {
		index: number;
		address: string;
		amount: string;
		newState?: IBeneficiary[];
	};
}

const beneficiaryAddressesReducer = (state: IBeneficiary[], action: EBeneficiaryAddressesAction) => {
	switch (action.type) {
		case EBeneficiaryAddressesActionType.UPDATE_ADDRESS:
			return state.map((beneficiary, index) => {
				if (index === action.payload.index) {
					return { ...beneficiary, address: action.payload.address, amount: beneficiary.amount ?? ZERO_BN.toString() };
				} else {
					return beneficiary;
				}
			});
		case EBeneficiaryAddressesActionType.UPDATE_AMOUNT:
			return state.map((beneficiary, index) => {
				if (index === action.payload.index) {
					return { ...beneficiary, address: beneficiary.address ?? '', amount: action.payload.amount };
				} else {
					return beneficiary;
				}
			});
		case EBeneficiaryAddressesActionType.REMOVE_ALL:
			return INIT_BENEFICIARIES;
		case EBeneficiaryAddressesActionType.REPLACE_ALL_WITH_ONE:
			return [{ address: action.payload.address, amount: action.payload.amount }];
		case EBeneficiaryAddressesActionType.ADD:
			return [...state, { address: '', amount: ZERO_BN.toString() } as IBeneficiary];
		case EBeneficiaryAddressesActionType.REPLACE_STATE:
			return action.payload.newState || INIT_BENEFICIARIES;
		default:
			return state;
	}
};

export const INIT_BENEFICIARIES = [
	{
		address: '',
		amount: ZERO_BN.toString()
	}
];

const OpenGovTreasuryProposal = ({ className }: Props) => {
	const { api, apiReady } = useApiContext();

	const [beneficiaryAddresses, dispatchBeneficiaryAddresses] = useReducer(beneficiaryAddressesReducer, INIT_BENEFICIARIES);

	const [openModal, setOpenModal] = useState<boolean>(false);
	const [steps, setSteps] = useState<ISteps>({ percent: 0, step: 0 });
	const [isDiscussionLinked, setIsDiscussionLinked] = useState<boolean | null>(null);
	const [isPreimage, setIsPreimage] = useState<boolean | null>(null);
	const [discussionLink, setDiscussionLink] = useState<string>('');
	const [preimageHash, setPreimageHash] = useState<string>('');
	const [preimageLength, setPreimageLength] = useState<number | null>(null);
	const [proposerAddress, setProposerAddress] = useState<string>('');
	const [fundingAmount, setFundingAmount] = useState<BN>(ZERO_BN);
	const [tags, setTags] = useState<string[]>([]);
	const [content, setContent] = useState<string>('');
	const [title, setTitle] = useState<string>('');
	const [selectedTrack, setSelectedTrack] = useState('');
	const [enactment, setEnactment] = useState<IEnactment>({ key: EEnactment.After_No_Of_Blocks, value: BN_HUNDRED });
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);
	const [preimage, setPreimage] = useState<IPreimage | undefined>();
	const [writeProposalForm] = Form.useForm();
	const [createPreimageForm] = Form.useForm();
	const [closeConfirm, setCloseConfirm] = useState<boolean>(false);
	const [openSuccess, setOpenSuccess] = useState<boolean>(false);
	const [postId, setPostId] = useState<number>(0);
	const { id } = useUserDetailsSelector();
	const [openLoginPrompt, setOpenLoginPrompt] = useState<boolean>(false);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [isUpdatedAvailableBalance, setIsUpdatedAvailableBalance] = useState<boolean>(false);
	const currentUser = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();

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
		if (!api || !apiReady || !proposerAddress) return;
		setIsUpdatedAvailableBalance(!isUpdatedAvailableBalance);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [title, api, apiReady, preimage, postId]);

	const handleClick = () => {
		// GAEvent for treasury proposal creation
		trackEvent('proposal_creation', 'clicked_create_treasury_proposal', {
			isWeb3Login: currentUser?.web3signup,
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});

		if (id) {
			proposerAddress.length > 0 ? setOpenModal(!openModal) : setOpenAddressLinkedModal(true);
		} else {
			setOpenLoginPrompt(true);
		}
	};

	return (
		<div className={className}>
			<div
				className='ml-[-37px] flex min-w-[290px] cursor-pointer items-center justify-center rounded-[8px] align-middle text-[35px] text-lightBlue transition delay-150 duration-300 hover:bg-[#e5007a12] hover:text-bodyBlue dark:text-blue-dark-high'
				onClick={handleClick}
			>
				<CreatePropoosalIcon className='ml-[-31px] cursor-pointer' />
				<p className='mb-3 ml-4 mt-2.5 text-sm font-medium leading-5 tracking-[1.25%] dark:text-blue-dark-medium'>Create Treasury Proposal</p>
			</div>
			{openAddressLinkedModal && (
				<AddressConnectModal
					open={openAddressLinkedModal}
					setOpen={setOpenAddressLinkedModal}
					isProposalCreation
					closable
					linkAddressNeeded
					accountSelectionFormTitle='Select Proposer Address'
					onConfirm={() => setOpenModal(true)}
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
						<Button
							onClick={handleClose}
							className='h-[38px] w-[145px] rounded-[4px] border-pink_primary text-sm font-medium tracking-[0.05em] text-pink_primary dark:bg-transparent'
						>
							Yes, Exit
						</Button>
						<Button
							onClick={() => {
								setCloseConfirm(false);
								setOpenModal(true);
							}}
							className={'h-[40px] w-[200px] rounded-[4px] bg-pink_primary text-sm font-medium tracking-[0.05em] text-white'}
						>
							No, Continue Editing
						</Button>
					</div>
				</div>
			</Modal>
			<TreasuryProposalSuccessPopup
				open={openSuccess}
				onCancel={() => {
					setOpenSuccess(false);
					handleClose();
				}}
				selectedTrack={selectedTrack}
				proposerAddress={proposerAddress}
				beneficiaryAddresses={beneficiaryAddresses}
				fundingAmount={fundingAmount}
				preimageHash={preimageHash}
				preimageLength={preimageLength}
				postId={postId}
			/>

			<Modal
				open={openModal}
				maskClosable={false}
				onCancel={() => {
					setCloseConfirm(true);
					setOpenModal(false);
				}}
				footer={false}
				className={`${poppins.className} ${poppins.variable} opengov-proposals w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				title={
					<div className='flex items-center gap-2 border-0 border-b-[1px] border-solid border-[#D2D8E0] px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						{theme === 'dark' ? <CreateProposalIconDark /> : <CreateProposalIcon />}
						Create Treasury Proposal
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
								title: ESteps.Create_Preimage
							},
							{
								title: ESteps.Create_Proposal
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
						<CreatePreimage
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
							beneficiaryAddresses={beneficiaryAddresses}
							dispatchBeneficiaryAddresses={dispatchBeneficiaryAddresses}
							fundingAmount={fundingAmount}
							setFundingAmount={setFundingAmount}
							selectedTrack={selectedTrack}
							setSelectedTrack={setSelectedTrack}
							enactment={enactment}
							setEnactment={setEnactment}
							isUpdatedAvailableBalance={isUpdatedAvailableBalance}
						/>
					)}
					{steps.step === 2 && (
						<CreateProposal
							discussionLink={discussionLink}
							availableBalance={availableBalance}
							title={title}
							content={content}
							tags={tags}
							postId={postId}
							setPostId={setPostId}
							setOpenSuccess={setOpenSuccess}
							setOpenModal={setOpenModal}
							beneficiaryAddresses={beneficiaryAddresses}
							enactment={enactment}
							isPreimage={Boolean(isPreimage)}
							proposerAddress={proposerAddress}
							fundingAmount={fundingAmount}
							selectedTrack={selectedTrack}
							preimageHash={preimageHash}
							preimageLength={preimageLength}
						/>
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
export default styled(OpenGovTreasuryProposal)`
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
