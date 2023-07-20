// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined } from '@ant-design/icons';
import { dayjs } from 'dayjs-init';
import Image from 'next/image';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { useEffect, useState } from 'react';
import { noTitle } from 'src/global/noTitle';
import Markdown from 'src/ui-components/Markdown';

import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface Props {
  className?: string;
  id: number;
  title?: string | null;
  username?: string;
  commentsCount?: number | null;
  createdAt?: any;
}

const DiscussionPostCard = ({
	className,
	id,
	title,
	username,
	commentsCount,
	createdAt
}: Props) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [post, setPost] = useState<IPostResponse>();

	const relativeCreatedAt = createdAt
		? dayjs(createdAt).isBefore(dayjs().subtract(1, 'w'))
			? dayjs(createdAt).format('DD-MM-YY')
			: dayjs(createdAt).startOf('day').fromNow()
		: null;

	useEffect(() => {
		setLoading(true);
		nextApiClientFetch<IPostResponse>(`api/v1/posts/discussion?postId=${id}`)
			.then((res) => {
				if (res.data) {
					setPost(res.data);
				} else if (res.error) {
					setError(res.error);
				}
				setLoading(false);
			})
			.catch((err) => {
				setError(err?.message || err);
				setLoading(false);
			});
	}, [id]);

	return (
		<div
			className={`${className} bg-white drop-shadow-md p-3 lg:p-6 rounded-md`}
		>
			<h3 className="text-sidebarBlue">{title || noTitle}</h3>
			{loading && <p>loading...</p>}
			{!loading && !error && post && (
				<Markdown
					md={`${(post.content as string)
						.split(' ')
						.splice(0, 30)
						.join(' ')}...`}
				/>
			)}

			<div>
				<div className="posted-by flex items-center mb-3">
					<span className="title mr-2 text-sidebarBlue">Posted by: </span>
					<span className="inline-block truncate">{username}</span>
				</div>

				<div className="flex items-center">
					<div className="comments flex items-center mr-3">
						<Image
							className="mr-1"
							width="14"
							height="14"
							src="/assets/latest-activity-comment.png"
							alt="Comment"
						/>
						{commentsCount || post?.comments?.length || 0}
					</div>
					<div>
						<ClockCircleOutlined className="align-middle mr-1 text-grey_primary" />
						{relativeCreatedAt}
					</div>
				</div>
			</div>
		</div>
	);
};

export default DiscussionPostCard;
