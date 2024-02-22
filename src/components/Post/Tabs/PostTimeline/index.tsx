// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { usePostDataContext } from '~src/context';
import { PostEmptyState } from '~src/ui-components/UIStates';

import TimelineContainer from './TimelineContainer';
import { useTheme } from 'next-themes';
import EmptyStateLight from '~assets/emptyStateLightMode.svg';
import EmptyStateDark from '~assets/emptyStateDarkMode.svg';

interface IPostTimelineProps {
	className?: string;
}

const PostTimeline: FC<IPostTimelineProps> = (props) => {
	const { className } = props;
	const { resolvedTheme: theme } = useTheme();
	const {
		postData: { timeline }
	} = usePostDataContext();
	return (
		<div className={`${className} ml-9`}>
			{timeline && Array.isArray(timeline) && timeline.length > 0 ? (
				timeline?.map((obj: any, index) => {
					return (
						<TimelineContainer
							key={index}
							timeline={obj}
						/>
					);
				})
			) : (
				<PostEmptyState
					image={theme === 'dark' ? <EmptyStateDark style={{ transform: 'scale(0.8' }} /> : <EmptyStateLight style={{ transform: 'scale(0.8' }} />}
					imageStyle={{ height: 260 }}
				/>
			)}
		</div>
	);
};

export default PostTimeline;
