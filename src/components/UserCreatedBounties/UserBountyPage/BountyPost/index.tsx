// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { useTheme } from 'next-themes';
import { IUserCreatedBounty } from '~src/types';
import Markdown from '~src/ui-components/Markdown';
import NameLabel from '~src/ui-components/NameLabel';
import StatusTag from '~src/ui-components/StatusTag';
import { chainProperties } from '~src/global/networkConstants';
import { useCurrentTokenDataSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import formatBnBalance from '~src/util/formatBnBalance';
import TagsModal from '~src/ui-components/TagsModal';
import BountyPostReactionBar from './BountyPostReactions';
import BountyPostComments from './BountyPostReactions/BountyPostComments';
import dynamic from 'next/dynamic';
import Skeleton from '~src/basic-components/Skeleton';

const CreateBountyModal = dynamic(() => import('../../CreateBountyModal'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const BountyPost = ({ post }: { post: IUserCreatedBounty }) => {
	const { title, post_index, created_at, tags, proposer, content, status, reward } = post;
	const { resolvedTheme: theme } = useTheme();
	const { loginAddress } = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const { currentTokenPrice } = useCurrentTokenDataSelector();
	const [tagsModal, setTagsModal] = useState<boolean>(false);
	const unit = chainProperties?.[network]?.tokenSymbol;
	const date = new Date(created_at);
	const [openCreateBountyModal, setOpenCreateBountyModal] = useState<boolean>(false);

	return (
		<section className='my-5 h-full w-full rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay md:p-4 lg:w-[69%] lg:p-6 '>
			<div className={'mb-[6px] flex items-center justify-between'}>
				{status && (
					<StatusTag
						className='tracking-wide'
						status={status.charAt(0).toUpperCase() + status.slice(1)}
						theme={theme}
					/>
				)}
				<div className='flex items-center gap-1 tracking-wide'>
					{currentTokenPrice && (
						<span className='text-sm font-semibold text-blue-light-high dark:text-blue-dark-high'>
							Requested: ${Number(currentTokenPrice) * Number(formatBnBalance(String(reward), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: false }, network))}
						</span>
					)}
					{reward && (
						<span className='rounded-md bg-[#F3F4F6] px-[6px] py-1 text-xs font-medium text-blue-light-medium dark:bg-[#272727] dark:text-blue-dark-medium'>
							{formatBnBalance(String(reward), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: false }, network)} {unit}
						</span>
					)}
				</div>
			</div>

			<div className='flex items-center space-x-1'>
				<h2 className={'mb-1 text-lg font-semibold leading-7 text-bodyBlue dark:text-blue-dark-high sm:mb-3'}>
					#{post_index} {title}
				</h2>
			</div>
			<div className='flex items-center gap-1 rounded-full'>
				<NameLabel
					defaultAddress={proposer}
					usernameClassName='text-xs -mt-[4px] text-ellipsis overflow-hidden'
					className='flex items-center'
					isUsedInBountyPage={true}
				/>
				<Divider
					type='vertical'
					className='border-l-1 border-[#D2D8E0B2] dark:border-separatorDark md:inline-block'
				/>
				{!!created_at && (
					<>
						<div className='items-center text-xs font-normal text-lightBlue dark:text-icon-dark-inactive'>
							<ClockCircleOutlined className='mr-[2px]' /> <span></span>
							{getRelativeCreatedAt(date)}
						</div>
					</>
				)}
			</div>
			<div className=' mt-2 flex gap-1'>
				{tags?.slice(0, 2).map((tag, index) => (
					<div
						key={index}
						className='rounded-xl border-[1px] border-solid border-section-light-container px-[14px] py-1 text-[10px] font-medium text-lightBlue dark:border-[#3B444F] dark:text-blue-dark-medium'
					>
						{tag}
					</div>
				))}
				{tags.length > 2 && (
					<span
						className='text-bodyBlue dark:text-blue-dark-high'
						style={{ background: '#D2D8E080', borderRadius: '20px', padding: '4px 8px' }}
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							setTagsModal(true);
						}}
					>
						+{tags.length - 2}
					</span>
				)}
			</div>
			<TagsModal
				tags={tags}
				openTagsModal={tagsModal}
				setOpenTagsModal={setTagsModal}
			/>
			<Divider className='border-l-1 my-2 border-[#D2D8E0B2] dark:border-separatorDark md:inline-block' />
			<div className='min-h-[183px]'>
				{content && (
					<Markdown
						className=''
						md={content}
						theme={theme}
						disableQuote={true}
					/>
				)}
			</div>
			<div className='flex items-center justify-between'>
				<div className='flex items-center'>
					<BountyPostReactionBar
						post_reactions={post?.post_reactions}
						postIndex={post?.post_index}
					/>
					<BountyPostComments
						comments={post?.comments || {}}
						postIndex={post?.post_index}
					/>
				</div>
				{loginAddress == proposer && (
					<button
						onClick={() => setOpenCreateBountyModal(true)}
						className='flex cursor-pointer items-center gap-1 rounded-md border-none bg-[#F4F6F8] px-3 py-[8.5px] text-xs hover:bg-[#ebecee] dark:bg-[#1F1F21]'
					>
						<span className='text-xs font-medium text-blue-light-medium dark:text-blue-dark-medium'>Edit</span>
					</button>
				)}
			</div>
			<CreateBountyModal
				openCreateBountyModal={openCreateBountyModal}
				setOpenCreateBountyModal={setOpenCreateBountyModal}
				isUsedForEdit={true}
				postInfo={post}
			/>
		</section>
	);
};

export default BountyPost;
