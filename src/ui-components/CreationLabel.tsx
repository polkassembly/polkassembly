// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import React, { FC, ReactNode } from 'react';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';

import NameLabel from './NameLabel';
import TopicTag from './TopicTag';

import AgainstIcon from '~assets/icons/against.svg';
import SlightlyAgainstIcon from '~assets/icons/slightly-against.svg';
import NeutralIcon from '~assets/icons/neutral.svg';
import SlightlyForIcon from '~assets/icons/slightly-for.svg';
import ForIcon from '~assets/icons/for.svg';

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
	const { className, children, created_at, defaultAddress, text, username, topic,sentiment } = props;
	const relativeCreatedAt = getRelativeCreatedAt(created_at);

	return <div className={`${className} flex justify-between w-[100%]`} >
		<div className={` text-navBlue text-xs flex flex-col md:flex-row md:items-center ${sentiment && sentiment!==0 &&'mt-[-12px]'}`}>
			<div className={'flex min-[320px]:flex-row min-[320px]:items-center w-full min-[320px]:w-auto '}>
				<div className={'flex items-center'}>
					{!text && <span className='mr-1'>By:</span>}
					<NameLabel
						defaultAddress={defaultAddress}
						username={username}
					/>
					{text}&nbsp;
					{topic &&
			<div className='flex items-center'> <span>in</span> &nbsp; &nbsp; <TopicTag topic={topic} className={topic} /> </div>
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
		{sentiment===1 && <AgainstIcon className='scale-50 mt-[-15px]'/>}
		{sentiment===2 && <SlightlyAgainstIcon className='scale-50 mt-[-15px]'/>}
		{sentiment===3 && <NeutralIcon className='scale-50 mt-[-15px]'/>}
		{sentiment===4 && <SlightlyForIcon className='scale-50 mt-[-15px]'/>}
		{sentiment===5 && <ForIcon className='scale-50 mt-[-15px]'/>}
	</div>;
};

export default CreationLabel;
