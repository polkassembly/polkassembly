// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { sendCommentReportMail } from '~src/auth/email';
import { getSinglePostLinkFromProposalType, ProposalType } from '~src/global/proposalType';

export default async function _sendCommentReportMail(network: string, postType: string, postId: string, commentId: string, spam_users_count: number) {
	const commentUrl = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(postType as ProposalType)}/${postId}#${commentId}`;
	sendCommentReportMail(postType, postId, commentId, commentUrl, network, spam_users_count);
}
