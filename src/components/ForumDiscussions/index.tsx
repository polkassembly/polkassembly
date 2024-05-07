// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { TopicList } from './types';
import ForumPostsListing from './ForumPostsListing';

interface ForumDiscussionsProps {
	topics: TopicList | null;
}

const ForumPostsContainer: React.FC<ForumDiscussionsProps> = ({ topics }) => {
	return (
		<>
			<div>
				<ForumPostsListing topics={topics} />
			</div>
		</>
	);
};

export default ForumPostsContainer;
