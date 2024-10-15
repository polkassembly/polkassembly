// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import TinderCard from 'react-tinder-card';
import { LeftOutlined, RightOutlined, StopOutlined } from '@ant-design/icons';
import { batchVotesActions } from '~src/redux/batchVoting';
import { useAppDispatch } from '~src/redux/store';
import { useBatchVotesSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import SwipeActionButtons from './CardComponents/SwipeActionButtons';
import dynamic from 'next/dynamic';
import { Skeleton, Spin } from 'antd';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ProposalType } from '~src/global/proposalType';
import { PostEmptyState } from '~src/ui-components/UIStates';
import { IAddBatchVotes } from './types';
import LikeWhite from '~assets/icons/like-white.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';

const CartOptionMenu = dynamic(() => import('./CardComponents/CartOptionMenu'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const TinderCards = dynamic(() => import('./CardComponents/TinderCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const VotingCards = () => {
	const { total_proposals_added_in_Cart, show_cart_menu, batch_vote_details, total_active_posts, voted_post_ids_array } = useBatchVotesSelector();
	const dispatch = useAppDispatch();
	const user = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const [activeProposal, setActiveProposals] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(activeProposal?.length - 1);
	const currentIndexRef = useRef(currentIndex);
	const [tempActiveProposals, setTempActiveProposals] = useState([]);
	const [skippedProposals, setSkippedProposals] = useState<number[]>([]);
	const [swipeDirection, setSwipeDirection] = useState<string | null>(null);

	const childRefs: any = useMemo(
		() =>
			Array(activeProposal?.length)
				?.fill(0)
				?.map(() => React.createRef()),
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
		getVoteCartData();
	};

	const getVoteCartData = async () => {
		const { data, error } = await nextApiClientFetch<any>('api/v1/votes/batch-votes-cart/getBatchVotesCart', {
			isExternalApiCall: true,
			userAddress: user?.loginAddress
		});
		if (error) {
			console.error(error);
			return;
		} else {
			dispatch(batchVotesActions.setTotalVotesAddedInCart(data?.votes?.length));
		}
	};

	const getActiveProposals = async (callingFirstTime?: boolean) => {
		setIsLoading(callingFirstTime === true);
		const skippedIndexes = [...(voted_post_ids_array || []), ...(skippedProposals || [])];
		const { data, error } = await nextApiClientFetch<any>('api/v1/posts/non-voted-active-proposals', {
			isExternalApiCall: true,
			network: network,
			proposalType: ProposalType.REFERENDUM_V2,
			skippedIndexes: skippedIndexes,
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
			if (id !== proposal?.id) {
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
		getActiveProposals(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, user?.loginAddress]);

	const swiped = async (direction: string, index: number, postId: number, postTitle: string) => {
		setSwipeDirection(null);
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

	const handleSwipe = (direction: string) => {
		setSwipeDirection(direction);
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

	const handleRightClickSkip = () => {
		if (currentIndex >= 0 && activeProposal[currentIndex]) {
			handleSkipProposalCard(activeProposal[currentIndex].id);
		}
	};

	return (
		<div className='mb-8 flex h-screen w-full flex-col items-center'>
			<div className='mb-4 flex w-full justify-between'>
				<button
					className='mr-auto flex h-[24px] w-[24px] items-center justify-center rounded-full border-none bg-[#ffffff] drop-shadow-2xl dark:bg-transparent'
					onClick={() => goBack()}
				>
					<LeftOutlined className='text-black dark:text-white' />
				</button>
				<p className='m-0 p-0 text-base font-semibold text-bodyBlue dark:text-white'>Active Proposals</p>
				<button
					className='ml-auto flex h-[24px] w-[24px] items-center justify-center rounded-full border-none bg-[#ffffff] drop-shadow-2xl dark:bg-transparent'
					onClick={handleRightClickSkip}
				>
					<RightOutlined className='text-black dark:text-white' />
				</button>
			</div>
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
				<div className={'relative w-full max-w-sm'}>
					{activeProposal?.map((proposal: any, index: number) => (
						<TinderCard
							ref={childRefs[index]}
							className='absolute w-full'
							key={proposal.name}
							onSwipeRequirementFulfilled={(dir) => handleSwipe(dir)}
							onSwipe={(dir) => swiped(dir, index, proposal?.id, proposal?.title)}
							onCardLeftScreen={() => outOfFrame(proposal.title, index)}
							preventSwipe={['down']}
						>
							<div className='relative rounded-2xl bg-[#f4f5f7] dark:bg-black'>
								{swipeDirection === 'right' && index === currentIndex && (
									<div
										className='absolute inset-0 z-10 flex items-center justify-center rounded-2xl'
										style={{
											background: 'linear-gradient(0deg, rgba(46, 212, 122, 0.12) 0%, rgba(46, 212, 122, 0.12) 100%), rgba(0, 0, 0, 0.12)',
											border: '1px solid rgba(46, 212, 122, 0.60)'
										}}
									>
										<button className='flex h-12 w-12 items-center justify-center rounded-full border-none bg-[#2ED47A] drop-shadow-2xl'>
											<LikeWhite className='' />
										</button>
									</div>
								)}
								{swipeDirection === 'left' && index === currentIndex && (
									<div
										className='absolute inset-0 z-10 flex items-center justify-center rounded-2xl'
										style={{
											background: 'linear-gradient(0deg, rgba(245, 60, 60, 0.38) 0%, rgba(245, 60, 60, 0.38) 100%), rgba(0, 0, 0, 0.12)',
											border: '1px solid rgba(245, 60, 60, 0.60)'
										}}
									>
										<button className='flex h-12 w-12 items-center justify-center rounded-full border-none bg-[#F53C3C] drop-shadow-2xl'>
											<DislikeWhite className='' />
										</button>
									</div>
								)}
								{swipeDirection === 'up' && index === currentIndex && (
									<div
										className='absolute inset-0 z-10 flex items-center justify-center rounded-2xl'
										style={{
											background: 'linear-gradient(0deg, rgba(255, 191, 96, 0.74) 0%, rgba(255, 191, 96, 0.74) 100%), rgba(0, 0, 0, 0.12)',
											border: '1px solid #FFBF60'
										}}
									>
										<button className='flex h-14 w-14 items-center justify-center rounded-full border-none bg-[#ffffff] drop-shadow-2xl'>
											<StopOutlined className={'text-2xl text-lightBlue'} />
										</button>
									</div>
								)}
								<TinderCards
									post={proposal}
									proposalType={proposal?.postType}
									onSkip={handleSkipProposalCard}
								/>
							</div>
						</TinderCard>
					))}
				</div>
			)}

			<SwipeActionButtons
				trackPosts={activeProposal}
				currentIndex={currentIndex}
				childRefs={childRefs}
				onSwipe={handleSwipe}
				className={show_cart_menu ? 'mb-10' : ''}
			/>
			{show_cart_menu && <CartOptionMenu />}
		</div>
	);
};

export default VotingCards;
