// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classNames from 'classnames';
import { poppins } from 'pages/_app';
import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';
import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import NotificationsLayout from './NotificationsLayout';
import { useInAppNotificationsSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { inAppNotificationsActions } from '~src/redux/inAppNotifications';
import { EInAppNotificationsType } from './types';
import { CHANNEL } from '../Settings/Notifications/NotificationChannels';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { MessageType } from '~src/auth/types';
import { useRouter } from 'next/router';
import { isPage } from 'react-pdf/dist/cjs/shared/propTypes';

interface INotificationsContent {
	className?: string;
	inPage?: boolean;
	isLoading?: boolean;
	closePopover?: (pre: boolean) => void;
}

const NotificationsContent = ({ className, inPage = false, isLoading, closePopover }: INotificationsContent) => {
	const router = useRouter();
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const { networkPreferences, id: userId } = useUserDetailsSelector();
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const { unreadNotificationsCount, recentNotificationsCount, recentNotifications, unreadNotifications } = useInAppNotificationsSelector();

	const handleUpdateLastSeen = async () => {
		const { data, error } = await nextApiClientFetch<MessageType>('/api/v1/inAppNotifications/add-last-seen', {
			userId: userId
		});

		if (error || data) console.log(error || data?.message || '');
	};

	const handleMarkAsRead = () => {
		handleUpdateLastSeen();
		dispatch(
			inAppNotificationsActions.updateInAppNotifications({
				lastReadTime: JSON.stringify(new Date()),
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

	const handleViewAll = (timeLimit: number) => {
		if (!unreadNotificationsCount) return;
		const timeoutId = setTimeout(() => {
			handleMarkAsRead();
		}, timeLimit);
		return () => clearTimeout(timeoutId);
	};

	useEffect(() => {
		if (!isPage) return;
		handleViewAll(10000);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inPage]);

	return (
		<div
			className={classNames(className, poppins.className, poppins.variable, 'flex flex-col justify-between', inPage ? 'rounded-xl bg-white py-6 dark:bg-section-dark-overlay' : '')}
		>
			<div className='flex flex-col'>
				<div className={classNames('flex items-center justify-between rounded-t-md pb-3 text-bodyBlue dark:text-blue-dark-high', inPage ? 'px-10 pt-3 max-sm:px-5' : 'px-8 pt-5')}>
					<div className={classNames('flex items-center gap-2 font-semibold max-sm:justify-start', inPage ? 'text-2xl tracking-wide' : 'text-xl tracking-[0.025em]')}>
						{inPage && (
							<Image
								src={'/assets/icons/notification-bell-default.svg'}
								height={28}
								width={28}
								alt='notific...'
								className={theme === 'dark' ? 'dark-icons' : ''}
							/>
						)}
						Notifications
						{!!unreadNotificationsCount && (
							<span className='flex min-h-[26px] min-w-[26px] items-center justify-center rounded-full bg-[#3B47DF] p-1 text-xs font-medium text-white dark:bg-[#5B67FF]'>
								{unreadNotificationsCount}
							</span>
						)}
					</div>
					<div className='flex gap-4'>
						{!!unreadNotificationsCount && !router.pathname.includes('/notifications') && (
							<button
								onClick={handleMarkAsRead}
								className={classNames(
									'flex cursor-pointer items-center gap-1 bg-transparent py-0.5 text-xs font-medium text-[#3B47DF] dark:text-[#5B67FF]',
									inPage ? 'rounded-md border-[1px] border-solid border-[#5B67FF] bg-[#F3F4FD] px-3 dark:bg-[#1A1B34]' : 'border-none'
								)}
							>
								<Image
									src={'/assets/icons/mark-as-read.svg'}
									height={16}
									width={16}
									alt='notific...'
								/>
								{!isMobile && 'Mark as read'}
							</button>
						)}
						{inPage && (
							<div className=''>
								<Link
									href={'/settings?tab=notifications'}
									onClick={() => closePopover?.(true)}
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
				{unreadNotificationsCount + recentNotificationsCount > 0 && !isLoading ? (
					<NotificationsLayout inPage={inPage} />
				) : !isLoading ? (
					<div className='flex h-[350px] flex-col items-center gap-2 py-8'>
						<Image
							src={theme == 'dark' ? '/assets/icons/notification-empty-state-dark.svg' : '/assets/icons/notification-empty-state.svg'}
							height={150}
							width={150}
							alt='empty...'
						/>
						<span className='text-sm text-lightBlue dark:text-blue-dark-medium'>No Notifications</span>
						{!networkPreferences.channelPreferences?.[CHANNEL.IN_APP]?.enabled && !isLoading && (
							<div className='mt-1 flex items-center justify-center gap-1 text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>
								<div className={'flex items-center justify-between gap-1'}>
									<Image
										src={'/assets/icons/notification-bell-default.svg'}
										height={14}
										width={14}
										alt='notific...'
										className={theme == 'dark' ? 'pink-dark-icon ' : 'pink-icon'}
									/>
									<Link
										onClick={() => closePopover?.(true)}
										href={'/settings?tab=notifications'}
										className={'-ml-0.5 text-pink_primary dark:text-blue-dark-helper'}
									>
										set Notifications
									</Link>
								</div>
								to get alerts for the governance events
							</div>
						)}
					</div>
				) : (
					<div className='h-[200px]' />
				)}
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
						onClick={() => closePopover?.(true)}
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
					{unreadNotificationsCount + recentNotificationsCount > 0 && (
						<Link
							href='/notifications'
							className='font-medium text-pink_primary dark:text-blue-dark-helper'
							onClick={() => {
								closePopover?.(true);
								handleViewAll(5000);
							}}
						>
							View All
						</Link>
					)}
				</div>
			)}
		</div>
	);
};
export default styled(NotificationsContent)`
	.shadow-bottom {
		box-shadow: 0px -2px 6px 0px rgba(0, 0, 0, 0.08) !important;
	}
	.dark-shadow-bottom {
		box-shadow: 0px -2px 6px 0px rgba(0, 0, 0, 0.4) !important;
	}
	.pink-icon {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}
	.pink-dark-icon {
		filter: invert(61%) sepia(29%) saturate(4814%) hue-rotate(296deg) brightness(101%) contrast(105%);
	}
`;
