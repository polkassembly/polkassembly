// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { MailFilled } from '@ant-design/icons';
import { Button, Input } from 'antd';
type Props = {
    onClick: any;
};

export default function EmailNotificationCard({ onClick }: Props) {
	const [input, setInput] = useState('');
	const handleClick = () => {
		//TODO: Aleem need to add validation for email
		if (!input) {
			return;
		}
		onClick(input);
	};
	return (
		<div className='flex flex-col'>
			<h3 className='text-base font-semibold m-0'>
				<MailFilled /> Email Notifications
			</h3>
			<div className='flex gap-2 w-1/2'>
				<Input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder='Account Address'
				/>
				<Button
					className='h-10 rounded-[6px] bg-[#E5007A] flex items-center justify-center border border-solid border-pink_primary px-[22px] py-[4px] text-white font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize'
					onClick={handleClick}
				>
                    Verify
				</Button>
			</div>
		</div>
	);
}
