// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { MessageType } from 'antd/es/message/interface';
import { NotificationStatus } from '~src/types';
import queueNotification from '~src/ui-components/QueueNotification';
import nextApiClientFetch from './nextApiClientFetch';
import { ProposalType } from '~src/global/proposalType';

export async function deleteContentByMod(postId:number|string|undefined, proposalType:ProposalType, reason:string, commentId?:string, replyId?:string, onDeleteComment?:()=>void , onDeleteReply?:()=>void)   {
	console.log('function ke andar',postId,proposalType,commentId,replyId,reason);
	const { data: deleteData , error: deleteError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/deleteContentByMod', {
		commentId,
		postId,
		postType: proposalType,
		reason,
		replyId
	});
	console.log('hellloooooo',deleteData);
	if (deleteError || !deleteData) {
		console.error('Error deleting content: ', deleteError);
		queueNotification({
			header: 'Error!',
			message: deleteError || 'Error in deleting content',
			status: NotificationStatus.ERROR
		});
	}
	if(deleteData && commentId && !replyId){
		console.log('comment delete');
		onDeleteComment?.();
	}
	else if(deleteData && replyId && commentId){
		onDeleteReply?.();
	}
}