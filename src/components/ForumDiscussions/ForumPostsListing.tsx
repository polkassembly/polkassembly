// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { TopicList } from './types';
import ForumPostCard from './ForumPostCard';

interface ForumPostsListingProps {
	topics: TopicList | null;
}

const ForumPostsListing: React.FC<ForumPostsListingProps> = ({ topics }) => {
	return (
		<>
			<div>
				{/* <Link /> */}
				{topics && <ForumPostCard topics={topics?.topics} />}
			</div>
		</>
	);
};

export default ForumPostsListing;
