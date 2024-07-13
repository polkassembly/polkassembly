// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useMemo, useRef, useState } from 'react';
import TinderCard from 'react-tinder-card';
import { StopOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import LikeWhite from '~assets/icons/like-white.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { Button } from 'antd';
import ImageIcon from '~src/ui-components/ImageIcon';
import { batchVotesActions } from '~src/redux/batchVoting';
import { useAppDispatch } from '~src/redux/store';
import { useBatchVotesSelector } from '~src/redux/selectors';
// import PostHeading from '../Post/PostHeading';

interface IVotingCards {
	trackPosts?: any;
}

const VotingCards: FC<IVotingCards> = (props) => {
	const { trackPosts } = props;
	const { total_proposals_added_in_Cart } = useBatchVotesSelector();
	const dispatch = useAppDispatch();
	console.log(trackPosts);
	const [currentIndex, setCurrentIndex] = useState(trackPosts?.posts?.length - 1);
	const [showCartMenu, setShowCartMenu] = useState(false);
	const currentIndexRef = useRef(currentIndex);

	const childRefs: any = useMemo(
		() =>
			Array(trackPosts?.posts?.length)
				.fill(0)
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				.map((i) => React.createRef()),
		[trackPosts?.posts?.length]
	);

	const updateCurrentIndex = (val: any) => {
		setCurrentIndex(val);
		currentIndexRef.current = val;
	};

	const canGoBack = currentIndex < trackPosts?.posts?.length - 1;
	const canSwipe = currentIndex >= 0;

	const swiped = (direction: string, index: number, postId: number) => {
		setShowCartMenu(true);
		dispatch(batchVotesActions.setTotalVotesAddedInCart(total_proposals_added_in_Cart + 1));
		dispatch(
			batchVotesActions.setvoteCardInfo({
				post_id: postId,
				voted_for: direction === 'left' ? 'nye' : direction === 'right' ? 'aye' : 'abstain'
			})
		);
		updateCurrentIndex(index - 1);
	};

	const outOfFrame = (name: string, idx: number) => {
		currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
	};

	const swipe = async (dir: any) => {
		if (canSwipe && currentIndex < trackPosts?.posts?.length) {
			await childRefs[currentIndex].current.swipe(dir);
		}
	};

	const goBack = async () => {
		if (!canGoBack) return;
		const newIndex = currentIndex + 1;
		updateCurrentIndex(newIndex);
		await childRefs[newIndex].current.restoreCard();
	};

	return (
		<div className='mb-8 flex h-screen w-full flex-col items-center'>
			<div className='mb-4 flex w-full justify-between'>
				<button
					className='mr-auto flex h-[24px] w-[24px] items-center justify-center rounded-full border-none bg-[#ffffff] drop-shadow-2xl'
					onClick={() => goBack()}
				>
					<LeftOutlined className='text-black' />
				</button>
				<p className='m-0 p-0 text-base font-semibold text-bodyBlue'>Active Proposals</p>
				<button
					className='ml-auto flex h-[24px] w-[24px] items-center justify-center rounded-full border-none bg-[#ffffff] drop-shadow-2xl'
					onClick={() => goBack()}
				>
					<RightOutlined className='text-black' />
				</button>
			</div>
			<div className='relative h-full w-full max-w-sm'>
				{trackPosts?.posts?.map((character: any, index: number) => (
					<TinderCard
						ref={childRefs[index]}
						className='absolute h-full w-full'
						key={character.name}
						onSwipe={(dir) => {
							swiped(dir, index, character?.post_id);
						}}
						onCardLeftScreen={() => outOfFrame(character.name, index)}
						preventSwipe={['down']}
					>
						<div className='flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-4 shadow-lg'>
							<div className='h-full overflow-y-auto'>
								<h3 className='text-xl font-bold'>{character.title}</h3>
								{/* <PostHeading
									method={character?.method}
									motion_method={character?.motion_method}
									postArguments={character?.proposed_call?.args}
									className='mb-5'
								/> */}
							</div>
							<div className='absolute bottom-0 left-0 h-24 w-full '></div>
						</div>
					</TinderCard>
				))}
			</div>
			<div className={`${showCartMenu ? '-mt-[320px]' : ''} sticky bottom-[48px] z-10 flex w-full flex-col gap-y-2`}>
				<div className='flex items-center justify-center gap-x-6 p-4'>
					<button
						className='flex h-[46px] w-[46px] items-center justify-center rounded-full border-none bg-[#F53C3C] drop-shadow-2xl'
						onClick={() => swipe('left')}
					>
						<DislikeWhite className='' />
					</button>
					<button
						className='flex h-[60px] w-[60px] items-center justify-center rounded-full border-none bg-[#ffffff] drop-shadow-2xl'
						onClick={() => swipe('up')}
					>
						<StopOutlined className={'text-2xl text-lightBlue'} />
					</button>
					<button
						className='flex h-[46px] w-[46px] items-center justify-center rounded-full border-none bg-[#2ED47A] drop-shadow-2xl'
						onClick={() => swipe('right')}
					>
						<LikeWhite className='' />
					</button>
				</div>
			</div>
			{showCartMenu && (
				<div className='z-1000 sticky bottom-0 mt-[20px] flex h-[56px] w-full items-center justify-center gap-x-6 bg-white p-4 drop-shadow-2xl'>
					<p className='m-0 mr-auto p-0 text-xs'>{total_proposals_added_in_Cart} proposal added</p>
					<div className='ml-auto flex gap-x-1'>
						<CustomButton
							variant='primary'
							text='Add to cart'
							height={36}
							width={91}
							fontSize='xs'
						/>
						<Button className='flex h-[36px] w-[36px] items-center justify-center rounded-lg border border-solid border-pink_primary bg-transparent'>
							<ImageIcon
								src='/assets/icons/bin-icon.svg'
								alt='bin-icon'
							/>
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default VotingCards;
