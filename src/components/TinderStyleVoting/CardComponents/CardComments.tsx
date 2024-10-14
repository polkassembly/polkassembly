// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import { ICardComments } from '../types';
import Markdown from '~src/ui-components/Markdown';

const CardComments: FC<ICardComments> = (props) => {
	const { proposal } = props;
	return (
		<div className='mx-auto mb-2 flex max-h-[304px] flex-col gap-y-4 overflow-y-auto overflow-x-hidden rounded-xl border border-solid border-[#D2D8E0] p-2 px-4 py-6 dark:border-separatorDark'>
			<div className='flex items-center justify-between'>
				<h1 className='m-0 -mt-1 p-0 text-sm font-semibold text-sidebarBlue dark:text-white'>Users are saying...</h1>
				<p className='m-0 flex h-[24px] w-[124px] items-center justify-center rounded-[38px] bg-[#F6F6F6] p-0 text-[10px] text-lightBlue'>Based on comments</p>
			</div>
			{proposal.comments.map((comment: any, index: number) => (
				<div
					key={index}
					className='comment-container flex items-start justify-center gap-x-4'
				>
					<ImageIcon
						src='/assets/icons/rounded-check-icon.svg'
						alt='check-icon'
					/>
					<div className='flex flex-col gap-y-2'>
						<p className='m-0 flex items-center justify-center p-0 text-xs text-bodyBlue dark:text-blue-dark-medium'>
							<Markdown
								className=''
								md={comment?.content || ''}
							/>
							{/* {comment.content} */}
						</p>
						<div className='flex items-center justify-start gap-x-2'>
							{comment.replies?.length > 0 && (
								<p className='m-0 flex h-[26px] items-center justify-center rounded-md bg-[#ECFCF3] p-0 px-2 py-1 text-[10px] text-[#1FA25B]'>{comment.replies?.length} replies</p>
							)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default CardComments;
