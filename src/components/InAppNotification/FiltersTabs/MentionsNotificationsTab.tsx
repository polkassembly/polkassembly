// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useInAppNotificationsSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ECustomNotificationFilters, EInAppNotificationsType, IInAppNotificationResponse, INotificationsTab } from '../types';
import { inAppNotificationsActions } from '~src/redux/inAppNotifications';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import dayjs from 'dayjs';
import { PaginationProps, Spin } from 'antd';
import { Pagination } from '~src/ui-components/Pagination';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import classNames from 'classnames';
import Image from 'next/image';
import { CHANNEL } from '~src/components/Settings/Notifications/NotificationChannels';
import NotificationsContainer from '../NotificationContainer';
import Link from 'next/link';

const MentionsNotificationsTab = ({ inPage, closePopover, isStopInterval, setStopInterval }: INotificationsTab) => {
	const dispatch = useDispatch();
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();
	const { id: userId, networkPreferences } = useUserDetailsSelector();
	const { popupNotifications, totalNotificationsCount, mentionsNotifications, unreadNotificationsCount, popupActiveFilter } = useInAppNotificationsSelector();
	const [loading, setLoading] = useState(false);
	const [loadingTime, setLoadingTime] = useState(0);
	const [page, setPage] = useState(Number(router.query.page as string) || 1);
	const pageActiveFilter = (router?.query?.filter as ECustomNotificationFilters) || ECustomNotificationFilters.MENTIONS;

	const handleModifyData = (data: IInAppNotificationResponse) => {
		const { lastSeen, notifications, totalNotificationsCount } = data;
		const lastReadTime = dayjs(lastSeen).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

		dispatch(inAppNotificationsActions.updateMentionsNotifications(notifications));
		dispatch(inAppNotificationsActions.updateNotificationLastReadTime(lastReadTime));
		dispatch(inAppNotificationsActions.updateTotalNotificationsCount(totalNotificationsCount || 0));
	};

	const getNotifications = async (pageNum?: number, isLoading?: boolean) => {
		if (typeof userId !== 'number') return;
		setLoading(isLoading || !loadingTime);

		const { data, error } = await nextApiClientFetch<IInAppNotificationResponse>('/api/v1/inAppNotifications/get-notifications', {
			filterBy: ECustomNotificationFilters.MENTIONS,
			page: inPage ? pageNum || page || 1 : 1
		});

		if (data) {
			if (inPage) {
				if (data.filterBy !== pageActiveFilter || pageActiveFilter !== ECustomNotificationFilters.MENTIONS) {
					setLoading(false);
					return;
				}
				handleModifyData(data);
			} else {
				if (data.filterBy !== popupActiveFilter) {
					setLoading(false);
					return;
				}
				dispatch(
					inAppNotificationsActions.updatePopupNotifications({
						all: popupNotifications?.all || [],
						comments: popupNotifications?.comments || [],
						mentions: data?.notifications || [],
						proposals: popupNotifications?.proposals || []
					})
				);
				dispatch(inAppNotificationsActions.updateTotalNotificationsCount(data?.totalNotificationsCount || 0));
			}
		} else if (error) {
			console.log(error);
		}
		setLoadingTime(loadingTime + 1);
		setLoading(false);
		setStopInterval(false);
	};

	const onChange: PaginationProps['onChange'] = (page: number) => {
		router.push({
			pathname: router.pathname,
			query: { ...router.query, page: page }
		});
		setPage(page);
		getNotifications(page, true);
		setLoadingTime(0);
		setStopInterval(true);
	};

	useEffect(() => {
		if (!userId) return;
		let intervalId: any = null;

		const startInterval = () => {
			intervalId = setInterval(getNotifications, 30000); // 30000 ms is 30 secs
		};

		const stopInterval = () => {
			clearInterval(intervalId);
		};

		startInterval();

		if (isStopInterval) {
			stopInterval();
		}

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
	}, [userId, isStopInterval]);

	useEffect(() => {
		getNotifications();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	return (
		<Spin
			spinning={loading && !loadingTime}
			className='h-[500px]'
		>
			{totalNotificationsCount > 0 && (inPage || !!popupNotifications?.mentions?.length) ? (
				inPage ? (
					<div>
						<NotificationsContainer
							count={totalNotificationsCount}
							data={mentionsNotifications || []}
							inPage={inPage}
							key={EInAppNotificationsType.RECENT}
						/>
						<div className='mt-4 flex justify-end px-8'>
							{totalNotificationsCount > 10 && (
								<Pagination
									theme={theme as string}
									defaultCurrent={page}
									pageSize={LISTING_LIMIT}
									total={totalNotificationsCount}
									showSizeChanger={false}
									hideOnSinglePage={true}
									onChange={onChange}
									responsive={true}
								/>
							)}
						</div>
					</div>
				) : (
					<div className={classNames('flex flex-col gap-2 ', inPage ? '' : 'h-[450px] overflow-y-auto')}>
						<NotificationsContainer
							count={unreadNotificationsCount || 0}
							data={popupNotifications?.mentions || []}
							inPage={inPage}
							title='Unread'
							key={EInAppNotificationsType.UNREAD}
						/>
					</div>
				)
			) : !loading && !!loadingTime ? (
				<div className='flex h-[350px] flex-col items-center gap-2 py-8'>
					<Image
						src={theme == 'dark' ? '/assets/icons/notification-empty-state-dark.svg' : '/assets/icons/notification-empty-state.svg'}
						height={150}
						width={150}
						alt='empty...'
					/>
					<span className='text-sm text-lightBlue dark:text-blue-dark-medium'>No Notifications</span>
					{!networkPreferences.channelPreferences?.[CHANNEL.IN_APP]?.enabled && !loading && (
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
		</Spin>
	);
};
export default MentionsNotificationsTab;
