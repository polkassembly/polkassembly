// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined, CommentOutlined, DislikeOutlined, LikeOutlined } from '@ant-design/icons';
import { Divider, Modal, Tooltip } from 'antd';
import { poppins } from 'pages/_app';
import React, { FC, useContext, useState } from 'react';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';
import { WarningMessageIcon } from '~src/ui-components/CustomIcons';

import OnchainCreationLabel from '~src/ui-components/OnchainCreationLabel';
import { getFormattedLike } from '~src/util/getFormattedLike';

export interface IDiscussionProps {
	created_at: Date
	address: string;
	commentsCount?: number
	title: string
	username: string
	topic: string
	postReactionCount: {
		'👍': number;
		'👎': number;
	};
	post_id: string;
	tags:string[] | [];
	spam_users_count?: number;
}

const DiscussionCard: FC<IDiscussionProps> = (props) => {
	const { created_at, commentsCount, address, title, username, topic, postReactionCount, post_id, tags, spam_users_count } = props;
	const currentUser = useContext(UserDetailsContext);
	const ownPost = currentUser.username === username;
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const [tagsModal, setTagsModal] = useState<boolean>(false);

	return (
		<div className={`${ownPost && 'border-l-pink_primary border-l-4'} border-2 border-solid border-grey_light hover:border-pink_primary hover:shadow-xl transition-all duration-200 rounded-md p-3 md:p-4`}>
			<div className="flex flex-col justify-between">
				<div className="flex lg:justify-between lg:items-start lg:flex-row flex-col-reverse">
					<div className='mt-3 lg:mt-0'>
						<h1 className='text-sidebarBlue font-semibold text-sm flex'>
							<span className='font-medium mr-2'>#{post_id}</span>{title}
						</h1>
					</div>
					<div className='flex justify-between items-center'>
						{relativeCreatedAt &&
							<div className='flex items-center text-navBlue lg:hidden'>
								<ClockCircleOutlined className='mr-1' /> {relativeCreatedAt}
							</div>}
						{
							spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0?
								<div className='flex lg:hidden items-center justify-center'>
									<Tooltip color="#E5007A" title="This post could be a spam.">
										<WarningMessageIcon className='text-xl text-[#FFA012]' />
									</Tooltip>
								</div>
								: null
						}
					</div>
					{
						spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0?
							<div className='hidden lg:flex items-center justify-center'>
								<Tooltip color="#E5007A" title="This post could be a spam.">
									<WarningMessageIcon className='text-xl text-[#FFA012]' />
								</Tooltip>
							</div>
							: null
					}
				</div>
				<div className="mt-3 gap-2.5 font-medium text-navBlue text-xs flex flex-col lg:flex-row items-start lg:items-center">
					<OnchainCreationLabel address={address} topic={topic} username={username} />
					<Divider className='hidden lg:inline-block' type="vertical" style={{ borderLeft: '1px solid #90A0B7' }} />

					<div className='flex items-center gap-x-2'>
						<div className='flex items-center justify-center gap-x-1.5'>
							<LikeOutlined />
							<span>{getFormattedLike(postReactionCount['👍'])}</span>
						</div>
						<Divider className='hidden lg:inline-block' type="vertical" style={{ borderLeft: '1px solid #90A0B7' }} />
						<div className='flex items-center justify-center gap-x-1.5'>
							<DislikeOutlined />
							<span>{getFormattedLike(postReactionCount['👎'])}</span>
						</div>
						<Divider className='hidden lg:inline-block' type="vertical" style={{ borderLeft: '1px solid #90A0B7' }} />
						<div className='flex items-center'>
							<CommentOutlined className='mr-1' /> {commentsCount}
						</div>
						<Divider type="vertical" style={{ borderLeft: '1px solid #90A0B7' }} />
						{relativeCreatedAt && <>
							<div className='hidden lg:flex items-center'>
								<ClockCircleOutlined className='mr-1' /> {relativeCreatedAt}
							</div>
						</>}
						{tags && tags.length>0 && <Divider type="vertical" className='max-lg:hidden' style={{ borderLeft: '1px solid #90A0B7' }} />}
						{tags && tags.length>0 && <>{ tags?.slice(0,2).map((tag,index) =>
							(<div key={index} className='rounded-xl px-[14px] py-[4px] border-navBlue border-solid border-[1px] font-medium text-[10px]' >
								{tag}
							</div>))}
						{tags.length>2 && <span className='text-pink_primary' style={{ borderBottom:'1px solid #E5007A' }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(true);}}>
                +{tags.length-2} more
						</span>}
						</>}
					</div>
				</div>
			</div>
			<Modal
				open= {tagsModal}
				onCancel={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(false);}}
				footer={false}
				className={`${poppins.variable} ${poppins.className} max-w-full shrink-0 w-[433px] max-sm:w-[100%] h-[120px] padding  justify-center center-aligned`}
			><div>
					<h2 className='text-lg tracking-wide font-medium text-sidebarBlue mb-4'>Tags</h2>
					<div className='flex gap-2 max-sm:flex-col items-start'>{tags && tags.length>0 && <>{ tags?.map((tag,index) =>
						(<div key={index} className='rounded-xl px-[16px] py-[2px] border-navBlue border-solid border-[1px] font-normal text-xs text-navBlue' >
							{tag}
						</div>))}
					</>}</div></div>
			</Modal>
		</div>
	);
};

export default DiscussionCard;