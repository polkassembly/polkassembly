// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { StopOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { ISwipeActionButtons } from '~src/components/TinderStyleVoting/types';
import ImageIcon from '~src/ui-components/ImageIcon';

const SwipeBtns: FC<ISwipeActionButtons> = (props) => {
	const { currentIndex, trackPosts, onSwipeAction, className } = props;
	const canSwipe = currentIndex >= 0;

	// Trigger the swipe action (without animation)
	const handleAction = (direction: string) => {
		if (canSwipe && currentIndex < trackPosts?.length) {
			onSwipeAction(direction, currentIndex); // Call the action handler with the current index and direction
		}
	};

	return (
		<section className={classNames(className, 'fixed z-[1000] flex w-full flex-col gap-y-2 rounded-lg bg-white shadow-inner dark:bg-highlightBg')}>
			<div className='flex items-center justify-center gap-x-6 p-4'>
				<button
					className='flex h-[32px] w-[209px] items-center justify-center gap-x-1 rounded-md border border-solid border-[#F53C3C] bg-transparent'
					onClick={() => handleAction('left')}
				>
					<ImageIcon
						src='/assets/icons/red-dislike-icon.svg'
						alt='dislike-icon'
					/>
					<p className='m-0 p-0 text-[#F53C3C]'>Nay</p>
				</button>
				<button
					className='flex h-[32px] w-[209px] items-center justify-center gap-x-1 rounded-md border border-solid border-[#407BFF] bg-transparent'
					onClick={() => handleAction('up')}
				>
					<StopOutlined className={'text-base text-[#407BFF]'} />
					<p className='m-0 p-0 text-[#407BFF]'>Abstain</p>
				</button>
				<button
					className='flex h-[32px] w-[209px] items-center justify-center gap-x-1 rounded-md border border-solid border-[#2ED47A] bg-transparent'
					onClick={() => handleAction('right')}
				>
					<ImageIcon
						src='/assets/icons/green-like-icon.svg'
						alt='dislike-icon'
					/>
					<p className='m-0 p-0 text-[#2ED47A]'>Aye</p>
				</button>
			</div>
		</section>
	);
};

export default SwipeBtns;
