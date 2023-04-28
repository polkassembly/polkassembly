// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined } from '@ant-design/icons';
import { Divider, Dropdown, MenuProps } from 'antd';
import React, { FC, ReactNode } from 'react';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';
import { poppins } from 'pages/_app';

import NameLabel from './NameLabel';
import TopicTag from './TopicTag';

import { AgainstIcon ,SlightlyAgainstIcon,SlightlyForIcon,NeutralIcon,ForIcon } from '~src/ui-components/CustomIcons';
import Link from 'next/link';
import { PaperClipOutlined } from '@ant-design/icons';
import HelperTooltip from './HelperTooltip';
import styled from 'styled-components';

const Styled = styled.div`
    padding:0;
    margin:0;
    
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
    .ant-tooltip-placement-leftTop .ant-tooltip-arrow{
    	top:-7px;
    	right:4px;
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
}

const CreationLabel: FC<ICreationLabelProps> = (props) => {
	const { className, children, created_at, text, username, defaultAddress, topic,sentiment,commentSource='polkassembly', cid } = props;
	const relativeCreatedAt = getRelativeCreatedAt(created_at);

	const items : MenuProps['items']=[
		sentiment === 1 ? { key:1,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Completely Against</div> }:null,
		sentiment === 2 ? { key:2,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Slightly Against</div> }:null,
		sentiment === 3 ? { key:3,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Neutral</div> }:null,
		sentiment === 4 ? { key:4,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Slightly For</div> }:null,
		sentiment === 5 ? { key:5,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Completely For</div> }:null
	];

	return <div className={`${className} flex justify-between w-[100%]`} >
		<div className='text-navBlue text-xs flex flex-col md:flex-row md:items-center'>
			<div className={'flex min-[320px]:flex-row min-[320px]:items-center w-full min-[320px]:w-auto '}>
				<div className={'flex items-center '}>
					{!text && <span className='mr-1'>By:</span>}
					<NameLabel
						defaultAddress={defaultAddress}
						username={username}
					/>
					{text}&nbsp;
					{
						topic && <div className='flex items-center'> <span>in</span> &nbsp; &nbsp; <TopicTag topic={topic} className={topic} /></div>
					}
					{cid ?
						<>
							<Divider type="vertical" style={{ borderLeft: '1px solid #90A0B7' }} />
							<Link href={`https://ipfs.io/ipfs/${cid}`} target="_blank"> <PaperClipOutlined /> IPFS</Link>
						</> : null}
					{children}
				</div>
			</div>
			<div className='flex items-center mt-2 md:mt-0'>
				{(topic || text) && <>
				&nbsp;
					<Divider className='ml-1 hidden md:inline-block' type="vertical" style={{ borderLeft: '1px solid #90A0B7' }} />
				</>}
				{created_at && <span className='flex items-center'> <ClockCircleOutlined className='mr-1' />{relativeCreatedAt}</span>}
			</div>
		</div>
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
	</div>;
};

export default CreationLabel;
