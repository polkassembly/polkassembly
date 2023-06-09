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
	onClick:any;
	channel:CHANNEL
};

export default function BotSetupCard({ title, description, Icon, onClick, channel }: Props) {
	return (
		<div className='flex items-start gap-2'>
			<div>{Icon}</div>
			<div>
				<h3 className='text-base font-semibold m-0'>
					{title} Notifications {!description && (
						<span className='text-[10px] px-[2px] py-[4px] border'>Coming Soon</span>
					)}
				</h3>
				{description && (
					<p className='font-normal m-0'>
						<span className='text-pink_primary font-medium' onClick={() => onClick(channel)}>
							<PlusCircleOutlined /> ADD THE POLKASSEMBLY BOT
						</span>{' '}
                        to {description}
					</p>
				)}
			</div>
		</div>
	);
}
