// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Popover from '~src/basic-components/Popover';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { EInAppNotificationsType, IInAppNotification } from './types';
import { useInAppNotificationsSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { inAppNotificationsActions } from '~src/redux/inAppNotifications';
import dayjs from 'dayjs';
import styled from 'styled-components';
import classNames from 'classnames';
import NotificationsContent from './NotificationsContent';
import { Spin } from 'antd';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';

const InAppNotification = ({ className }: { className?: string }) => {
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useDispatch();
	const { id: userId } = useUserDetailsSelector();
	const { unreadNotificationsCount } = useInAppNotificationsSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingTime, setLoadingTime] = useState<number>(0);
	const [openLoginPrompt, setOpenLoginPrompt] = useState<boolean>(false);
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;

	const handleModifyData = (notifications: IInAppNotification[], lastSeen: Date) => {
		if (!lastSeen) {
			dispatch(
				inAppNotificationsActions.updateInAppNotifications({
					lastReadTime: null,
					recentNotifications: [],
					recentNotificationsCount: 0,
					unreadNotifications: notifications.map((notification) => {
						return { ...notification, type: EInAppNotificationsType.UNREAD };
					}),
					unreadNotificationsCount: notifications?.length
				})
			);
		} else {
			const lastReadTime = dayjs(lastSeen).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

			const recent: IInAppNotification[] = [];
			const unread: IInAppNotification[] = [];
			notifications.map((notification) => {
				if (dayjs(notification.createdAt).isAfter(lastSeen)) {
					unread.push({ ...notification, type: EInAppNotificationsType.UNREAD });
				} else {
					recent.push({ ...notification, type: EInAppNotificationsType.RECENT });
				}
			});

			dispatch(
				inAppNotificationsActions.updateInAppNotifications({
					lastReadTime: lastReadTime,
					recentNotifications: recent,
					recentNotificationsCount: recent.length,
					unreadNotifications: unread,
					unreadNotificationsCount: unread?.length
				})
			);
		}
	};

	const getNotifications = async () => {
		if (typeof userId !== 'number') return;
		setLoadingTime(loadingTime + 1);
		setLoading(true);
		const { data, error } = await nextApiClientFetch<{ notifications: IInAppNotification[]; lastSeen: Date }>('/api/v1/inAppNotifications/get-notifications', {
			userId: userId
		});
		if (data) {
			handleModifyData(data.notifications, data?.lastSeen);
		} else if (error) {
			console.log(error);
		}
		setLoading(false);
	};

	useEffect(() => {
		if (!userId) return;
		let intervalId: any = null;
		const startInterval = () => {
			intervalId = setInterval(getNotifications, 30000); // 50000 ms is 50 secs
		};

		const stopInterval = () => {
			clearInterval(intervalId);
		};

		startInterval();

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				startInterval();
			} else {
				stopInterval();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			stopInterval();
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	useEffect(() => {
		console.log('heree');
		getNotifications();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	return (
		<div className='mr-1'>
			{userId ? (
				<Popover
					content={
						<Spin
							spinning={loading && !loadingTime}
							className='h-[200px]'
						>
							<NotificationsContent isLoading={loading && !loadingTime} />
						</Spin>
					}
					overlayClassName={classNames('h-[600px] mt-1.5 max-sm:w-full', className, !userId ? 'w-[400px]' : 'w-[480px]')}
					trigger={'click'}
					className={classNames(className, '')}
					placement={isMobile ? 'bottom' : 'bottomLeft'}
				>
					<div className='rounded-full p-2 hover:bg-[#FEF5FA] hover:dark:bg-[#48092A]'>
						<Image
							src={!unreadNotificationsCount || !userId ? '/assets/icons/notification-bell-default.svg' : '/assets/icons/notification-bell-active.svg'}
							height={24}
							width={24}
							alt='notific...'
							className={classNames(theme === 'dark' && !unreadNotificationsCount ? 'dark-icons' : '', 'cursor-pointer')}
						/>
						{!!unreadNotificationsCount && (
							<div className='absolute -mt-7 ml-3.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-pink_primary text-[8px] text-white'>
								{unreadNotificationsCount}
							</div>
						)}
					</div>
				</Popover>
			) : (
				<div
					className='rounded-full p-2 hover:bg-[#FEF5FA] hover:dark:bg-[#48092A]'
					onClick={() => setOpenLoginPrompt(!openLoginPrompt)}
				>
					<Image
						src={'/assets/icons/notification-bell-default.svg'}
						height={24}
						width={24}
						alt='notific...'
						className={classNames(theme === 'dark' ? 'dark-icons' : '', 'cursor-pointer')}
					/>
					{!!unreadNotificationsCount && !!userId && (
						<div className='absolute -mt-7 ml-3.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-pink_primary text-[8px] text-white'>
							{unreadNotificationsCount}
						</div>
					)}
				</div>
			)}
			<ReferendaLoginPrompts
				modalOpen={openLoginPrompt}
				setModalOpen={setOpenLoginPrompt}
				image='/assets/referenda-endorse.png'
				title='Join Polkassembly to start using notifications.'
				subtitle='Please login to use polkassembly notifications.'
			/>
		</div>
	);
};
export default styled(InAppNotification)`
	.ant-popover-inner {
		padding: 0px 0px 12px 0px !important;
	}
`;
