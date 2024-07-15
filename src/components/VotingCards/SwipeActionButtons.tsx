// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import LikeWhite from '~assets/icons/like-white.svg';
import DislikeWhite from '~assets/icons/dislike-white.svg';
import { StopOutlined } from '@ant-design/icons';

interface ISwipeActionButtons {
	currentIndex: number;
	trackPosts: any;
	childRefs: any;
}

const SwipeActionButtons: FC<ISwipeActionButtons> = (props) => {
	const { currentIndex, trackPosts, childRefs } = props;
	const canSwipe = currentIndex >= 0;

	const swipe = async (dir: any) => {
		if (canSwipe && currentIndex < trackPosts?.posts?.length) {
			await childRefs[currentIndex].current.swipe(dir);
		}
	};

	return (
		<section className={'flex w-full flex-col gap-y-2'}>
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
		</section>
	);
};

export default SwipeActionButtons;
