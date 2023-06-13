// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { allGov1 } from '../Gov1Notification/utils';
import { openGov } from '../OpenGovNotification/utils';

const myProposal = [
	{
		label: 'Comments on my posts',
		triggerName: 'newCommentAdded',
		triggerPreferencesName: 'commentsOnMyPosts',
		value: 'Comments on my posts'
	}
];

const subscribePost = [
	{
		label: 'Comments on my posts',
		triggerName: 'newCommentAdded',
		triggerPreferencesName: 'commentsOnSubscribedPosts',
		value: 'Comments on my posts'
	}
];
export const notificationInitialState = {
	gov1Post: allGov1,
	myProposal,
	openGov: openGov,
	subscribePost
};
