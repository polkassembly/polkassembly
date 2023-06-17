// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
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
					<h4
						className='truncate'
					>
						{title}
					</h4>
				</>
			);
		}
	},
	{
		title: 'Posted By',
		dataIndex: 'username',
		key: 'postedBy',
		render: (username, { proposer }) => <NameLabel textClassName='max-w-[9vw] 2xl:max-w-[12vw]' defaultAddress={proposer} username={username} disableIdenticon={false} />,
		width: 180
	},
	{
		title: 'Created',
		key: 'created',
		dataIndex: 'created_at',
		render: (createdAt) => {
			const relativeCreatedAt = getRelativeCreatedAt(createdAt);
			return (
				<span>{relativeCreatedAt}</span>
			);
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
					<span className='capitalize'>{postOrigin?.split(/(?=[A-Z])/).join(' ')}</span></span>
			);
		},
		width: 160
	},
	{
		title: 'Status',
		dataIndex: 'status',
		key: 'status',
		render: (status) => {
			if(status) return <StatusTag status={status} />;
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

	function gotoPost(rowData: IPostsRowData): void{
		let path = 'referenda';
		if (rowData.type === 'FellowshipReferendum') {
			path = 'member-referenda';
		} else if (rowData.type === 'ReferendumV2') {
			path = 'referenda';
		} else if(!rowData.origin) {
			path = 'post';
		}
		if ((event as KeyboardEvent).ctrlKey || (event as KeyboardEvent).metaKey) {
			window?.open(`/${path}/${rowData.post_id}`, '_blank');
		} else {
			router.push(`/${path}/${rowData.post_id}`);
		}
	}

	//error state
	if (error) return <ErrorState errorMessage={error} />;

	if(posts) {
		//empty state
		if(!posts || !posts.length) return <EmptyLatestActivity />;

		const tableData: IPostsRowData[] = [];

		posts.forEach((post: any) => {

			if(post) {
				// truncate title
				let title = post.title || post.method || noTitle;
				title = title.length > 80 ? `${title.substring(0, Math.min(80, title.length))}...`  : title.substring(0, Math.min(80, title.length));
				const subTitle = !title && post.method;

				const tableDataObj: IPostsRowData = {
					key: post.post_id,
					post_id: post.post_id,
					title,
					proposer: post.proposer,
					username: post?.username,
					created_at: post.created_at,
					origin: post.origin || post.type ||null,
					status: post.status || '-',
					sub_title: subTitle,
					track: Number(post.track_number),
					type: post.type
				};

				tableData.push(tableDataObj);
			}
		});

		return (
			<>
				<div className='hidden lg:block'>
					<PopulatedLatestActivity columns={columns} tableData={tableData}
						// modify the tableData to add the onClick event
						onClick={(rowData) => gotoPost(rowData)}
					/>
				</div>

				<div className="block lg:hidden h-[520px] overflow-y-auto">
					<Gov2PopulatedLatestActivityCard tableData={tableData}
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