// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { CHANNEL } from '.';

type Props = {
    title: string;
    description: string;
    Icon: any;
	onClick:(channelName: CHANNEL) => void;
	channel:CHANNEL
	enabled:boolean
};

export default function BotSetupCard({ title, description, Icon, onClick, channel, enabled }: Props) {
	return (
		<div className='flex items-start text-[#243A57] gap-2'>
			<div className={'relative mt-[2px] [&>svg]:mt-0'}>{Icon}</div>
			<div>
				<h3 className='text-base font-medium m-0'>
					{title} Notifications {!description && (
						<span className='text-[10px] px-[4px] py-[2px] bg-[#407BFF] border-[#5A46FF] border-2 text-[#FFFFFF] rounded-tr-lg rounded-bl-lg'>Coming Soon</span>
					)}
					{!!enabled && <span className='text-[10px] px-[4px] py-[2px] bg-[#407BFF] border-[#5A46FF] border-2 text-[#FFFFFF] rounded-tr-lg rounded-bl-lg'>Enabled</span>}
				</h3>
				{description && (
					<p className='font-normal m-0 text-[12px] leading-[18px] font-normal'>
						<span className='text-pink_primary font-medium cursor-pointer text-[14px] leading-[21px]' onClick={() => onClick(channel)}>
							<PlusCircleOutlined /> ADD THE POLKASSEMBLY BOT
						</span>{' '}
                        to {description}
					</p>
				)}
			</div>
		</div>
	);
}
