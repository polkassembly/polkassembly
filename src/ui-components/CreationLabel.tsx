// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Divider, Dropdown, MenuProps, Modal, Tooltip } from 'antd';
import React, { FC, ReactNode, useState } from 'react';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';
import { poppins } from 'pages/_app';

import NameLabel from './NameLabel';
import TopicTag from './TopicTag';

import { AgainstIcon ,SlightlyAgainstIcon,SlightlyForIcon,NeutralIcon,ForIcon, WarningMessageIcon } from '~src/ui-components/CustomIcons';
import Link from 'next/link';
import HelperTooltip from './HelperTooltip';
import styled from 'styled-components';
import { EVoteDecisionType } from '~src/types';
import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import AbstainGray from '~assets/icons/abstainGray.svg';
import SplitYellow from '~assets/icons/split-yellow-icon.svg';
import CloseCross from '~assets/icons/close-cross-icon.svg';
import dayjs from 'dayjs';

const Styled = styled.div`
    padding:0;
    margin:0;
	margin-top:-2px;
	margin-right:8px;
    & svg{
		width:14.6px;
		height:14.6px;
	}
    &:hover{
    	color:#E5007A;
    }
    .ant-tooltip {
    	font-size:16px;
    }
    .ant-tooltip .ant-tooltip-placement-leftTop{
    	height:10px;
    	padding:0px;
    }
    .ant-tooltip .ant-tooltip-inner{
    	min-height:0;
    }
	.ant-tooltip-arrow{
    	display:none;
    }
    .ant-tooltip-inner {
        color: black;
  	    font-size:10px;
  	    padding:0px 6px;
    }
    .dark-pink{
  	    color:#E5007A;
  	    text-decoration:underline;
    }
`;

interface ICreationLabelProps {
	className?: string
	children?: ReactNode
	created_at?: Date
	defaultAddress?: string | null
	text?: string
	topic?: string
	username?: string;
  sentiment?:number;
  commentSource?:'polkassembly' | 'subsquare';
  cid?:string;
  spam_users_count?:number;
  truncateUsername?:boolean;
  vote?:string | null;
  votesArr?: any;
}

