// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { notification } from 'antd';
import { NotificationStatus } from 'src/types';

interface Props {
	header: string;
	message?: string;
	durationInSeconds?: number;
	status: NotificationStatus;
}

const queueNotification = ({
	header,
	message,
	durationInSeconds = 4.5,
	status,
}: Props) => {
	const args = {
		message: header,
		description: message,
		duration: durationInSeconds,
	};

	// queues notifcation
	notification[status](args);
};

export default queueNotification;
