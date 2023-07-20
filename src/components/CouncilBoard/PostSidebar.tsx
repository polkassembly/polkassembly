// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import SidebarRight from 'src/components/SidebarRight';

import DiscussionPostClient from './DiscussionsBoard/DiscussionPostClient';
import ReferendumPostClient from './ReferendaBoard/ReferendumPostClient';

interface Props {
	className?: string;
	closeSidebar: () => void;
	sidebarState: any;
	open: boolean;
}

const PostSidebar = ({
	className,
	closeSidebar,
	open,
	sidebarState
}: Props) => {
	return (
		<SidebarRight
			closeSidebar={closeSidebar}
			open={open}
			className={className}
			width="75%"
		>
			<div className="sidebar-content">
				{sidebarState.postType === 'discussion' && (
					<DiscussionPostClient
						councilBoardSidebar={true}
						postID={sidebarState.postID}
					/>
				)}
				{sidebarState.postType === 'referenda' && (
					<ReferendumPostClient
						councilBoardSidebar={true}
						postID={sidebarState.postID}
					/>
				)}
			</div>
		</SidebarRight>
	);
};

export default PostSidebar;
