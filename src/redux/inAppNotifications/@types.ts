// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECustomNotificationFilters, IInAppNotification } from '~src/components/InAppNotification/types';

export interface IPopupNotifications {
	all: IInAppNotification[];
	comments: IInAppNotification[];
	mentions: IInAppNotification[];
	proposals: IInAppNotification[];
}
export interface IInAppNotificationsStore {
	allNotifications: IInAppNotification[];
	proposalsNotifications: IInAppNotification[];
	mentionsNotifications: IInAppNotification[];
	commentsNotifications: IInAppNotification[];
	unreadNotificationsCount?: number;
	lastReadTime: string | null;
	viewAllClicked?: boolean;
	totalNotificationsCount: number;
	popupNotifications?: IPopupNotifications;
	popupActiveFilter?: ECustomNotificationFilters;
}
