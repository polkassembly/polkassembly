// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ColumnsType } from 'antd/es/table';

import { ProposalType, getFirestoreProposalType, getProposalTypeTitle, getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import NameLabel from '~src/ui-components/NameLabel';
import StatusTag from '~src/ui-components/StatusTag';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';

import { IPostsRowData } from './PostsTable';
import { WarningMessageIcon } from '~src/ui-components/CustomIcons';
import { noTitle } from '~src/global/noTitle';
import Tooltip from '~src/basic-components/Tooltip';

const Index: any = {
	dataIndex: 'post_id',
	fixed: 'left',
	key: 'index',
	render: (post_id: any, data: any) => (
		<div className='truncate'>{post_id === null ? `${data?.hash.slice(0, 2)}..${data?.hash.slice(data?.hash.length - 2, data?.hash.length)}` : post_id}</div>
	),
	title: '#',
	width: 75
};

const Title = (network: string): any => {
	return {
		dataIndex: 'title',
		fixed: 'left',
		key: 'title',
		render: (title: any, { type, post_id }: { type: any; post_id: any }) => {
			const path = getSinglePostLinkFromProposalType(getFirestoreProposalType(type) as any);

			return (
				<a
					rel='noreffer'
					href={`https://${network}.polkassembly.io/${path}/${post_id}`}
				>
					<div className='truncate'>{title}</div>
				</a>
			);
		},
		title: 'Title',
		width: 420
	};
};

const Description: any = {
	dataIndex: 'description',
	fixed: 'left',
	key: 'description',
	render: (description: any) => <div className='truncate font-medium text-bodyBlue dark:text-blue-dark-high'>{description || noTitle}</div>,
	title: 'Description',
	width: 320
};

const Creator: any = {
	dataIndex: 'username',
	key: 'creator',
	render: (username: any, { proposer }: { proposer: any }) => (
		<div className='truncate'>
			<NameLabel
				usernameMaxLength={15}
				usernameClassName='max-w-[9vw] 2xl:max-w-[12vw]'
				defaultAddress={proposer}
				username={username}
				disableIdenticon
			/>
		</div>
	),
	title: 'Creator'
};
const Proposer: any = {
	dataIndex: 'proposer',
	key: 'creator',
	onCell: () => {
		return {
			onClick: async (e: any) => {
				e.stopPropagation();
				e.preventDefault();
			}
		};
	},
	render: (username: any, { proposer }: { proposer: any }) => (
		<div className='truncate'>
			<NameLabel
				usernameMaxLength={15}
				usernameClassName='max-w-[9vw] 2xl:max-w-[12vw]'
				defaultAddress={proposer}
				username={username}
			/>
		</div>
	),
	title: 'Creator'
};

const Status: any = {
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
	title: 'Status',
	width: 200
};

const CreatedAt: any = {
	dataIndex: 'created_at',
	key: 'created',
	render: (createdAt: any) => {
		const relativeCreatedAt = getRelativeCreatedAt(createdAt);
		return <span>{relativeCreatedAt}</span>;
	},
	title: 'Created'
};

const PIPsType = {
	dataIndex: 'type',
	key: 'Type',
	render: (type: any) => <span className='capitalize'>{getProposalTypeTitle(getFirestoreProposalType(type) as ProposalType)}</span>,
	title: 'Type',
	width: 200
};

const columns = (network: string): ColumnsType<IPostsRowData> => [Index, Title(network), Creator, Status, CreatedAt];

const allColumns = (network: string): ColumnsType<IPostsRowData> => [
	Index,
	{
		dataIndex: 'title',
		fixed: 'left',
		key: 'title',
		render: (title, { type, post_id }) => {
			const path = getSinglePostLinkFromProposalType(getFirestoreProposalType(type) as any);

			return (
				<a
					rel='noreffer'
					href={`https://${network}.polkassembly.io/${path}/${post_id}`}
				>
					<div className='truncate'>{title}</div>
				</a>
			);
		},
		title: 'Title',
		width: 350
	},
	{
		dataIndex: 'username',
		key: 'postedBy',
		onCell: () => {
			return {
				onClick: async (e) => {
					e.stopPropagation();
					e.preventDefault();
				}
			};
		},
		render: (username, { proposer }) => (
			<div className='truncate'>
				<NameLabel
					usernameMaxLength={15}
					usernameClassName='max-w-[9vw] 2xl:max-w-[12vw] '
					defaultAddress={proposer}
					username={username}
					disableIdenticon
				/>
			</div>
		),
		title: 'Posted By'
	},
	CreatedAt,
	{
		dataIndex: 'type',
		key: 'type',
		render: (postCategory) => {
			return (
				<span className='flex items-center'>
					<span className='capitalize '>{postCategory}</span>
				</span>
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
const AdvisoryMotionIndex: any = {
	dataIndex: 'post_id',
	fixed: 'left',
	key: 'index',
	render: (post_id: any, data: any) => (
		<div className='truncate'>{post_id === null ? `${data?.hash.slice(0, 2)}..${data?.hash.slice(data?.hash.length - 2, data?.hash.length)}` : post_id}</div>
	),
	title: '#',
	width: 75
};
const advisoryMotionColumns: ColumnsType<IPostsRowData> = [
	AdvisoryMotionIndex,
	{
		dataIndex: 'title',
		fixed: 'left',
		key: 'title',
		render: (title) => {
			return (
				<>
					<div className='truncate'>{title === noTitle ? 'Advisory Council Motion' : title}</div>
				</>
			);
		},
		title: 'Title',
		width: 350
	},
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
					<div className='truncate'>{title}</div>
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

const PIPsColumns = [Index, Description, Proposer, CreatedAt, PIPsType, Status];

export function getColumns(key: 'all' | ProposalType, network: string): ColumnsType<IPostsRowData> {
	if (key === 'all') {
		return allColumns(network);
	} else if (key === ProposalType.TIPS) {
		return tipColumns;
	} else if ([ProposalType.BOUNTIES, ProposalType.DEMOCRACY_PROPOSALS, ProposalType.REFERENDUMS, ProposalType.COUNCIL_MOTIONS, ProposalType.TREASURY_PROPOSALS].includes(key)) {
		return columns(network);
	} else if ([ProposalType.DISCUSSIONS, ProposalType.GRANTS].includes(key)) {
		return offChainColumns;
	} else if ([ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS, ProposalType.COMMUNITY_PIPS].includes(key)) {
		return PIPsColumns;
	} else if ([ProposalType.ADVISORY_COMMITTEE].includes(key)) {
		return advisoryMotionColumns;
	}
	return [];
}
