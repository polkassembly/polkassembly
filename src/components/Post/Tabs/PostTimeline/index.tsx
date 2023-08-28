// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { usePostDataContext } from '~src/context';
import { PostEmptyState } from '~src/ui-components/UIStates';

import TimelineContainer from './TimelineContainer';

interface IPostTimelineProps {
	className?: string;
}

const PostTimeline: FC<IPostTimelineProps> = (props) => {
	const { className } = props;
	const { postData: { timeline } } = usePostDataContext();
	return (
		<div className={`${className} ml-9`}>
			{
				timeline && Array.isArray(timeline) && timeline.length > 0 ?timeline?.map((obj: any, index) => {
					return (
						<TimelineContainer
							key={index}
							timeline={obj}
						/>
					);
				})
					: <PostEmptyState />
			}
		</div>
	);
};

export default PostTimeline;