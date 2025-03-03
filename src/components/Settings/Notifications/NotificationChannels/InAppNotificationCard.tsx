// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Switch } from 'antd';
import DisabledConfirmation from './Modals/Confirmation';
import { CHANNEL } from '.';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import classNames from 'classnames';

type Props = {
	handleEnableDisabled: any;
	notificationEnabled: boolean;
};

export default function InAppNotificationsCard({ handleEnableDisabled, notificationEnabled }: Props) {
	const [showModal, setShowModal] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const handleToggleClick = () => {
		setShowModal(true);
	};

	return (
		<div className='mb-2 flex flex-col'>
			<h3 className='m-0 flex items-center gap-2 text-base font-medium text-blue-light-high dark:text-blue-dark-high'>
				<span className='flex '>
					<Image
						src={'/assets/icons/notification-bell-default.svg'}
						height={24}
						width={24}
						alt='notific...'
						className={classNames(theme === 'dark' ? 'dark-icons' : '', 'cursor-pointer')}
					/>{' '}
					<p className='m-0 ml-1 mr-1 p-0 text-sm sm:text-base'>In App Notifications</p>
				</span>
				{
					<span className='flex items-center gap-1'>
						<Switch
							checked={!!notificationEnabled}
							size='small'
							onChange={(checked) => (!checked ? handleToggleClick() : handleEnableDisabled(CHANNEL.IN_APP, true))}
						/>
						<label>
							<span className={`text-sm font-medium  ${notificationEnabled ? 'text-pink_primary' : 'text-bodyBlue dark:text-blue-dark-medium'}`}>
								{notificationEnabled ? 'Enabled' : 'Disabled'}
							</span>
						</label>
					</span>
				}
			</h3>
			<h3 className='token-desktop-container m-0 ml-7 text-sm text-blue-light-high dark:text-blue-dark-high'>
				{notificationEnabled ? 'You have already enabled your in app notifications' : 'Get Alerts for the governance events you’re interested in!'}
			</h3>
			<DisabledConfirmation
				open={showModal}
				onConfirm={() => {
					setShowModal(false);
					handleEnableDisabled(CHANNEL.IN_APP);
				}}
				onCancel={() => setShowModal(false)}
				channel={CHANNEL.IN_APP}
			/>
		</div>
	);
}
