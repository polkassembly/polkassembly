// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Tag } from 'antd';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';
import { PlusCircleOutlined } from '@ant-design/icons';
import CloseIcon from '~assets/icons/close.svg';
type Props = {
	icon?: any;
	name: any;
	selected?: boolean;
	onActionClick?: any;
	onClose?: any;
};

const PlusIcon = styled(PlusCircleOutlined)`
	svg {
		width: 25px;
		height: 25px;
		color: #e5007a;
	}
`;

export default function NetworkTags({ icon, name, selected = true, onActionClick, onClose }: Props) {
	return (
		<Tag
			onClick={onActionClick}
			className={`flex items-center justify-between rounded-[34px] border border-solid border-[#E5007A] px-3 sm:px-[24px] ${
				selected ? 'bg-[#FEF2F8] py-[8px] dark:bg-[#33071E]' : 'bg-white py-2 dark:border-separatorDark dark:bg-section-dark-overlay sm:py-[14px]'
			} cursor-pointer`}
		>
			{icon ? (
				<Image
					className='h-6 w-6 rounded-full sm:h-[40px] sm:w-[40px]'
					src={icon}
					alt='Logo'
				/>
			) : (
				<PlusIcon />
			)}
			<span
				className={`ml-[9.25px] mr-[13.35px] items-center justify-center font-semibold ${
					selected ? 'text-blue-light-high dark:text-blue-dark-high' : 'text-pink_primary'
				} text-sm capitalize leading-[21px] tracking-[0.02em] sm:text-lg`}
			>
				{name === 'xx' ? 'XX' : name}
			</span>
			{onClose && (
				<span
					onClick={() => onClose(name)}
					className='mt-1'
				>
					<CloseIcon />
				</span>
			)}
		</Tag>
	);
}
