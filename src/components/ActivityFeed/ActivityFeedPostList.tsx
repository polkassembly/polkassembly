// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import ActivityFeedPostItem from './ActivityFeedPostItem';

interface IPostListProps {
	postData: any;
}

const ActivityFeedPostList: React.FC<IPostListProps> = ({ postData }) => {
	return (
		<div className='hide-scrollbar space-y-5 lg:max-h-[1078px] lg:overflow-y-auto'>
			{postData.length === 0 ? (
				<p>No posts available</p>
			) : (
				postData.map((post: any, index: number) => (
					<ActivityFeedPostItem
						key={index}
						post={post}
					/>
				))
			)}
		</div>
	);
};

export default ActivityFeedPostList;
