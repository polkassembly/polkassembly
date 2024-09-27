// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import PostItem from './PostItem';
import { PostListProps } from './types/types';

const PostList: React.FC<PostListProps> = ({ postData }) => {
	return (
		<div className='space-y-5'>
			{postData.length === 0 ? (
				<p>No posts available</p>
			) : (
				postData.map((post, index) => (
					<PostItem
						key={index}
						post={post}
					/>
				))
			)}
		</div>
	);
};

export default PostList;
