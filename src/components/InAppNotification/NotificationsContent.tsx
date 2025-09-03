// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classNames from 'classnames';
import { dmSans } from 'pages/_app';
import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import { useClaimPayoutSelector, useInAppNotificationsSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { inAppNotificationsActions } from '~src/redux/inAppNotifications';
import { ECustomNotificationFilters, EInAppNotificationsType } from './types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { MessageType } from '~src/auth/types';
import { useRouter } from 'next/router';
import NotificationsFilters from './NotificationsFilters';
import AllNotificationsTab from './FiltersTabs/AllNotificationsTab';
import CommentsNotificationsTab from './FiltersTabs/CommentsNotificationsTab';
import MentionsNotificationsTab from './FiltersTabs/MentionsNotificationsTab';
import ProposalsNotificationsTab from './FiltersTabs/ProposalsNotificationsTab';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';
import dynamic from 'next/dynamic';
import Alert from '~src/basic-components/Alert';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import isMultiassetSupportedNetwork from '~src/util/isMultiassetSupportedNetwork';

const ClaimAssetPayoutInfo = dynamic(() => import('~src/ui-components/ClaimAssetPayoutInfo'), {
	loading: () => (
		<div className='mt-4 w-[400px] px-8'>
			<SkeletonButton
				active
				className='w-[400px]'
			/>
		</div>
	),
	ssr: false
});

interface INotificationsContent {
	className?: string;
	inPage?: boolean;
	closePopover?: (pre: boolean) => void;
}

const handleRenderTab = (
	activeFilter: ECustomNotificationFilters,
	inPage: boolean,
	isStopInterval: boolean,
	setStopInterval: (pre: boolean) => void,
	closePopover?: (pre: boolean) => void
) => {
	switch (activeFilter) {
		case ECustomNotificationFilters.ALL:
			return (
				<AllNotificationsTab
					inPage={inPage}
					closePopover={closePopover}
					isStopInterval={isStopInterval}
					setStopInterval={setStopInterval}
				/>
			);
		case ECustomNotificationFilters.COMMENTS:
			return (
				<CommentsNotificationsTab
					inPage={inPage}
					closePopover={closePopover}
					isStopInterval={isStopInterval}
					setStopInterval={setStopInterval}
				/>
			);
		case ECustomNotificationFilters.MENTIONS:
			return (
				<MentionsNotificationsTab
					inPage={inPage}
					closePopover={closePopover}
					isStopInterval={isStopInterval}
					setStopInterval={setStopInterval}
				/>
			);
		case ECustomNotificationFilters.PROPOSALS:
			return (
				<ProposalsNotificationsTab
					inPage={inPage}
					closePopover={closePopover}
					isStopInterval={isStopInterval}
					setStopInterval={setStopInterval}
				/>
			);
	}
};
const NotificationsContent = ({ className, inPage = false, closePopover }: INotificationsContent) => {
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const { payouts } = useClaimPayoutSelector();
	const router = useRouter();
	const page = Number(router.query.page as string) || 1;
	const { resolvedTheme: theme } = useTheme();
	const { id: userId } = useUserDetailsSelector();
	const {
		viewAllClicked = false,
		popupNotifications,
		allNotifications,
		commentsNotifications,
		mentionsNotifications,
		proposalsNotifications,
		totalNotificationsCount,
		unreadNotificationsCount,
		popupActiveFilter
	} = useInAppNotificationsSelector();
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const [isStopInterval, setStopInterval] = useState(false);
	const activeFilter = inPage ? (router.query.filter as ECustomNotificationFilters) || ECustomNotificationFilters.ALL : popupActiveFilter || ECustomNotificationFilters.ALL;
	const [openClaimModal, setOpenClaimModal] = useState(false);

	const handleUpdateLastSeen = async () => {
		const { data, error } = await nextApiClientFetch<MessageType>('/api/v1/inAppNotifications/add-last-seen', {
			userId: userId
		});

		if (error || data) console.log(error || data?.message || '');
	};

	const handleFilterChange = (filter: ECustomNotificationFilters) => {
		if (inPage) {
			router.push({
				pathname: router.pathname,
				query: { ...router.query, filter: filter, page: 1 }
			});
		} else {
			dispatch(inAppNotificationsActions.updateNotificationsPopupActiveFilter(filter));
		}
		setStopInterval(true);
	};

	const handleMarkAsRead = (isViewAllClicked?: boolean) => {
		setStopInterval(true);
		dispatch(inAppNotificationsActions.updateUnreadNotificationsCount(0));
		handleUpdateLastSeen();
		dispatch(
			inAppNotificationsActions.updatePopupNotifications({
				all:
					popupNotifications?.all?.map((notification) => {
						return { ...notification, type: EInAppNotificationsType.RECENT };
					}) || [],
				comments:
					popupNotifications?.comments?.map((notification) => {
						return { ...notification, type: EInAppNotificationsType.RECENT };
					}) || [],
				mentions:
					popupNotifications?.mentions?.map((notification) => {
						return { ...notification, type: EInAppNotificationsType.RECENT };
					}) || [],
				proposals:
					popupNotifications?.proposals?.map((notification) => {
						return { ...notification, type: EInAppNotificationsType.RECENT };
					}) || []
			})
		);
		dispatch(
			inAppNotificationsActions.updateInAppNotifications({
				allNotifications: [
					...(allNotifications || []).map((notification) => {
						return { ...notification, type: EInAppNotificationsType.RECENT };
					})
				],
				commentsNotifications: [
					...(commentsNotifications?.map((notification) => {
						return { ...notification, type: EInAppNotificationsType.RECENT };
					}) || [])
				],
				lastReadTime: JSON.stringify(new Date()),
				mentionsNotifications: [
					...(mentionsNotifications?.map((notification) => {
						return { ...notification, type: EInAppNotificationsType.RECENT };
					}) || [])
				],
				proposalsNotifications: [
					...(proposalsNotifications?.map((notification) => {
						return { ...notification, type: EInAppNotificationsType.RECENT };
					}) || [])
				],
				totalNotificationsCount: totalNotificationsCount,
				unreadNotificationsCount: 0,
				viewAllClicked: isViewAllClicked
			})
		);
		handleUpdateLastSeen();
		setStopInterval(false);
	};

	const handleViewAll = () => {
		if (!unreadNotificationsCount) return;
		handleMarkAsRead(true);
	};

	return (
		<div
			className={classNames(
				className,
				dmSans.className,
				dmSans.variable,
				'flex min-h-[540px] flex-col justify-between',
				inPage ? 'rounded-xl bg-white py-6 dark:bg-section-dark-overlay' : ''
			)}
		>
			<div className='flex flex-col'>
				<div className={classNames('flex items-center justify-between rounded-t-md pb-3 text-bodyBlue dark:text-blue-dark-high', inPage ? 'px-10 pt-3 max-sm:px-5' : 'px-8 pt-5')}>
					<div className={classNames('flex items-center gap-2 font-semibold max-sm:justify-start', inPage ? 'text-2xl tracking-wide' : 'text-xl tracking-[0.025em]')}>
						{inPage && (
							<Image
								src={'/assets/icons/notification-bell-default.svg'}
								height={inPage ? 32 : 28}
								width={inPage ? 32 : 28}
								alt='notific...'
								className={theme === 'dark' ? 'dark-icons' : ''}
							/>
						)}
						Notifications
						{!!unreadNotificationsCount && !viewAllClicked && (
							<span className='flex min-h-[26px] min-w-[26px] items-center justify-center rounded-full bg-[#3B47DF] p-1 text-xs font-medium text-white dark:bg-[#5B67FF]'>
								{unreadNotificationsCount}
							</span>
						)}
					</div>
					<div className='flex gap-4'>
						{!!unreadNotificationsCount && !viewAllClicked && (
							<button
								onClick={() => handleMarkAsRead()}
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

				{/* filters */}
				<div className={inPage ? 'mb-4 px-10 max-sm:px-5' : 'px-8 pb-2'}>
					<NotificationsFilters
						inPage={inPage}
						onChange={(filter: ECustomNotificationFilters) => {
							handleFilterChange(filter);
						}}
					/>
				</div>

				{/*ClaimAssetPayoutInfo  */}

				{isMultiassetSupportedNetwork(network) && (
					<ClaimAssetPayoutInfo
						className={classNames('my-2 rounded-[4px]', inPage ? 'ml-10 w-[500px]' : 'px-8')}
						open={openClaimModal}
						setOpen={setOpenClaimModal}
					>
						<Alert
							type='info'
							showIcon
							message={
								<div className='m-0 flex items-center justify-between p-0 text-xs dark:text-blue-dark-high'>
									<span>You have {payouts?.length || 0} payouts from your proposals </span>
									<CustomButton
										text='Claim'
										onClick={() => {
											setOpenClaimModal(true);
											closePopover?.(true);
										}}
										width={91}
										className='_button mr-1 flex w-[70px] items-center justify-center text-[10px] tracking-wide'
										height={21}
										type='primary'
									/>
								</div>
							}
						/>
					</ClaimAssetPayoutInfo>
				)}

				{/* content */}
				{handleRenderTab(activeFilter, inPage, isStopInterval, setStopInterval, closePopover as any)}
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
					{totalNotificationsCount > 0 && (
						<Link
							href={`/notifications?page=${page}`}
							className='font-medium text-pink_primary dark:text-blue-dark-helper'
							onClick={() => {
								closePopover?.(true);
								handleViewAll();
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
