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
import { useUserDetailsContext } from '~src/context';

interface ICreationLabelProps {
	className?: string
	children?: ReactNode
	created_at?: Date
	defaultAddress?: string | null
	text?: string
	topic?: string
	username?: string;
  sentiment?:number;
}

const CreationLabel: FC<ICreationLabelProps> = (props) => {
	const { className, children, created_at, text, username, topic,sentiment } = props;
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const { defaultAddress }=useUserDetailsContext();

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
					{topic &&
			<div className='flex items-center'> <span>in</span> &nbsp; &nbsp; <TopicTag topic={topic} className={topic} /></div>
					}
				</div>
			</div>
			<div className='flex items-center mt-2 md:mt-0'>
				{(topic || text) && <>
				&nbsp;
					<Divider className='ml-1 hidden md:inline-block' type="vertical" style={{ borderLeft: '1px solid #90A0B7' }} />
				</>}
				{created_at && <span className='flex items-center'> <ClockCircleOutlined className='mr-1' />{relativeCreatedAt}</span>}
				{children}
			</div>
		</div>
		{sentiment===1 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-2xl'><AgainstIcon /></Dropdown>}
		{sentiment===2 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-2xl'><SlightlyAgainstIcon/></Dropdown>}
		{sentiment===3 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-2xl'><NeutralIcon /></Dropdown>}
		{sentiment===4 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-2xl'><SlightlyForIcon /></Dropdown>}
		{sentiment===5 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-2xl'><div></div><ForIcon /></Dropdown>}
	</div>;
};

export default CreationLabel;
