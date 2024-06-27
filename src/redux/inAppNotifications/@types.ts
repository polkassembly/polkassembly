// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IInAppNotification } from '~src/components/InAppNotification/types';

export interface IInAppNotificationsStore {
	recentNotifications: IInAppNotification[];
	unreadNotifications: IInAppNotification[];
	recentNotificationsCount: number;
	unreadNotificationsCount?: number;
	lastReadTime: string | null;
	viewAllClicked?: boolean;
	totalNotificationsCount: number;
	popupNotifications?: IInAppNotification[];
}
