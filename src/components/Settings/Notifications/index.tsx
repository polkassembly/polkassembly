// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import Parachain from './Parachain';
import Proposals from './Proposals';
import SubscribedPosts from './SubscribedPosts';
import Gov1Notification from './Gov1Notification';
import OpenGovNotification from './OpenGovNotification';
import NotificationChannels from './NotificationChannels';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkContext, useUserDetailsContext } from '~src/context';
import { PublicUser } from '~src/auth/types';

export default function Notifications() {
	const { id } = useUserDetailsContext();
	const { network } = useNetworkContext();
	const [primaryNetwork, setPrimaryNetwork] = useState('');
	const [primaryNetworkNotifications, setPrimaryNetworkNotifications] =
        useState<any>({});
	const [currentNetworkNotifications, setCurrentNetworkNotifications] =
        useState<any>({});

	const handleSetNotification = async (payload: any) => {
		const { data, error } = await nextApiClientFetch(
			'api/v1/auth/actions/setTriggerPreferences',
			payload
		);
		console.log(data, error);
	};

	const getNotificationSettings = async () => {
		try {
			const { data, error } = (await nextApiClientFetch(
				'api/v1/auth/data/notificationSettings'
			)) as {data: any; error: null | string};
			if (error) {
				throw new Error(error);
			}
			if (data?.notification_settings?.triggerPreferences?.[network]) {
				setCurrentNetworkNotifications(
					data?.notification_settings?.triggerPreferences?.[network]
				);
			}
			// const primaryNetworkPreferences = data.notification_settings.triggerPreferences.
			if (
				data?.notification_settings?.triggerPreferences?.[
					primaryNetwork
				]
			) {
				setPrimaryNetworkNotifications(
					data?.notification_settings?.triggerPreferences?.[
						primaryNetwork
					]
				);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const getPrimaryNetwork = async () => {
		try {
			const { data, error } = (await nextApiClientFetch(
				`api/v1/auth/data/user?userId=${id}`
			)) as {data: PublicUser; error: null | string};
			if (error) {
				throw new Error(error);
			}
			if (data.primary_network) {
				setPrimaryNetwork(data.primary_network);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleSetPrimaryNetwork = async (network: string) => {
		try {
			const { data, error } = (await nextApiClientFetch(
				'api/v1/auth/actions/setPrimaryNetwork',
				{ primary_network: network }
			)) as {data: PublicUser; error: null | string};
			if (error) {
				throw new Error(error);
			}
			if (data?.primary_network) {
				setPrimaryNetwork(data?.primary_network);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleSetNetworkPreferences = async (networks: Array<string>) => {
		try {
			console.log(currentNetworkNotifications);
			const { data, error } = (await nextApiClientFetch(
				'api/v1/auth/actions/setNetworkPreferences',
				{ network_preferences: currentNetworkNotifications, networks }
			)) as {data: {message: string}; error: string | null};
			if (error || !data.message) {
				throw new Error(error || '');
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleCopyPrimaryNetworkNotification = async (
		selectedNetwork: any
	) => {
		try {
			const { data, error } = (await nextApiClientFetch(
				'api/v1/auth/actions/setNetworkPreferences',
				{
					network_preferences: primaryNetworkNotifications,
					networks: selectedNetwork
				}
			)) as {data: {message: string}; error: string | null};
			if (error || !data.message) {
				throw new Error(error || '');
			}
		} catch (e) {
			console.log(e);
		}
	};

	const sendAllCategoryRequest = (payload:any, checked:boolean, title:string) => {
		const notification = Object.assign({}, currentNetworkNotifications);
		const promises = payload.map((option: any) => {
			if (!option?.triggerName) {
				return;
			}
			let postTypes =
			notification?.[option.triggerName]?.post_types || [];
			if (checked) {
				if(!postTypes.includes(title))
					postTypes.push(title);
			} else {
				postTypes = postTypes.filter((postType: string) => {
					return postType !== title;
				});
			}
			const payload = {
				network,
				trigger_name: option?.triggerName,
				trigger_preferences: {
					enabled: postTypes.length > 0,
					name: option?.triggerPreferencesName,
					post_types: postTypes
				}
			};
			notification[option.triggerName].post_types = postTypes;
			return handleSetNotification(payload);
		});
		setCurrentNetworkNotifications(notification);
		Promise.all(promises);
	};

	useEffect(() => {
		getPrimaryNetwork().then(() => {
			getNotificationSettings();
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
			<NotificationChannels />
			<Parachain
				primaryNetwork={primaryNetwork}
				onSetPrimaryNetwork={handleSetPrimaryNetwork}
				onSetNetworkPreferences={handleSetNetworkPreferences}
				onCopyPrimaryNetworkNotification={
					handleCopyPrimaryNetworkNotification
				}
			/>
			<Proposals
				userNotification={currentNetworkNotifications}
				onSetNotification={handleSetNotification}
			/>
			<SubscribedPosts
				userNotification={currentNetworkNotifications}
				onSetNotification={handleSetNotification}
			/>
			<Gov1Notification
				userNotification={currentNetworkNotifications}
				onSetNotification={handleSetNotification}
				sendAllCategoryRequest={sendAllCategoryRequest}
				onSetCurrentNetworkNotifications={setCurrentNetworkNotifications}
			/>
			<OpenGovNotification
				userNotification={currentNetworkNotifications}
				onSetNotification={handleSetNotification}
				onSetCurrentNetworkNotifications={setCurrentNetworkNotifications}
			/>
		</div>
	);
}
