// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { MessageType } from 'antd/es/message/interface';
import { NotificationStatus } from '~src/types';
import queueNotification from '~src/ui-components/QueueNotification';
import nextApiClientFetch from './nextApiClientFetch';
import { ProposalType } from '~src/global/proposalType';

export async function deleteContentByMod(postId: number | string, proposalType: ProposalType, reason: string, commentId?: string, replyId?: string, onSuccess?: () => void) {
	const { data: deleteData, error: deleteError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/deleteContentByMod', {
		commentId,
		postId: Number(postId),
		postType: proposalType,
		reason,
		replyId
	});
	if (deleteError || !deleteData) {
		console.error('Error deleting content: ', deleteError);
		queueNotification({
			header: 'Error!',
			message: deleteError || 'Error in deleting content',
			status: NotificationStatus.ERROR
		});
		return;
	}
	onSuccess?.();
}
