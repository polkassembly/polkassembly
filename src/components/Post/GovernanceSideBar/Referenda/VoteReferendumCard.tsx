// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StopOutlined } from '@ant-design/icons';
import { Form, Segmented } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import { EVoteDecisionType, ILastVote } from 'src/types';
import styled from 'styled-components';
import { useApiContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import LoginToVote from '../LoginToVoteOrEndorse';
import { dmSans } from 'pages/_app';
import LikeWhite from '~assets/icons/like-white.svg';
import LikeGray from '~assets/icons/like-gray.svg';
import DarkLikeGray from '~assets/icons/like-gray-dark.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import DislikeGray from '~assets/icons/dislike-gray.svg';
import DarkDislikeGray from '~assets/icons/dislike-gray-dark.svg';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import blockToDays from '~src/util/blockToDays';
import { ApiPromise } from '@polkadot/api';
import { network as AllNetworks, chainProperties } from '~src/global/networkConstants';
import { useBatchVotesSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { trackEvent } from 'analytics';
import SelectOption from '~src/basic-components/Select/SelectOption';
import VotingFormCard, { EFormType } from '../../../TinderStyleVoting/PostInfoComponents/VotingFormCard';
import { editBatchValueChanged, editCartPostValueChanged } from '~src/redux/batchVoting/actions';
import { useAppDispatch } from '~src/redux/store';
import { batchVotesActions } from '~src/redux/batchVoting';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { formatedBalance } from '~src/util/formatedBalance';
import Input from '~src/basic-components/Input';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IDelegateBalance } from '~src/components/UserProfile/TotalProfileBalances';
const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	referendumId?: number | null | undefined;
	onAccountChange: (address: string) => void;
	lastVote: ILastVote | undefined;
	setLastVote: (pre: ILastVote) => void;
	proposalType: ProposalType;
	address: string;
	theme?: string;
	trackNumber?: number;
	forSpecificPost?: boolean;
	postEdit?: any;
	currentDecision?: string;
	postData?: any;
}

export const getConvictionVoteOptions = (CONVICTIONS: [number, number][], proposalType: ProposalType, api: ApiPromise | undefined, apiReady: boolean, network: string) => {
	if ([ProposalType.REFERENDUM_V2, ProposalType.FELLOWSHIP_REFERENDUMS].includes(proposalType) && ![AllNetworks.COLLECTIVES, AllNetworks.WESTENDCOLLECTIVES].includes(network)) {
		if (api && apiReady) {
			const res = api?.consts?.convictionVoting?.voteLockingPeriod;
			const num = res?.toJSON();
			const days = blockToDays(num, network);
			if (days && !isNaN(Number(days))) {
				return [
					<SelectOption
						className={`text-bodyBlue  ${dmSans.variable}`}
						key={0}
						value={0}
					>
						{'0.1x voting balance, no lockup period'}
					</SelectOption>,
					...CONVICTIONS.map(([value, lock]) => (
						<SelectOption
							className={`text-bodyBlue ${dmSans.variable}`}
							key={value}
							value={value}
						>{`${value}x voting balance, locked for ${lock}x duration (${Number(lock) * Number(days)} days)`}</SelectOption>
					))
				];
			}
		}
	}
	return [
		<SelectOption
			className={`text-bodyBlue ${dmSans.variable}`}
			key={0}
			value={0}
		>
			{'0.1x voting balance, no lockup period'}
		</SelectOption>,
		...CONVICTIONS.map(([value, lock]) => (
			<SelectOption
				className={`text-bodyBlue ${dmSans.variable}`}
				key={value}
				value={value}
			>{`${value}x voting balance, locked for ${lock} enactment period(s)`}</SelectOption>
		))
	];
};

