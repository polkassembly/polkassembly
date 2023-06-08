// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Collapse, Divider } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import NotificationChannelsIcon from '~assets/icons/notification-channels-icon.svg';
import SlackIcon from '~assets/icons/slack.svg';
import ElementIcon from '~assets/icons/element.svg';
import EmailNotificationCard from './EmailNotificationCard';
import BotSetupCard from './BotSetupCard';
import { DiscordIcon, TelegramIcon } from '~src/ui-components/CustomIcons';

const { Panel } = Collapse;
type Props = {};

// eslint-disable-next-line no-empty-pattern
export default function NotificationChannels({}: Props) {
	return (
		<Collapse
			size='large'
			className='bg-white'
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				return isActive ? <CollapseIcon /> : <ExpandIcon />;
			}}
		>
			<Panel
				header={
					<div className='flex items-center gap-[8px]'>
						<NotificationChannelsIcon />
						<h3 className='font-semibold text-xl tracking-wide leading-7 text-sidebarBlue mb-0'>
                            Notification Channels
						</h3>
					</div>
				}
				key='1'
			>
				<div className='flex flex-col'>
					<p className='font-semibold text-[#243A57] text-[16px]'>
                        Please select the socials where you would like to
                        receive notifications:
					</p>
					<EmailNotificationCard onClick={() => {}} />
					<Divider className='border-[#D2D8E0] border-2' dashed />
					{Bots.map((bot, i) => (
						<div key={bot.title}>
							<BotSetupCard {...bot} />
							{Bots.length - 1 > i && (
								<Divider
									className='border-[#D2D8E0] border-[2px]'
									dashed
								/>
							)}
						</div>
					))}
				</div>
			</Panel>
		</Collapse>
	);
}

const Bots = [
	{
		Icon: <TelegramIcon />,
		description: 'a Telegram chat to get Telegram notifications',
		title: 'Telegram'
	},
	{
		Icon: <DiscordIcon />,
		description: 'to a Discord Channel chat to get Discord notifications',
		title: 'Discord'
	},
	{
		Icon: <SlackIcon />,
		description: 'to a Slack Channel chat to get Slack notifications',
		title: 'Slack'
	},
	{
		Icon: <ElementIcon />,
		description: '',
		title: 'Element'
	}
];
