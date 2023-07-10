// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import React from 'react';

interface Props{
	className?: string;
	disabled?: boolean;
	size?: SizeType;
	onClickAye: () => void;
	onClickNay: () => void;
	customWidth?:string
}

const AyeNayButton = ({ className, disabled, onClickAye, onClickNay, size, customWidth } : Props) => (
	<div className={`${className} flex items-center justify-between max-w-[256px]`}>

		<Button name='aye' htmlType='submit' className={`bg-aye_green hover:bg-green-600 text-white flex items-center justify-center mr-7 border-aye_green hover:border-green-600 rounded-md ${customWidth} max-[370px]:w-[120px]`} disabled={disabled} size={size} onClick={onClickAye}>
			<LikeFilled className='mr-1' />Aye
		</Button>

		<Button name='nay' htmlType='submit' className={` text-white hover:text-white flex items-center justify-center bg-nay_red hover:bg-red_primary border-nay_red rounded-md ${customWidth} max-[370px]:w-[120px]`} disabled={disabled} size={size} onClick={onClickNay}>
			<DislikeFilled className='mr-1' />Nay
		</Button>
	</div>
);

export default AyeNayButton;
