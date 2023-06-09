// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { sendPostSubscriptionMail } from '~src/auth/email';
import { IUserPreference, User } from '~src/auth/types';
import { getSinglePostLinkFromProposalType, ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';

export default async function sendCommentMailToPostSubs(
	network: string,
	postType: string,
	postId: string,
	content: string,
	commentId: string,
	commentAuthor: User
) {
	const networkRef = firestore_db.collection('networks').doc(network);

	const postSubsQuerySnaphsot = await networkRef
		.collection('user_preferences')
		.where(`post_subscriptions.${postType}`, 'array-contains', String(postId))
		.get();

	if(postSubsQuerySnaphsot.empty) return;

	const commentUrl = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(postType as ProposalType)}/${postId}#${commentId}`;

	for (const doc of postSubsQuerySnaphsot.docs) {
		const user = (await firestore_db.collection('users').doc(doc.id).get()).data() as User;
		if(!user || Number(user.id)  === commentAuthor.id) continue; //skip if comment author

		// user preference check
		const userPreferenceDoc = await firestore_db.collection('networks').doc(network).collection('user_preferences').doc(String(user.id)).get();

		// userPreference won't exist for new user and post_participated is considered true by default
		if(userPreferenceDoc.exists) {
			const userPreference = userPreferenceDoc.data() as IUserPreference;

			if(!userPreference?.notification_preferences?.post_participated) continue;
		}

		sendPostSubscriptionMail(user, commentAuthor, content, String(postId), commentUrl, network);
	}

}