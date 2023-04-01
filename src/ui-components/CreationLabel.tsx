// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import React, { FC, ReactNode } from 'react';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';

import NameLabel from './NameLabel';
import TopicTag from './TopicTag';

interface ICreationLabelProps {
	className?: string
	children?: ReactNode
	created_at?: Date
	defaultAddress?: string | null
	text?: string
	topic?: string
	username?: string
}

const CreationLabel: FC<ICreationLabelProps> = (props) => {
	const { className, children, created_at, defaultAddress, text, username, topic } = props;
	const relativeCreatedAt = getRelativeCreatedAt(created_at);

	return <div className={`${className} text-navBlue text-xs flex flex-col md:flex-row md:items-center`}>
		<div className='flex min-[320px]:flex-row min-[320px]:items-center w-full min-[320px]:w-auto'>
			<div className='flex items-center'>
				{!text && <span className='mr-1'>By:</span>}
				<NameLabel
					defaultAddress={defaultAddress}
					username={username}
				/>
				{text}&nbsp;
			</div>
			{topic &&
			<div className='flex items-center'> <span>in</span> &nbsp; &nbsp; <TopicTag topic={topic} className={topic} /> </div>
			}
		</div>

		<div className='flex items-center mt-2 md:mt-0'>
			{(topic || text) && <>
				&nbsp;
				<Divider className='ml-1 hidden md:inline-block' type="vertical" style={{ borderLeft: '1px solid #90A0B7' }} />
			</>}
			{created_at && <span className='flex items-center'> <ClockCircleOutlined className='mr-1' />{relativeCreatedAt}</span>}
			{children}
		</div>
	</div>;
};

export default CreationLabel;
