// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import React from 'react';
import Markdown from '~src/ui-components/Markdown';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';

const ForumReply = ({ reply }: any) => {
	const { resolvedTheme: theme } = useTheme();
	const date = new Date(reply.updated_at);
	return (
		<div className='reply-user-container -mt-1 rounded-t-md px-1 py-1 pt-4 dark:bg-[#141416]'>
			<div className='flex items-center gap-[6px] px-4'>
				<span className='text-xs font-semibold text-blue-light-high dark:text-blue-dark-high'>{reply.username}</span>
				{reply.created_at && (
					<>
						<div className='my-auto h-[2px] w-[2px] rounded-full bg-blue-light-medium dark:to-blue-dark-medium'></div>
						<div className='hidden text-[10px] text-blue-light-medium dark:text-blue-dark-medium sm:flex'>{getRelativeCreatedAt(date)}</div>
					</>
				)}
			</div>
			{reply.cooked && (
				<Markdown
					theme={theme}
					className='rounded-b-md bg-[#ebf0f5] px-1 py-1 text-sm dark:bg-[#141416] md:px-4'
					md={reply.cooked}
					disableQuote={true}
				/>
			)}
		</div>
	);
};

export default ForumReply;
