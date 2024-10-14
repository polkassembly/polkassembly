// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Divider, Modal } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { StopOutlined } from '@ant-design/icons';
import ImageIcon from '~src/ui-components/ImageIcon';
import { batchVotesActions } from '~src/redux/batchVoting';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import DefaultVotingOptionsModal from '../../Listing/Tracks/DefaultVotingOptionsModal';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import { useTheme } from 'next-themes';
import { useBatchVotesSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import CardPostInfo from '../PostInfoComponents/CardPostInfo';
import { useRouter } from 'next/router';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import Image from 'next/image';
import { IDeleteBatchVotes, IupdateBatchVotes } from '../types';
import DeletedModalContent from './DeletedModalContent';
import { useAppDispatch } from '~src/redux/store';
import { editCartPostValueChanged } from '~src/redux/batchVoting/actions';

interface IProposalInfoCard {
	voteInfo: any;
	index: number;
	key?: number;
	reloadBatchCart: () => void;
}

const ProposalInfoCard: FC<IProposalInfoCard> = (props) => {
	const { index, voteInfo, reloadBatchCart } = props;
	const dispatch = useAppDispatch();
	const router = useRouter();
	const user = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const { resolvedTheme: theme } = useTheme();
	const { edit_vote_details, batch_vote_details, vote_cart_data, is_field_edited } = useBatchVotesSelector();
	const [openEditModal, setOpenEditModal] = useState<boolean>(false);
	const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
	const [deletedPostId, setDeletedPostId] = useState<number>(0);
	const [openViewProposalModal, setOpenViewProposalModal] = useState<boolean>(false);
	const handleRemove = (postId: number) => {
		setDeletedPostId(postId);
		setOpenDeleteModal(true);
	};

	useEffect(() => {
		if (openEditModal) {
			dispatch(batchVotesActions.setVote(voteInfo.decision));
		}
	}, [openEditModal, dispatch, voteInfo.decision]);

	const editPostVoteDetails = async () => {
		const updatedCartVotes: any[] = vote_cart_data.map((item) => {
			if (item.id === voteInfo.id) {
				return {
					...item,
					abstainBalance: edit_vote_details?.voteOption === 'abstain' ? edit_vote_details?.abstainVoteBalance : '0',
					ayeBalance:
						edit_vote_details?.voteOption === 'aye'
							? edit_vote_details.ayeVoteBalance
							: edit_vote_details?.voteOption === 'abstain'
							? edit_vote_details.abstainAyeVoteBalance
							: '0',
					conviction: edit_vote_details.conviction,
					decision: edit_vote_details.voteOption,
					nayBalance:
						edit_vote_details?.voteOption === 'nay' ? edit_vote_details.nyeVoteBalance : edit_vote_details?.voteOption === 'abstain' ? edit_vote_details.abstainNyeVoteBalance : '0'
				};
			}
			return item;
		});

		dispatch(batchVotesActions.setVoteCartData(updatedCartVotes));

		const { error } = await nextApiClientFetch<IupdateBatchVotes>('api/v1/votes/batch-votes-cart/updateBatchVoteCart', {
			vote: {
				abstain_balance: edit_vote_details?.voteOption === 'abstain' ? edit_vote_details?.abstainVoteBalance : '0',
				aye_balance:
					edit_vote_details?.voteOption === 'aye' ? edit_vote_details.ayeVoteBalance : edit_vote_details?.voteOption === 'abstain' ? edit_vote_details.abstainAyeVoteBalance : '0',
				decision: edit_vote_details?.voteOption,
				id: voteInfo?.id,
				locked_period: edit_vote_details?.conviction,
				nay_balance:
					edit_vote_details?.voteOption === 'nay' ? edit_vote_details.nyeVoteBalance : edit_vote_details?.voteOption === 'abstain' ? edit_vote_details.abstainNyeVoteBalance : '0',
				network: network,
				referendum_index: voteInfo.referendumIndex,
				user_address: user?.loginAddress
			}
		});
		if (error) {
			console.error(error);
			return;
		}
		reloadBatchCart();
	};

	const deletePostDetails = async () => {
		const { error } = await nextApiClientFetch<IDeleteBatchVotes>('api/v1/votes/batch-votes-cart/deleteBatchVotesCart', {
			id: voteInfo?.id
		});
		if (error) {
			console.error(error);
			return;
		} else {
			dispatch(batchVotesActions.setRemoveVoteCartItem(voteInfo?.id));
		}
	};

	const voteBalance = voteInfo?.decision === 'aye' ? voteInfo.ayeBalance : voteInfo?.decision === 'nay' ? voteInfo?.nayBalance : '0';

	return (
		<section
			key={index}
			className='mb-4 h-[106px] w-full rounded-xl border border-solid border-grey_border bg-white dark:border dark:border-solid dark:border-separatorDark dark:bg-transparent'
		>
			<article className='flex h-[53px] items-center justify-start gap-x-4 px-4'>
				<p className='text-bodyblue m-0 p-0 text-xs'>#{voteInfo.referendumIndex}</p>
				<p className='text-bodyblue m-0 p-0 text-xs dark:text-blue-dark-medium'>{voteInfo?.proposal?.title?.substring(0, 50)}...</p>
				<Button
					className='m-0 ml-auto flex items-center justify-center border-none bg-transparent p-0 shadow-none'
					onClick={() => {
						setOpenViewProposalModal(true);
					}}
				>
					<Image
						src={'/assets/icons/eye-icon-grey.svg'}
						alt='eye-icon'
						height={20}
						width={20}
						className={classNames(theme === 'dark' ? 'dark-icons' : '', 'cursor-pointer')}
					/>
				</Button>
			</article>
			<Divider
				type='horizontal'
				className='border-l-1 my-0 border-grey_border dark:border-separatorDark'
			/>
			<article className='flex h-[53px] items-center justify-start gap-x-4 px-4'>
				<div className='mr-auto flex items-center gap-x-1'>
					{voteInfo?.decision === 'aye' || voteInfo?.decision === 'nay' ? (
						<ImageIcon
							src={`${voteInfo?.decision === 'aye' ? '/assets/icons/like-icon-green.svg' : '/assets/icons/dislike-icon-red.svg'}`}
							imgClassName='text-black'
							alt='like-dislike-icon'
						/>
					) : (
						<StopOutlined className='text-[#909090] dark:text-white' />
					)}
					<p
						className={`${
							voteInfo?.decision === 'aye'
								? 'text-aye_green dark:text-aye_green_Dark'
								: voteInfo?.decision === 'nay'
								? 'text-nay_red dark:text-nay_red_Dark'
								: 'text-bodyBlue dark:text-blue-dark-medium'
						} text-capitalize m-0 p-0 text-xs`}
					>
						{voteInfo?.decision}
					</p>
				</div>
				<div className='flex items-center justify-center gap-x-2'>
					<p className='m-0 p-0 text-xs text-bodyBlue dark:text-blue-dark-medium'>{formatedBalance(voteBalance, unit, 0)} DOT</p>
					<p className='m-0 p-0 text-xs text-bodyBlue dark:text-blue-dark-medium'>{voteInfo?.lockedPeriod || '0'}x</p>
				</div>
				<div className='ml-auto flex items-center gap-x-4'>
					<Button
						className='m-0 flex items-center justify-center border-none bg-transparent p-0 shadow-none'
						onClick={() => {
							setOpenEditModal(true);
						}}
					>
						<Image
							src={'/assets/icons/edit-option-icon.svg'}
							alt='edit-icon'
							height={20}
							width={20}
							className={classNames(theme === 'dark' ? 'dark-icons' : '', 'cursor-pointer')}
						/>
					</Button>
					<Button
						className='m-0 flex items-center justify-center border-none bg-transparent p-0 shadow-none'
						onClick={() => handleRemove(voteInfo.post_id)}
					>
						<Image
							src={'/assets/icons/bin-icon-grey.svg'}
							alt='bin-icon'
							height={20}
							width={20}
							className={classNames(theme === 'dark' ? 'dark-icons' : '', 'cursor-pointer')}
						/>
					</Button>
				</div>
				<Modal
					wrapClassName='dark:bg-modalOverlayDark'
					className={classNames(poppins.className, poppins.variable, 'w-[600px]')}
					open={openEditModal}
					footer={
						<div className='-mx-6 mt-9 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
							<CustomButton
								variant='default'
								text='Cancel'
								buttonsize='sm'
								onClick={() => {
									dispatch(batchVotesActions.setVote(voteInfo.decision));
									dispatch(
										editCartPostValueChanged({
											values: {
												abstainAyeVoteBalance: voteInfo?.ayeBalance || '0',
												abstainNyeVoteBalance: voteInfo?.nayBalance || '0',
												abstainVoteBalance: voteInfo?.abstainBalance || '0',
												ayeVoteBalance: voteInfo.ayeBalance || '0',
												conviction: voteInfo?.lockedPeriod || '0.1',
												nyeVoteBalance: voteInfo.nayBalance || '0',
												voteOption: voteInfo?.decision || 'aye'
											}
										})
									);
									setOpenEditModal(false);
								}}
							/>
							<CustomButton
								variant='primary'
								text='Save'
								buttonsize='sm'
								className={`${!is_field_edited ? 'opacity-50' : ''}`}
								disabled={!is_field_edited}
								onClick={() => {
									dispatch(
										batchVotesActions.setvoteCardInfo({
											abstainAyeBalance: edit_vote_details?.voteOption === 'aye' || edit_vote_details?.voteOption === 'nay' ? '0' : edit_vote_details?.abstainAyeVoteBalance,
											abstainNayBalance: edit_vote_details?.voteOption === 'aye' || edit_vote_details?.voteOption === 'nay' ? '0' : edit_vote_details?.abstainNyeVoteBalance,
											decision: edit_vote_details?.voteOption || batch_vote_details?.voteOption || 'aye',
											post_id: voteInfo.post_id,
											post_title: voteInfo.post_title,
											voteBalance:
												edit_vote_details?.voteOption === 'aye'
													? edit_vote_details?.ayeVoteBalance
														? edit_vote_details?.ayeVoteBalance
														: '0'
													: edit_vote_details?.voteOption === 'nay'
													? edit_vote_details?.nyeVoteBalance
														? edit_vote_details?.nyeVoteBalance
														: '0'
													: edit_vote_details?.abstainVoteBalance
													? edit_vote_details?.abstainVoteBalance
													: '0',
											voteConviction: edit_vote_details?.conviction || 0.1
										})
									);
									setOpenEditModal(false);
									editPostVoteDetails();
								}}
							/>
						</div>
					}
					maskClosable={false}
					closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
					onCancel={() => {
						setOpenEditModal(false);
					}}
					title={
						<div className='-mx-6 flex items-center gap-x-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-5 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
							<Image
								src={'/assets/icons/edit-option-icon.svg'}
								alt='edit-icon'
								height={20}
								width={20}
								className={classNames(theme === 'dark' ? 'dark-icons' : '', 'cursor-pointer')}
							/>
							Edit Vote Details
						</div>
					}
				>
					<DefaultVotingOptionsModal
						theme={theme}
						currentDecision={voteInfo?.decision}
						forSpecificPost={true}
						postEdit={voteInfo.post_id}
						voteInfo={voteInfo}
					/>
				</Modal>
				<Modal
					wrapClassName='dark:bg-modalOverlayDark'
					className={classNames(poppins.className, poppins.variable, 'w-[600px]')}
					open={openViewProposalModal}
					footer={
						<div className='-mx-6 mt-9 flex items-center justify-center gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
							<CustomButton
								variant='default'
								text='View Details'
								className='w-full'
								buttonsize='sm'
								onClick={() => {
									router.push(`/referenda/${voteInfo?.proposal?.id}`);
									setOpenViewProposalModal(false);
								}}
							/>
						</div>
					}
					maskClosable={false}
					closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
					onCancel={() => {
						setOpenViewProposalModal(false);
					}}
				>
					<CardPostInfo
						post={voteInfo?.proposal}
						proposalType={voteInfo?.proposal?.type}
					/>
				</Modal>
				<Modal
					wrapClassName='dark:bg-modalOverlayDark'
					className={classNames(poppins.className, poppins.variable, 'w-[600px]')}
					open={openDeleteModal}
					footer={
						<div className='-mx-6 mt-4 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
							<CustomButton
								variant='default'
								text='No, Cancel'
								buttonsize='sm'
								onClick={() => {
									setOpenDeleteModal(false);
								}}
							/>
							<CustomButton
								variant='primary'
								text='Yes, Remove'
								buttonsize='sm'
								onClick={() => {
									dispatch(batchVotesActions.setRemoveVoteCardInfo(deletedPostId));
									deletePostDetails();
									setOpenDeleteModal(false);
								}}
							/>
						</div>
					}
					maskClosable={false}
					closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
					onCancel={() => {
						setOpenDeleteModal(false);
					}}
					title={
						<div className='-mx-6 flex items-center gap-x-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-2 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
							<Image
								src={'/assets/icons/bin-icon-grey.svg'}
								alt='bin-icon'
								height={20}
								width={20}
								className={classNames(theme === 'dark' ? 'dark-icons' : '', 'cursor-pointer')}
							/>
							Remove proposal from cart?
						</div>
					}
				>
					<DeletedModalContent
						title={voteInfo?.proposal?.title}
						id={voteInfo.referendumIndex}
					/>
				</Modal>
			</article>
		</section>
	);
};

export default ProposalInfoCard;
