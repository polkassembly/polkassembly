// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import React from 'react';
import { useBatchVotesSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';

const VoteCart: React.FC = () => {
	const { vote_card_info_array } = useBatchVotesSelector();
	console.log(vote_card_info_array);
	return (
		<section>
			<article className='h-[100vh] p-2'>
				<div className='mb-[48px] h-[686px] w-full overflow-y-auto rounded-md bg-white p-2 shadow-md'>
					<div className='my-4 flex items-center justify-start gap-x-2'>
						<h1 className='m-0 p-0 text-base font-semibold text-bodyBlue'>Voted Proposals</h1>
						<p className='m-0 p-0 text-sm text-bodyBlue'>({vote_card_info_array?.length})</p>
					</div>
					{vote_card_info_array.map((voteCardInfo, index) => (
						<div
							key={index}
							className='mb-4 h-[106px] w-full rounded-xl border border-solid border-grey_border bg-white'
						>
							<div className='flex h-[53px] items-center justify-start gap-x-4 px-4'>
								<p className='text-bodyblue m-0 p-0 text-xs'>#{voteCardInfo.post_id}</p>
								<p className='text-bodyblue m-0 p-0 text-xs'>{voteCardInfo.post_title?.substring(0, 50)}...</p>
								<ImageIcon
									src='/assets/icons/eye-icon-grey.svg'
									alt='eye-icon'
									imgWrapperClassName='ml-auto'
								/>
							</div>
							<Divider
								type='horizontal'
								className='border-l-1 my-0 border-grey_border dark:border-icon-dark-inactive'
							/>
							<div className='flex h-[53px] items-center justify-start gap-x-4 px-4'>
								<div className='mr-auto flex items-center gap-x-1'>
									{voteCardInfo?.voted_for === 'aye' || voteCardInfo?.voted_for === 'nye' ? (
										<ImageIcon
											src={`${voteCardInfo?.voted_for === 'aye' ? '/assets/icons/like-icon-green.svg' : '/assets/icons/dislike-icon-red.svg'}`}
											imgClassName='text-black'
											alt='like-dislike-icon'
										/>
									) : (
										<StopOutlined className='text-[#909090] dark:text-white' />
									)}
									<p
										className={`${
											voteCardInfo?.voted_for === 'aye'
												? 'text-aye_green dark:text-aye_green_Dark'
												: voteCardInfo?.voted_for === 'nye'
												? 'text-nye_red dark:text-nay_red_Dark'
												: 'text-bodyBlue'
										} text-capitalize m-0 p-0 text-xs`}
									>
										{voteCardInfo?.voted_for}
									</p>
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
							</div>
						</div>
					))}
				</div>
			</article>
			<article
				className='sticky bottom-0 h-[137px] w-full bg-white p-5 shadow-lg'
				style={{ borderRadius: '8px 8px 0 0' }}
			>
				<div className='flex flex-col gap-y-2'>
					<div className='flex h-[40px] items-center justify-between rounded-sm bg-[#F6F7F9] p-2'>
						<p className='m-0 p-0 text-sm text-lightBlue'>Gas Fees</p>
						<p className='m-0 p-0 text-base font-semibold text-bodyBlue'>27.4 DOT</p>
					</div>
					<Button className='flex h-[40px] items-center justify-center rounded-lg border-none bg-pink_primary text-base text-white'>Confirm Batch Voting</Button>
				</div>
			</article>
		</section>
	);
};

export default VoteCart;
