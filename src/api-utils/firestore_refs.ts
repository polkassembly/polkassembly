// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';

export const networkDocRef = (networkName: string) => firestore_db.collection('networks').doc(networkName);
export const postsByTypeRef = (networkName: string, proposalType: ProposalType) => {
	if (proposalType == ProposalType.USER_CREATED_BOUNTIES) {
		return firestore_db.collection('user_created_bounties');
	}
	console.log('ref', networkDocRef(networkName).collection('post_types').doc(String(proposalType)).collection('posts').path);
	return networkDocRef(networkName).collection('post_types').doc(String(proposalType)).collection('posts');
};

export const activityCollRef = (networkName: string) => networkDocRef(networkName).collection('activities');
export const activityDocRef = (networkName: string, activityId: string) => activityCollRef(networkName).doc(activityId);
export const activityReactionCollRef = (networkName: string, activityId: string) => activityDocRef(networkName, activityId).collection('reactions');
export const activityViewsCollRef = (networkName: string, activityId: string) => activityDocRef(networkName, activityId).collection('views');

export const followsCollRef = () => firestore_db.collection('follows');

export const delegatesColRef = (networkName: string) => networkDocRef(networkName).collection('pa_delegates');

export const chatCollRef = () => firestore_db.collection('chats');
export const chatDocRef = (chatId: string) => chatCollRef().doc(chatId);
export const chatMessagesRef = (chatId: string) => chatDocRef(chatId).collection('messages');

export const messageDocRef = (chatId: string, messageId: string) => chatMessagesRef(chatId).doc(messageId);
