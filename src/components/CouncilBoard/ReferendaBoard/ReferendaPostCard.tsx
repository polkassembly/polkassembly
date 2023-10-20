// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined, DislikeOutlined, LikeOutlined } from '@ant-design/icons';
import { dayjs } from 'dayjs-init';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { useEffect, useState } from 'react';
import { noTitle } from 'src/global/noTitle';
import Markdown from 'src/ui-components/Markdown';
import StatusTag from 'src/ui-components/StatusTag';

import { ProposalType } from '~src/global/proposalType';
import { useUserDetailsSelector } from '~src/redux/selectors';
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

const ReferendaPostCard = ({ className, createdAt, postStatus, referendumId, title, method }: Props) => {
	const { defaultAddress } = useUserDetailsSelector();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [post, setPost] = useState<IPostResponse>();

	useEffect(() => {
		setLoading(true);
		nextApiClientFetch<IPostResponse>(`api/v1/posts/on-chain-post?proposalType=${ProposalType.REFERENDUMS}&postId=${referendumId}&voterAddress=${defaultAddress}`)
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
		<div className={`${className} rounded-md bg-white dark:bg-section-dark-overlay p-3 drop-shadow-md lg:p-6`}>
			<div className='mb-[9px] text-sm font-medium'>
				{post && post.decision && (
					<>
						{post.decision.toLowerCase() === 'yes' ? (
							<>
								<div className='algin-middle height-[2.5rem] inline-block w-[2.5rem] text-center text-[1.5rem] text-green_primary'>
									<LikeOutlined />
								</div>{' '}
								Aye
							</>
						) : (
							<>
								<div className='algin-middle height-[2.5rem] inline-block w-[2.5rem] text-center text-[1.5rem] text-red_primary'>
									<DislikeOutlined />
								</div>{' '}
								Nay
							</>
						)}
					</>
				)}
			</div>

			<h3 className='text-sidebarBlue'>{title || method || noTitle}</h3>
			{loading && <p>loading...</p>}
			{!loading && !error && post && <Markdown md={`${(post.content as string).split(' ').splice(0, 30).join(' ')}...`} />}

			<div className='flex items-center justify-between'>
				<div className='referenda-post-status'>
					{postStatus && (
						<StatusTag
							className='post_tags'
							status={postStatus}
						/>
					)}
				</div>

				<div>
					<span>
						<ClockCircleOutlined className='mr-1 align-middle text-grey_primary' />
						{relativeCreatedAt}
					</span>
				</div>
			</div>
		</div>
	);
};

export default ReferendaPostCard;
