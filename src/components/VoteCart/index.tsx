// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Pagination } from 'antd';
import React, { useEffect, useState } from 'react';
import { useBatchVotesSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import ProposalInfoCard from './ProposalInfoCard';
import { EVoteDecisionType } from '~src/types';
import { useApiContext } from '~src/context';
import BN from 'bn.js';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const VoteCart: React.FC = () => {
	const { vote_card_info_array } = useBatchVotesSelector();
	const { api, apiReady } = useApiContext();
	const user = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const { loginAddress } = useUserDetailsSelector();
	const [gasFees, setGasFees] = useState<any>();
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 1;
	console.log(vote_card_info_array);

	console.log('userid --> ', user?.id, user?.loginAddress);

	const getVoteCartData = async () => {
		const { data, error } = await nextApiClientFetch<any>('api/v1/votes/batch-votes-cart/getBatchVotesCart', {
			isExternalApiCall: true,
			page: currentPage,
			userAddress: user?.loginAddress
		});
		if (error) {
			console.error(error);
			return;
		} else {
			console.log('cards in cart --> ', data);
		}
	};

	useEffect(() => {
		getVoteCartData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage]);

	useEffect(() => {
		if (!api || !apiReady) return;
		const batchCall: any[] = [];
		vote_card_info_array.map((vote) => {
			let voteTx = null;
			if ([EVoteDecisionType.AYE, EVoteDecisionType.NAY].includes(vote?.decision as EVoteDecisionType)) {
				voteTx = api?.tx.convictionVoting.vote(vote?.post_id, {
					Standard: { balance: vote?.voteBalance, vote: { aye: vote?.decision === EVoteDecisionType.AYE, conviction: vote?.voteConviction } }
				});
			} else if (vote?.decision === EVoteDecisionType.SPLIT) {
				try {
					voteTx = api?.tx.convictionVoting.vote(vote?.post_id, { Split: { aye: `${vote?.abstainAyeBalance?.toString()}`, nay: `${vote?.abstainNayBalance?.toString()}` } });
				} catch (e) {
					console.log(e);
				}
			} else if (vote?.decision === EVoteDecisionType.ABSTAIN && vote?.abstainAyeBalance && vote?.abstainNayBalance) {
				try {
					voteTx = api?.tx.convictionVoting.vote(vote?.post_id, {
						SplitAbstain: { abstain: `${vote?.voteBalance?.toString()}`, aye: `${vote?.abstainAyeBalance?.toString()}`, nay: `${vote?.abstainNayBalance?.toString()}` }
					});
				} catch (e) {
					console.log(e);
				}
			}
			batchCall.push(voteTx);
		});
		api?.tx?.utility
			?.batch(batchCall)
			?.paymentInfo(loginAddress)
			.then((info) => {
				const gasPrice = new BN(info?.partialFee?.toString() || '0');
				console.log(gasPrice);
				setGasFees(gasPrice);
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const paginatedData = vote_card_info_array.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	return (
		<section>
			<article className='px-2'>
				<div className='h-[662px] w-full overflow-y-auto rounded-md bg-white p-2 shadow-md dark:bg-black'>
					<div className='my-4 flex items-center justify-start gap-x-2'>
						<h1 className='m-0 p-0 text-base font-semibold text-bodyBlue dark:text-white'>Voted Proposals</h1>
						<p className='m-0 p-0 text-sm text-bodyBlue dark:text-blue-dark-medium'>({vote_card_info_array?.length})</p>
					</div>
					{paginatedData.map((voteCardInfo, index) => (
						<ProposalInfoCard
							key={index}
							voteInfo={voteCardInfo}
							index={index}
						/>
					))}
				</div>
				<Pagination
					current={currentPage}
					pageSize={pageSize}
					total={vote_card_info_array.length}
					onChange={handlePageChange}
					className='my-4 flex justify-center'
				/>
			</article>
			<article
				className='h-[171px] w-full bg-white p-5 shadow-lg drop-shadow-lg dark:bg-black'
				style={{ borderRadius: '8px 8px 0 0' }}
			>
				<div className='flex flex-col gap-y-2'>
					<div className='flex h-[40px] items-center justify-between rounded-sm bg-transparent p-2'>
						<p className='m-0 p-0 text-sm text-lightBlue dark:text-white'>Total Proposals</p>
						<p className='m-0 p-0 text-base font-semibold text-bodyBlue dark:text-blue-dark-medium'>{vote_card_info_array?.length}</p>
					</div>
					<div className='flex h-[40px] items-center justify-between rounded-sm bg-[#F6F7F9] p-2 dark:bg-modalOverlayDark'>
						<p className='m-0 p-0 text-sm text-lightBlue dark:text-blue-dark-medium'>Gas Fees</p>
						<p className='m-0 p-0 text-base font-semibold text-bodyBlue dark:text-white'>
							{formatedBalance(gasFees, unit, 0)} {chainProperties?.[network]?.tokenSymbol}
						</p>
					</div>
					<Button className='flex h-[40px] items-center justify-center rounded-lg border-none bg-pink_primary text-base text-white'>Confirm Batch Voting</Button>
				</div>
			</article>
		</section>
	);
};

export default VoteCart;
