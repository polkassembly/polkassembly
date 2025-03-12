// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StopOutlined } from '@ant-design/icons';
import { Form, Segmented, Slider, SliderSingleProps } from 'antd';
import BN from 'bn.js';
import React, { useState } from 'react';
import { EVoteDecisionType } from 'src/types';
import styled from 'styled-components';
import { useApiContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import LikeWhite from '~assets/icons/like-white.svg';
import LikeGray from '~assets/icons/like-gray.svg';
import DarkLikeGray from '~assets/icons/like-gray-dark.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import DislikeGray from '~assets/icons/dislike-gray.svg';
import DarkDislikeGray from '~assets/icons/dislike-gray-dark.svg';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import blockToDays from '~src/util/blockToDays';
import { useBatchVotesSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { trackEvent } from 'analytics';
import { editBatchValueChanged, editCartPostValueChanged } from '~src/redux/batchVoting/actions';
import { useAppDispatch } from '~src/redux/store';
import VotingFormCard, { EFormType } from '~src/components/TinderStyleVoting/PostInfoComponents/VotingFormCard';
import AbstainOptions from './AbstainOptions';
import { IOptionsWrapper } from '../types';
import Image from 'next/image';
import { SegmentedValue } from 'antd/es/segmented';
import LoginToVoteOrEndorse from '~src/components/Post/GovernanceSideBar/LoginToVoteOrEndorse';
import formatBnBalance from '~src/util/formatBnBalance';

const OptionWrapper = ({ className, referendumId, proposalType, forSpecificPost }: IOptionsWrapper) => {
	const dispatch = useAppDispatch();
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const [splitForm] = Form.useForm();
	const [abstainFrom] = Form.useForm();
	const [ayeNayForm] = Form.useForm();
	const { resolvedTheme: theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	const { id } = currentUser;
	const [vote, setVote] = useState<EVoteDecisionType>(EVoteDecisionType.AYE);
	const [lockingPeriodMessage, setLockingPeriodMessage] = useState<string>('No lockup period');
	const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock]);
	const { batch_vote_details } = useBatchVotesSelector();
	console.log('batch_vote_details', batch_vote_details);

	const calculateLock = (convictionValue: number): number => {
		const conviction = CONVICTIONS.find(([value]) => value === convictionValue);
		return conviction ? conviction[1] : 0;
	};

	const marks: SliderSingleProps['marks'] = {
		0: '0.1x',
		16.7: '1x',
		33.33: '2x',
		50: '3x',
		66.7: '4x',
		83.33: '5x',
		// eslint-disable-next-line sort-keys
		100: '6x'
	};

	const handleModalReset = () => {
		ayeNayForm.setFieldValue('balance', '');
		splitForm.setFieldValue('ayeVote', '');
		splitForm.setFieldValue('nayVote', '');
		abstainFrom.setFieldValue('ayeVote', '');
		abstainFrom.setFieldValue('nayVote', '');
		abstainFrom.setFieldValue('abstainVote', '');
	};

	const calculateLockingPeriod = (convictionValue: number) => {
		const lockPeriod = calculateLock(convictionValue);

		if (!api || !apiReady) {
			return 'No lockup period';
		}

		const res = api?.consts?.convictionVoting?.voteLockingPeriod;
		const num = res?.toJSON();
		const days = blockToDays(num, network);

		if (days && !isNaN(Number(days)) && lockPeriod) {
			return `${convictionValue}x voting balance, locked for ${lockPeriod * days} days`;
		}

		return 'No lockup period';
	};

	const handleConvictionChange = (value: string) => {
		const lockingPeriodMessage = value === '0.1x' ? 'No lockup period' : calculateLockingPeriod(parseFloat(value));
		setLockingPeriodMessage(lockingPeriodMessage);
	};

	const handleOnVoteChange = (value: SegmentedValue) => {
		setVote(value as EVoteDecisionType);
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
		if (value === EVoteDecisionType.AYE) {
			ayeNayForm.setFieldsValue({ balance: formatBnBalance(String(batch_vote_details.ayeVoteBalance), { numberAfterComma: 1, withThousandDelimitor: false }, network) || '' });
		} else if (value === EVoteDecisionType.NAY) {
			ayeNayForm.setFieldsValue({ balance: formatBnBalance(String(batch_vote_details.nyeVoteBalance), { numberAfterComma: 1, withThousandDelimitor: false }, network) || '' });
		} else if (value === EVoteDecisionType.ABSTAIN) {
			abstainFrom.setFieldsValue({ balance: formatBnBalance(String(batch_vote_details.abstainVoteBalance), { numberAfterComma: 1, withThousandDelimitor: false }, network) || '' });
		}
	};

	const handleBalanceChange = (balance: BN) => {
		if (!forSpecificPost) {
			dispatch(
				editBatchValueChanged({
					values: {
						...(vote === EVoteDecisionType.AYE && { ayeVoteBalance: balance.toString() }),
						...(vote === EVoteDecisionType.NAY && { nyeVoteBalance: balance.toString() }),
						...(vote === EVoteDecisionType.ABSTAIN && { abstainVoteBalance: balance.toString() })
					}
				})
			);
		} else {
			dispatch(
				editCartPostValueChanged({
					values: {
						...(vote === EVoteDecisionType.AYE && { ayeVoteBalance: balance.toString() }),
						...(vote === EVoteDecisionType.NAY && { nyeVoteBalance: balance.toString() }),
						...(vote === EVoteDecisionType.ABSTAIN && { abstainVoteBalance: balance.toString() })
					}
				})
			);
		}
	};

	const getMarkValue = (value: number): string => {
		const markValue = marks[value];
		if (typeof markValue === 'string') {
			return markValue;
		}
		throw new Error(`Invalid mark value: ${markValue}`);
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

	if (id === null || isNaN(Number(id))) {
		return <LoginToVoteOrEndorse isUsedInDefaultValueModal={true} />;
	}

	const ayeNayVotesArr = [
		{
			label: (
				<div
					className={`flex h-8 w-full items-center justify-center rounded text-textGreyColor ${
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
					className={`flex h-8 w-full items-center justify-center rounded text-textGreyColor ${
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
							className={`flex h-8 w-full items-center  justify-center rounded text-textGreyColor ${
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
			<h3 className={` ${className} inner-headings mb-0.5 mt-6 dark:text-blue-dark-medium`}>Choose your vote</h3>
			<div className='flex items-start justify-between'>
				<Segmented
					block
					className={`${className} mb-6 w-[48%] rounded-[4px] border-[1px] border-solid border-section-light-container bg-white pt-1 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay`}
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
						className='-mt-5 w-[48%]'
						formName={EFormType.AYE_NAY_FORM}
						onBalanceChange={handleBalanceChange}
						handleSubmit={handleSubmit}
						forSpecificPost={forSpecificPost}
						showConvictionBar={false}
					/>
				)}
				{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote !== EVoteDecisionType.SPLIT && vote !== EVoteDecisionType.ABSTAIN && vote !== EVoteDecisionType.AYE && (
					<VotingFormCard
						form={ayeNayForm}
						className='-mt-5 w-[48%]'
						formName={EFormType.AYE_NAY_FORM}
						onBalanceChange={handleBalanceChange}
						handleSubmit={handleSubmit}
						forSpecificPost={forSpecificPost}
						showConvictionBar={false}
					/>
				)}

				{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote === 'abstain' && (
					<VotingFormCard
						form={abstainFrom}
						isUsedInTinderWebView={true}
						className='-mt-5 w-[48%]'
						formName={EFormType.ABSTAIN_FORM}
						onBalanceChange={handleBalanceChange}
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
							}
						}}
						handleSubmit={handleSubmit}
						forSpecificPost={forSpecificPost}
						showConvictionBar={false}
					/>
				)}
			</div>
			{proposalType !== ProposalType.FELLOWSHIP_REFERENDUMS && vote === 'abstain' && (
				<div className='w-full'>
					<AbstainOptions
						form={abstainFrom}
						isUsedInTinderWebView={true}
						className=''
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
							}
						}}
						handleSubmit={handleSubmit}
						forSpecificPost={forSpecificPost}
						showConvictionBar={false}
					/>
				</div>
			)}
			<article className={`${className} flex items-center justify-between`}>
				<div className='w-[48%]'>
					<label className='inner-headings mb-[2px] dark:text-blue-dark-medium'>
						<span className='flex items-center'>Set Conviction</span>
						<Slider
							marks={marks}
							tooltip={{ open: false }}
							step={null}
							className='dark:text-white'
							rootClassName='dark:text-white'
							onChange={(value) => {
								handleConvictionChange(getMarkValue(value as number));
								const markValue = getMarkValue(value as number);
								if (!forSpecificPost) {
									dispatch(editBatchValueChanged({ values: { conviction: parseFloat(markValue.replace('x', '')) } }));
								} else {
									dispatch(
										editCartPostValueChanged({
											values: {
												conviction: parseFloat(markValue.replace('x', '')) || 0.1
											}
										})
									);
								}
							}}
							defaultValue={0}
						/>
					</label>
				</div>

				<div className='flex h-[46px] w-[48%] items-center justify-between rounded-md bg-lightWhite p-3 dark:bg-highlightBg'>
					<div className='flex items-center gap-x-1'>
						<Image
							src='/assets/icons/lock-icon.svg'
							alt='lock-icon'
							width={24}
							height={24}
							className={theme === 'dark' ? 'dark-icons' : ''}
						/>
						<p className='m-0 p-0 text-sm text-lightBlue dark:text-white'>Locking period</p>
					</div>
					<p className='m-0 p-0 text-sm text-lightBlue dark:text-blue-dark-medium'>{lockingPeriodMessage}</p>
				</div>
			</article>
		</>
	);
	return VoteUI;
};

export default styled(OptionWrapper)`
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
	.ant-slider .ant-slider-handle::before {
		content: '';
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		top: -5px;
		width: 15px;
		height: 20px;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
		background-color: #e5007a !important;
		box-shadow: 0 0 0 2px #e5007a !important;
		border-radius: 8px;
		cursor: pointer;
		transition:
			inset-inline-start 0.2s,
			inset-block-start 0.2s,
			width 0.2s,
			height 0.2s,
			box-shadow 0.2s;
	}
	.ant-slider .ant-slider-handle:hover::before {
		content: '';
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		top: -5px;
		width: 15px;
		height: 20px;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
		background-color: #e5007a !important;
		box-shadow: 0 0 0 2px #e5007a !important;
		border-radius: 8px;
		cursor: pointer;
		transition:
			inset-inline-start 0.2s,
			inset-block-start 0.2s,
			width 0.2s,
			height 0.2s,
			box-shadow 0.2s;
	}

	.ant-slider .ant-slider-handle:hover::before,
	.ant-slider .ant-slider-handle:active::before,
	.ant-slider .ant-slider-handle:focus::before {
		content: '';
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		top: -5px;
		width: 15px;
		height: 20px;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
		background-color: #e5007a !important;
		box-shadow: 0 0 0 2px #e5007a !important;
		border-radius: 8px;
		cursor: pointer;
		transition:
			inset-inline-start 0.2s,
			inset-block-start 0.2s,
			width 0.2s,
			height 0.2s,
			box-shadow 0.2s;
	}

	.ant-slider .ant-slider-handle::after {
		content: '';
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		top: -5px;
		width: 15px;
		height: 20px;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
		background-color: #e5007a !important;
		box-shadow: 0 0 0 2px #e5007a !important;
		border-radius: 8px;
		cursor: pointer;
		transition:
			inset-inline-start 0.2s,
			inset-block-start 0.2s,
			width 0.2s,
			height 0.2s,
			box-shadow 0.2s;
	}

	.ant-slider .ant-slider-handle:hover::after,
	.ant-slider .ant-slider-handle:active::after,
	.ant-slider .ant-slider-handle:focus::after {
		content: '';
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		top: -5px;
		width: 15px;
		height: 20px;
		box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
		background-color: #e5007a !important;
		box-shadow: 0 0 0 2px #e5007a !important;
		border-radius: 8px;
		cursor: pointer;
		transition:
			inset-inline-start 0.2s,
			inset-block-start 0.2s,
			width 0.2s,
			height 0.2s,
			box-shadow 0.2s;
	}
	.ant-slider-horizontal .ant-slider-mark {
		top: 22px;
	}
	.ant-slider .ant-slider-dot {
		width: 3px !important;
		height: 12px !important;
		margin-top: -2px !important;
		border-radius: 0 !important;
	}
	.ant-slider .ant-slider-rail {
		background-color: #f6f7f9 !important;
	}
	.ant-segmented .ant-segmented-item-selected {
		box-shadow: none !important;
	}
`;
