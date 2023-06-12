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
	className?:string;
}

const DiscussionCard: FC<IDiscussionProps> = (props) => {
	const { created_at, commentsCount, address, title, username, topic, postReactionCount, post_id, tags, spam_users_count , className } = props;
	const currentUser = useContext(UserDetailsContext);
	const ownPost = currentUser.username === username;
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const [tagsModal, setTagsModal] = useState<boolean>(false);

	return (
		<>
			<div className={`${ownPost && 'border-l-pink_primary border-l-4'} border-2 border-solid border-grey_light hover:border-pink_primary hover:shadow-xl transition-all duration-200 p-3 md:p-4 h-[147px] sm:flex xs:hidden ${className}`}>
				<span className='font-medium text-center mr-2 flex-none sm:w-[120px] text-bodyBlue sm:mt-4'>#{post_id}</span>
				<div className="sm:flex flex-col sm:justify-between flex-1 sm:mt-4">
					<OnchainCreationLabel address={address} topic={topic} username={username}  />
					<div className="hidden sm:flex sm:justify-between lg:items-start lg:flex-row">
						<div className='mt-3 lg:mt-0'>
							<h1 className='text-bodyBlue font-medium text-sm flex'>
								{title}
							</h1>
						</div>
						<div className='flex justify-between items-center'>
							{relativeCreatedAt &&
							<div className='flex items-center text-lightBlue lg:hidden'>
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
					<div className="-mt-2 font-medium text-bodyBlue text-xs sm:flex xs:hidden flex-col lg:flex-row items-start lg:items-center">

						<div className='flex items-center gap-x-2'>
							<div className='xs:hidden sm:flex items-center justify-center gap-x-1.5 mr-2'>
								<LikeOutlined />
								<span className='text-lightBlue'>{getFormattedLike(postReactionCount['👍'])}</span>
							</div>

							<div className='xs:hidden sm:flex items-center justify-center gap-x-1.5 mr-2'>
								<DislikeOutlined />
								<span className='text-lightBlue'>{getFormattedLike(postReactionCount['👎'])}</span>
							</div>

							<div className='xs:hidden sm:flex items-center'>
								<CommentOutlined className='mr-1 text-lightBlue' /> {commentsCount}
							</div>
							<Divider type="vertical" style={{ borderLeft: '1px solid #485F7D' }} />

							{tags && tags.length>0 && <>{ tags?.slice(0,2).map((tag,index) =>
								(<div key={index} className='text-lightBlue rounded-xl px-[14px] py-[4px] border-[#D2D8E0] border-solid border-[1px] font-medium text-[10px]' >
									{tag}
								</div>))}
							{tags.length>2 && <span className='text-bodyBlue' style={{ background:'#D2D8E0' , borderRadius:'20px', padding:'4px 8px' }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(true);}}>
                +{tags.length-2}
							</span>}
							</>}
							{tags && tags.length>0 && <Divider type="vertical" className='max-lg:hidden' style={{ borderLeft: '1px solid #485F7D' }} />}
							{relativeCreatedAt && <>
								<div className='hidden text-lightBlue lg:flex items-center'>
									<ClockCircleOutlined className='mr-1' /> {relativeCreatedAt}
								</div>
							</>}
						</div>
					</div>
				</div>
				<Modal
					open= {tagsModal}
					onCancel={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(false);}}
					footer={false}
					className={`${poppins.variable} ${poppins.className} max-w-full shrink-0 max-sm:w-[100%] h-[120px] padding  justify-center center-aligned`}
				><div>
						<h2 className='text-lg tracking-wide font-medium text-sidebarBlue mb-4'>Tags</h2>
						<div className='flex gap-2 items-start flex-wrap'>{tags && tags.length>0 && <>{ tags?.map((tag,index) =>
							(<div key={index} className='rounded-xl px-[16px] py-[2px] font-normal text-xs text-bodyBlue' >
								{tag}
							</div>))}
						</>}</div></div>
				</Modal>
			</div>
			<div className={`${ownPost && 'border-l-pink_primary border-l-4'} border-2 border-solid border-grey_light hover:border-pink_primary hover:shadow-xl transition-all duration-200 xs:p-2 md:p-4 xs:h-[150px] xs:flex sm:hidden ${className}`}>
				<div className="sm:hidden xs:flex flex-col flex-1 xs:mt-1">
					<div className="sm:hidden xs:flex xs:justify-start gap-x-2 lg:items-start lg:flex-row my-2">
						<span className='font-medium text-center mr-2 flex-none xs:w-[45px] text-bodyBlue xs:mt-0'>#{post_id}</span>
						<div className='xs:mt-0 lg:mt-0'>
							<h1 className='text-bodyBlue font-medium flex'>
								{title}
							</h1>
						</div>
						<div className='flex justify-between items-center'>

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
					<div className="xs:mt-2 xs:gap-0 sm:gap-2.5 font-medium text-bodyBlue text-xs sm:hidden xs:flex flex-col lg:flex-row items-start lg:items-center">

						<div className='sm:hidden xs:flex xs:justify-start'>
							<OnchainCreationLabel address={address} username={username} />
							<Divider type="vertical" className='max-lg:hidden xs:inline-block xs:mt-0.5' style={{ borderLeft: '1px solid #485F7D' }} />
							{relativeCreatedAt && <>
								<div className='xs:flex xs:text-lightBlue lg:flex items-center'>
									<ClockCircleOutlined className='mr-1' /> {relativeCreatedAt}
								</div>
							</>}
						</div>

						<div className='xs:flex justify-between items-center xs:mt-3.5 xs:gap-x-2'>
							{tags && tags.length>0 && <Divider type="vertical" className='max-lg:hidden' style={{ borderLeft: '1px solid #90A0B7' }} />}
							{tags && tags.length>0 && <>{ tags?.slice(0,2).map((tag,index) =>
								(<div key={index} className='text-lightBlue rounded-xl px-[14px] py-[4px] border-[#D2D8E0] border-solid border-[1px] font-medium text-[10px]' >
									{tag}
								</div>))}
							{tags.length>2 && <span className='text-bodyBlue' style={{ background:'#D2D8E080' , borderRadius:'20px', padding:'4px 8px' }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(true);}}>
                +{tags.length-2}
							</span>}
							</>}
						</div>
					</div>
				</div>
				<Modal
					open= {tagsModal}
					onCancel={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(false);}}
					footer={false}
					className={`${poppins.variable} ${poppins.className} max-w-full shrink-0 max-sm:w-[100%] h-[120px] padding  justify-center center-aligned`}
				><div>
						<h2 className='text-lg tracking-wide font-medium text-sidebarBlue mb-4'>Tags</h2>
						<div className='flex gap-2 items-start flex-wrap'>{tags && tags.length>0 && <>{ tags?.map((tag,index) =>
							(<div key={index} className='rounded-xl px-[16px] py-[2px] font-normal text-xs text-bodyBlue' >
								{tag}
							</div>))}
						</>}</div></div>
				</Modal>
			</div>
		</>
	);
};

export default DiscussionCard;