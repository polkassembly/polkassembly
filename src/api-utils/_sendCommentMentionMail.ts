// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { sendCommentMentionMail } from '~src/auth/email';
import { User } from '~src/auth/types';
import { getSinglePostLinkFromProposalType, ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';

export default async function _sendCommentMentionMail(
	network: string,
	postType: string,
	postId: string,
	content: string,
	commentId: string,
	commentAuthor: User,
	mentions: string[]
) {
	if (!mentions.length) return;

	const commentUrl = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(postType as ProposalType)}/${postId}#${commentId}`;

	for (const username of mentions) {
		// fetching individual because 'in' query only supports upto 10 values
		const user = (await firestore_db.collection('users').where('username', '==', username).limit(1).get()).docs?.[0]?.data() as User;
		if(!user || Number(user.id)  === commentAuthor.id) continue; //skip if comment author
		sendCommentMentionMail(user, commentAuthor, content, String(postId), commentUrl, network);
	}

}