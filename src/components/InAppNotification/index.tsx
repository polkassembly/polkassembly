// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { useEffect } from 'react';
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

const InAppNotification = ({ className }: { className?: string }) => {
	const { resolvedTheme: theme } = useTheme();
	const { id: userId } = useUserDetailsSelector();
	const { lastReadTime, unreadNotificationsCount } = useInAppNotificationsSelector();
	const dispatch = useDispatch();
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;

	const handleModifyData = (notifications: IInAppNotification[]) => {
		if (!lastReadTime) {
			dispatch(
				inAppNotificationsActions.updateInAppNotifications({
					lastReadTime: null,
					recentNotifications: [],
					recentNotificationsCount: 0,
					unreadNotifications: notifications,
					unreadNotificationsCount: notifications?.length
				})
			);
		} else {
			const recent: IInAppNotification[] = [];
			const unread: IInAppNotification[] = [];
			notifications.map((notification) => {
				if (dayjs(notification.createdAt).isAfter(lastReadTime)) {
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
		// setLoading(true);
		const { data, error } = await nextApiClientFetch<IInAppNotification[]>('/api/v1/inAppNotifications/get-notifications', {
			userId: userId
		});
		if (data) {
			handleModifyData(data);
			console.log(data);
		} else if (error) {
			console.log(error);
		}
		// setLoading(false);
	};

	useEffect(() => {
		getNotifications();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	return (
		<Popover
			content={<NotificationsContent />}
			overlayClassName={classNames('h-[600px] w-[480px] mt-1.5 max-sm:w-full', className)}
			trigger={'click'}
			className={className}
			placement={isMobile ? 'bottom' : 'bottomLeft'}
		>
			<Image
				src={!unreadNotificationsCount ? '/assets/icons/notification-bell-default.svg' : '/assets/icons/notification-bell-active.svg'}
				height={28}
				width={28}
				alt='notific...'
				className={classNames(theme === 'dark' && !unreadNotificationsCount ? 'dark-icons' : '', 'cursor-pointer')}
			/>
			{!!unreadNotificationsCount && (
				<div className='absolute -mt-7 ml-3.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-pink_primary text-[8px] text-white'>
					{unreadNotificationsCount}
				</div>
			)}
		</Popover>
	);
};
export default styled(InAppNotification)`
	.ant-popover-inner {
		padding: 0px 0px 12px 0px !important;
	}
`;
