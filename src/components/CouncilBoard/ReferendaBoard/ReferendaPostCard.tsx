// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {
	ClockCircleOutlined,
	DislikeOutlined,
	LikeOutlined
} from '@ant-design/icons';
import { dayjs } from 'dayjs-init';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { useContext, useEffect, useState } from 'react';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import { noTitle } from 'src/global/noTitle';
import Markdown from 'src/ui-components/Markdown';
import StatusTag from 'src/ui-components/StatusTag';

import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface Props {
	className?: string;
	title?: string | null;
	method: string | undefined;
	postStatus: string | undefined;
	createdAt?: any;
	referendumId: number;

	content?: string | null;
	username?: string;
	commentsCount?: number | null;
}

const ReferendaPostCard = ({
	className,
	createdAt,
	postStatus,
	referendumId,
	title,
	method
}: Props) => {
	const { defaultAddress } = useContext(UserDetailsContext);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [post, setPost] = useState<IPostResponse>();

	useEffect(() => {
		setLoading(true);
		nextApiClientFetch<IPostResponse>(
			`api/v1/posts/on-chain-post?proposalType=${ProposalType.REFERENDUMS}&postId=${referendumId}&voterAddress=${defaultAddress}`
		)
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
	}, [referendumId, defaultAddress]);

	const relativeCreatedAt = createdAt
		? dayjs(createdAt).isBefore(dayjs().subtract(1, 'w'))
			? dayjs(createdAt).format('DD-MM-YY')
			: dayjs(createdAt).startOf('day').fromNow()
		: null;

	return (
		<div
			className={`${className} bg-white drop-shadow-md p-3 lg:p-6 rounded-md`}
		>
			<div className="font-medium text-sm mb-[9px]">
				{post && post.decision && (
					<>
						{post.decision.toLowerCase() === 'yes' ? (
							<>
								<div className="inline-block text-center algin-middle w-[2.5rem] height-[2.5rem] text-[1.5rem] text-green_primary">
									<LikeOutlined />
								</div>{' '}
								Aye
							</>
						) : (
							<>
								<div className="inline-block text-center algin-middle w-[2.5rem] height-[2.5rem] text-[1.5rem] text-red_primary">
									<DislikeOutlined />
								</div>{' '}
								Nay
							</>
						)}
					</>
				)}
			</div>

			<h3 className="text-sidebarBlue">{title || method || noTitle}</h3>
			{loading && <p>loading...</p>}
			{!loading && !error && post && (
				<Markdown
					md={`${(post.content as string)
						.split(' ')
						.splice(0, 30)
						.join(' ')}...`}
				/>
			)}

			<div className="flex justify-between items-center">
				<div className="referenda-post-status">
					{postStatus && (
						<StatusTag className="post_tags" status={postStatus} />
					)}
				</div>

				<div>
					<span>
						<ClockCircleOutlined className="align-middle mr-1 text-grey_primary" />
						{relativeCreatedAt}
					</span>
				</div>
			</div>
		</div>
	);
};

export default ReferendaPostCard;
