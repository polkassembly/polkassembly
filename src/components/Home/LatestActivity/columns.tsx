// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ColumnsType } from 'antd/es/table';

import { ProposalType, getFirestoreProposalType, getProposalTypeTitle } from '~src/global/proposalType';
import NameLabel from '~src/ui-components/NameLabel';
import StatusTag from '~src/ui-components/StatusTag';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';

import { IPostsRowData } from './PostsTable';
import { WarningMessageIcon } from '~src/ui-components/CustomIcons';
import { Tooltip } from 'antd';
import getUsernameByAddress from '~src/util/getUsernameByAddress';
import { noTitle } from '~src/global/noTitle';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

async function goToProfileByAddress(address: string) {
	if (!address) return;
	const username = await getUsernameByAddress(address);
	const substrateAddress = getSubstrateAddress(address);
	if (!username) {
		window.open(`/address/${substrateAddress}`, '_blank');
		return;
	}
	const routePath = `/user/${username}`;
	window.open(routePath, '_blank');
}

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

const Description: any = {
	dataIndex: 'description',
	fixed: 'left',
	key: 'description',
	render: (description: any) => <div className='truncate font-medium text-bodyBlue'>{description || noTitle}</div>,
	title: 'Description',
	width: 320
};

const Creator: any = {
	dataIndex: 'username',
	key: 'creator',
	onCell: (record: any) => {
		return {
			onClick: async (e: any) => {
				e.stopPropagation();
				if (record.username) {
					const routePath = `/user/${record.username}`;
					window.open(routePath, '_blank');
				} else {
					await goToProfileByAddress(record.proposer || '');
				}
			}
		};
	},
	render: (username: any, { proposer }: { proposer: any }) => (
		<div className='truncate'>
			<NameLabel
				textClassName='max-w-[9vw] 2xl:max-w-[12vw]'
				defaultAddress={proposer}
				username={username}
				disableIdenticon={true}
			/>
		</div>
	),
	title: 'Creator'
};
const Proposer: any = {
	dataIndex: 'proposer',
	key: 'creator',
	onCell: (record: any) => {
		return {
			onClick: async (e: any) => {
				e.stopPropagation();
				await goToProfileByAddress(record.proposer || '');
			}
		};
	},
	render: (username: any, { proposer }: { proposer: any }) => (
		<div className='truncate'>
			<NameLabel
				textClassName='max-w-[9vw] 2xl:max-w-[12vw]'
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

const columns: ColumnsType<IPostsRowData> = [Index, Title, Creator, Status, CreatedAt];

const allColumns: ColumnsType<IPostsRowData> = [
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
		width: 350
	},
	{
		dataIndex: 'username',
		key: 'postedBy',
		onCell: (record) => {
			return {
				onClick: async (e) => {
					e.stopPropagation();
					if (record.username) {
						const routePath = `/user/${record.username}`;
						window.open(routePath, '_blank');
					} else {
						await goToProfileByAddress(record.proposer || '');
					}
				}
			};
		},
		render: (username, { proposer }) => (
			<div className='truncate'>
				<NameLabel
					textClassName='max-w-[9vw] 2xl:max-w-[12vw]'
					defaultAddress={proposer}
					username={username}
					disableIdenticon={true}
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

export function getColumns(key: 'all' | ProposalType): ColumnsType<IPostsRowData> {
	if (key === 'all') {
		return allColumns;
	} else if (key === ProposalType.TIPS) {
		return tipColumns;
	} else if ([ProposalType.BOUNTIES, ProposalType.DEMOCRACY_PROPOSALS, ProposalType.REFERENDUMS, ProposalType.COUNCIL_MOTIONS, ProposalType.TREASURY_PROPOSALS].includes(key)) {
		return columns;
	} else if ([ProposalType.DISCUSSIONS, ProposalType.GRANTS].includes(key)) {
		return offChainColumns;
	} else if ([ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS, ProposalType.COMMUNITY_PIPS].includes(key)) {
		return PIPsColumns;
	}
	return [];
}
