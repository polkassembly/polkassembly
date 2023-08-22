// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import MailFilled from '~assets/icons/email-notification.svg';
import { Switch } from 'antd';
import DisabledConfirmation from './Modals/Confirmation';
import { CHANNEL } from '.';
type Props = {
	verifiedEmail: string;
	handleEnableDisabled: any
	verified:boolean
	notificationEnabled:boolean
};

export default function EmailNotificationCard({ verifiedEmail, handleEnableDisabled, verified, notificationEnabled }: Props) {
	const [showModal, setShowModal] = useState<boolean>(false);
	const handleToggleClick = () => {
		setShowModal(true);
	};

	return (
		<div className='flex flex-col mb-2'>
			<h3 className='flex gap-2 items-center text-base text-blue-light-high dark:text-blue-dark-high font-medium m-0 gap-1'>
				<span>
					<MailFilled /> Email Notifications{' '}
					{!verified && <span className='text-[10px] px-[4px] py-[2px] bg-[red] border-[#5A46FF] border-2 text-[#FFFFFF] rounded-tr-lg rounded-bl-lg'>  {verifiedEmail ? 'Not Verified' : 'Not Added'}</span>}

				</span>
				{(!!verifiedEmail && verified) &&
					<span className='flex gap-1 items-center'>
						<Switch
							checked={!!notificationEnabled}
							size='small'
							onChange={(checked) => !checked ? handleToggleClick() : handleEnableDisabled(CHANNEL.EMAIL, true)}
						/>
						<label>
							<span className={`text-[14px] font-medium  ${notificationEnabled ? 'text-pink_primary' : 'text-[#485F7D]'}`}>{notificationEnabled ? 'Enabled' : 'Disabled'}</span>
						</label>
					</span>
				}
			</h3>
			<div className='ml-5'>
				<h3 className='m-0 text-blue-light-high dark:text-blue-dark-high text-[14px]'>{verifiedEmail ? verifiedEmail: 'Please add your email on account page.'}</h3>
			</div>
			<DisabledConfirmation
				open={showModal}
				onConfirm={() => {
					setShowModal(false);
					handleEnableDisabled(CHANNEL.EMAIL);
				}}
				onCancel={() => setShowModal(false)}
				channel={CHANNEL.EMAIL} />

		</div>
	);
}
