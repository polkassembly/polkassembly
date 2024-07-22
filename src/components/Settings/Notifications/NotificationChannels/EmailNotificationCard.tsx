// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Switch } from 'antd';
import DisabledConfirmation from './Modals/Confirmation';
import { CHANNEL } from '.';
import { shortenString } from '~src/util/shortenString';
import { MailFilledIcon } from '~src/ui-components/CustomIcons';
type Props = {
	verifiedEmail: string;
	handleEnableDisabled: any;
	verified: boolean;
	notificationEnabled: boolean;
};

export default function EmailNotificationCard({ verifiedEmail, handleEnableDisabled, verified, notificationEnabled }: Props) {
	const [showModal, setShowModal] = useState<boolean>(false);
	const handleToggleClick = () => {
		setShowModal(true);
	};

	return (
		<div className='mb-2 flex flex-col'>
			<h3 className='m-0 flex items-center gap-2 text-base font-medium text-blue-light-high dark:text-blue-dark-high'>
				<span className='flex '>
					<MailFilledIcon className='mt-1 text-2xl text-lightBlue dark:text-icon-dark-inactive' /> <p className='m-0 ml-1 mr-1 p-0'>Email Notifications</p>
					{!verified && (
						<span className='rounded-bl-lg rounded-tr-lg border-2 border-[#5A46FF] bg-[red] px-[4px] py-[2px] text-[10px] text-[#FFFFFF]'>
							{' '}
							{verifiedEmail ? 'Not Verified' : 'Not Added'}
						</span>
					)}
				</span>
				{!!verifiedEmail && verified && (
					<span className='flex items-center gap-1'>
						<Switch
							checked={!!notificationEnabled}
							size='small'
							onChange={(checked) => (!checked ? handleToggleClick() : handleEnableDisabled(CHANNEL.EMAIL, true))}
						/>
						<label>
							<span className={`text-sm font-medium  ${notificationEnabled ? 'text-pink_primary' : 'text-[#485F7D] dark:text-blue-dark-medium'}`}>
								{notificationEnabled ? 'Enabled' : 'Disabled'}
							</span>
						</label>
					</span>
				)}
			</h3>
			<div className='ml-7'>
				<h3 className='token-desktop-container m-0 text-sm text-blue-light-high dark:text-blue-dark-high'>
					{verifiedEmail ? verifiedEmail : 'Please add your email on account page.'}
				</h3>
				<h3 className='token-mobile-container m-0 text-sm text-blue-light-high dark:text-blue-dark-high'>
					{verifiedEmail ? shortenString(verifiedEmail, 10) : 'Please add your email on account page.'}
				</h3>
			</div>
			<DisabledConfirmation
				open={showModal}
				onConfirm={() => {
					setShowModal(false);
					handleEnableDisabled(CHANNEL.EMAIL);
				}}
				onCancel={() => setShowModal(false)}
				channel={CHANNEL.EMAIL}
			/>
		</div>
	);
}
