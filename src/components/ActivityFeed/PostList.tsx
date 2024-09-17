// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import PostItem from './PostItem';
import { PostListProps } from './utils/types';

const PostList: React.FC<PostListProps> = ({ postData, currentUserdata }) => {
	return (
		<div className='w-[915px] space-y-4'>
			{postData.length === 0 ? (
				<p>No posts available</p>
			) : (
				postData.map((post, index) => (
					<PostItem
						key={index}
						post={post}
						currentUserdata={currentUserdata}
					/>
				))
			)}
		</div>
	);
};

export default PostList;
