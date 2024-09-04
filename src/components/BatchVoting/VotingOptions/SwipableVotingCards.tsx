// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import TinderCard from 'react-tinder-card';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { batchVotesActions } from '~src/redux/batchVoting';
import { useAppDispatch } from '~src/redux/store';
import { useBatchVotesSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { Spin } from 'antd';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ProposalType } from '~src/global/proposalType';
import { PostEmptyState } from '~src/ui-components/UIStates';
import { IAddBatchVotes } from '~src/components/TinderStyleVoting/types';
import TinderCardsComponent from '~src/components/TinderStyleVoting/CardComponents/TinderCardsComponent';
import SwipeBtns from './SwipeBtns';

const SwipableVotingCards = () => {
	const { total_proposals_added_in_Cart, batch_vote_details, total_active_posts, voted_post_ids_array } = useBatchVotesSelector();
	const dispatch = useAppDispatch();
	const user = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const [activeProposal, setActiveProposals] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(activeProposal?.length - 1);
	const currentIndexRef = useRef(currentIndex);
	const [tempActiveProposals, setTempActiveProposals] = useState([]);
	const [skippedProposals, setSkippedProposals] = useState<number[]>([]);

	const childRefs: any = useMemo(
		() =>
			Array(activeProposal?.length)
				.fill(0)
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				.map((i) => React.createRef()),
		[activeProposal?.length]
	);

	const updateCurrentIndex = (val: any) => {
		setCurrentIndex(val);
		currentIndexRef.current = val;
	};

	const canGoBack = currentIndex < activeProposal?.length - 1;

	const addVotedPostToDB = async (postId: number, direction: string) => {
		const { error } = await nextApiClientFetch<IAddBatchVotes>('api/v1/votes/batch-votes-cart/addBatchVoteToCart', {
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
			console.error(error);
			return;
		}
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
			} else {
				setTempActiveProposals(data);
			}
		}
	};

	const handleSkipProposalCard = (id: number) => {
		const updateActiveProposals: any[] = [];
		activeProposal.map((proposal) => {
			if (id !== proposal.id) {
				updateActiveProposals.push(proposal);
			}
		});
		if (activeProposal.length === 5) {
			getActiveProposals();
		}
		if (activeProposal.length < 4) {
			setActiveProposals([...updateActiveProposals, ...tempActiveProposals]);
		} else {
			setActiveProposals(updateActiveProposals);
		}
		setSkippedProposals([...skippedProposals, id]);
	};

	useEffect(() => {
		if (!network || !user?.loginAddress?.length) return;
		getActiveProposals(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, user?.loginAddress]);

	const swiped = async (direction: string, index: number, postId: number, postTitle: string) => {
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
		updateCurrentIndex(index - 1);
		addVotedPostToDB(postId, direction);
		if (total_active_posts > 5) {
			getActiveProposals();
		}
		if (total_active_posts === 9) {
			dispatch(batchVotesActions.setTotalActivePosts(0));
			setActiveProposals([...activeProposal, ...tempActiveProposals]);
		}
	};

	const outOfFrame = (name: string, idx: number) => {
		currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
	};

	const goBack = async () => {
		if (!canGoBack) return;
		const newIndex = currentIndex + 1;
		updateCurrentIndex(newIndex);
		await childRefs[newIndex].current.restoreCard();
	};

	return (
		<div className='mb-8 flex h-screen w-full flex-col items-center'>
			<div className='relative z-[100] h-[527px] w-full'>
				<button
					className='absolute -left-[21px] top-1/2 z-10 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full border-none bg-black dark:bg-white'
					onClick={() => goBack()}
				>
					<LeftOutlined className='text-white dark:text-black' />
				</button>
				<button
					className='absolute -right-[18px] top-1/2 z-10 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded-full border-none bg-black dark:bg-white'
					onClick={() => goBack()}
				>
					<RightOutlined className='text-white dark:text-black' />
				</button>

				{!isLoading && activeProposal.length <= 0 && (
					<div className='flex h-[600px] items-center justify-center'>
						<PostEmptyState
							description={
								<div className='p-5'>
									<p>Currently no active proposals found</p>
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
						{activeProposal?.map((proposal: any, index: number) => (
							<TinderCard
								ref={childRefs[index]}
								className='absolute h-full w-full'
								key={proposal.name}
								onSwipe={(dir) => {
									swiped(dir, index, proposal?.id, proposal?.title);
								}}
								onCardLeftScreen={() => outOfFrame(proposal.title, index)}
								preventSwipe={['down']}
							>
								<div className='h-full overflow-y-auto bg-[#f4f5f7] dark:bg-black'>
									<TinderCardsComponent
										proposal={proposal}
										onSkip={handleSkipProposalCard}
									/>
								</div>
							</TinderCard>
						))}
					</div>
				)}
			</div>

			<SwipeBtns
				trackPosts={activeProposal}
				currentIndex={currentIndex}
				childRefs={childRefs}
				className={'bottom-1 mt-8'}
			/>
		</div>
	);
};

export default SwipableVotingCards;
