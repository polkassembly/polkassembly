// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classNames from 'classnames';
import { poppins } from 'pages/_app';
import React from 'react';
import { useTheme } from 'next-themes';
import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import NotificationsLayout from './NotificationsLayout';
import { useInAppNotificationsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { inAppNotificationsActions } from '~src/redux/inAppNotifications';
import { EInAppNotificationsType } from './types';

const NotificationsContent = ({ className, inPage = false }: { className?: string; inPage?: boolean }) => {
	const { resolvedTheme: theme } = useTheme();
	const { unreadNotificationsCount, recentNotificationsCount, recentNotifications, unreadNotifications } = useInAppNotificationsSelector();
	const dispatch = useDispatch();

	const handleMarkAsRead = () => {
		dispatch(
			inAppNotificationsActions.updateInAppNotifications({
				lastReadTime: new Date(),
				recentNotifications: [
					...unreadNotifications.map((notification) => {
						return { ...notification, type: EInAppNotificationsType.RECENT };
					}),
					...recentNotifications
				],
				recentNotificationsCount: unreadNotificationsCount + recentNotificationsCount,
				unreadNotifications: [],
				unreadNotificationsCount: 0
			})
		);
	};

	return (
		<div
			className={classNames(className, poppins.className, poppins.variable, 'flex flex-col justify-between', inPage ? 'rounded-xl bg-white py-6 dark:bg-section-dark-overlay' : '')}
		>
			<div className='flex flex-col'>
				<div
					className={classNames(
						!inPage ? (theme == 'dark' ? 'dark-shadow-top' : 'shadow-top') : '',
						'flex items-center justify-between rounded-t-md pb-3 tracking-[0.015em] text-bodyBlue dark:text-blue-dark-high max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-4',
						inPage ? 'px-10 pt-3' : 'px-8 pt-5'
					)}
				>
					<div className={classNames('flex items-center gap-2 font-semibold max-sm:justify-start', inPage ? 'text-2xl' : 'text-xl ')}>
						{inPage && (
							<Image
								src={'/assets/icons/notification-bell-default.svg'}
								height={28}
								width={28}
								alt='notific...'
								className={theme === 'dark' ? 'dark-icons' : ''}
							/>
						)}
						Notification
						{!!unreadNotificationsCount && (
							<span className='flex h-7 w-7 items-center justify-center rounded-full bg-[#3B47DF] text-sm font-medium text-white dark:bg-[#5B67FF]'>
								{unreadNotificationsCount}
							</span>
						)}
					</div>
					<div className='flex gap-2'>
						{!!unreadNotificationsCount && (
							<button
								onClick={handleMarkAsRead}
								className={classNames(
									'flex cursor-pointer items-center gap-1 bg-transparent px-3 py-0.5 text-xs font-medium text-[#3B47DF] dark:text-[#5B67FF]',
									inPage ? 'rounded-md border-[1px] border-solid border-[#5B67FF] bg-[#F3F4FD] dark:bg-[#1A1B34]' : 'border-none'
								)}
							>
								<Image
									src={'/assets/icons/mark-as-read.svg'}
									height={16}
									width={16}
									alt='notific...'
								/>
								Mark as read
							</button>
						)}
						{inPage && (
							<div className=''>
								<Link
									href={'/settings?tab=notifications'}
									className='flex items-center gap-2 rounded-md border-[1px] border-solid border-section-light-container p-2 dark:border-separatorDark'
								>
									<Image
										height={16}
										width={16}
										alt='...'
										className={theme == 'dark' ? 'dark-icons' : ''}
										src='/assets/icons/notification-setting.svg'
									/>
								</Link>
							</div>
						)}
					</div>
				</div>

				{/* content */}
				<NotificationsLayout inPage={inPage} />
			</div>

			{/* footer */}
			{!inPage && (
				<div
					className={classNames(
						theme === 'dark' ? 'dark-shadow-bottom' : '',
						'shadow-bottom -mb-3 flex items-center justify-between px-6 py-4 text-sm text-lightBlue dark:text-blue-dark-medium'
					)}
				>
					<Link
						href={'/settings?tab=notifications'}
						className='flex items-center gap-2'
					>
						<Image
							height={16}
							width={16}
							alt='...'
							className={theme == 'dark' ? 'dark-icons' : ''}
							src='/assets/icons/notification-setting.svg'
						/>
						Manage Settings
					</Link>
					<Link
						href='/notification'
						className='font-medium text-pink_primary'
					>
						View All
					</Link>
				</div>
			)}
		</div>
	);
};
export default styled(NotificationsContent)`
	.shadow-bottom {
		box-shadow: 0px -2px 6px 0px rgba(0, 0, 0, 0.08) !important;
	}
	.shadow-top {
		box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.08) !important;
	}
	.dark-shadow-top {
		box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.4) !important;
	}
	.dark-shadow-bottom {
		box-shadow: 0px -2px 6px 0px rgba(0, 0, 0, 0.4) !important;
	}
`;
