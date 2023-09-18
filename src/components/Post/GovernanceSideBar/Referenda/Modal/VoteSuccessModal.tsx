// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import CloseIcon from '~assets/icons/close.svg';
import { poppins } from 'pages/_app';
import BN from 'bn.js';

import { useCommentDataContext, useNetworkContext } from '~src/context';
import Address from '~src/ui-components/Address';
import { formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import AbstainGray from '~assets/icons/abstainGray.svg';
import { EVoteDecisionType } from '~src/types';
import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import SplitYellow from '~assets/icons/split-yellow-icon.svg';
import { formatedBalance } from '~src/util/formatedBalance';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import PostCommentForm from '~src/components/Post/PostCommentForm';
import styled from 'styled-components';
import BackgroundImage from '~assets/icons/vector.svg';
import LeftQuote from '~assets/icons/chatbox-icons/icon-left-quote.svg';
import RightQuote from '~assets/icons/chatbox-icons/icon-right-quote.svg';
import { IComment } from '~src/components/Post/Comment/Comment';
import { getSortedComments } from '~src/components/Post/Comment/CommentsContainer';

interface Props {
	className?: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
	address: string;
	multisig?: string;
	balance: BN;
	conviction?: number;
	title: string;
	vote: EVoteDecisionType;
	votedAt: string;
	ayeVoteValue?: BN;
	nayVoteValue?: BN;
	abstainVoteValue?: BN;
	icon: ReactElement;
}

const VoteInitiatedModal = ({
	className,
	open,
	setOpen,
	address,
	multisig,
	balance,
	conviction,
	title,
	vote,
	votedAt,
	ayeVoteValue,
	nayVoteValue,
	abstainVoteValue,
	icon
}: Props) => {
	const { network } = useNetworkContext();
	const { setComments, timelines, setTimelines, comments } = useCommentDataContext();
	const [posted, setPosted] = useState(false);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleCurrentCommentAndTimeline = (postId: string, type: string, comment: IComment) => {
		const key = `${postId}_${type}`;
		const commentsPayload = {
			...comments,
			[key]: [...comments[key], comment]
		};
		setComments(getSortedComments(commentsPayload));
		const timelinePayload = timelines.map((timeline) => (timeline.index === postId ? { ...timeline, commentsCount: timeline.commentsCount + 1 } : timeline));
		setTimelines(timelinePayload);
	};

	title = 'Voted Successfully';

	return (
		<Modal
			open={open}
			className={`${poppins.variable} ${poppins.className} delegate w-[604px]`}
			wrapClassName={className}
			closeIcon={<CloseIcon onClick={() => setPosted(true)} />}
			onCancel={() => setOpen(false)}
			centered
			footer={false}
			maskClosable={false}
		>
			<div className='-mt-[132px] flex flex-col items-center justify-center'>
				{icon}
				<h2 className='mt-2 text-[20px] font-semibold tracking-[0.0015em]'>{title}</h2>
				<div className='flex flex-col items-center justify-center gap-[14px]'>
					<div className='text-[24px] font-semibold text-pink_primary'>
						{formatedBalance(balance.toString(), unit)}
						{` ${unit}`}
					</div>
					{vote === EVoteDecisionType.SPLIT && (
						<div className=' flex flex-wrap justify-center text-sm font-normal text-bodyBlue'>
							{' '}
							<span className='mr-3'>
								<span className='font-semibold'> Aye: </span>
								<span className='font-normal'>
									{ayeVoteValue ? formatedBalance(ayeVoteValue.toString(), unit) : 0}
									{` ${unit}`}
								</span>
							</span>{' '}
							<span className='mr-3'>
								<span className='font-semibold'>Nay: </span>
								<span className='font-normal'>
									{nayVoteValue ? formatedBalance(nayVoteValue.toString(), unit) : 0}
									{` ${unit}`}
								</span>
							</span>
						</div>
					)}
					{vote === EVoteDecisionType.ABSTAIN && (
						<div className='flex flex-wrap justify-center text-sm font-normal text-bodyBlue'>
							{' '}
							<span className='mr-3'>
								<span className='font-semibold'> Abstain:</span>{' '}
								<span className='font-normal'>
									{abstainVoteValue ? formatedBalance(abstainVoteValue.toString(), unit) : 0}
									{` ${unit}`}
								</span>
							</span>{' '}
							<span className='mr-3'>
								{' '}
								<span className='font-semibold'>Aye:</span>{' '}
								<span className='font-normal'>
									{' '}
									{ayeVoteValue ? formatedBalance(ayeVoteValue.toString(), unit) : 0}
									{` ${unit}`}
								</span>
							</span>{' '}
							<span className='mr-3'>
								<span className='font-semibold'>Nay:</span>{' '}
								<span className='font-normal'>
									{nayVoteValue ? formatedBalance(nayVoteValue.toString(), unit) : 0}
									{` ${unit}`}
								</span>
							</span>
						</div>
					)}
					<div className='flex flex-col items-start justify-center gap-[10px]'>
						<div className='flex gap-3 text-sm font-normal text-lightBlue'>
							With address:{' '}
							<span className='font-medium'>
								<Address
									isTruncateUsername={false}
									address={address}
									className='address'
									displayInline
								/>{' '}
							</span>
						</div>

						{multisig && (
							<div className='flex gap-[17px] text-sm font-normal text-lightBlue'>
								With Multisig:{' '}
								<span className='font-medium'>
									<Address
										isTruncateUsername={false}
										address={multisig}
										className='address'
										displayInline
									/>{' '}
								</span>
							</div>
						)}

						<div className='flex h-[21px] gap-[70px] text-sm font-normal text-lightBlue'>
							Vote :
							{vote === EVoteDecisionType.AYE ? (
								<p>
									<LikeFilled className='text-[green]' /> <span className='font-medium capitalize text-bodyBlue'>{vote}</span>
								</p>
							) : vote === EVoteDecisionType.NAY ? (
								<div>
									<DislikeFilled className='text-[red]' /> <span className='mb-[5px] font-medium capitalize text-bodyBlue'>{vote}</span>
								</div>
							) : vote === EVoteDecisionType.SPLIT ? (
								<p>
									<SplitYellow /> <span className='font-medium capitalize text-bodyBlue'>{vote}</span>
								</p>
							) : vote === EVoteDecisionType.ABSTAIN ? (
								<p className='flex align-middle'>
									<AbstainGray className='mr-1' /> <span className='font-medium capitalize text-bodyBlue'>{vote}</span>
								</p>
							) : null}
						</div>
						<div className='flex gap-[30px] text-sm font-normal text-lightBlue'>
							{' '}
							Conviction:
							<span className='font-medium text-bodyBlue'>{conviction || '0.1'}x</span>{' '}
						</div>
						<div className='flex h-[21px] gap-[14px] text-sm font-normal text-lightBlue'>
							Time of Vote : <span className='font-medium text-bodyBlue'>{votedAt}</span>
						</div>
						{multisig && (
							<div className='flex h-[21px] gap-11 text-sm font-normal text-lightBlue'>
								Vote Link:{' '}
								<span className='font-medium text-bodyBlue'>
									<a
										className='text-pink_primary'
										href='https://app.polkasafe.xyz/transactions'
										target='_blank'
										rel='noreferrer'
									>
										Polkasafe
									</a>
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
			<div className='relative mt-3 w-full'>
				<div className='vector min-w-[250px]'>
					<BackgroundImage className='background-image -ml-[15px] min-w-[250px] text-2xl' />
				</div>
				<span
					className='quote quote--left -left-[23px] -top-[2px] h-[40px] w-[48px] justify-center pt-[10px] text-center'
					style={{ background: 'conic-gradient(#ffffff 0deg 90deg, #f6f8ff 90deg 180deg, #ffffff 180deg 270deg, #ffffff 270deg 360deg)' }}
				>
					<LeftQuote />
				</span>
				<p className='-mt-[155px] text-center'>
					Your <span className='capitalize text-pink_primary '>&apos;{vote}&apos;</span> vote is in! Mind sharing your reason for this vote?
				</p>
				<div className='form-group form-container ml-4'>
					<PostCommentForm
						className='-mt-[25px] ml-4 w-[100%]'
						posted={posted}
						isUsedInSuccessModal={true}
						setCurrentState={handleCurrentCommentAndTimeline}
						voteDecision={vote}
						setSuccessModalOpen={setOpen}
					/>
				</div>
				<span
					className='quote quote--right -right-[24px] -top-[2px] h-[40px] w-[48px] pt-[10px] text-center'
					style={{ background: 'conic-gradient(#ffffff 0deg 180deg, #f6f8ff 180deg 270deg, #ffffff 270deg 360deg)' }}
				>
					<RightQuote />
				</span>
			</div>
		</Modal>
	);
};
export default styled(VoteInitiatedModal)`
	.mde-header-group {
		display: none !important;
	}
	.mde-tabs {
		display: none !important;
	}
	.mde-text {
		height: 50px !important;
	}
	.tox.tox-tinymce {
		border-radius: 4px !important;
		height: 40px !important;
	}

	.tox-sidebar {
		display: none !important;
	}

	.ant-avatar {
		display: none !important;
	}
	.anticon-info-circle {
		display: none !important;
	}
	.container {
		max-width: 100% !important;
	}
	.ant-form-item-explain-error {
		display: none !important;
	}
`;