const CreationLabel: FC<ICreationLabelProps> = (props) => {

	const { className, children, created_at, text, username, defaultAddress, topic, sentiment, commentSource='polkassembly', cid ,spam_users_count = 0, truncateUsername , vote , votesArr = [] } = props;
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const [showVotesModal,setShowVotesModal] = useState(false);

	const items : MenuProps['items']=[
		sentiment === 1 ? { key:1,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Completely Against</div> }:null,
		sentiment === 2 ? { key:2,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Slightly Against</div> }:null,
		sentiment === 3 ? { key:3,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Neutral</div> }:null,
		sentiment === 4 ? { key:4,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Slightly For</div> }:null,
		sentiment === 5 ? { key:5,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Completely For</div> }:null
	];
	return <div className={`${className} flex justify-between w-[100%]`} >
		<div className='text-xs flex flex-col md:flex-row md:items-center'>
			<div className={'flex min-[320px]:flex-row min-[320px]:items-center w-full min-[320px]:w-auto '}>
				<div className={'flex items-center '}>
					<span className='mr-2 text-lightBlue'>By:</span>
					<NameLabel
						defaultAddress={defaultAddress}
						username={username}
						clickable={commentSource === 'polkassembly' }
						truncateUsername={truncateUsername}
						textClassName={'text-[12px] text-ellipsis overflow-hidden'}
					/>
					{text}&nbsp;
					{topic &&
			<div className='flex sm:-mt-0.5'> <span className='text-lightBlue mr-2 mt-1'>in</span> <TopicTag topic={topic} className={topic} /></div>
					}
					{cid ?
						<>
							<Divider type="vertical" style={{ borderLeft: '1px solid #485F7D' }} />
							<Link href={`https://ipfs.io/ipfs/${cid}`} target="_blank"> <PaperClipOutlined /> IPFS</Link>
						</> : null}
				</div>
			</div>
			<div className='flex items-center text-lightBlue'>
				{(topic || text || created_at) && <>
				&nbsp;
					<Divider className='ml-1 hidden md:inline-block' type="vertical" style={{ borderLeft: '1px solid #485F7D' }} />
				</>}
				{created_at && <span className='flex items-center pl-5 mt-2 md:pl-0 md:mt-0'><ClockCircleOutlined className='mx-1' />{relativeCreatedAt}</span>}
				{/* showing vote from local state */}
				{vote && <div  className='flex items-center justify-center'>
					<Divider className='ml-1 mb-[-1px] hidden md:inline-block' type="vertical" style={{ borderLeft: '1px solid #485F7D' }} />
					{vote === EVoteDecisionType.AYE ? (
						<p className='mb-[-1px]'>
							<LikeFilled className='text-[green]' />{' '}
							<span className='capitalize font-medium text-[green]'>
							Voted {vote}
							</span>
						</p>
					) : vote === EVoteDecisionType.NAY ? (
						<div>
							<DislikeFilled className='text-[red]' />{' '}
							<span className='mb-[5px] capitalize font-medium text-[red]'>
							Voted {vote}
							</span>
						</div>
					) : vote === EVoteDecisionType.SPLIT ? (
						<div className='mb-[-1px] flex align-center justify-center'>
							<SplitYellow className='mr-1'/>{' '}
							<span className='capitalize font-medium text-[#FECA7E]'>
								Voted {vote}
							</span>
						</div>
					) : vote === EVoteDecisionType.ABSTAIN ? (
						<div className='flex align-center justify-center mb-[1px]'>
							<AbstainGray className='mr-1' />{' '}
							<span className='capitalize font-medium text-bodyBlue' >
							Voted {vote}
							</span>
						</div>
					) : null}</div>}

				{/* showing vote from subsquid */}
				{
					votesArr.length > 0 ?
						<div className={votesArr.length > 1 ? 'flex items-center justify-center hover:cursor-pointer max-[768px]:mb-[-10px] ml-1' :'flex items-center justify-center max-[768px]:mb-[-10px] ml-1' } onClick={() => { if(votesArr.length > 1) setShowVotesModal(!showVotesModal);}}>
							<Divider className='ml-1 mb-[-1px] hidden md:inline-block' type="vertical" style={{ borderLeft: '1px solid #485F7D' }} />
							{votesArr[0].decision == 'yes' ?
								<p className='mb-[-1px]'>
									<LikeFilled className='text-[green]' />{' '}
									<span className='capitalize font-medium text-[green]'>
							Voted Aye
									</span>
								</p> :
								votesArr[0].decision == 'no' ?
									<div>
										<DislikeFilled className='text-[red]' />{' '}
										<span className='mb-[5px] capitalize font-medium text-[red]'>
							Voted Nay
										</span>
									</div> :
									votesArr[0].decision == 'abstain' && !(votesArr[0].balance as any).abstain ?
										<div className='mb-[-1px] flex align-center justify-center'>
											<SplitYellow className='mr-1'/>{' '}
											<span className='capitalize font-medium text-[#FECA7E]'>
									Voted Split
											</span>
										</div> :
										votesArr[0].decision == 'abstain' && (votesArr[0].balance as any).abstain ?
											<div className='flex align-center justify-center mb-[1px]'>
												<AbstainGray className='mr-1 mb-[-1px]' />{' '}
												<span className='capitalize font-medium text-bodyBlue' >
									Voted Abstain
												</span>
											</div> : null
							}
							{/* { votesArr.length > 1 && <p title={`${votesArr.length-1}+ votes available`}  className='mb-[-1px] ml-1' >{votesArr.length-1}+</p>} */}
							<Modal
								open={showVotesModal}
								onCancel={() => setShowVotesModal(false)}
								footer={false}
								className={`w-[400px] ${poppins.variable} ${poppins.className} max-md:w-full max-h-[675px] rounded-[6px]`}
								closeIcon={<CloseCross/>}
								wrapClassName={className}
								title={
									<div className='h-[65px] -mt-5 border-0 border-solid border-b-[1.5px] border-[#D2D8E0] mr-[-24px] ml-[-24px] rounded-t-[6px] flex  items-center gap-2'>
										<span className='text-bodyBlue font-semibold tracking-[0.0015em] ml-4 text-xl'>Votes</span>
									</div>
								}
							>
								{
									votesArr.length > 0 && votesArr.map((vote:any,idx:any) => {
										return(
											<div key={idx} className='flex items-center'>
												{vote.decision == 'yes' ?
													<div className='mb-[-1px] w-[90%] flex justify-between '>
														<div>
															<LikeFilled className='text-[green]' />{' '}
															<span className='capitalize font-medium text-[green]'>
																Aye
															</span>
														</div>
														<p>{dayjs(vote.createdAt, 'YYYY-MM-DD').format('Do MMM\'YY')}</p>
													</div> :
													vote.decision == 'no' ?
														<div className='w-[90%] flex justify-between'>
															<div className='mb-[-1px] '>
																<DislikeFilled className='text-[red]' />{' '}
																<span className='mb-[5px] capitalize font-medium text-[red]'>
																	Nay
																</span>
															</div>
															<p>{dayjs(vote.createdAt, 'YYYY-MM-DD').format('Do MMM\'YY')}</p>
														</div> :
														vote.decision == 'abstain' && !(vote.balance as any).abstain ?
															<div className='w-[90%] mb-[-1px] flex justify-between '>
																<div className='flex  mb-[-1px]'>
																	<SplitYellow className='mr-1'/>{' '}
																	<span className='capitalize font-medium text-[#FECA7E]'>
																		Split
																	</span>
																</div>
																<p>{dayjs(vote.createdAt, 'YYYY-MM-DD').format('Do MMM\'YY')}</p>
															</div> :
															vote.decision == 'abstain' && (vote.balance as any).abstain ?
																<div className=' w-[90%] flex align-center justify-between mb-[1px]'>
																	<div className='flex align-middle justify-center'>
																		<AbstainGray className='mr-1' />{' '}
																		<span className='capitalize font-medium text-bodyBlue' >
																			Abstain
																		</span>
																	</div>
																	<p>{dayjs(vote.createdAt, 'YYYY-MM-DD').format('Do MMM\'YY')}</p>
																</div> : null
												}
											</div>
										);
									})
								}

							</Modal>
						</div>: null
				}
				{children}
			</div>
		</div>

		<div className='flex'>

			{
				spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0?
					<div className='flex items-center mr-2'>
						<Tooltip color="#E5007A" title={`This comment has been reported as spam by ${spam_users_count} members`}>
							<WarningMessageIcon className='text-xl text-[#FFA012] scale-75' />
						</Tooltip>
					</div>
					: null
			}

			{sentiment===1 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-lg text-white  flex justify-center items-center  min-[320px]:mr-2'><AgainstIcon className='min-[320px]:items-start' /></Dropdown>}
			{sentiment===2 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-lg text-white  flex justify-center items-center min-[320px]:mr-2'><SlightlyAgainstIcon  className='min-[320px]:items-start'/></Dropdown>}
			{sentiment===3 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-lg text-white  flex justify-center items-center min-[320px]:mr-2'><NeutralIcon  className='min-[320px]:items-start' /></Dropdown>}
			{sentiment===4 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-lg text-white  flex justify-center items-center min-[320px]:mr-2' ><SlightlyForIcon  className='min-[320px]:items-start'/></Dropdown>}
			{sentiment===5 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-[20px] mr-[-1px] mb-[-1px] mt-[-2px] text-white  flex justify-center items-center min-[320px]:mr-2'><ForIcon  className='min-[320px]:items-start'/></Dropdown>}
			{commentSource=== 'subsquare' &&
			<Styled>
				<HelperTooltip text={<span>This comment is imported from <span className='dark-pink'>Subsqaure</span></span>} placement={'leftTop'} bgColor='#FCE5F2' />
			</Styled>
			}
		</div>
	</div>;
};

export default CreationLabel;