const VoteReferendumCard = ({ className, referendumId, proposalType, forSpecificPost, postData }: Props) => {
	const userDetails = useUserDetailsSelector();
	const dispatch = useAppDispatch();
	const { id } = userDetails;
	const { batch_voting_address } = useBatchVotesSelector();
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const [splitForm] = Form.useForm();
	const [abstainFrom] = Form.useForm();
	const [ayeNayForm] = Form.useForm();
	const { resolvedTheme: theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const { vote } = useBatchVotesSelector();
	const { loginAddress } = useUserDetailsSelector();
	const [delegatedVotingPower, setDelegatedVotingPower] = useState<BN>(ZERO_BN);

	const getDelegateData = async () => {
		if (!loginAddress.length || proposalType !== ProposalType.REFERENDUM_V2) return;
		const { data, error } = await nextApiClientFetch<IDelegateBalance>('/api/v1/delegations/total-delegate-balance', {
			addresses: [batch_voting_address],
			trackNo: postData?.track_number
		});
		if (data) {
			const bnVotingPower = new BN(data?.votingPower || '0');
			setDelegatedVotingPower(bnVotingPower);
		} else if (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getDelegateData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginAddress]);

	if (!id) {
		return <LoginToVote isUsedInDefaultValueModal={true} />;
	}

	const handleModalReset = () => {
		ayeNayForm.setFieldValue('balance', '');
		splitForm.setFieldValue('ayeVote', '');
		splitForm.setFieldValue('nayVote', '');
		abstainFrom.setFieldValue('ayeVote', '');
		abstainFrom.setFieldValue('nayVote', '');
		abstainFrom.setFieldValue('abstainVote', '');
	};

	const handleOnVoteChange = (value: any) => {
		// setVote(value as EVoteDecisionType);
		dispatch(batchVotesActions.setVote(value));
		if (!forSpecificPost) {
			dispatch(
				editBatchValueChanged({
					values: {
						voteOption: value as EVoteDecisionType
					}
				})
			);
		} else {
			dispatch(
				editCartPostValueChanged({
					values: {
						voteOption: (value as EVoteDecisionType) || 'aye'
					}
				})
			);
		}
		handleModalReset();
	};

	const handleSubmit = async () => {
		// GAEvent for proposal voting
		trackEvent('proposal_voting', 'voted_proposal', {
			decision: vote,
			isWeb3Login: currentUser?.web3signup,
			postId: referendumId,
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});
	};

	const ayeNayVotesArr = [
		{
			label: (
				<div
					className={`flex h-[32px] w-full items-center justify-center rounded-[4px] text-textGreyColor ${
						vote === EVoteDecisionType.AYE ? 'bg-ayeGreenColor text-white dark:bg-ayeDarkGreenColor' : ''
					}`}
				>
					{vote === EVoteDecisionType.AYE ? (
						<LikeWhite className='mb-[3px] mr-1' />
					) : theme === 'dark' ? (
						<DarkLikeGray className='mb-[3px] mr-1' />
					) : (
						<LikeGray className='mb-[3px] mr-1' />
					)}
					<span className={`${vote === EVoteDecisionType.AYE ? 'text-white' : 'dark:text-blue-dark-medium'} text-base font-medium`}>Aye</span>
				</div>
			),
			value: 'aye'
		},
		{
			label: (
				<div
					className={`flex h-[32px] w-full items-center justify-center rounded-[4px] text-textGreyColor ${
						vote === EVoteDecisionType.NAY ? 'bg-nayRedColor text-white dark:bg-nayDarkRedColor' : ''
					}`}
				>
					{vote === EVoteDecisionType.NAY ? (
						<DislikeWhite className='-mb-[3px] mr-1' />
					) : theme === 'dark' ? (
						<DarkDislikeGray className='-mb-[3px] mr-1' />
					) : (
						<DislikeGray className='-mb-[3px] mr-1' />
					)}
					<span className={`${vote === EVoteDecisionType.NAY ? 'text-white' : 'dark:text-blue-dark-medium'} text-base font-medium`}>Nay</span>
				</div>
			),
			value: 'nay'
		}
	];

	const decisionOptions = isOpenGovSupported(network)
		? [
				...ayeNayVotesArr,
				{
					label: (
						<div
							className={`flex h-[32px] w-full items-center  justify-center rounded-[4px] text-textGreyColor ${
								vote === EVoteDecisionType.ABSTAIN ? 'bg-abstainBlueColor text-white dark:bg-abstainDarkBlueColor' : ''
							}`}
						>
							<StopOutlined className={`mr-1 ${vote === EVoteDecisionType.ABSTAIN ? 'dark:text-white' : 'dark:text-[#909090]'}`} />
							<span className={`${vote === EVoteDecisionType.ABSTAIN ? 'text-white' : 'dark:text-blue-dark-medium'} text-base font-medium`}>Abstain</span>
						</div>
					),
					value: 'abstain'
				}
			]
		: ayeNayVotesArr;

	const VoteUI = (
		<>
			<h3 className='inner-headings mb-[2px] mt-[24px] dark:text-blue-dark-medium'>Choose your vote</h3>
			<Segmented
				block
				className={`${className} mb-6 w-full rounded-[4px] border-[1px] border-solid border-section-light-container bg-white pt-1 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay`}
				size='large'
				value={vote}
				onChange={(value) => {
					handleOnVoteChange(value);
					dispatch(batchVotesActions.setIsFieldEdited(true));
				}}
				options={decisionOptions}
				disabled={!api || !apiReady}
			/>
			{forSpecificPost && delegatedVotingPower.gt(ZERO_BN) && (
				<div className='mb-5 mt-6 flex flex-col gap-0.5 text-sm'>
					<span className='flex gap-1 text-sm text-lightBlue dark:text-blue-dark-medium'>
						{' '}
						Delegated power <HelperTooltip text='Total amount of voting power' />
					</span>
					<Input
						value={formatedBalance(delegatedVotingPower?.toString() || '0', chainProperties[network]?.tokenSymbol, 0)}
						disabled
						className='h-10 rounded-[4px] border-[1px] border-solid dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high'
					/>
				</div>
			)}
			{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote !== EVoteDecisionType.SPLIT && vote !== EVoteDecisionType.ABSTAIN && vote !== EVoteDecisionType.NAY && (
				<VotingFormCard
					form={ayeNayForm}
					showConvictionBar={true}
					formName={EFormType.AYE_FORM}
					onBalanceChange={(balance: BN) => {
						if (!forSpecificPost) {
							dispatch(
								editBatchValueChanged({
									values: {
										ayeVoteBalance: balance?.toString()
									}
								})
							);
						} else {
							dispatch(
								editCartPostValueChanged({
									values: {
										ayeVoteBalance: balance?.toString() || '0'
									}
								})
							);
							dispatch(batchVotesActions.setIsFieldEdited(true));
						}
					}}
					handleSubmit={handleSubmit}
					forSpecificPost={forSpecificPost}
				/>
			)}
			{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote !== EVoteDecisionType.SPLIT && vote !== EVoteDecisionType.ABSTAIN && vote !== EVoteDecisionType.AYE && (
				<VotingFormCard
					form={ayeNayForm}
					showConvictionBar={true}
					formName={EFormType.NAYE_FORM}
					onBalanceChange={(balance: BN) => {
						if (!forSpecificPost) {
							dispatch(
								editBatchValueChanged({
									values: {
										nyeVoteBalance: balance?.toString()
									}
								})
							);
						} else {
							dispatch(
								editCartPostValueChanged({
									values: {
										nyeVoteBalance: balance?.toString() || '0'
									}
								})
							);
							dispatch(batchVotesActions.setIsFieldEdited(true));
						}
					}}
					handleSubmit={handleSubmit}
					forSpecificPost={forSpecificPost}
				/>
			)}

			{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote === 'abstain' && (
				<VotingFormCard
					form={abstainFrom}
					showConvictionBar={true}
					formName={EFormType.ABSTAIN_FORM}
					onBalanceChange={(balance: BN) => {
						if (!forSpecificPost) {
							dispatch(
								editBatchValueChanged({
									values: {
										abstainVoteBalance: balance?.toString()
									}
								})
							);
						} else {
							dispatch(
								editCartPostValueChanged({
									values: {
										abstainVoteBalance: balance?.toString() || '0'
									}
								})
							);
							dispatch(batchVotesActions.setIsFieldEdited(true));
						}
					}}
					onAyeValueChange={(balance: BN) => {
						if (!forSpecificPost) {
							dispatch(
								editBatchValueChanged({
									values: {
										abstainAyeVoteBalance: balance?.toString()
									}
								})
							);
						} else {
							dispatch(
								editCartPostValueChanged({
									values: {
										abstainAyeVoteBalance: balance?.toString() || '0'
									}
								})
							);
							dispatch(batchVotesActions.setIsFieldEdited(true));
						}
					}}
					onNayValueChange={(balance: BN) => {
						if (!forSpecificPost) {
							dispatch(
								editBatchValueChanged({
									values: {
										abstainNyeVoteBalance: balance?.toString()
									}
								})
							);
						} else {
							dispatch(
								editCartPostValueChanged({
									values: {
										abstainNyeVoteBalance: balance?.toString() || '0'
									}
								})
							);
							dispatch(batchVotesActions.setIsFieldEdited(true));
						}
					}}
					onAbstainValueChange={(balance: BN) => {
						if (!forSpecificPost) {
							dispatch(
								editBatchValueChanged({
									values: {
										abstainVoteBalance: balance?.toString()
									}
								})
							);
						} else {
							dispatch(
								editCartPostValueChanged({
									values: {
										abstainVoteBalance: balance?.toString() || '0'
									}
								})
							);
							dispatch(batchVotesActions.setIsFieldEdited(true));
						}
					}}
					handleSubmit={handleSubmit}
					forSpecificPost={forSpecificPost}
				/>
			)}
		</>
	);
	return VoteUI;
};

export default styled(VoteReferendumCard)`
	.LoaderWrapper {
		height: 40rem;
		position: absolute;
		width: 100%;
	}
	.vote-form-cont {
		padding: 12px;
	}
	.vote-referendum .ant-modal-close {
		margin-top: 4px;
	}
	.vote-referendum .ant-modal-close:hover {
		margin-top: 4px;
	}
	.vote-referendum .ant-select-selector {
		border: 1px soild !important;
		border-color: #d2d8e0 !important;
		height: 40px;
		border-radius: 4px !important;
	}
	.vote-referendum .ant-select-selection-item {
		font-style: normal !important;
		font-weight: 400 !important;
		font-size: 14px !important;
		display: flex;
		align-items: center;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
		color: #243a57;
	}

	.vote-referendum .ant-input-number-in-from-item {
		height: 39.85px !important;
	}
	.vote-referendum .ant-segmented-item-label {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 32px !important;
		border-radius: 4px !important;
		padding-right: 0px !important;
		padding-left: 0px !important;
	}
	.vote-referendum .ant-segmented {
		padding: 0px !important;
	}

	.vote-referendum .ant-select-selection-item {
		color: #243a57;
	}
	.vote-referendum .ant-select-focused {
		border: 1px solid #e5007a !important;
		border-radius: 4px !important;
	}
	.vote-referendum.ant-segmented-item-selected {
		box-shadow: none !important;
		padding-right: 0px !important;
	}
	.vote-referendum .ant-segmented-item {
		padding: 0px !important;
	}
	.dark .ant-segmented-group label {
		background-color: transparent !important;
	}
	.ant-checkbox .ant-checkbox-inner {
		background-color: transparent !important;
	}
	.ant-checkbox-checked .ant-checkbox-inner {
		background-color: #e5007a !important;
		border-color: #e5007a !important;
	}
	.ant-segmented .ant-segmented-group {
		margin-top: 4px !important;
	}
	.ant-segmented .ant-segmented-item-label {
		padding: 0 !important;
	}
	.ant-segmented .ant-segmented-lg .ant-segmented-item-label {
		padding: 0 !important;
	}
	.ant-segmented.ant-segmented-lg {
		padding: 0 8px !important;
	}
`;
