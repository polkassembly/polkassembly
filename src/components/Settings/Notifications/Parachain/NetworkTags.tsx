// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Tag as AntdTag } from 'antd';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';
import { PlusCircleOutlined } from '@ant-design/icons';
type Props = {
    icon?: any;
    name: any;
	selected?:boolean;
	onActionClick?:any;
};

const Tag = styled(AntdTag)`
&.ant-tag{
padding:8px;
}
`;

const PlusIcon = styled(PlusCircleOutlined)`
svg {
	width:25px;
	height:25px;
	color:#E5007A;
}
`;

export default function NetworkTags({ icon, name, selected=true, onActionClick }: Props) {
	return (
		<Tag onClick={onActionClick} className={`flex items-center justify-between text-navBlue border-solid border rounded-[34px] px-[24px] py-[8px] border-[#E5007A] ${selected ? 'bg-[#FEF2F8]': 'bg-white px-[12px] py-[15px]' } cursor-pointer`}>
			{icon ? <Image
				className='w-[40px] h-[40px] rounded-full'
				src={icon}
				alt='Logo'
			/>: <PlusIcon/>}
			<span className={`items-center justify-center ml-[9.25px] mr-[13.35px] font-semibold ${selected ? 'text-[#243A57]' : 'text-pink_primary'} text-lg leading-[18px] tracking-[0.02em] capitalize`}>
				{name}
			</span>
		</Tag>
	);
}
