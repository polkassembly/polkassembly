// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import LikeWhite from '~assets/icons/like-white.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import { StopOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { ISwipeActionButtons } from '../types';
import { useBatchVotesSelector } from '~src/redux/selectors';

const SwipeActionButtons: FC<ISwipeActionButtons> = (props) => {
	const { currentIndex, trackPosts, childRefs, className, onSwipe } = props;
	const { show_cart_menu } = useBatchVotesSelector();
	const canSwipe = currentIndex >= 0;

	const swipe = async (dir: any) => {
		if (canSwipe && currentIndex < trackPosts?.length) {
			onSwipe(dir);
			setTimeout(async () => {
				await childRefs[currentIndex]?.current?.swipe(dir);
			}, 300);
		}
	};

	return (
		<section className={classNames(className, `fixed ${show_cart_menu ? 'bottom-3' : 'bottom-3'} left-0 right-0 z-10 flex h-[80px] flex-col gap-y-2 bg-transparent p-4`)}>
			<div className='flex items-center justify-center gap-x-6'>
				<button
					className='flex h-12 w-12 items-center justify-center rounded-full border-none bg-[#F53C3C] drop-shadow-2xl'
					onClick={() => swipe('left')}
				>
					<DislikeWhite />
				</button>
				<button
					className='flex h-14 w-14 items-center justify-center rounded-full border-none bg-[#ffffff] drop-shadow-2xl'
					onClick={() => swipe('up')}
				>
					<StopOutlined className='text-2xl text-lightBlue' />
				</button>
				<button
					className='flex h-12 w-12 items-center justify-center rounded-full border-none bg-[#2ED47A] drop-shadow-2xl'
					onClick={() => swipe('right')}
				>
					<LikeWhite />
				</button>
			</div>
		</section>
	);
};

export default SwipeActionButtons;
