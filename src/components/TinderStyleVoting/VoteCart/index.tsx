// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Modal, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useBatchVotesSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import ProposalInfoCard from './ProposalInfoCard';
import { EVoteDecisionType, NotificationStatus } from '~src/types';
import { useApiContext } from '~src/context';
import BN from 'bn.js';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useDispatch } from 'react-redux';
import { batchVotesActions } from '~src/redux/batchVoting';
import classNames from 'classnames';
import { dmSans } from 'pages/_app';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import VoteSuccessModal from './VoteSuccessModal';
import executeTx from '~src/util/executeTx';
import queueNotification from '~src/ui-components/QueueNotification';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { PostEmptyState } from '~src/ui-components/UIStates';
import { IDeleteBatchVotes } from '../types';
import Alert from '~src/basic-components/Alert';
import Address from '~src/ui-components/Address';

const VoteCart: React.FC = () => {
	const { api, apiReady } = useApiContext();
	const user = useUserDetailsSelector();
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const { loginAddress } = useUserDetailsSelector();
	const [gasFees, setGasFees] = useState<any>();
	const [isDisable, setIsDisable] = useState<boolean>(false);
	const { vote_cart_data } = useBatchVotesSelector();
	const [isLoading, setIsLoading] = useState(false);
	const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(false);

	const getVoteCartData = async () => {
		setIsLoading(true);
		const { data, error } = await nextApiClientFetch<any>('api/v1/votes/batch-votes-cart/getBatchVotesCart', {
			isExternalApiCall: true,
			userAddress: user?.loginAddress
		});
		if (error) {
			setIsLoading(false);
			console.error(error);
			return;
		} else {
			setIsLoading(false);
			dispatch(batchVotesActions.setVoteCartData(data?.votes));
			dispatch(batchVotesActions.setTotalVotesAddedInCart(data?.votes?.length));
		}
	};

	const reloadBatchCart = () => {
		getVoteCartData();
	};

	useEffect(() => {
		getVoteCartData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onFailed = (error: string) => {
		queueNotification({
			header: 'failed!',
			message: error || 'Transaction failed!',
			status: NotificationStatus.ERROR
		});
	};

	const onSuccess = async () => {
		queueNotification({
			header: 'success!',
			message: 'Transaction successful!',
			status: NotificationStatus.SUCCESS
		});
		setIsDisable(true);
		setOpenSuccessModal(true);
		const { error } = await nextApiClientFetch<IDeleteBatchVotes>('api/v1/votes/batch-votes-cart/deleteBatchVotesCart', {
			deleteWholeCart: true
		});
		if (error) {
			console.error(error);
			return;
		} else {
			dispatch(batchVotesActions.setRemoveCartItems([]));
		}
	};

	const voteProposals = async () => {
		if (!api || !apiReady) return;
		const batchCall: any[] = [];
		vote_cart_data.map((vote: any) => {
			let voteTx = null;
			if ([EVoteDecisionType.AYE, EVoteDecisionType.NAY].includes(vote?.decision as EVoteDecisionType)) {
				const balance = vote?.decision === 'aye' ? vote?.ayeBalance : vote?.nayBalance;
				voteTx = api?.tx.convictionVoting.vote(vote?.referendumIndex, {
					Standard: { balance: balance, vote: { aye: vote?.decision === EVoteDecisionType.AYE, conviction: parseInt(vote?.lockedPeriod) } }
				});
			} else if (vote?.decision === EVoteDecisionType.ABSTAIN && vote?.ayeBalance && vote?.nayBalance) {
				try {
					voteTx = api?.tx.convictionVoting.vote(vote?.post_id, {
						SplitAbstain: { abstain: `${vote?.abstainBalance?.toString()}`, aye: `${vote?.ayeBalance?.toString()}`, nay: `${vote?.nayBalance?.toString()}` }
					});
				} catch (e) {
					console.log(e);
				}
			}
			batchCall.push(voteTx);
		});
		const tx = api?.tx?.utility?.batchAll(batchCall);
		// eslint-disable-next-line sort-keys
		await executeTx({ address: loginAddress, api, apiReady, network, errorMessageFallback: 'error', onFailed: onFailed, onSuccess: onSuccess, tx });
	};

	const getGASFees = () => {
		if (!api || !apiReady) return;
		const batchCall: any[] = [];
		vote_cart_data.map((vote: any) => {
			let voteTx = null;
			if ([EVoteDecisionType.AYE, EVoteDecisionType.NAY].includes(vote?.decision as EVoteDecisionType)) {
				const balance = vote?.decision === 'aye' ? vote?.ayeBalance : vote?.nayBalance;
				voteTx = api?.tx.convictionVoting.vote(vote?.referendumIndex, {
					Standard: { balance: balance, vote: { aye: vote?.decision === EVoteDecisionType.AYE, conviction: parseInt(vote?.lockedPeriod) } }
				});
			} else if (vote?.decision === EVoteDecisionType.ABSTAIN && vote?.ayeBalance && vote?.nayBalance) {
				try {
					voteTx = api?.tx.convictionVoting.vote(vote?.post_id, {
						SplitAbstain: { abstain: `${vote?.abstainBalance?.toString()}`, aye: `${vote?.ayeBalance?.toString()}`, nay: `${vote?.nayBalance?.toString()}` }
					});
				} catch (e) {
					console.log(e);
				}
			}
			batchCall.push(voteTx);
		});
		api?.tx?.utility
			?.batchAll(batchCall)
			?.paymentInfo(loginAddress)
			.then((info) => {
				const gasPrice = new BN(info?.partialFee?.toString() || '0');
				setGasFees(gasPrice);
			});
	};

	useEffect(() => {
		if (!api || !apiReady) return;
		if (vote_cart_data && vote_cart_data?.length > 0) {
			getGASFees();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [vote_cart_data]);

	return (
		<section>
			<article className='px-2'>
				{!!loginAddress?.length && (
					<Alert
						type='info'
						showIcon
						className='icon-alert my-2'
						message={<span className='m-0 flex gap-x-1 p-0 text-sm text-xs dark:text-white'>All Votes will be made with</span>}
						description={
							<Address
								disableTooltip
								displayInline
								address={loginAddress}
								iconSize={20}
							/>
						}
					/>
				)}
				<div className={'max-h-[662px] w-full overflow-y-auto rounded-md bg-white p-2 shadow-md  dark:bg-black'}>
					<div className='my-4 flex items-center justify-start gap-x-2'>
						<h1 className='m-0 p-0 text-base font-semibold text-bodyBlue dark:text-white'>Voted Proposals</h1>
						<p className='m-0 p-0 text-sm text-bodyBlue dark:text-blue-dark-medium'>({vote_cart_data?.length})</p>
					</div>
					{!isLoading && vote_cart_data.length <= 0 && !!loginAddress.length && (
						<div className='flex h-[600px] items-center justify-center'>
							<PostEmptyState
								description={
									<div className='p-5'>
										<p>Currently no active proposals found in cart</p>
									</div>
								}
							/>
						</div>
					)}

					<Spin
						spinning={isLoading}
						size='default'
					>
						{vote_cart_data.map((voteCardInfo: any, index: number) => (
							<ProposalInfoCard
								key={index}
								voteInfo={voteCardInfo}
								index={index}
								reloadBatchCart={reloadBatchCart}
							/>
						))}
					</Spin>
				</div>
			</article>

			<article
				className='fixed bottom-0 left-0 right-0 h-[171px] w-full bg-white p-5 shadow-lg drop-shadow-lg dark:bg-black'
				style={{ borderRadius: '8px 8px 0 0' }}
			>
				<div className='flex flex-col gap-y-2'>
					<div className='flex h-[40px] items-center justify-between rounded-sm bg-transparent p-2'>
						<p className='m-0 p-0 text-sm text-lightBlue dark:text-white'>Total Proposals</p>
						<p className='m-0 p-0 text-base font-semibold text-bodyBlue dark:text-blue-dark-medium'>{vote_cart_data?.length}</p>
					</div>
					<div className='flex h-[40px] items-center justify-between rounded-sm bg-[#F6F7F9] p-2 dark:bg-modalOverlayDark'>
						<p className='m-0 p-0 text-sm text-lightBlue dark:text-blue-dark-medium'>Gas Fees</p>
						<p className='m-0 p-0 text-base font-semibold text-bodyBlue dark:text-white'>
							{formatedBalance(gasFees, unit, 0)} {chainProperties?.[network]?.tokenSymbol}
						</p>
					</div>
					<Button
						className='flex h-[40px] items-center justify-center rounded-lg border-none bg-pink_primary text-base text-white'
						onClick={voteProposals}
						disabled={isDisable}
					>
						Confirm Batch Voting
					</Button>
				</div>
			</article>

			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(dmSans.className, dmSans.variable, 'mt-[100px] w-[600px]')}
				open={openSuccessModal}
				maskClosable={false}
				footer={
					<CustomButton
						variant='primary'
						className='w-full'
						text='close'
						onClick={() => {
							setOpenSuccessModal(false);
						}}
					/>
				}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {}}
			>
				<VoteSuccessModal />
			</Modal>
		</section>
	);
};

export default VoteCart;
