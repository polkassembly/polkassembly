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
import { networkTrackInfo } from '~src/global/post_trackInfo';
import Loader from '~src/ui-components/Loader';

export default function Notifications() {
	const { id, networkPreferences, setUserDetailsContextState } =
        useUserDetailsContext();
	const { network } = useNetworkContext();
	const [selectedNetwork, setSelectedNetwork] = useState([{ name: network, selected: true }]);
	const [loading, setLoading] = useState(true);
	const HandleCurrentNetworkNotifications = (obj:any) => {
		setUserDetailsContextState(
			(prev) => ({
				...prev,
				networkPreferences: {
					...prev.networkPreferences,
					triggerPreferences:{
						...prev.networkPreferences.triggerPreferences,
						[network]:obj
					}
				}
			}));
	};

	const handleSetNotification = async (payload: any) => {
		const { data, error } = await nextApiClientFetch(
			'api/v1/auth/actions/setTriggerPreferences',
			payload
		);
		console.log(data, error);
		if(selectedNetwork.length>1)
			handleSetNetworkPreferences(selectedNetwork.map(({ name }) => name));
	};

	const getNotificationSettings = async () => {
		try {
			const { data, error } = (await nextApiClientFetch(
				'api/v1/auth/data/notificationSettings'
			)) as {data: any; error: null | string};
			if (error) {
				throw new Error(error);
			}
			if (data?.notification_settings?.triggerPreferences) {
				setUserDetailsContextState((prev) => ({
					...prev,
					networkPreferences: {
						...prev.networkPreferences,
						triggerPreferences:
                            data?.notification_settings?.triggerPreferences
					}
				}));
			}
			return data?.notification_settings;
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
				setUserDetailsContextState((prev) => ({
					...prev,
					networkPreferences: {
						...prev.networkPreferences,
						primaryNetwork: data.primary_network || ''
					}
				}));
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
				setUserDetailsContextState((prev) => ({
					...prev,
					networkPreferences: {
						...prev.networkPreferences,
						primaryNetwork: data.primary_network || ''
					}
				}));
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleSetNetworkPreferences = async (networks: Array<string>) => {
		try {
			console.log(networkPreferences.triggerPreferences[network]);
			const { data, error } = (await nextApiClientFetch(
				'api/v1/auth/actions/setNetworkPreferences',
				{
					network_preferences:
                        networkPreferences.triggerPreferences[network],
					networks
				}
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
			const primarySettings =
                networkPreferences.triggerPreferences?.[networkPreferences.primaryNetwork];
			const { data, error } = (await nextApiClientFetch(
				'api/v1/auth/actions/setNetworkPreferences',
				{
					network_preferences: primarySettings,
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

	const sendAllCategoryRequest = (
		payload: any,
		checked: boolean,
		title: string
	) => {
		const notification = Object.assign({}, networkPreferences.triggerPreferences[network]);
		const promises = payload.map((option: any) => {
			if (!option?.triggerName) {
				return;
			}

			let postTypes =
			//@ts-ignore
			notification?.[option.triggerName]?.post_types || [];
			if (checked) {
				if (!postTypes.includes(title)) postTypes.push(title);
			} else {
				postTypes = postTypes.filter((postType: string) => {
					// console.log(postType, title);
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
			//@ts-ignore
			notification[option.triggerName] = {
				enabled: postTypes.length > 0,
				name: option?.triggerPreferencesName,
				post_types: postTypes
			};
			return handleSetNotification(payload);
		});
		HandleCurrentNetworkNotifications(notification);
		Promise.all(promises);
	};

	const sendAllCategoryRequestForOpenGov = (
		payload: any,
		checked: boolean,
		title: string
	) => {
		const id = networkTrackInfo[network][title].trackId;
		const notification = Object.assign({}, networkPreferences.triggerPreferences[network]);
		const promises = payload.map((option: any) => {
			if (!option?.triggerName) {
				return;
			}
			let tracks =
			//@ts-ignore
			notification?.[option.triggerName]?.tracks || [];
			if (checked) {
				if (!tracks.includes(id)) tracks.push(id);
			} else {
				tracks = tracks.filter((tracks: number) => {
					return tracks !== id;
				});
			}
			const payload = {
				network,
				trigger_name: option?.triggerName,
				trigger_preferences: {
					enabled: tracks.length > 0,
					name: option?.triggerPreferencesName,
					tracks: tracks
				}
			};
			//@ts-ignore
			notification[option.triggerName] = {
				enabled: tracks.length > 0,
				name: option?.triggerPreferencesName,
				tracks: tracks
			};
			return handleSetNotification(payload);
		});
		HandleCurrentNetworkNotifications(notification);
		Promise.all(promises);
	};

	useEffect(() => {
		getPrimaryNetwork().then(() => {
			getNotificationSettings().then(() => {
				setLoading(false);
			});
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return loading? <Loader/>: (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
			<NotificationChannels />
			<Parachain
				primaryNetwork={networkPreferences.primaryNetwork}
				onSetPrimaryNetwork={handleSetPrimaryNetwork}
				onSetNetworkPreferences={handleSetNetworkPreferences}
				onCopyPrimaryNetworkNotification={
					handleCopyPrimaryNetworkNotification
				}
				selectedNetwork={selectedNetwork}
				setSelectedNetwork={setSelectedNetwork}
			/>
			<Proposals
				userNotification={
					networkPreferences.triggerPreferences[network]
				}
				onSetNotification={handleSetNotification}
			/>
			<SubscribedPosts
				userNotification={
					networkPreferences.triggerPreferences[network]
				}
				onSetNotification={handleSetNotification}
			/>
			<Gov1Notification
				userNotification={
					networkPreferences.triggerPreferences[network]
				}
				onSetNotification={handleSetNotification}
				sendAllCategoryRequest={sendAllCategoryRequest}
				onSetCurrentNetworkNotifications={
					HandleCurrentNetworkNotifications
				}
			/>
			<OpenGovNotification
				userNotification={
					networkPreferences.triggerPreferences[network]
				}
				onSetNotification={handleSetNotification}
				sendAllCategoryRequest={sendAllCategoryRequestForOpenGov}
				onSetCurrentNetworkNotifications={
					HandleCurrentNetworkNotifications
				}
			/>
		</div>
	);
}
