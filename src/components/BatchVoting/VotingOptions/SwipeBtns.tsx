// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { StopOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { ISwipeActionButtons } from '~src/components/TinderStyleVoting/types';
import ImageIcon from '~src/ui-components/ImageIcon';
import { Button } from 'antd';

const SwipeBtns: FC<ISwipeActionButtons> = (props) => {
	const { currentIndex, trackPosts, onSwipeAction, className, decision, isLoading } = props;
	const canSwipe = currentIndex >= 0;

	const handleAction = (direction: string) => {
		if (canSwipe && trackPosts && currentIndex >= 0 && currentIndex < trackPosts.length) {
			onSwipeAction(direction, currentIndex);
		} else {
			console.warn('Cannot swipe: either no posts left or invalid index');
		}
	};

	return (
		<section className={classNames(className, 'fixed z-[1000] flex w-full flex-col gap-y-2 rounded-lg bg-white shadow-inner dark:bg-highlightBg')}>
			<div className='flex h-[76px] items-center justify-center gap-x-6 p-4'>
				<Button
					className={`${
						isLoading ? 'opacity-60' : ''
					} flex h-8 w-[209px] cursor-pointer items-center justify-center gap-x-1 rounded-md border border-solid border-[#F53C3C] bg-transparent`}
					onClick={() => {
						handleAction('left');
					}}
					loading={decision === 'nay' ? isLoading : false}
					disabled={isLoading}
				>
					<ImageIcon
						src='/assets/icons/red-dislike-icon.svg'
						alt='dislike-icon'
					/>
					<p className='m-0 p-0 text-[#F53C3C]'>Nay</p>
				</Button>
				<Button
					className={`${
						isLoading ? 'opacity-60' : ''
					} flex h-8 w-[209px] cursor-pointer items-center justify-center gap-x-1 rounded-md border border-solid border-[#407BFF] bg-transparent`}
					onClick={() => handleAction('up')}
					loading={decision === 'abstain' ? isLoading : false}
					disabled={isLoading}
				>
					<StopOutlined className={'text-base text-[#407BFF]'} />
					<p className='m-0 p-0 text-[#407BFF]'>Abstain</p>
				</Button>
				<Button
					className={`${
						isLoading ? 'opacity-60' : ''
					} flex h-8 w-[209px] cursor-pointer items-center justify-center gap-x-1 rounded-md border border-solid border-[#2ED47A] bg-transparent`}
					onClick={() => handleAction('right')}
					loading={decision === 'aye' ? isLoading : false}
					disabled={isLoading}
				>
					<ImageIcon
						src='/assets/icons/green-like-icon.svg'
						alt='dislike-icon'
					/>
					<p className='m-0 p-0 text-[#2ED47A]'>Aye</p>
				</Button>
			</div>
		</section>
	);
};

export default SwipeBtns;
