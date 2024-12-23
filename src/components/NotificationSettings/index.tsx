// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Form, Switch } from 'antd';
import React, { useEffect, useState } from 'react';
import { NotificationStatus } from 'src/types';
import FilteredError from 'src/ui-components/FilteredError';
import queueNotification from 'src/ui-components/QueueNotification';

import { NotificationSettings, UpdatedDataResponseType } from '~src/auth/types';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const NotificationSettings = () => {
	const currentUser = useUserDetailsSelector();

	const [changed, setChanged] = useState<boolean>(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [postParticipated, setPostParticipated] = useState<boolean>(false);
	const [postCreated, setPostCreated] = useState<boolean>(false);
	const [newProposal, setNewProposal] = useState<boolean>(false);
	const [ownProposal, setOwnProposal] = useState<boolean>(false);
	const { email_verified } = currentUser;
	const [notification, setNotification] = useState<NotificationSettings>();

	useEffect(() => {
		setPostParticipated(notification?.post_participated || false);
		setPostCreated(notification?.post_created || false);
		setNewProposal(notification?.new_proposal || false);
		setOwnProposal(notification?.own_proposal || false);
	}, [notification]);

	useEffect(() => {
		setLoading(true);
		nextApiClientFetch<NotificationSettings>('api/v1/auth/data/notificationPreference')
			.then((res) => {
				if (res.error) {
					setError(res.error);
				} else {
					setNotification(res.data);
				}
				setLoading(false);
			})
			.catch((err) => {
				setLoading(false);
				setError(typeof err === 'string' ? err : err?.message);
			});
	}, []);

	const updatePreference = async () => {
		setLoading(true);

		const { data, error } = await nextApiClientFetch<UpdatedDataResponseType<NotificationSettings>>('api/v1/auth/actions/changeNotificationPreference', {
			new_proposal: newProposal,
			own_proposal: ownProposal,
			post_created: postCreated,
			post_participated: postParticipated
		});

		if (error) {
			setError(error);
			queueNotification({
				header: 'Failed!',
				message: error,
				status: NotificationStatus.ERROR
			});
			console.error('change name error', error);
			setLoading(false);
			return;
		}

		if (data) {
			queueNotification({
				header: 'Success!',
				message: data.message,
				status: NotificationStatus.SUCCESS
			});
			setChanged(false);
			setNotification(data.updated);
		}

		setLoading(false);
	};
	return (
		<Form
			onFinish={() => updatePreference()}
			className='flex w-full flex-col gap-y-8 rounded-md bg-white p-8 shadow-md dark:bg-section-dark-overlay'
		>
			<header>
				<h3 className='text-lg font-medium tracking-wide text-sidebarBlue'>Notification Settings</h3>
				<h5 className='mt-2 text-sm font-normal text-navBlue'>
					Update your notification settings. You will be receiving your notifications on <span className='text-sidebarBlue'>{currentUser?.email}</span>
				</h5>
			</header>
			{error && <FilteredError text={error} />}
			<article className='flex items-center gap-x-2'>
				<label
					className='cursor-pointer text-sm font-normal text-sidebarBlue'
					htmlFor='postParticipated'
				>
					Subscribe to post you participate in
				</label>
				<Switch
					checked={!!email_verified && postParticipated}
					disabled={!email_verified}
					onChange={(checked) => {
						setPostParticipated(checked);
						setChanged(true);
					}}
					size='small'
					id='postParticipated'
				/>
			</article>
			<article className='flex items-center gap-x-2'>
				<label
					className='cursor-pointer text-sm font-normal text-sidebarBlue'
					htmlFor='postCreated'
				>
					Subscribe to post you created
				</label>
				<Switch
					checked={!!email_verified && postCreated}
					disabled={!email_verified}
					onChange={(checked) => {
						setPostCreated(checked);
						setChanged(true);
					}}
					size='small'
					id='postCreated'
				/>
			</article>
			<article className='flex items-center gap-x-2'>
				<label
					className='cursor-pointer text-sm font-normal text-sidebarBlue'
					htmlFor='newProposal'
				>
					Notified for new proposal in council/motion/referendum
				</label>
				<Switch
					checked={!!email_verified && newProposal}
					disabled={!email_verified}
					onChange={(checked) => {
						setNewProposal(checked);
						setChanged(true);
					}}
					size='small'
					id='newProposal'
				/>
			</article>
			<article className='flex items-center gap-x-2'>
				<label
					className='cursor-pointer text-sm font-normal text-sidebarBlue'
					htmlFor='ownProposal'
				>
					Notified for your own proposals
				</label>
				<Switch
					checked={!!email_verified && ownProposal}
					disabled={!email_verified}
					onChange={(checked) => {
						setOwnProposal(checked);
						setChanged(true);
					}}
					size='small'
					id='ownProposal'
				/>
			</article>
			<article>
				<CustomButton
					text='Save'
					loading={loading}
					disabled={!changed}
					htmlType='submit'
					variant='primary'
					className={`rounded-lg border-none px-14 py-3 text-lg font-semibold ${changed ? 'bg-pink_primary' : 'bg-icon_grey'}`}
				/>
			</article>
		</Form>
	);
};

export default NotificationSettings;
