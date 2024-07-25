// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Divider, Modal } from 'antd';
import React, { FC, useState } from 'react';
import { StopOutlined } from '@ant-design/icons';
import ImageIcon from '~src/ui-components/ImageIcon';
import { useDispatch } from 'react-redux';
import { batchVotesActions } from '~src/redux/batchVoting';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import DefaultVotingOptionsModal from '../Listing/Tracks/DefaultVotingOptionsModal';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import { useTheme } from 'next-themes';
import { useBatchVotesSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import CardPostInfo from '../Post/CardPostInfo';
import { useRouter } from 'next/router';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';

interface IProposalInfoCard {
	voteInfo: any;
	index: number;
	key?: number;
}

const ProposalInfoCard: FC<IProposalInfoCard> = (props) => {
	const { index, voteInfo } = props;
	const dispatch = useDispatch();
	const router = useRouter();
	const user = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const { resolvedTheme: theme } = useTheme();
	const { edit_vote_details, batch_vote_details } = useBatchVotesSelector();
	const [openEditModal, setOpenEditModal] = useState<boolean>(false);
	const [openViewProposalModal, setOpenViewProposalModal] = useState<boolean>(false);
	const handleRemove = (postId: number) => {
		dispatch(batchVotesActions.setRemoveVoteCardInfo(postId));
		deletePostDetails();
	};

	const editPostVoteDetails = async () => {
		const { error } = await nextApiClientFetch<any>('api/v1/votes/batch-votes-cart/updateBatchVoteCart', {
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
		} else {
			dispatch(batchVotesActions.updateVoteCartItem(voteInfo?.id));
		}
	};

	const deletePostDetails = async () => {
		const { error } = await nextApiClientFetch<any>('api/v1/votes/batch-votes-cart/deleteBatchVotesCart', {
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
			className='mb-4 h-[106px] w-full rounded-xl border border-solid border-grey_border bg-white dark:border dark:border-solid dark:border-[#D2D8E0] dark:bg-transparent'
		>
			<article className='flex h-[53px] items-center justify-start gap-x-4 px-4'>
				<p className='text-bodyblue m-0 p-0 text-xs'>#{voteInfo.referendumIndex}</p>
				<p className='text-bodyblue m-0 p-0 text-xs'>{voteInfo?.proposal?.title?.substring(0, 50)}...</p>
				<Button
					className='m-0 ml-auto flex items-center justify-center border-none bg-transparent p-0'
					onClick={() => {
						setOpenViewProposalModal(true);
					}}
				>
					<ImageIcon
						src='/assets/icons/eye-icon-grey.svg'
						alt='eye-icon'
						imgWrapperClassName='ml-auto'
					/>
				</Button>
			</article>
			<Divider
				type='horizontal'
				className='border-l-1 my-0 border-grey_border dark:border-icon-dark-inactive'
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
							voteInfo?.decision === 'aye' ? 'text-aye_green dark:text-aye_green_Dark' : voteInfo?.decision === 'nay' ? 'text-nye_red dark:text-nay_red_Dark' : 'text-bodyBlue'
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
						className='m-0 flex items-center justify-center border-none bg-transparent p-0'
						onClick={() => {
							setOpenEditModal(true);
						}}
					>
						<ImageIcon
							src='/assets/icons/edit-option-icon.svg'
							alt='edit-icon'
						/>
					</Button>
					<Button
						className='m-0 flex items-center justify-center border-none bg-transparent p-0'
						onClick={() => handleRemove(voteInfo.post_id)}
					>
						<ImageIcon
							src='/assets/icons/bin-icon-grey.svg'
							alt='bin-icon'
						/>
					</Button>
				</div>
				<Modal
					wrapClassName='dark:bg-modalOverlayDark'
					className={classNames(poppins.className, poppins.variable, 'w-[600px]')}
					open={openEditModal}
					footer={
						<div className='-mx-6 mt-9 flex items-center justify-center gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
							<CustomButton
								variant='default'
								text='Cancel'
								buttonsize='sm'
								onClick={() => {
									setOpenEditModal(false);
								}}
							/>
							<CustomButton
								variant='primary'
								text='Done'
								buttonsize='sm'
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
													: edit_vote_details?.voteOption === 'nay'
													? edit_vote_details?.nyeVoteBalance
													: edit_vote_details?.abstainVoteBalance,
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
						<div className='-mx-6 flex items-center gap-x-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-2 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
							<ImageIcon
								src='/assets/icons/edit-option-icon.svg'
								alt='edit-icon'
							/>
							Edit Vote Details
						</div>
					}
				>
					<DefaultVotingOptionsModal
						theme={theme}
						forSpecificPost={true}
						postEdit={voteInfo.post_id}
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
			</article>
		</section>
	);
};

export default ProposalInfoCard;
