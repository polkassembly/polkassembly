// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '~src/redux/store';
import { useBatchVotesSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { Spin } from 'antd';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ProposalType } from '~src/global/proposalType';
import { PostEmptyState } from '~src/ui-components/UIStates';
import { batchVotesActions } from '~src/redux/batchVoting';
import SwipeBtns from './SwipeBtns';
import TinderCardsComponent from './TinderCardComponent';
import { useTranslation } from 'next-i18next';

const SwipableVotingCards = () => {
	const { t } = useTranslation();
	const { total_proposals_added_in_Cart, batch_vote_details, total_active_posts, voted_post_ids_array } = useBatchVotesSelector();
	const dispatch = useAppDispatch();
	const user = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const [activeProposal, setActiveProposals] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isVoteLoading, setIsVoteLoading] = useState(false);
	const [decision, setDecision] = useState<string>('');
	const [currentIndex, setCurrentIndex] = useState(activeProposal?.length - 1);
	const [skippedProposals, setSkippedProposals] = useState<number[]>([]);

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

	const addVotedPostToDB = async (postId: number, direction: string) => {
		setIsVoteLoading(true);
		setDecision(direction === 'left' ? 'nay' : direction === 'right' ? 'aye' : 'abstain');
		const { error } = await nextApiClientFetch<any>('api/v1/votes/batch-votes-cart/addBatchVoteToCart', {
			vote: {
				abstain_balance: direction === 'up' ? batch_vote_details.abstainVoteBalance : '0',
				aye_balance: direction === 'right' ? batch_vote_details.ayeVoteBalance || '0' : direction === 'up' ? batch_vote_details.abstainAyeVoteBalance || '0' : '0',
				decision: direction === 'left' ? 'nay' : direction === 'right' ? 'aye' : 'abstain',
				locked_period: batch_vote_details.conviction,
				nay_balance: direction === 'left' ? batch_vote_details.nyeVoteBalance || '0' : direction === 'up' ? batch_vote_details.abstainNyeVoteBalance || '0' : '0',
				network: network,
				referendum_index: postId,
				user_address: user?.loginAddress
			}
		});
		if (error) {
			setIsVoteLoading(false);
			console.error(error);
			return;
		}
		setIsVoteLoading(false);
		getVoteCartData();
	};

	const getActiveProposals = async (callingFirstTime?: boolean) => {
		setIsLoading(callingFirstTime === true);

		const { data, error } = await nextApiClientFetch<any>('api/v1/posts/non-voted-active-proposals', {
			isExternalApiCall: true,
			network: network,
			proposalType: ProposalType.REFERENDUM_V2,
			skippedIndexes: [...(voted_post_ids_array || []), ...(skippedProposals || [])],
			userAddress: user?.loginAddress,
			userId: user?.id
		});
		if (error) {
			console.error(error);
			return;
		} else {
			setIsLoading(false);
			if (callingFirstTime) {
				dispatch(batchVotesActions.setVotedPostsIdsArray([]));
				setActiveProposals(data);
				setCurrentIndex(data.length - 1);
			}
		}
	};

	const handleSkipProposalCard = (id: number) => {
		const updatedProposals = activeProposal.filter((proposal) => proposal.id !== id);

		setActiveProposals(updatedProposals);
		setCurrentIndex(updatedProposals.length - 1);

		setSkippedProposals([...skippedProposals, id]);
		getActiveProposals();
	};

	const handleSwipeAction = async (direction: string, index: number) => {
		const postId = activeProposal[index]?.id;
		const postTitle = activeProposal[index]?.title;

		dispatch(batchVotesActions.setShowCartMenu(true));
		dispatch(batchVotesActions.setVotedProposalId(postId));
		dispatch(batchVotesActions.setTotalVotesAddedInCart(total_proposals_added_in_Cart + 1));
		dispatch(batchVotesActions.setTotalActivePosts(total_active_posts + 1));
		dispatch(
			batchVotesActions.setvoteCardInfo({
				abstainAyeBalance: direction === 'left' || direction === 'right' ? '0' : batch_vote_details?.abstainAyeVoteBalance,
				abstainNayBalance: direction === 'left' || direction === 'right' ? '0' : batch_vote_details?.abstainNyeVoteBalance,
				decision: direction === 'left' ? 'nay' : direction === 'right' ? 'aye' : 'abstain',
				post_id: postId,
				post_title: postTitle,
				voteBalance:
					direction === 'left' ? batch_vote_details?.nyeVoteBalance : direction === 'right' ? batch_vote_details?.ayeVoteBalance : batch_vote_details?.abstainVoteBalance,
				voteConviction: batch_vote_details?.conviction || 0
			})
		);

		await addVotedPostToDB(postId, direction);

		const updatedProposals = activeProposal.filter((_, i) => i !== index);
		setActiveProposals(updatedProposals);
		setCurrentIndex(updatedProposals.length - 1);
	};

	useEffect(() => {
		if (!network || !user?.loginAddress?.length) return;
		getActiveProposals(true);
	}, [network, user?.loginAddress]);

	return (
		<div className='mb-8 flex h-screen w-full flex-col items-center'>
			<div className='relative h-[527px] w-full'>
				{!isLoading && activeProposal.length <= 0 && (
					<div className='flex h-[600px] items-center justify-center'>
						<PostEmptyState
							description={
								<div className='p-5'>
									<p>{t('no_active_proposals_found')}</p>
								</div>
							}
						/>
					</div>
				)}

				{isLoading && (
					<div className='flex min-h-[400px] items-center justify-center'>
						<Spin
							spinning={isLoading}
							size='default'
							className='mt-[48px]'
						></Spin>
					</div>
				)}

				{!isLoading && (
					<div className={'relative h-full w-full'}>
						{activeProposal?.map((proposal) => (
							<article
								className='absolute h-full w-full'
								key={proposal?.id}
							>
								<TinderCardsComponent
									onSkip={handleSkipProposalCard}
									proposal={proposal}
									isUsedInWebView={true}
								/>
							</article>
						))}
					</div>
				)}
			</div>

			<SwipeBtns
				trackPosts={activeProposal}
				currentIndex={currentIndex}
				childRefs={null}
				className={'-bottom-[2px] mt-9'}
				isLoading={isVoteLoading}
				decision={decision}
				onSwipeAction={handleSwipeAction}
			/>
		</div>
	);
};

export default SwipableVotingCards;
