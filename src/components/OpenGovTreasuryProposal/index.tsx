// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useReducer, useState } from 'react';
import BN from 'bn.js';
import { dmSans } from 'pages/_app';
import styled from 'styled-components';
import { Form, Modal, Steps } from 'antd';
import TreasuryProposalSuccessPopup from './TreasuryProposalSuccess';
import { HexString } from '@polkadot/util/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import CreateProposalIcon from '~assets/openGovProposals/create_proposal.svg';
import CreateProposalIconDark from '~assets/openGovProposals/create_proposal_white.svg';
import { BN_HUNDRED } from '@polkadot/util';
import { CloseIcon, CreatePropoosalIcon } from '~src/ui-components/CustomIcons';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { useNetworkSelector, useTreasuryProposalSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';
import { useTheme } from 'next-themes';
import { EAllowedCommentor, ESteps, IBeneficiary } from '~src/types';
import { checkIsAddressMultisig } from '../DelegationDashboard/utils/checkIsAddressMultisig';
import dynamic from 'next/dynamic';
import CreateProposalWhiteIcon from '~assets/icons/CreateProposalWhite.svg';
import { useDispatch } from 'react-redux';
import {
	setIdentityCardLoading,
	setMultisigCardLoading,
	setShowIdentityInfoCardForBeneficiary,
	setShowIdentityInfoCardForProposer,
	setShowMultisigInfoCard
} from '~src/redux/treasuryProposal';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import ImageIcon from '~src/ui-components/ImageIcon';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import { useTranslation } from 'next-i18next';

const WriteProposal = dynamic(() => import('./WriteProposal'), {
	ssr: false
});
const CreatePreimage = dynamic(() => import('./CreatePreimage'), {
	ssr: false
});
const CreateProposal = dynamic(() => import('./CreateProposal'), {
	ssr: false
});

const AddressConnectModal = dynamic(() => import('src/ui-components/AddressConnectModal'), {
	ssr: false
});
interface Props {
	className?: string;
	theme?: string;
	isUsedInTreasuryTrack?: boolean;
	isUsedInReferedumComponent?: boolean;
	onClick?: () => void;
}

export interface ISteps {
	step: number;
	percent: number;
}

export enum EEnactment {
	At_Block_No = 'at_block_number',
	After_No_Of_Blocks = 'after_no_of_Blocks'
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
	storageFee?: BN;
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

const OpenGovTreasuryProposal = ({ className, isUsedInTreasuryTrack, isUsedInReferedumComponent, onClick }: Props) => {
	const { t } = useTranslation('common');
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const dispatch = useDispatch();
	const [beneficiaryAddresses, dispatchBeneficiaryAddresses] = useReducer(beneficiaryAddressesReducer, INIT_BENEFICIARIES);
	const currentUser = useUserDetailsSelector();
	const { id, loginAddress } = currentUser;
	const { network } = useNetworkSelector();
	const { beneficiaries } = useTreasuryProposalSelector();
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
	const [openLoginPrompt, setOpenLoginPrompt] = useState<boolean>(false);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [isUpdatedAvailableBalance, setIsUpdatedAvailableBalance] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const [generalIndex, setGeneralIndex] = useState<string | null>(null);
	const [inputAmountValue, setInputAmountValue] = useState<string>('0');
	const [allowedCommentors, setAllowedCommentors] = useState<EAllowedCommentor>(EAllowedCommentor.ALL);

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
		setGeneralIndex(null);
	};

	const handleBeneficiaryIdentityInfo = async () => {
		if (beneficiaries.filter((item) => !!item).length === 0) {
			dispatch(setShowIdentityInfoCardForBeneficiary(false));
			return;
		}
		if ((!api && !peopleChainApi) || beneficiaries.find((beneficiary) => !beneficiary)?.length === 0) return;

		let promiseArr: any[] = [];
		for (const address of [...beneficiaries.map((addr) => addr)]) {
			if (!address) continue;
			promiseArr = [...promiseArr, getIdentityInformation({ address: address, api: peopleChainApi ?? api, network })];
		}
		try {
			dispatch(setIdentityCardLoading(true));
			const resolve = await Promise.all(promiseArr);
			dispatch(
				setShowIdentityInfoCardForBeneficiary(
					!!resolve.find((info: any) => {
						return !info?.isGood;
					})
				)
			);
			dispatch(setIdentityCardLoading(false));
		} catch (err) {
			console.log(err);
			dispatch(setIdentityCardLoading(false));
		}
	};
	const handleBeneficiariesMultisigCheck = async () => {
		if (beneficiaries.filter((item) => !!item).length === 0) {
			dispatch(setShowMultisigInfoCard(false));
			return;
		}
		if (!api || !apiReady || beneficiaries.find((beneficiary) => !beneficiary)?.length) return;

		let promiseArr: any[] = [];
		for (const address of [...beneficiaries.map((addr) => (addr as any)?.value || addr)]) {
			if (!address) continue;
			promiseArr = [...promiseArr, checkIsAddressMultisig(address)];
		}
		try {
			dispatch(setMultisigCardLoading(true));
			const resolve = await Promise.all(promiseArr);
			dispatch(setShowMultisigInfoCard(!resolve.find((val) => !!val)));
			dispatch(setMultisigCardLoading(false));
		} catch (err) {
			console.log(err);
		}
	};
	useEffect(() => {
		handleBeneficiaryIdentityInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, apiReady, peopleChainApi, peopleChainApiReady, beneficiaryAddresses]);

	useEffect(() => {
		handleBeneficiariesMultisigCheck();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginAddress, window, beneficiaries, api, apiReady]);

	const handleIdentityInfo = async () => {
		if (!api || !proposerAddress || !apiReady) return;

		const { isGood } = await getIdentityInformation({
			address: proposerAddress,
			api: peopleChainApi ?? api,
			network: network
		});
		dispatch(setShowIdentityInfoCardForProposer(!isGood));
	};

	useEffect(() => {
		if (!proposerAddress) return;

		handleIdentityInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [proposerAddress]);

	useEffect(() => {
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

		onClick?.();

		if (id) {
			proposerAddress.length > 0 ? setOpenModal(!openModal) : setOpenAddressLinkedModal(true);
		} else {
			setOpenLoginPrompt(true);
		}
	};

	return (
		<div className={className}>
			{isUsedInReferedumComponent ? (
				<div
					className='flex items-center space-x-1'
					onClick={handleClick}
				>
					<ImageIcon
						src='/assets/icons/create-treasury-proposal-icon.svg'
						alt='Create Treasury Proposal icon'
						className='-mt-[2px]'
					/>
					<span className='hidden text-sm font-medium text-white sm:flex'>{t('create_treasury_proposal')}</span>
				</div>
			) : (
				<div
					className={`${
						isUsedInTreasuryTrack
							? 'flex'
							: 'ml-[-37px] flex min-w-[290px] cursor-pointer items-center justify-center rounded-[8px] align-middle text-[35px] text-lightBlue transition delay-150 duration-300 hover:bg-[#e5007a12] hover:text-bodyBlue dark:text-blue-dark-medium'
					}`}
					onClick={handleClick}
				>
					{isUsedInTreasuryTrack ? (
						<CreateProposalWhiteIcon className='mr-2' />
					) : (
						<CreatePropoosalIcon className={`${isUsedInTreasuryTrack ? 'scale-200' : 'ml-[-31px] cursor-pointer'}`} />
					)}
					{isUsedInTreasuryTrack ? (
						<p className='m-0 p-0'>{t('create_proposal')}</p>
					) : (
						<p className='mb-3 ml-4 mt-2.5 text-sm font-medium leading-5 tracking-[1.25%] dark:text-blue-dark-medium'>{t('create_treasury_proposal')}</p>
					)}
				</div>
			)}
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
						{t('exit_treasury_proposal_creation')}
					</div>
				}
			>
				<div className='mt-6 px-6'>
					<span className='text-sm text-bodyBlue dark:text-blue-dark-high'>
						{t('your_treasury_proposal_information_title_description_tags_would_be_lost')}. {t('are_you_sure_you_want_to_exit_proposal_creation_process')}
					</span>
					<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<CustomButton
							onClick={handleClose}
							buttonsize='sm'
							text={t('yes_exit')}
							variant='default'
						/>
						<CustomButton
							onClick={() => {
								setCloseConfirm(false);
								setGeneralIndex(null);
								setOpenModal(true);
							}}
							height={40}
							width={200}
							text={t('no_continue_editing')}
							variant='primary'
						/>
					</div>
				</div>
			</Modal>
			<TreasuryProposalSuccessPopup
				inputAmountValue={inputAmountValue}
				generalIndex={generalIndex}
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
				className={`${dmSans.className} ${dmSans.variable} opengov-proposals w-[720px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				title={
					<div className='flex items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						{theme === 'dark' ? <CreateProposalIconDark /> : <CreateProposalIcon />}
						{t('create_treasury_proposal')}
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
							setAllowedCommentors={setAllowedCommentors}
							allowedCommentors={allowedCommentors}
						/>
					)}

					{steps?.step === 1 && (
						<CreatePreimage
							inputAmountValue={inputAmountValue}
							setInputAmountValue={setInputAmountValue}
							setGeneralIndex={setGeneralIndex}
							generalIndex={generalIndex}
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
							inputAmountValue={inputAmountValue}
							generalIndex={generalIndex}
							discussionLink={discussionLink}
							title={title}
							content={content}
							tags={tags}
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
							isDiscussionLinked={isDiscussionLinked as boolean}
							allowedCommentors={allowedCommentors}
						/>
					)}
				</div>
			</Modal>
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
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '#243A57')} !important;
	}
	input::placeholder {
		color: #7c899b;
		font-weight: 400 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
	}
	.ant-steps .ant-steps-item-wait .ant-steps-item-icon {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#dde4ed' : 'rgba(0, 0, 0, 0.06)')} !important;
	}
`;
