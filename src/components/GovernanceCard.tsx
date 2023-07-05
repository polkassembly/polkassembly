// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined, DislikeOutlined, LikeOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Divider, Modal, Skeleton, Tooltip } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { poppins } from 'pages/_app';
import React, { FC, useContext, useState } from 'react';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import { noTitle } from 'src/global/noTitle';
import useCurrentBlock from 'src/hooks/useCurrentBlock';
import OnchainCreationLabel from 'src/ui-components/OnchainCreationLabel';
import StatusTag from 'src/ui-components/StatusTag';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';
import { WarningMessageIcon } from '~src/ui-components/CustomIcons';
import TopicTag from '~src/ui-components/TopicTag';
import BigNumber from 'bignumber.js';
import { chainProperties } from 'src/global/networkConstants';
import NewChatIcon from '~assets/icons/chat-icon.svg';
import TagsIcon from '~assets/icons/tags-icon.svg';
import { getFormattedLike } from '~src/util/getFormattedLike';
import { useNetworkContext } from '~src/context';

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
	cid?:string;
	requestedAmount?:number;
}

const BlockCountdown = dynamic(() => import('src/components/BlockCountdown'),{
	loading: () => <Skeleton.Button active />,
	ssr: false
});
const GovernanceCard: FC<IGovernanceProps> = (props) => {
	const {
		postReactionCount,
		address,
		cid,
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
		spam_users_count,
		requestedAmount
	} = props;
	const currentUser = useContext(UserDetailsContext);
	let titleString = title || method || tipReason || noTitle;
	const { network } = useNetworkContext();
	const titleTrimmed = titleString.match(/.{1,80}(\s|$)/g)![0];
	titleString = `${titleTrimmed} ${titleTrimmed.length != titleString.length ? '...' : ''}`;

	const mainTitle = <span className={tipReason ? 'tipTitle' : ''}><div>{titleString}</div></span>;
	const subTitle = title && tipReason && method && <h5>{title}</h5>;
	const currentBlock = useCurrentBlock()?.toNumber() || 0;
	const ownProposal = currentUser?.addresses?.includes(address);
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const [tagsModal, setTagsModal] = useState<boolean>(false);

	const tokenDecimals = chainProperties[network]?.tokenDecimals;
	const requestedAmountFormatted = requestedAmount ? new BigNumber(requestedAmount).div(10 ** tokenDecimals).toFixed(0, BigNumber.ROUND_DOWN) : 0;

	return (
		<>
			<div className={`${className} ${ownProposal && 'border-l-pink_primary border-l-4'} border-2 border-[#DCDFE350] border-solid hover:border-pink_primary hover:shadow-xl transition-all duration-200 sm:p-3 min-h-[120px] sm:flex xs:hidden`}>
				<div className="sm:flex flex-col sm:justify-between flex-1 sm:mt-2.5">
					<div className="flex justify-between items-center">
						<div className="flex flex-grow">
							<span className='font-medium text-center flex-none sm:w-[120px] text-bodyBlue'>#{isTip? tip_index: onchainId}</span>
							<OnchainCreationLabel address={address} username={username} />
						</div>
						<div className="flex justify-end items-center">
							{status && <StatusTag className='sm:mr-10' status={status} />}
						</div>
					</div>
					<div className="flex justify-between items-center">
						<div className="flex flex-grow ml-[120px]">
							<h1 className='text-bodyBlue text-sm mt-0.5 flex overflow-hidden lg:max-w-none'>
								<span className='break-all text-bodyBlue font-medium text-sm'>{ mainTitle }</span>
							</h1>
							<h2 className='text-bodyBlue font-medium text-sm'>{subTitle}</h2>
						</div>
						{
							requestedAmount &&
							<div className='flex justify-center items-center'>
								{requestedAmount > 100 ?
									<span className='text-bodyBlue text-sm font-medium sm:mr-12'>{requestedAmountFormatted} {chainProperties[network]?.tokenSymbol}</span>
									:
									<span className='text-bodyBlue text-sm font-medium sm:mr-20'>{requestedAmount} {chainProperties[network]?.tokenSymbol}</span>
								}
							</div>
						}
					</div>
					<div className="font-medium text-bodyBlue text-xs sm:flex xs:hidden flex-col lg:flex-row items-start lg:items-center sm:mb-1 sm:mt-0 sm:ml-[120px]">
						<div className='flex items-center gap-x-2'>
							<div className='xs:hidden sm:flex items-center justify-center gap-x-1.5'>
								<LikeOutlined style={{ color: '#485F7D' }} />
								<span className='text-lightBlue'>{getFormattedLike(postReactionCount['👍'])}</span>
							</div>
							<div className='xs:hidden sm:flex items-center justify-center gap-x-1.5 mr-0.5'>
								<DislikeOutlined style={{ color: '#485F7D' }} />
								<span className='text-lightBlue'>{getFormattedLike(postReactionCount['👎'])}</span>
							</div>
							{
								isCommentsVisible?
									<>
										<div className='xs:hidden text-lightBlue sm:flex items-center'>
											<NewChatIcon style={{
												color: '#485F7D'
											}} className='mr-1 text-lightBlue' /> {commentsCount}
										</div>
									</>
									: null
							}
							{tags && tags.length>0 && <Divider type="vertical" className='max-lg:hidden' style={{ borderLeft: '1px solid #90A0B7' }} />}
							{tags && tags.length>0 && <>{ tags?.slice(0,2).map((tag,index) =>
								(<div key={index} className='text-lightBlue rounded-xl px-[14px] py-[4px] border-[#D2D8E0] border-solid border-[1px] font-medium text-[10px]' >
									{tag}
								</div>))}
							{tags.length>2 && <span className='text-bodyBlue' style={{ background:'#D2D8E080' , borderRadius:'20px', padding:'4px 8px' }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(true);}}>
                +{tags.length-2}
							</span>}
							</>}
							<Divider type="vertical" style={{ borderLeft: '1px solid #485F7D' }} />
							{
								cid ?
									<>
										<Link href={`https://ipfs.io/ipfs/${cid}`} target="_blank"> <PaperClipOutlined /> IPFS</Link>
										<Divider type="vertical" style={{ borderLeft: '1px solid #485F7D' }} />
									</> : null
							}
							{relativeCreatedAt && <>
								<div className='flex text-lightBlue items-center sm:mt-0'>
									<ClockCircleOutlined className='mr-1' /> {relativeCreatedAt}
								</div>
							</>}

							{
								topic?
									<div className='flex items-center sm:-mt-1'>
										<Divider type="vertical" className='max-lg:hidden sm:mt-1' style={{ borderLeft: '1px solid #485F7D' }} />
										<TopicTag className='sm:mt-0 sm:mx-1' topic={topic} />
									</div>
									: null
							}
						</div>

						{!!end && !!currentBlock &&
							<div className="flex text-lightBlue items-center">
								<Divider className='hidden lg:inline-block' type="vertical" style={{ borderLeft: '1px solid #485F7D' }} />
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
					className={`${poppins.variable} ${poppins.className} max-w-full shrink-0  max-sm:w-[100%] h-[120px]`}
				><div className='flex'>
						<h2 className='text-lg tracking-wide font-medium text-bodyBlue mb-2'>
							<TagsIcon className='mr-2' />
							Tags
						</h2>
					</div>
					<div className='w-full h-[1px] bg-[#D2D8E0]' />
					<div className='flex gap-2 flex-wrap mt-4' >{tags && tags.length>0 && <>{ tags?.map((tag,index) =>
						(<div key={index} className='rounded-xl border-solid border-[1px] border-[#D2D8E0] px-[16px] py-[2px] font-normal text-[10px] text-lightBlue' >
							{tag}
						</div>))}
					</>}</div>
				</Modal>
			</div>
			<div className={`${className} ${ownProposal && 'border-l-pink_primary border-l-4'} border-2 border-grey_light border-solid hover:border-pink_primary hover:shadow-xl transition-all duration-200  xs:px-2 xs:py-2 md:pb-6 min-h-[147px] xs:flex h-auto sm:hidden`}>
				<div className="sm:hidden xs:flex flex-col flex-1 xs:mt-1">
					<div className='sm:hidden xs:flex xs:justify-start gap-x-2 lg:items-start lg:flex-row my-2 '>
						<span className='font-medium text-center xs:w-[45px] text-bodyBlue xs:mt-0'>#{isTip? tip_index: onchainId}</span>
						<div className='xs:mt-0 lg:mt-0'>
							<h1 className='text-bodyBlue flex overflow-hidden lg:max-w-none'>
								<span className='text-bodyBlue text-sm font-medium mt-0 xs:mt-[-1.5px]'>{ mainTitle }</span>
							</h1>
							<h2 className='text-bodyBlue font-medium text-sm'>{subTitle}</h2>
						</div>
						<div className='sm:hidden xs:flex justify-between items-center gap-x-2'>
							{
								spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0?
									<div className='flex items-center justify-center'>
										<Tooltip color="#E5007A" title="This post could be a spam.">
											<WarningMessageIcon className='text-xl text-[#FFA012]' />
										</Tooltip>
									</div>
									: null
							}
							{/* {status  && <StatusTag className='mt-[-36px]' status={status} />} */}
						</div>
					</div>

					<div className="mt-0 sm:gap-2.5 xs:gap-0 font-medium text-bodyBlue text-xs sm:hidden xs:flex flex-col lg:flex-row items-start lg:items-center">
						<div className="sm:hidden xs:flex xs:justify-start xs:flex-wrap">
							<OnchainCreationLabel address={address} username={username} />
							<Divider type="vertical" className='max-lg:hidden xs:inline-block xs:mt-0.5' style={{ borderLeft: '1px solid #485F7D' }} />
							{relativeCreatedAt && <>
								<div className='flex text-lightBlue xs:-mt-0.5 mt-0 items-center'>
									<ClockCircleOutlined className='mr-1 mt-0 xs:-mt-0.5' /> {relativeCreatedAt}
								</div>
							</>}
						</div>
						<div className='xs:flex justify-between items-center xs:mt-3 xs:gap-x-2'>
							{tags && tags.length>0 && <Divider type="vertical" className='max-lg:hidden' style={{ borderLeft: '1px solid #90A0B7' }} />}
							{tags && tags.length>0 && <>{ tags?.slice(0,2).map((tag,index) =>
								(<div key={index} className='text-lightBlue rounded-xl px-[14px] py-[4px] border-[#D2D8E0] border-solid border-[1px] font-medium text-[10px]' >
									{tag}
								</div>))}
							{tags.length>2 && <span className='text-bodyBlue' style={{ background:'#D2D8E080' , borderRadius:'20px', padding:'4px 8px' }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(true);}}>
                +{tags.length-2}
							</span>}
							</>}
							{tags && tags.length > 0?
								status  && <StatusTag className='xs:mt-0 xs:absolute xs:right-[5%]' status={status} />
								: null}
							{
								!tags || tags.length === 0?
									status  &&
									<StatusTag className='mt-1' status={status} />
									: null
							}
						</div>

					</div>
				</div>
				<Modal
					open= {tagsModal}
					onCancel={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(false);}}
					footer={false}
					className={`${poppins.variable} ${poppins.className} max-w-full shrink-0 max-sm:w-[100%] h-[120px]`}
				><div className='flex'>
						<TagsIcon className='mr-2 mt-1.5' />
						<h2 className='text-lg tracking-wide font-semibold text-bodyBlue mb-2'>Tags</h2>
					</div>
					<div className='w-full h-[1px] bg-[#D2D8E0]' />
					<div className='flex gap-2 flex-wrap mt-4' >{tags && tags.length>0 && <>{ tags?.map((tag,index) =>
						(<div key={index} className='rounded-xl border-solid border-[1px] border-[#D2D8E0] px-[16px] py-[2px] font-normal text-[10px] text-lightBlue' >
							{tag}
						</div>))}
					</>}</div>
				</Modal>
			</div>
		</>
	);
};

export default GovernanceCard;