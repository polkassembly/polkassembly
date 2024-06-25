// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React from 'react';
import { useInAppNotificationsSelector } from '~src/redux/selectors';
import NotificationsContainer from './NotificationContainer';
import { EInAppNotificationsType } from './types';
import { Pagination } from '~src/ui-components/Pagination';
import { useTheme } from 'next-themes';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { PaginationProps } from 'antd';
import { useRouter } from 'next/router';

const NotificationsLayout = ({ inPage, onPageChange }: { inPage: boolean; onPageChange?: (page: number) => void }) => {
	const router = useRouter();
	const page = Number(router.query.page as string) || 1;
	const { resolvedTheme: theme } = useTheme();
	const { recentNotifications, unreadNotifications, unreadNotificationsCount, totalNotificationsCount, popupNotifications } = useInAppNotificationsSelector();

	const onChange: PaginationProps['onChange'] = (page: number) => {
		onPageChange?.(page);
		router.push({
			pathname: router.pathname,
			query: { ...router.query, page: page }
		});
	};

	return inPage ? (
		<div>
			<NotificationsContainer
				count={totalNotificationsCount}
				data={[...unreadNotifications, ...recentNotifications]}
				inPage={inPage}
				key={EInAppNotificationsType.RECENT}
				className='min-h-[300px]'
			/>
			<div className='mt-4 flex justify-end px-8'>
				{totalNotificationsCount > 10 && (
					<Pagination
						theme={theme as any}
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
			{
				<NotificationsContainer
					count={unreadNotificationsCount || unreadNotifications?.length || 0}
					data={popupNotifications || []}
					inPage={inPage}
					title='Unread'
					key={EInAppNotificationsType.UNREAD}
				/>
			}
		</div>
	);
};
export default NotificationsLayout;
