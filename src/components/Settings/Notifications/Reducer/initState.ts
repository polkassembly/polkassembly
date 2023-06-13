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
	},
	{
		label: 'Own proposal Created',
		triggerName: 'ownProposalCreated',
		triggerPreferencesName: 'ownProposalCreated',
		value: 'Own proposal Created'
	}
];

const subscribePost = [
	{
		label: 'Comments on subscribed posts',
		triggerName: 'newCommentAdded',
		triggerPreferencesName: 'commentsOnSubscribedPosts',
		value: 'Comments on subscribed posts'
	}
];
export const notificationInitialState = {
	gov1Post: allGov1,
	myProposal,
	openGov: openGov,
	subscribePost
};
