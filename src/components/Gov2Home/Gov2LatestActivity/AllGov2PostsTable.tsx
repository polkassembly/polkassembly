// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import { noTitle } from 'src/global/noTitle';
import { EmptyLatestActivity, Gov2PopulatedLatestActivityCard, LoadingLatestActivity, PopulatedLatestActivity } from 'src/ui-components/LatestActivityStates';
import NameLabel from 'src/ui-components/NameLabel';
import StatusTag from 'src/ui-components/StatusTag';
import { ErrorState } from 'src/ui-components/UIStates';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';

import { IPostsRowData } from '~src/components/Home/LatestActivity/PostsTable';
import { getFirestoreProposalType, getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import { WarningMessageIcon } from '~src/ui-components/CustomIcons';

const columns: ColumnsType<IPostsRowData> = [
	{
		title: '#',
		dataIndex: 'post_id',
		key: 'id',
		render: (post_id: any) => <div className='truncate'>{post_id}</div>,
		width: 80,
		fixed: 'left'
	},
	{
		title: 'Title',
		dataIndex: 'title',
		key: 'title',
		width: 340,
		fixed: 'left',
		render: (title) => {
			return (
				<>
					<h4 className='m-0 truncate'>{title}</h4>
				</>
			);
		}
	},
	{
		title: 'Posted By',
		dataIndex: 'username',
		key: 'postedBy',
		onCell: () => {
			return {
				onClick: async (e: any) => {
					e.stopPropagation();
					e.preventDefault();
				}
			};
		},
		render: (username, { proposer }) => (
			<div className='truncate'>
				<NameLabel
					usernameClassName='max-w-[9vw] 2xl:max-w-[12vw] font-semibold'
					defaultAddress={proposer}
					username={username}
				/>
			</div>
		),
		width: 200
	},
	{
		title: 'Created',
		key: 'created',
		dataIndex: 'created_at',
		render: (createdAt) => {
			const relativeCreatedAt = getRelativeCreatedAt(createdAt);
			return <span>{relativeCreatedAt}</span>;
		},
		width: 140
	},
	{
		title: 'Origin',
		dataIndex: 'origin',
		key: 'type',
		render: (postOrigin) => {
			return (
				<span className='flex items-center'>
					<span className='capitalize'>{postOrigin?.split(/(?=[A-Z])/).join(' ')}</span>
				</span>
			);
		},
		width: 160
	},
	{
		title: 'Status',
		dataIndex: 'status',
		key: 'status',
		render: (status: any, obj: any) => {
			if (status || obj.spam_users_count)
				return (
					<div className='flex items-center gap-x-2'>
						{status ? <StatusTag status={status} /> : null}
						{obj.spam_users_count ? (
							<div className='flex items-center justify-center'>
								<Tooltip
									color='#E5007A'
									title='This post could be a spam.'
								>
									<WarningMessageIcon className='text-lg text-[#FFA012]' />
								</Tooltip>
							</div>
						) : null}
					</div>
				);
		},
		width: 160
	}
];

interface IAllGov2PostsTableProps {
	posts?: any[];
	error?: string;
}

const AllGov2PostsTable: FC<IAllGov2PostsTableProps> = ({ posts, error }) => {
	const router = useRouter();

	function gotoPost(rowData: IPostsRowData): void {
		const path = getSinglePostLinkFromProposalType(getFirestoreProposalType(rowData.type) as any);
		if ((event as KeyboardEvent).ctrlKey || (event as KeyboardEvent).metaKey) {
			window?.open(`/${path}/${rowData.post_id}`, '_blank');
		} else {
			router.push(`/${path}/${rowData.post_id}`);
		}
	}

	//error state
	if (error) return <ErrorState errorMessage={error} />;

	if (posts) {
		//empty state
		if (!posts || !posts.length) return <EmptyLatestActivity />;

		const tableData: IPostsRowData[] = [];

		posts.forEach((post: any) => {
			if (post) {
				// truncate title
				let title = post.title || post.method || noTitle;
				title = title.length > 80 ? `${title.substring(0, Math.min(80, title.length))}...` : title.substring(0, Math.min(80, title.length));
				const subTitle = !title && post.method;

				const tableDataObj: IPostsRowData = {
					key: post.post_id,
					post_id: post.post_id,
					title,
					proposer: post.proposer,
					username: post?.username,
					created_at: post.created_at,
					origin: post.origin || post.type || null,
					status: post.status || '-',
					sub_title: subTitle,
					track: Number(post.track_number),
					type: post.type,
					spam_users_count: post.spam_users_count || 0
				};

				tableData.push(tableDataObj);
			}
		});

		return (
			<>
				<div className='hidden p-0 md:block'>
					<PopulatedLatestActivity
						columns={columns}
						tableData={tableData}
						// modify the tableData to add the onClick event
						onClick={(rowData) => gotoPost(rowData)}
					/>
				</div>

				<div className='block h-[520px] overflow-y-auto px-0 md:hidden'>
					<Gov2PopulatedLatestActivityCard
						tableData={tableData}
						onClick={(rowData) => gotoPost(rowData)}
					/>
				</div>
			</>
		);
	}

	// Loading state
	return <LoadingLatestActivity />;
};

export default AllGov2PostsTable;
