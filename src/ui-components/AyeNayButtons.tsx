// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import React from 'react';

interface Props {
	className?: string;
	disabled?: boolean;
	size?: SizeType;
	onClickAye: () => void;
	onClickNay: () => void;
	customWidth?: string;
}

const AyeNayButton = ({ className, disabled, onClickAye, onClickNay, size, customWidth }: Props) => (
	<div className={`${className} flex max-w-[256px] items-center justify-between`}>
		<Button
			name='aye'
			htmlType='submit'
			className={`mr-7 flex items-center justify-center rounded-md border-aye_green bg-aye_green text-white hover:border-green-600 hover:bg-green-600 dark:border-aye_green_Dark dark:bg-aye_green_Dark ${customWidth} max-[370px]:w-[120px]`}
			disabled={disabled}
			size={size}
			onClick={onClickAye}
		>
			<LikeFilled className='mr-1' />
			Aye
		</Button>

		<Button
			name='nay'
			htmlType='submit'
			className={`flex items-center justify-center rounded-md border-nay_red bg-nay_red text-white hover:bg-red_primary hover:text-white dark:border-nay_red_Dark dark:bg-nay_red_Dark ${customWidth} max-[370px]:w-[120px]`}
			disabled={disabled}
			size={size}
			onClick={onClickNay}
		>
			<DislikeFilled className='mr-1' />
			Nay
		</Button>
	</div>
);

export default AyeNayButton;
