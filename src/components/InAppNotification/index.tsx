// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { FC, useCallback, useEffect, useState } from 'react';
import Popover from '~src/basic-components/Popover';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useInAppNotificationsSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { inAppNotificationsActions } from '~src/redux/inAppNotifications';
import styled from 'styled-components';
import classNames from 'classnames';
import NotificationsContent from './NotificationsContent';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import { setUserDetailsState } from '~src/redux/userDetails';
import { ACTIONS } from '../Settings/Notifications/Reducer/action';
import { ECustomNotificationFilters } from './types';
import { useApiContext } from '~src/context';
import checkPayoutForUserAddresses from '~src/util/checkPayoutForUserAddresses';
import { claimPayoutActions } from '~src/redux/claimProposalPayout';
import isMultiassetSupportedNetwork from '~src/util/isMultiassetSupportedNetwork';
import { GlobalActions } from '~src/redux/global';
import BN from 'bn.js';
import getCurrentBlock from '~src/util/getCurrentBlock';

interface INotificationProps {
	className?: string;
	setSidedrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

const InAppNotification: FC<INotificationProps> = (props) => {
	const { className, setSidedrawer } = props;

	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const [currentBlock, setCurrentBlock] = useState<BN | null>(null);
	const { id: userId, loginAddress } = currentUser;
	const { unreadNotificationsCount } = useInAppNotificationsSelector();
	const [openLoginPrompt, setOpenLoginPrompt] = useState<boolean>(false);
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const [open, setOpen] = useState(false);

	const fetchCurrentBlock = useCallback(async () => {
		if (!api || !apiReady) return;
		const currentBlock = await getCurrentBlock({ api, apiReady });
		setCurrentBlock(currentBlock || null);
	}, [api, apiReady]);

	useEffect(() => {
		fetchCurrentBlock();
	}, [fetchCurrentBlock]);

	useEffect(() => {
		if (!api || !apiReady || !loginAddress || !currentBlock || !isMultiassetSupportedNetwork(network)) return;
		if (currentBlock) {
			(async () => {
				const payoutsData = await checkPayoutForUserAddresses({ api: api || null, apiReady, currentBlockNumber: currentBlock?.toNumber(), network });
				dispatch(claimPayoutActions.setPayoutDetails({ claimPayoutAvailable: !!payoutsData?.length, payouts: payoutsData }));
			})();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, loginAddress, currentBlock]);

	const getNotificationSettings = async (network: string) => {
		if (!network) {
			return;
		}
		try {
			const { data, error } = (await nextApiClientFetch('api/v1/auth/data/notificationSettings')) as { data: any; error: null | string };
			if (error) {
				throw new Error(error);
			}

			let networkPreferences: any = {};
			if (data?.notification_preferences?.channelPreferences) {
				networkPreferences = {
					...currentUser.networkPreferences,
					channelPreferences: data?.notification_preferences?.channelPreferences
				};
			}
			if (data?.notification_preferences?.triggerPreferences) {
				networkPreferences = {
					...(currentUser?.networkPreferences || {}),
					...(networkPreferences || {}),
					triggerPreferences: data?.notification_preferences?.triggerPreferences || null
				};
				dispatch(
					setUserDetailsState({
						...currentUser,
						networkPreferences: networkPreferences
					})
				);
				dispatch({
					payload: {
						data: data?.notification_preferences?.triggerPreferences?.[network],
						network
					},
					type: ACTIONS.GET_NOTIFICATION_OBJECT
				});
			}
		} catch (e) {
			console.log(e);
		}
	};

	const getUnreadNotificationsCount = async () => {
		if (typeof userId !== 'number') return;

		const { data, error } = await nextApiClientFetch<{ unread: number; lastSeen: Date }>('/api/v1/inAppNotifications/get-unread-notifications-count', {
			userId: userId
		});
		if (data) {
			dispatch(inAppNotificationsActions.updateUnreadNotificationsCount(data?.unread || 0));
		} else if (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (!userId) return;
		let intervalId: any = null;
		const startInterval = () => {
			intervalId = setInterval(getUnreadNotificationsCount, 30000); // 30000 ms is 30 secs
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
		getUnreadNotificationsCount();
		dispatch(inAppNotificationsActions.updateNotificationsPopupActiveFilter(ECustomNotificationFilters.ALL));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	useEffect(() => {
		if (!network || !userId) return;
		getNotificationSettings(network);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, userId]);

	return (
		<div className='mr-1'>
			{userId ? (
				<Popover
					onOpenChange={(open: boolean) => {
						if (isMobile) {
							dispatch(GlobalActions.setIsSidebarCollapsed(true));
							setSidedrawer(false);
						}
						setOpen(open);
					}}
					open={open}
					content={
						<NotificationsContent
							closePopover={(open: boolean) => {
								if (isMobile) {
									dispatch(GlobalActions.setIsSidebarCollapsed(true));
									setSidedrawer(false);
								}
								setOpen(!open);
							}}
						/>
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
							<div className='absolute -mt-7 ml-3.5 flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full bg-pink_primary text-[8px] text-white'>
								<span>{unreadNotificationsCount > 99 ? ' 99' : unreadNotificationsCount}</span>
								{unreadNotificationsCount > 99 && <span className='-mt-0.5 text-[10px]'>+</span>}
							</div>
						)}
					</div>
				</Popover>
			) : (
				<div
					className='rounded-full p-2 hover:bg-[#FEF5FA] hover:dark:bg-[#48092A]'
					onClick={() => {
						if (isMobile) {
							dispatch(GlobalActions.setIsSidebarCollapsed(true));
							setSidedrawer(false);
						}
						setOpenLoginPrompt(!openLoginPrompt);
					}}
				>
					<Image
						src={'/assets/icons/notification-bell-default.svg'}
						height={24}
						width={24}
						alt='notific...'
						className={classNames(theme === 'dark' ? 'dark-icons' : '', 'cursor-pointer', !unreadNotificationsCount ? '-mr-1' : '')}
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
				image='/assets/Gifs/login-endorse.gif'
				title='Join Polkassembly to start using notifications.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
		</div>
	);
};
export default styled(InAppNotification)`
	.ant-popover-inner {
		padding: 0px 0px 12px 0px !important;
	}
`;
