// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useInAppNotificationsSelector } from '~src/redux/selectors';
import NotificationsContainer from './NotificationContainer';
import { EInAppNotificationsType, IInAppNotification } from './types';
import { Pagination } from '~src/ui-components/Pagination';
import { useTheme } from 'next-themes';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { PaginationProps } from 'antd';

const NotificationsLayout = ({ inPage }: { inPage: boolean }) => {
	const { resolvedTheme: theme } = useTheme();
	const { recentNotifications, unreadNotifications, recentNotificationsCount, unreadNotificationsCount } = useInAppNotificationsSelector();
	const [page, setPage] = useState<number>(1);
	const [data, setData] = useState<IInAppNotification[]>([...unreadNotifications, ...recentNotifications].slice(0, LISTING_LIMIT));

	useEffect(() => {
		setData([...unreadNotifications, ...recentNotifications]?.slice((page - 1) * LISTING_LIMIT, page * LISTING_LIMIT));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [unreadNotifications, recentNotifications]);

	const onChange: PaginationProps['onChange'] = (page: number) => {
		setData([...unreadNotifications, ...recentNotifications]?.slice((page - 1) * LISTING_LIMIT, page * LISTING_LIMIT));
		setPage(page);
	};

	return inPage ? (
		<div>
			<NotificationsContainer
				count={recentNotificationsCount + unreadNotificationsCount}
				data={data}
				inPage={inPage}
				key={EInAppNotificationsType.RECENT}
			/>
			<div className='mt-4 flex justify-end px-8'>
				{recentNotificationsCount + unreadNotificationsCount > 10 && (
					<Pagination
						theme={theme as any}
						defaultCurrent={page}
						pageSize={LISTING_LIMIT}
						total={recentNotificationsCount + unreadNotificationsCount}
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
			{!!unreadNotificationsCount && (
				<NotificationsContainer
					count={unreadNotificationsCount}
					data={unreadNotifications}
					inPage={inPage}
					title='Unread'
					key={EInAppNotificationsType.UNREAD}
				/>
			)}

			{!!recentNotificationsCount && (
				<NotificationsContainer
					count={recentNotificationsCount}
					data={inPage ? recentNotifications : recentNotifications.slice(0, !unreadNotificationsCount ? 10 : 2)}
					inPage={inPage}
					title='Recent'
					key={EInAppNotificationsType.RECENT}
				/>
			)}
		</div>
	);
};
export default NotificationsLayout;
