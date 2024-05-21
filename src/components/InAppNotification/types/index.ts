// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export enum ENotificationFilters {
	ALL = 'all',
	PROPOSALS = 'proposals',
	MENTIONS = 'mentions',
	COMMENTS = 'comments'
}

export interface IInAppNotification {
	createdAt: Date;
	id: string;
	message: string;
	title: string;
	url: string;
	userId: number;
	network: string;
	type?: EInAppNotificationsType;
}

export enum EInAppNotificationsType {
	RECENT = 'recent',
	UNREAD = 'unread'
}
