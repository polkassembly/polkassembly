// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { ColumnsType } from 'antd/lib/table';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import { noTitle } from 'src/global/noTitle';
import { EmptyLatestActivity, ErrorLatestActivity, Gov2PopulatedLatestActivityCard, LoadingLatestActivity, PopulatedLatestActivity } from 'src/ui-components/LatestActivityStates';
import NameLabel from 'src/ui-components/NameLabel';
import StatusTag from 'src/ui-components/StatusTag';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';

import { IPostsRowData } from '~src/components/Home/LatestActivity/PostsTable';

const columns: ColumnsType<IPostsRowData> = [
	{
		title: '#',
		dataIndex: 'post_id',
		key: 'id',
		width: 65,
		fixed: 'left'
	},
	{
		title: 'Title',
		dataIndex: 'title',
		key: 'title',
		width: 400,
		fixed: 'left',
		render: (title) => {
			return (
				<>
					<div
						className='truncate'
					>
						{title}
					</div>
				</>
			);
		}
	},
	{
		title: 'Posted By',
		dataIndex: 'username',
		key: 'postedBy',
		render: (username, { proposer }) => <NameLabel textClassName='text-[#243A57] max-w-[9vw] 2xl:max-w-[12vw]' defaultAddress={proposer} username={username} disableIdenticon={false} />
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
		}
	},
	{
		title: 'Status',
		dataIndex: 'status',
		key: 'status',
		render: (status) => {
			if(status) return <StatusTag status={status} />;
		}
	}
];

interface ITrackPostsTableProps {
	posts: any[];
	error?: string;
}

const TrackPostsTable: FC<ITrackPostsTableProps> = ({ posts, error }) => {
	const router = useRouter();

	function gotoPost(rowData: IPostsRowData){
		let urlPrefix = '/referenda';
		if (rowData.type === 'FellowshipReferendum') {
			urlPrefix = '/member-referenda';
		}
		if(rowData.origin) {
			if ((event as KeyboardEvent).ctrlKey || (event as KeyboardEvent).metaKey) {
				window?.open(`${urlPrefix}/${rowData.post_id}`, '_blank');
			} else {
				router.push(`${urlPrefix}/${rowData.post_id}`);
			}
		}
	}

	//error state
	if (error) return <ErrorLatestActivity errorMessage={error} />;

	if(posts) {
		//empty state
		if(!posts || !posts.length) return <EmptyLatestActivity />;

		const tableData: IPostsRowData[] = [];

		posts.forEach((post:any) => {

			if(post) {
				// truncate title
				let title = post.title || post.method || noTitle;
				title = title.length > 80 ? `${title.substring(0, Math.min(80, title.length))}...`  : title.substring(0, Math.min(80, title.length));
				const subTitle = !title && post.method? post.method : null;

				const tableDataObj:IPostsRowData = {
					key: post.post_Id,
					post_id: post.post_id,
					title,
					sub_title: subTitle,
					proposer: post.proposer,
					username: post?.author?.username,
					created_at: post.created_at,
					origin: post.origin || null,
					status: post.status || null,
					track: Number(post.track_number),
					type: post.type
				};

				tableData.push(tableDataObj);
			}
		});

		return (
			<>
				<div className='hidden lg:block'>
					<PopulatedLatestActivity columns={columns} tableData={tableData} onClick={(rowData) => gotoPost(rowData)} />
				</div>

				<div className="block lg:hidden h-[520px] overflow-y-auto">
					<Gov2PopulatedLatestActivityCard tableData={tableData} onClick={(rowData) => gotoPost(rowData)} />
				</div>
			</>
		);
	}

	// Loading state
	return <LoadingLatestActivity />;
};

export default TrackPostsTable;