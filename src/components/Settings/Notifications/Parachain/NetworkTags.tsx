// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Tag as AntdTag } from 'antd';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

type Props = {
    icon: any;
    name: any;
};

const Tag = styled(AntdTag)`
&.ant-tag{
padding:8px;
}
`;

export default function NetworkTags({ icon, name }: Props) {
	return (
		<Tag className='flex items-center justify-between text-navBlue hover:text-[red] border-solid border rounded-[34px] bg-[rgba(210,216,224,0.2)] px-[24px] py-[8px] hover:border-[#E5007A] hover:bg-[#FEF2F8]'>
			<Image
				className='w-[40px] h-[40px] rounded-full'
				src={icon}
				alt='Logo'
			/>
			<span className='items-center justify-center ml-[9.25px] mr-[13.35px] font-semibold text-[#243A57] text-lg leading-[18px] tracking-[0.02em] capitalize'>
				{name}
			</span>
		</Tag>
	);
}
