// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ColumnsType } from 'antd/es/table';

import { ProposalType } from '~src/global/proposalType';
import NameLabel from '~src/ui-components/NameLabel';
import StatusTag from '~src/ui-components/StatusTag';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';

import { IPostsRowData } from './PostsTable';
import { WarningMessageIcon } from '~src/ui-components/CustomIcons';
import { Tooltip } from 'antd';

const Index: any = {
	dataIndex: 'post_id',
	fixed: 'left',
	key: 'index',
	render: (post_id: any) => <div className='truncate'>{post_id}</div>,
	title: '#',
	width: 75
};

const Title: any = {
	dataIndex: 'title',
	fixed: 'left',
	key: 'title',
	render: (title: any) => <div className='truncate'>{title}</div>,
	title: 'Title',
	width: 420
};

const Creator: any = {
	dataIndex: 'username',
	key: 'creator',
	render: (username: any, { proposer }: { proposer: any }) => <div className='truncate'><NameLabel textClassName='max-w-[9vw] 2xl:max-w-[12vw]' defaultAddress={proposer} username={username} disableIdenticon={true} /></div>,
	title: 'Creator'
};

const Status: any = {
	dataIndex: 'status',
	key: 'status',
	render: (status: any, obj: any) => {
		if(status || obj.spam_users_count) return <div className='flex items-center gap-x-2'>
			{
				status?
					<StatusTag status={status} />
					: null
			}
			{
				obj.spam_users_count ?
					<div className='flex items-center justify-center'>
						<Tooltip color="#E5007A" title="This post could be a spam.">
							<WarningMessageIcon className='text-lg text-[#FFA012]' />
						</Tooltip>
					</div>
					: null
			}
		</div>;
	},
	title: 'Status',
	width: 200
};

const CreatedAt: any = {
	dataIndex: 'created_at',
	key: 'created',
	render: (createdAt: any) => {
		const relativeCreatedAt = getRelativeCreatedAt(createdAt);
		return (
			<span>{relativeCreatedAt}</span>
		);
	},
	title: 'Created'
};

const columns: ColumnsType<IPostsRowData> = [
	Index,
	Title,
	Creator,
	Status,
	CreatedAt
];

const allColumns: ColumnsType<IPostsRowData> = [
	Index,
	{
		dataIndex: 'title',
		fixed: 'left',
		key: 'title',
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
		},
		title: 'Title',
		width: 350
	},
	{
		dataIndex: 'username',
		key: 'postedBy',
		render: (username, { proposer }) => <div className='truncate'><NameLabel textClassName='max-w-[9vw] 2xl:max-w-[12vw]' defaultAddress={proposer} username={username} disableIdenticon={true} /></div>,
		title: 'Posted By'
	},
	CreatedAt,
	{
		dataIndex: 'type',
		key: 'type',
		render: (postCategory) => {
			return (
				<span className='flex items-center'>
					<span className='capitalize ml-3'>{postCategory}</span></span>
			);
		},
		title: 'Type',
		width: 200

	},
	Status
];

const tipColumns: ColumnsType<IPostsRowData> = [
	{
		dataIndex: 'tip_id',
		fixed: 'left',
		key: 'index',
		title: '#',
		width: 75
	},
	Title,
	Creator,
	Status,
	CreatedAt
];

const offChainColumns: ColumnsType<IPostsRowData> = [
	Index,
	{
		dataIndex: 'title',
		fixed: 'left',
		key: 'title',
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
		},
		title: 'Title',
		width: 500
	},
	{
		dataIndex: 'topic',
		key: 'topic',
		title: 'Topic',
		width: 160
	},
	Creator,
	CreatedAt
];

export function getColumns(key: 'all' | ProposalType): ColumnsType<IPostsRowData> {
	if (key === 'all') {
		return allColumns;
	} else if (key === ProposalType.TIPS) {
		return tipColumns;
	} else if ([ProposalType.BOUNTIES,ProposalType.DEMOCRACY_PROPOSALS, ProposalType.REFERENDUMS, ProposalType.COUNCIL_MOTIONS, ProposalType.TREASURY_PROPOSALS].includes(key)) {
		return columns;
	} else if ([ProposalType.DISCUSSIONS, ProposalType.GRANTS].includes(key)) {
		return offChainColumns;
	}
	return [];
}