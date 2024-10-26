// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { Button, message, Modal } from 'antd';
import { poppins } from 'pages/_app';
import BN from 'bn.js';

import { useCommentDataContext, usePostDataContext } from '~src/context';
import { formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import { EVoteDecisionType } from '~src/types';
import { formatedBalance } from '~src/util/formatedBalance';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import PostCommentForm from '~src/components/Post/PostCommentForm';
import styled from 'styled-components';
import BackgroundImage from '~assets/icons/vector.svg';
import LeftQuote from '~assets/icons/chatbox-icons/icon-left-quote.svg';
import RightQuote from '~assets/icons/chatbox-icons/icon-right-quote.svg';
import { IComment } from '~src/components/Post/Comment/Comment';
import { getSortedComments } from '~src/components/Post/Comment/CommentsContainer';
import { useNetworkSelector } from '~src/redux/selectors';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { parseBalance } from '../../Modal/VoteData/utils/parseBalaceToReadable';
import ImageIcon from '~src/ui-components/ImageIcon';
import Address from '~src/ui-components/Address';
import { useTheme } from 'next-themes';

const ZERO_BN = new BN(0);

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
	delegatedVotingPower?: BN;
}

const VoteInitiatedModal = ({
	className,
	open,
	setOpen,
	multisig,
	address,
	balance,
	conviction,
	vote,
	ayeVoteValue,
	nayVoteValue,
	abstainVoteValue,
	delegatedVotingPower = ZERO_BN,
	icon
}: Props) => {
	const { network } = useNetworkSelector();
	const { setComments, timelines, setTimelines, comments } = useCommentDataContext();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [posted, setPosted] = useState(false);
	const { resolvedTheme: theme } = useTheme();
	const { postData } = usePostDataContext();

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

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

	const handleCopyClicked = () => {
		navigator.clipboard.writeText(window.location.href);
		message.success('Post link copied');
	};

	const onShareTwitter = () => {
		const text = `${encodeURIComponent(`I've just cast my vote for the "${postData?.title}"`)}%0A%0A${encodeURIComponent(
			`Check out the proposal and own the decision by casting your vote too! ${window.location.href || ''}`
		)}%0A%0A`;

		const url = `https://twitter.com/intent/tweet?text=${text}`;
		window.open(url, '_blank')?.focus();
	};

	const onShareDiscord = () => {
		const text = `${encodeURIComponent(`I've just cast my vote for the "${postData?.title}"`)}%0A%0A${encodeURIComponent(
			`Check out the proposal and own the decision by casting your vote too! ${window.location.href || ''}`
		)}%0A%0A`;
		navigator.clipboard.writeText(decodeURIComponent(text));
		message.success('Vote details copied to clipboard. You can paste it in Discord.');
		setTimeout(() => {
			window.open('https://discord.com/channels/@me', '_blank')?.focus();
		}, 3000);
	};

	return (
		<Modal
			open={open}
			className={`${poppins.variable} ${poppins.className} delegate mt-[100px] w-[604px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			onCancel={() => {
				setOpen(false);
				setPosted(false);
			}}
			footer={false}
			closable
		>
			<div className='-mt-[132px] flex flex-col items-center justify-center'>
				{icon}
				<div className='flex items-center justify-center gap-x-2'>
					<h2 className='mt-2 text-[20px] font-semibold tracking-[0.0015em] dark:text-white'>
						Voted{' '}
						<span
							className={`${
								vote === EVoteDecisionType.AYE ? 'text-[green]' : `${vote === EVoteDecisionType.NAY ? 'text-[red]' : 'text-bodyBlue dark:text-blue-dark-high'}`
							} capitalize`}
						>
							{vote}
						</span>{' '}
						successfully
					</h2>
					<span className='m-0 p-0 text-sm dark:text-blue-dark-high'>with</span>
					<span className='font-medium'>
						<Address
							isTruncateUsername={false}
							address={address}
							className='address text-base'
							displayInline
						/>{' '}
					</span>
				</div>
				<div className='-mt-1 flex flex-col items-center justify-center gap-[14px]'>
					<div className='flex items-center justify-center gap-x-2'>
						<div className='flex gap-x-2 font-normal text-lightBlue dark:text-blue-dark-medium'>
							<span className='m-0 p-0 text-base font-semibold text-bodyBlue dark:text-blue-dark-high'>{conviction || '0.1'}x Conviction</span>
							<span className='m-0 mt-0.5 p-0 text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>with</span>
						</div>
						<div className='text-[20px] font-semibold text-pink_primary'>
							{conviction
								? parseBalance(balance.mul(new BN(conviction)).add(delegatedVotingPower).toString(), 0, true, network)
								: parseBalance(balance.add(delegatedVotingPower).toString(), 0, true, network)}
						</div>
					</div>
					{+formatedBalance(delegatedVotingPower.toString(), unit, 0) !== 0 && (
						<div className='-mt-4 flex gap-2 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>
							<span className='min-w-[120px]'>Delegated Power:</span>
							<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>{parseBalance(balance.add(delegatedVotingPower).toString(), 0, true, network)}</span>
						</div>
					)}
					{vote === EVoteDecisionType.SPLIT && (
						<div className=' flex flex-wrap justify-center text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>
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
						<div className='flex flex-wrap justify-center text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>
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
					{multisig && (
						<div className='flex gap-6 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>
							<span className='min-w-[120px]'>With Multisig:</span>
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
					{multisig && (
						<div className='flex h-[21px] gap-6 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>
							<span className='min-w-[120px]'>Vote Link:</span>
							<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
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
			<div className='relative mt-3 w-full'>
				<div className='vector min-w-[250px]'>
					<BackgroundImage className='background-image -ml-[15px] min-w-[250px] text-2xl' />
				</div>
				<span className='quote quote--left -left-[23px] -top-[2px] h-[40px] w-[48px] justify-center rounded-br-xxl bg-white pt-[10px] text-center dark:bg-section-dark-overlay'>
					<LeftQuote />
				</span>
				<p className='-mt-[155px] text-center dark:text-blue-dark-medium'>
					Your <span className='capitalize text-pink_primary '>&apos;{vote}&apos;</span> vote is in! Mind sharing your reason for this vote?
				</p>
				<div className='form-group form-container ml-4'>
					<PostCommentForm
						className='-mt-[25px] ml-4 w-[100%]'
						isUsedInSuccessModal={true}
						setCurrentState={handleCurrentCommentAndTimeline}
						voteDecision={vote}
						setSuccessModalOpen={setOpen}
						voteReason={true}
						posted={posted}
						setPosted={setPosted}
					/>
				</div>
				<span className='quote quote--right -right-[24px] -top-[2px] h-[40px] w-[48px] rounded-bl-xxl bg-white pt-[10px] text-center dark:bg-section-dark-overlay'>
					<RightQuote />
				</span>
			</div>
			<p className='m-0 -mt-8 flex justify-center p-0 text-sm text-bodyBlue dark:text-blue-dark-medium'>Share your vote on:</p>
			<div className='mb-1 mt-2 flex items-center justify-center gap-x-2'>
				<Button
					className='flex h-[40px] w-[40px] items-center justify-center rounded-lg border-none bg-[#FEF2F8] dark:bg-[#33071E]'
					onClick={() => {
						onShareTwitter();
					}}
				>
					<ImageIcon
						src={theme === 'dark' ? '/assets/icons/x-icon-pink-dark.svg' : '/assets/icons/x-icon-pink.svg'}
						alt='twitter-icon'
					/>
				</Button>
				<Button
					className='flex h-[40px] w-[40px] items-center justify-center rounded-lg border-none bg-[#FEF2F8] dark:bg-[#33071E]'
					onClick={() => {
						onShareDiscord();
					}}
				>
					<ImageIcon
						src={theme === 'dark' ? '/assets/icons/discord-pink-dark.svg' : '/assets/icons/discord-pink.svg'}
						alt='discord-icon'
					/>
				</Button>
				{/* <Button className='flex h-[40px] w-[40px] items-center justify-center rounded-lg border-none bg-[#FEF2F8]'>
					<ImageIcon
						src='/assets/icons/riot-pink.svg'
						alt='riot-icon'
					/>
				</Button> */}
				<Button
					className='flex h-[40px] w-[40px] items-center justify-center rounded-lg border-none bg-[#FEF2F8] dark:bg-[#33071E]'
					onClick={() => {
						handleCopyClicked();
					}}
				>
					<ImageIcon
						src={theme === 'dark' ? '/assets/icons/copy-pink-dark.svg' : '/assets/icons/copy-pink.svg'}
						alt='copy-icon'
					/>
				</Button>
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
