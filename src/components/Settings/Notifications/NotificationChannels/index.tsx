// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Divider } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import NotificationChannelsIcon from '~assets/icons/notification-channel-svg.svg';
import EmailNotificationCard from './EmailNotificationCard';
import BotSetupCard from './BotSetupCard';
import TelegramInfoModal from './Modals/Telegram';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { FIREBASE_FUNCTIONS_URL, firebaseFunctionsHeader } from '../utilsFe';
import DiscordInfoModal from './Modals/Discord';
import SlackInfoModal from './Modals/Slack';
import { Collapse } from '../common-ui/Collapse';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { DiscordFilledIcon, ElementIcon, MailFilledIcon, SlackIcon, TelegramFilledIcon } from '~src/ui-components/CustomIcons';
import InAppNotificationsCard from './InAppNotificationCard';

const { Panel } = Collapse;
type Props = { handleEnableDisabled: any; handleReset: any };

export enum CHANNEL {
	TELEGRAM = 'telegram',
	DISCORD = 'discord',
	EMAIL = 'email',
	SLACK = 'slack',
	ELEMENT = 'element',
	IN_APP = 'in_app'
}

// eslint-disable-next-line no-empty-pattern
export default function NotificationChannels({ handleEnableDisabled, handleReset }: Props) {
	const [showModal, setShowModal] = useState<CHANNEL | null>(null);
	const { network } = useNetworkSelector();
	const { id, networkPreferences, email, email_verified, loginAddress } = useUserDetailsSelector();
	const [active, setActive] = useState<boolean | undefined>(false);
	const botsArr = Bots();
	const handleClick = (channelName: CHANNEL) => {
		setShowModal(channelName);
	};
	const { resolvedTheme: theme } = useTheme();

	const getVerifyToken = async (channel: CHANNEL) => {
		try {
			const verifyTokenRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getChannelVerifyToken`, {
				body: JSON.stringify({
					channel,
					userId: id
				}),
				headers: firebaseFunctionsHeader(network, loginAddress),
				method: 'POST'
			});

			const { data: verifyToken, error: verifyTokenError } = (await verifyTokenRes.json()) as {
				data: string;
				error: string;
			};

			if (verifyTokenError) {
				queueNotification({
					header: 'Failed!',
					message: verifyTokenError,
					status: NotificationStatus.ERROR
				});
				return;
			}

			if (verifyToken) {
				return verifyToken;
			}
		} catch (error) {
			queueNotification({
				header: 'Failed!',
				message: 'Error in generating token.',
				status: NotificationStatus.ERROR
			});
		}
	};

	return (
		<Collapse
			size='large'
			className={'border-section-light-container bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
			theme={theme as any}
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				setActive(isActive);
				return isActive ? <CollapseIcon /> : <ExpandIcon />;
			}}
		>
			<Panel
				header={
					<div className='flex items-center justify-between gap-[8px]'>
						<div className='channel-header flex items-center gap-[6px]'>
							<NotificationChannelsIcon />
							<h3 className='mb-0 pt-1 text-[16px] font-semibold leading-[21px] tracking-wide text-blue-light-high dark:text-blue-dark-high md:text-[18px]'>
								Notification Channels
							</h3>
						</div>
						{!!active && (
							<div className='hidden items-center gap-4 md:flex'>
								<div className={`${!networkPreferences?.channelPreferences?.[CHANNEL.EMAIL]?.enabled ? '[&>svg]:opacity-50' : ''}`}>
									<MailFilledIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />
								</div>
								{botsArr.map((bot, i) => (
									<div
										className={`${!networkPreferences?.channelPreferences?.[bot.channel]?.enabled ? '[&>svg]:opacity-50' : ''}`}
										key={i}
									>
										{bot.Icon}
									</div>
								))}
							</div>
						)}
					</div>
				}
				key='1'
			>
				<div className='flex flex-col'>
					<p className='mb-[22px] text-[16px] font-medium leading-[21px] text-blue-light-high dark:text-blue-dark-high'>
						Please select the socials where you would like to receive notifications:
					</p>
					<InAppNotificationsCard
						notificationEnabled={!!networkPreferences.channelPreferences?.[CHANNEL.IN_APP]?.enabled}
						handleEnableDisabled={handleEnableDisabled}
					/>
					<Divider
						className='my-[30px] border-2 border-section-light-container dark:border-[#3B444F] dark:border-separatorDark'
						dashed
					/>
					<EmailNotificationCard
						verifiedEmail={networkPreferences?.channelPreferences?.[CHANNEL.EMAIL]?.handle || email || ''}
						verified={email_verified || false}
						notificationEnabled={networkPreferences?.channelPreferences?.[CHANNEL.EMAIL]?.enabled || false}
						handleEnableDisabled={handleEnableDisabled}
					/>
					<Divider
						className='my-[30px] border-2 border-section-light-container dark:border-[#3B444F] dark:border-separatorDark'
						dashed
					/>
					{botsArr.map((bot, i) => (
						<div key={bot.title}>
							<BotSetupCard
								{...bot}
								onClick={handleClick}
								enabled={networkPreferences?.channelPreferences?.[bot.channel]?.enabled || false}
								isBotSetup={networkPreferences?.channelPreferences?.[bot.channel]?.enabled === undefined ? false : true}
								handleEnableDisabled={handleEnableDisabled}
								handleReset={handleReset}
							/>
							{botsArr.length - 1 > i && (
								<Divider
									className='my-[30px] border-[2px] border-section-light-container dark:border-[#3B444F] dark:border-separatorDark'
									dashed
								/>
							)}
						</div>
					))}
				</div>
				<TelegramInfoModal
					icon={<TelegramFilledIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />}
					title='How to add Bot to Telegram'
					open={showModal === CHANNEL.TELEGRAM}
					getVerifyToken={getVerifyToken}
					onClose={() => setShowModal(null)}
					generatedToken={networkPreferences?.channelPreferences?.[CHANNEL.TELEGRAM]?.verification_token || ''}
				/>
				<DiscordInfoModal
					icon={<DiscordFilledIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />}
					title='How to add Bot to Discord'
					open={showModal === CHANNEL.DISCORD}
					getVerifyToken={getVerifyToken}
					onClose={() => setShowModal(null)}
					generatedToken={networkPreferences?.channelPreferences?.[CHANNEL.DISCORD]?.verification_token || ''}
				/>
				<SlackInfoModal
					icon={<SlackIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />}
					title='How to add Bot to Slack'
					open={showModal === CHANNEL.SLACK}
					getVerifyToken={getVerifyToken}
					onClose={() => setShowModal(null)}
					generatedToken={networkPreferences?.channelPreferences?.[CHANNEL.SLACK]?.verification_token || ''}
				/>
			</Panel>
		</Collapse>
	);
}

const Bots = () => {
	return [
		{
			Icon: <TelegramFilledIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />,
			channel: CHANNEL.TELEGRAM,
			description: 'a Telegram chat to get Telegram notifications',
			title: 'Telegram'
		},
		{
			Icon: <DiscordFilledIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />,
			channel: CHANNEL.DISCORD,
			description: 'a Discord Channel chat to get Discord notifications',
			title: 'Discord'
		},
		{
			Icon: (
				<SlackIcon
					className='text-2xl text-lightBlue dark:text-icon-dark-inactive'
					style={{ marginTop: 4, transform: 'scale(0.9)' }}
				/>
			),
			channel: CHANNEL.SLACK,
			description: 'a Slack Channel chat to get Slack notifications',
			title: 'Slack'
		},
		{
			Icon: (
				<ElementIcon
					className='text-2xl text-lightBlue dark:text-icon-dark-inactive'
					style={{ marginTop: 4, transform: 'scale(0.9)' }}
				/>
			),
			channel: CHANNEL.ELEMENT,
			description: '',
			title: 'Element'
		}
	];
};
