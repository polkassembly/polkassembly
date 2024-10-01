// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Table, Progress } from 'antd';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Popover from '~src/basic-components/Popover';

interface DataType {
	key: React.Key;
	id: number;
	curator: string;
	title: string;
	amount: string;
	claimed: number;
	date: string;
	status: string;
	categories: string[];
	children?: DataType;
}

const columns: TableColumnsType<DataType> = [
	// eslint-disable-next-line sort-keys
	{ title: '#', dataIndex: 'id', key: 'id' },
	// eslint-disable-next-line sort-keys
	{ title: 'Curator', dataIndex: 'curator', key: 'curator' },
	// eslint-disable-next-line sort-keys
	{ title: 'Title', dataIndex: 'title', key: 'title' },
	// eslint-disable-next-line sort-keys
	{ title: 'Amount', dataIndex: 'amount', key: 'amount' },
	// eslint-disable-next-line sort-keys
	{
		title: 'Claimed',
		// eslint-disable-next-line sort-keys
		dataIndex: 'claimed',
		key: 'claimed',
		render: (claimed: number) => (
			<div style={{ alignItems: 'center', display: 'flex' }}>
				<Progress
					type='circle'
					percent={claimed}
					width={25}
					showInfo={false}
					strokeColor='#ffc500'
				/>
				<span style={{ marginLeft: '8px' }}>{claimed}%</span>
			</div>
		)
	}, // eslint-disable-next-line sort-keys
	{
		title: 'Date',
		// eslint-disable-next-line sort-keys
		dataIndex: 'date',
		key: 'date',
		render: (date: string) => (
			<span>
				<ClockCircleOutlined /> {date}
			</span>
		)
	}, // eslint-disable-next-line sort-keys
	{ title: 'Status', dataIndex: 'status', key: 'status' },
	// eslint-disable-next-line sort-keys
	{
		title: 'Categories',
		// eslint-disable-next-line sort-keys
		dataIndex: 'categories',
		key: 'categories',
		render: (categories: string[]) => (
			<div style={{ display: 'flex', gap: '8px' }}>
				{categories.map((category, index) => (
					<span
						key={index}
						className='rounded-full bg-[#FF6C1A] bg-opacity-[24%] px-4 py-2'
					>
						{category}
					</span>
				))}
			</div>
		)
	}
];

const data: DataType[] = [
	{
		key: 1,
		// eslint-disable-next-line sort-keys
		id: 101,
		// eslint-disable-next-line sort-keys
		curator: 'John Doe',
		title: 'Blockchain Development',
		// eslint-disable-next-line sort-keys
		amount: '$5000',
		claimed: 60,
		date: '2024-09-30',
		status: 'In Progress',
		// eslint-disable-next-line sort-keys
		categories: ['Event', 'Lorem'],
		// eslint-disable-next-line sort-keys
		children: [
			{
				key: 1,
				id: 101,
				curator: 'John Doe',
				title: 'Blockchain Development',
				amount: '$5000',
				claimed: 60,
				date: '2024-09-30',
				status: 'In Progress',
				categories: ['Event', 'Lorem']
			}
		]
	},
	{
		key: 2,
		id: 102,
		curator: 'Jane Smith',
		title: 'DeFi Research',
		amount: '$7500',
		claimed: 80,
		date: '2024-10-01',
		status: 'Approved',
		categories: ['Event', 'Lorem']
	}
];

function All() {
	return (
		<div>
			<Table<DataType>
				columns={columns}
				rowClassName={`${(record: DataType) => (record.children ? 'parent-row' : 'no-children')} `}
				expandable={{
					expandIcon: ({ expanded, onExpand, record }) =>
						record.children ? (
							expanded ? (
								<CaretUpOutlined
									className='pr-3 text-[#E5007A]'
									onClick={(e) => onExpand(record, e)}
								/>
							) : (
								<Popover
									content='Expand to view this'
									placement='top'
									arrow={true}
								>
									<CaretDownOutlined
										className='pr-3'
										onClick={(e) => onExpand(record, e)}
									/>
								</Popover>
							)
						) : null,
					rowExpandable: (record) => !!record.children
				}}
				dataSource={data}
				pagination={{ pageSize: 10 }}
			/>
		</div>
	);
}

const StyledTableContainer = styled.div`
	.ant-table-wrapper .ant-table-thead > tr > th {
		border-width: 1px 0px 1px 0px;
		border-style: solid;
		border-color: #d2d8e0;
		padding-left: 35px;
	}

	/* Default padding for all rows without children */
	.ant-table-wrapper .ant-table-tbody > tr.no-children > td:first-child {
		padding-left: 45px;
	}

	/* Padding for parent rows that have children */
	.ant-table-wrapper .ant-table-tbody > tr.parent-row > td:first-child {
		padding-left: 20px;
	}

	/* Padding for expanded child rows */
	.ant-table-wrapper .ant-table-tbody > tr.ant-table-expanded-row > td:first-child {
		padding-left: 25px !important;
	}
`;

export default function StyledAll() {
	return (
		<StyledTableContainer>
			<All />
		</StyledTableContainer>
	);
}
