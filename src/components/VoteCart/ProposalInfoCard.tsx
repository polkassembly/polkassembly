// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React, { FC } from 'react';
import { StopOutlined } from '@ant-design/icons';
import ImageIcon from '~src/ui-components/ImageIcon';

interface IProposalInfoCard {
	voteInfo: any;
	index: number;
	key?: number;
}
const ProposalInfoCard: FC<IProposalInfoCard> = (props) => {
	const { index, voteInfo } = props;

	return (
		<section
			key={index}
			className='mb-4 h-[106px] w-full rounded-xl border border-solid border-grey_border bg-white'
		>
			<article className='flex h-[53px] items-center justify-start gap-x-4 px-4'>
				<p className='text-bodyblue m-0 p-0 text-xs'>#{voteInfo.post_id}</p>
				<p className='text-bodyblue m-0 p-0 text-xs'>{voteInfo.post_title?.substring(0, 50)}...</p>
				<ImageIcon
					src='/assets/icons/eye-icon-grey.svg'
					alt='eye-icon'
					imgWrapperClassName='ml-auto'
				/>
			</article>
			<Divider
				type='horizontal'
				className='border-l-1 my-0 border-grey_border dark:border-icon-dark-inactive'
			/>
			<article className='flex h-[53px] items-center justify-start gap-x-4 px-4'>
				<div className='mr-auto flex items-center gap-x-1'>
					{voteInfo?.voted_for === 'Aye' || voteInfo?.voted_for === 'Nye' ? (
						<ImageIcon
							src={`${voteInfo?.voted_for === 'Aye' ? '/assets/icons/like-icon-green.svg' : '/assets/icons/dislike-icon-red.svg'}`}
							imgClassName='text-black'
							alt='like-dislike-icon'
						/>
					) : (
						<StopOutlined className='text-[#909090] dark:text-white' />
					)}
					<p
						className={`${
							voteInfo?.voted_for === 'Aye' ? 'text-aye_green dark:text-aye_green_Dark' : voteInfo?.voted_for === 'Nye' ? 'text-nye_red dark:text-nay_red_Dark' : 'text-bodyBlue'
						} text-capitalize m-0 p-0 text-xs`}
					>
						{voteInfo?.voted_for}
					</p>
				</div>
				<div className='flex items-center justify-center gap-x-2'>
					<p className='m-0 p-0 text-xs text-bodyBlue'>{voteInfo?.vote_balance.toNumber() / 10000000000} DOT</p>
					<p className='m-0 p-0 text-xs text-bodyBlue'>{voteInfo?.vote_conviction}</p>
				</div>
				<div className='ml-auto flex items-center gap-x-3'>
					<ImageIcon
						src='/assets/icons/edit-option-icon.svg'
						alt='eye-icon'
					/>
					<ImageIcon
						src='/assets/icons/bin-icon-grey.svg'
						alt='bin-icon'
					/>
				</div>
			</article>
		</section>
	);
};
export default ProposalInfoCard;
