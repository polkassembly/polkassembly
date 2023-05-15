// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DownOutlined, UpOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

import Reply from './Reply';

interface Props{
	className?: string
	repliesArr: any[]
	commentId: string
}

const Replies = ({ className, commentId, repliesArr }: Props) => {
	return (
		<div className={className}>
			{repliesArr.length > 0 && repliesArr.map((reply: any) =>
				<div key={reply.id}>
					<Reply
						reply={reply}
						key={reply.id}
						commentId={commentId}
						userName={reply.username}
					/>
				</div>
			)}
		</div>
	);
};

export default Replies;
