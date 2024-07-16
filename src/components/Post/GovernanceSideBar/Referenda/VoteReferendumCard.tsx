// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StopOutlined } from '@ant-design/icons';
import { Form, Segmented } from 'antd';
import BN from 'bn.js';
import React, { useState } from 'react';
import { EVoteDecisionType, ILastVote } from 'src/types';
import styled from 'styled-components';
import { useApiContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import LoginToVote from '../LoginToVoteOrEndorse';
import { poppins } from 'pages/_app';
import LikeWhite from '~assets/icons/like-white.svg';
import LikeGray from '~assets/icons/like-gray.svg';
import DarkLikeGray from '~assets/icons/like-gray-dark.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import DislikeGray from '~assets/icons/dislike-gray.svg';
import DarkDislikeGray from '~assets/icons/dislike-gray-dark.svg';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import blockToDays from '~src/util/blockToDays';
import { ApiPromise } from '@polkadot/api';
import { network as AllNetworks } from '~src/global/networkConstants';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { trackEvent } from 'analytics';
import SelectOption from '~src/basic-components/Select/SelectOption';
import VotingFormCard, { EFormType } from './VotingFormCard';
import ImageIcon from '~src/ui-components/ImageIcon';
import { editBatchValueChanged } from '~src/redux/batchVoting/actions';
import { useAppDispatch } from '~src/redux/store';

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
	setUpdateTally?: (pre: boolean) => void;
}
export interface INetworkWalletErr {
	message: string;
	description: string;
	error: number;
}

export const getConvictionVoteOptions = (CONVICTIONS: [number, number][], proposalType: ProposalType, api: ApiPromise | undefined, apiReady: boolean, network: string) => {
	if ([ProposalType.REFERENDUM_V2, ProposalType.FELLOWSHIP_REFERENDUMS].includes(proposalType) && ![AllNetworks.COLLECTIVES, AllNetworks.WESTENDCOLLECTIVES].includes(network)) {
		if (api && apiReady) {
			const res = api.consts.convictionVoting.voteLockingPeriod;
			const num = res.toJSON();
			const days = blockToDays(num, network);
			if (days && !isNaN(Number(days))) {
				return [
					<SelectOption
						className={`text-bodyBlue  ${poppins.variable}`}
						key={0}
						value={0}
					>
						{'0.1x voting balance, no lockup period'}
					</SelectOption>,
					...CONVICTIONS.map(([value, lock]) => (
						<SelectOption
							className={`text-bodyBlue ${poppins.variable}`}
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
			className={`text-bodyBlue ${poppins.variable}`}
			key={0}
			value={0}
		>
			{'0.1x voting balance, no lockup period'}
		</SelectOption>,
		...CONVICTIONS.map(([value, lock]) => (
			<SelectOption
				className={`text-bodyBlue ${poppins.variable}`}
				key={value}
				value={value}
			>{`${value}x voting balance, locked for ${lock} enactment period(s)`}</SelectOption>
		))
	];
};

// const VoteReferendumCard = ({ className, referendumId, onAccountChange, lastVote, setLastVote, proposalType, address, trackNumber, setUpdateTally }: Props) => {
const VoteReferendumCard = ({ className, referendumId, proposalType }: Props) => {
	const userDetails = useUserDetailsSelector();
	const dispatch = useAppDispatch();
	const { id } = userDetails;
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const [splitForm] = Form.useForm();
	const [abstainFrom] = Form.useForm();
	const [ayeNayForm] = Form.useForm();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [multisig, setMultisig] = useState<string>('');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [showMultisig, setShowMultisig] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const [vote, setVote] = useState<EVoteDecisionType>(EVoteDecisionType.AYE);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars

	if (!id) {
		return <LoginToVote />;
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
		setVote(value as EVoteDecisionType);
		dispatch(
			editBatchValueChanged({
				values: {
					voteOption: value as EVoteDecisionType
				}
			})
		);
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
					className={`ml-1 mr-1 flex h-[32px] w-full items-center justify-center rounded-[4px] text-textGreyColor ${
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
					className={`ml-1 mr-1 flex h-[32px] w-full items-center justify-center rounded-[4px] text-textGreyColor ${
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
							className={` ml-2 flex h-[32px] w-full items-center  justify-center rounded-[4px] text-textGreyColor ${
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
			{/* aye nye split abstain buttons */}
			<h3 className='inner-headings mb-[2px] mt-[24px] dark:text-blue-dark-medium'>Choose your vote</h3>
			<Segmented
				block
				className={`${className} mb-6 w-full rounded-[4px] border-[1px] border-solid border-section-light-container bg-white dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay`}
				size='large'
				value={vote}
				onChange={(value) => {
					handleOnVoteChange(value);
				}}
				options={decisionOptions}
				disabled={!api || !apiReady}
			/>
			{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote !== EVoteDecisionType.SPLIT && vote !== EVoteDecisionType.ABSTAIN && vote !== EVoteDecisionType.NAY && (
				<VotingFormCard
					form={ayeNayForm}
					formName={EFormType.AYE_NAY_FORM}
					onBalanceChange={(balance: BN) => {
						dispatch(
							editBatchValueChanged({
								values: {
									ayeVoteBalance: balance
								}
							})
						);
					}}
					handleSubmit={handleSubmit}
				/>
			)}
			{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote !== EVoteDecisionType.SPLIT && vote !== EVoteDecisionType.ABSTAIN && vote !== EVoteDecisionType.AYE && (
				<VotingFormCard
					form={ayeNayForm}
					formName={EFormType.AYE_NAY_FORM}
					onBalanceChange={(balance: BN) => {
						dispatch(
							editBatchValueChanged({
								values: {
									nyeVoteBalance: balance
								}
							})
						);
					}}
					handleSubmit={handleSubmit}
				/>
			)}

			{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote === 'abstain' && (
				<VotingFormCard
					form={abstainFrom}
					formName={EFormType.ABSTAIN_FORM}
					onBalanceChange={(balance: BN) => {
						dispatch(
							editBatchValueChanged({
								values: {
									abstainVoteBalance: balance
								}
							})
						);
					}}
					onAyeValueChange={(balance: BN) => {
						dispatch(
							editBatchValueChanged({
								values: {
									abstainAyeVoteBalance: balance
								}
							})
						);
					}}
					onNayValueChange={(balance: BN) => {
						dispatch(
							editBatchValueChanged({
								values: {
									abstainNyeVoteBalance: balance
								}
							})
						);
					}}
					onAbstainValueChange={(balance: BN) => {
						dispatch(
							editBatchValueChanged({
								values: {
									abstainVoteBalance: balance
								}
							})
						);
					}}
					handleSubmit={handleSubmit}
				/>
			)}

			<div className='mt-[40px] flex h-[46px] items-center justify-between rounded-md bg-[#F6F7F9] p-3'>
				<div className='flex items-center gap-x-1'>
					<ImageIcon
						src='/assets/icons/lock-icon.svg'
						alt='lock-icon'
					/>
					<p className='m-0 p-0 text-sm text-lightBlue'>Locking period</p>
				</div>
				<p className='m-0 p-0 text-sm text-lightBlue'>No lockup period</p>
			</div>
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
`;
