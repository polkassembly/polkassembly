// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Switch } from 'antd';
import DisabledConfirmation from './Modals/Confirmation';
import { CHANNEL } from '.';
import { MailFilledIcon } from '~src/ui-components/CustomIcons';

type Props = {
	handleEnableDisabled: any;
	notificationEnabled: boolean;
};

export default function InAppNotificationsCard({ handleEnableDisabled, notificationEnabled }: Props) {
	const [showModal, setShowModal] = useState<boolean>(false);
	const handleToggleClick = () => {
		setShowModal(true);
	};

	return (
		<div className='mb-2 flex flex-col'>
			<h3 className='m-0 flex items-center gap-2 text-base font-medium text-blue-light-high dark:text-blue-dark-high'>
				<span className='flex '>
					<MailFilledIcon className='mt-1 text-2xl text-lightBlue dark:text-icon-dark-inactive' /> <p className='m-0 ml-1 mr-1 p-0'>In App Notifications</p>
				</span>
				{
					<span className='flex items-center gap-1'>
						<Switch
							checked={!!notificationEnabled}
							size='small'
							onChange={(checked) => (!checked ? handleToggleClick() : handleEnableDisabled(CHANNEL.IN_APP, true))}
						/>
						<label>
							<span className={`text-[14px] font-medium  ${notificationEnabled ? 'text-pink_primary' : 'text-bodyBlue dark:text-blue-dark-medium'}`}>
								{notificationEnabled ? 'Enabled' : 'Disabled'}
							</span>
						</label>
					</span>
				}
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
