// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { sendCommentReplyMail } from '~src/auth/email';
import { User } from '~src/auth/types';
import { getSinglePostLinkFromProposalType, ProposalType } from '~src/global/proposalType';
import { firestore_db } from '~src/services/firebaseInit';
import { postsByTypeRef } from './firestore_refs';

export default async function _sendCommentReplyMail(
	network: string,
	postType: string,
	postId: string,
	content: string,
	commentId: string,
	replyAuthor: User
) {
	const commentRef = postsByTypeRef(network, postType as ProposalType).doc(String(postId)).collection('comments').doc(String(commentId));
	const commentAuthorId = (await commentRef.get()).data()?.user_id;
	const commentAuthor = (await firestore_db.collection('users').doc(String(commentAuthorId)).get()).data() as User;

	// Don't send email if comment author is replying to his own comment
	if(!commentAuthor || Number(commentAuthorId) === Number(replyAuthor.id)) return;

	const commentUrl = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(postType as ProposalType)}/${postId}#${commentId}`;

	sendCommentReplyMail(commentAuthor, replyAuthor, content, String(postId), commentUrl, network);
}