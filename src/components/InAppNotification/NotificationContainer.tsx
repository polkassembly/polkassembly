// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Link from 'next/link';
import { EInAppNotificationsType, IInAppNotification } from './types';
import Markdown from '~src/ui-components/Markdown';
import classNames from 'classnames';
import { useTheme } from 'next-themes';
import { Divider } from 'antd';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { ClockCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const NotificationsContainer = ({ title, count, data, inPage, className }: { title?: string; count: number; data: IInAppNotification[]; inPage: boolean; className?: string }) => {
	const { resolvedTheme: theme } = useTheme();

	return (
		<div>
			{!inPage && (
				<div className={classNames('container mt-3 text-sm font-medium text-lightBlue dark:text-blue-dark-medium', inPage ? 'px-11' : 'px-8', className)}>
					{title} ({count})
				</div>
			)}
			<div className='mt-1 flex w-full flex-col'>
				{data?.map((notification, index) => (
					<>
						<Link
							className={classNames(
								'flex flex-col',
								inPage ? 'px-7 pt-5 max-sm:px-3' : 'px-4 pt-3',
								notification.type === EInAppNotificationsType.UNREAD ? 'bg-[#f7f8ff] dark:bg-[#1a1b34]' : ''
							)}
							key={`${notification.id}_${index}`}
							href={notification.url}
							target='_blank'
						>
							<div className='flex items-start gap-1.5'>
								<div>
									{notification.type === EInAppNotificationsType.UNREAD && (
										<div className={classNames('aspect-square h-2 w-2 rounded-full bg-[#3B47DF]', inPage ? 'mt-[5px]' : 'mt-1')} />
									)}
								</div>
								<div
									className={classNames(
										'flex flex-col items-start',
										notification.type === EInAppNotificationsType.RECENT ? 'px-3' : '',
										inPage && notification.type === EInAppNotificationsType.UNREAD ? 'font-semibold' : 'font-medium'
									)}
								>
									<div className={classNames('flex items-center gap-2 text-bodyBlue dark:text-blue-dark-high', inPage ? 'text-sm' : 'text-xs')}>{notification.title}</div>
									<div className='flex w-full flex-wrap'>
										<Markdown
											md={notification.message}
											className={classNames(
												'line-clamp-1 flex w-full flex-wrap text-lightBlue dark:text-blue-dark-medium',
												inPage && notification.type === EInAppNotificationsType.UNREAD ? 'container font-semibold' : 'font-normal',
												inPage ? 'text-sm' : 'text-xs'
											)}
											theme={theme}
											imgHidden
											isAutoComplete
										/>
									</div>
								</div>
							</div>

							<div className={classNames('flex items-center px-4 pb-3 text-lightBlue dark:text-blue-dark-medium', inPage ? 'text-sm' : 'text-xs')}>
								<ClockCircleOutlined className='mr-1' /> <span className='whitespace-nowrap'>{getRelativeCreatedAt(notification.createdAt)}</span>
							</div>
						</Link>

						{index !== data?.length - 1 && <Divider className='m-0 bg-section-light-container dark:bg-separatorDark' />}
					</>
				))}
			</div>
		</div>
	);
};
export default styled(NotificationsContainer)`
	.container p {
		font-weight: 600 !important;
	}
`;
