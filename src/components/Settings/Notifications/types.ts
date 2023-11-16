// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export enum EMentionType {
	COMMENT = 'comment',
	REPLY = 'reply',
	POST = 'post'
}
export interface INotificationObject {
	[index: string]: {
		enabled: boolean;
		name: string;
		post_types?: Array<string> | undefined;
		tracks?: Array<number> | undefined;
		sub_triggers?: Array<string> | undefined;
		mention_types?: Array<string> | EMentionType[];
		pip_types?: Array<string> | undefined;
	};
}

export interface IReducerState {
	gov1Post: {
		[index: string]: {
			label: string;
			triggerName: string;
			triggerPreferencesName: string;
			value: string;
		}[];
	};
	pipNotification: {
		[index: string]: {
			label: string;
			triggerName: string;
			triggerPreferencesName: string;
			value: string;
		}[];
	};
	openGov: {
		[index: string]: {
			label: string;
			triggerName: string;
			triggerPreferencesName: string;
			value: string;
		}[];
	};
	myProposal: {
		label: string;
		triggerName: string;
		triggerPreferencesName: string;
		value: string;
	}[];
	subscribePost: {
		label: string;
		triggerName: string;
		triggerPreferencesName: string;
		value: string;
	}[];
}

export interface ISelectedNetwork {
	[index: string]: Array<{
		name: string;
		selected: boolean;
	}>;
}
