// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined, DislikeOutlined, LikeOutlined } from '@ant-design/icons';
import { Divider, Modal, Skeleton, Tooltip } from 'antd';
import dynamic from 'next/dynamic';
import { poppins } from 'pages/_app';
import React, { FC, useContext, useState } from 'react';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import { noTitle } from 'src/global/noTitle';
import useCurrentBlock from 'src/hooks/useCurrentBlock';
import OnchainCreationLabel from 'src/ui-components/OnchainCreationLabel';
import StatusTag from 'src/ui-components/StatusTag';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';
import { WarningMessageIcon } from '~src/ui-components/CustomIcons';
import TopicTag from 'src/ui-components/TopicTag';
import { getFormattedLike } from '~src/util/getFormattedLike';
import NewChatIcon from '~assets/icons/new-chat-icon.svg';

interface IGovernanceProps {
	postReactionCount: {
		'👍': number;
		'👎': number;
	};
	address: string;
	username?: string;
	className?: string
	commentsCount: number
	created_at?: Date
	end?: number
	method?: string
	onchainId?: string | number | null
	status?: string | null
	tipReason?: string
	title?: string | null
	topic?: string
	isTip?: boolean;
	tip_index?: number | null;
	isCommentsVisible?: boolean;
	tags?: string[] | [];
	spam_users_count?: number;
}

const BlockCountdown = dynamic(() => import('src/components/BlockCountdown'),{
	loading: () => <Skeleton.Button active />,
	ssr: false
});
const GovernanceCard: FC<IGovernanceProps> = (props) => {
	const {
		postReactionCount,
		address,
		className,
		commentsCount,
		created_at,
		end = 0,
		method,
		onchainId,
		status,
		tipReason,
		title,
		topic,
		isTip,
		tip_index,
		isCommentsVisible = true,
		username,
		tags,
		spam_users_count
	} = props;
	const currentUser = useContext(UserDetailsContext);
	let titleString = title || method || tipReason || noTitle;

	const titleTrimmed = titleString.match(/.{1,80}(\s|$)/g)![0];
	titleString = `${titleTrimmed} ${titleTrimmed.length != titleString.length ? '...' : ''}`;

	const mainTitle = <span className={tipReason ? 'tipTitle' : ''}><div>{titleString}</div></span>;
	const subTitle = title && tipReason && method && <h5>{title}</h5>;
	const currentBlock = useCurrentBlock()?.toNumber() || 0;
	const ownProposal = currentUser?.addresses?.includes(address);
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const [tagsModal, setTagsModal] = useState<boolean>(false);

	return (
		<div className={`${className} ${ownProposal && 'border-l-pink_primary border-l-4'} border-2 border-grey_light border-solid hover:border-pink_primary hover:shadow-xl transition-all duration-200  p-3 md:p-6 min-h-[147px] flex`}>
			<span className='font-medium text-center mr-2 flex-none w-[120px] text-[#334D6E] mt-4'>#{isTip? tip_index: onchainId}</span>
			<div className="flex flex-col justify-between flex-1 mt-4">
				<OnchainCreationLabel address={address} username={username} />
				<div className='flex justify-between gap-x-2  lg:items-start lg:flex-row my-2 '>
					<div className='mt-3 lg:mt-0'>
						<h1 className='text-sidebarBlue  flex max-w-[250px] max-h-10 overflow-hidden lg:max-w-none'>
							{} <span className='break-all font-medium text-[14px] leading-[21px]'>{mainTitle}</span>
						</h1>
						<h2 className='text-navBlue font-medium text-sm'>{subTitle}</h2>
					</div>
					<div className='flex justify-between items-center gap-x-2'>
						{
							spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0?
								<div className='flex items-center justify-center'>
									<Tooltip color="#E5007A" title="This post could be a spam.">
										<WarningMessageIcon className='text-xl text-[#FFA012]' />
									</Tooltip>
								</div>
								: null
						}
						{status  && <StatusTag className='mt-[-36px]' status={status} />}
					</div>
				</div>

				<div className="mt-0 gap-2.5 font-medium text-navBlue text-xs flex flex-col lg:flex-row items-start lg:items-center">

					<div className='flex items-center gap-x-2'>
						<div className='flex items-center justify-center gap-x-1.5 mr-2'>
							<LikeOutlined />
							<span>{getFormattedLike(postReactionCount['👍'])}</span>
						</div>
						<div className='flex items-center justify-center gap-x-1.5 mr-2'>
							<DislikeOutlined />
							<span>{getFormattedLike(postReactionCount['👎'])}</span>
						</div>
						{
							isCommentsVisible?
								<>
									<div className='flex items-center'>
										<NewChatIcon className='mr-1' /> {commentsCount}
									</div>
								</>
								: null
						}
						{tags && tags.length>0 && <Divider type="vertical" className='max-lg:hidden' style={{ borderLeft: '1px solid #90A0B7' }} />}
						{tags && tags.length>0 && <>{ tags?.slice(0,2).map((tag,index) =>
							(<div key={index} className='rounded-xl px-[14px] py-[4px] border-navBlue border-solid border-[1px] font-medium text-[10px]' >
								{tag}
							</div>))}
						{tags.length>2 && <span className='text-pink_primary' style={{ borderBottom:'1px solid #E5007A' }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(true);}}>
            +{tags.length-2} more
						</span>}
						</>}
						<Divider type="vertical" style={{ borderLeft: '1px solid #90A0B7' }} />
						{relativeCreatedAt && <>
							<div className='flex items-center'>
								<ClockCircleOutlined className='mr-1' /> {relativeCreatedAt}
							</div>
						</>}

						{
							topic?
								<div className='flex items-center '>
									<div className='mr-1.5 ml-auto hidden min-[340px]:flex'></div>
									<Divider type="vertical" className='max-lg:hidden' style={{ borderLeft: '1px solid #90A0B7' }} />
									<TopicTag topic={topic} />
								</div>
								: null
						}
					</div>

					{!!end && !!currentBlock &&
							<div className="flex items-center">
								<Divider className='hidden lg:inline-block' type="vertical" style={{ borderLeft: '1px solid #90A0B7' }} />
								<ClockCircleOutlined className='mr-1' />
								{
									end > currentBlock
										? <span><BlockCountdown endBlock={end}/> remaining</span>
										: <span>ended <BlockCountdown endBlock={end}/></span>
								}
							</div>
					}

				</div>
			</div>
			<Modal
				open= {tagsModal}
				onCancel={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(false);}}
				footer={false}
				className={`${poppins.variable} ${poppins.className} max-w-full shrink-0  max-sm:w-[100%] h-[120px] padding  justify-center center-aligned`}
			><div className=''>
					<h2 className='text-lg tracking-wide font-medium text-sidebarBlue mb-4'>Tags</h2>
					<div className='flex gap-2 max-lg:flex-col border-solid' >{tags && tags.length>0 && <>{ tags?.map((tag,index) =>
						(<div key={index} className='rounded-xl px-[16px] py-[2px] border-navBlue border-solid border-[1px] font-normal text-xs text-navBlue' >
							{tag}
						</div>))}
					</>}</div></div>
			</Modal>
		</div>
	);
};

export default GovernanceCard;