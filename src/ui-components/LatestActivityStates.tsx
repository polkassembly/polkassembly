// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { dayjs } from 'dayjs-init';
import React, { FC, ReactNode } from 'react';

import { IPostsRowData } from '~src/components/Home/LatestActivity/PostsTable';

import Address from './Address';
import StatusTag from './StatusTag';
import { ErrorState, LoadingState, PostEmptyState } from './UIStates';

const LatestActivityWrapper = ({ children }: {children: ReactNode}) => (
	<div className="h-[500px] flex items-center justify-center overflow-y-auto">
		{children}
	</div>
);

export const LoadingLatestActivity = () => {
	return (
		<LatestActivityWrapper>
			<LoadingState />
		</LatestActivityWrapper>
	);
};

export const ErrorLatestActivity = ({ errorMessage } : { errorMessage: string}) => {
	return (
		<LatestActivityWrapper>
			<ErrorState errorMessage={errorMessage} />
		</LatestActivityWrapper>
	);
};

export const EmptyLatestActivity = () => {
	return (
		<LatestActivityWrapper>
			<PostEmptyState />
		</LatestActivityWrapper>
	);
};

interface IPopulatedLatestActivityProps {
	columns: ColumnsType<IPostsRowData>;
	tableData: IPostsRowData[];
	onClick: (rowData: IPostsRowData) => any;
}

export const PopulatedLatestActivity: FC<IPopulatedLatestActivityProps> = ({ columns, tableData, onClick }) => {
	return (
		<Table
			columns={columns}
			dataSource={tableData}
			pagination={false}
			scroll={{ x: 1000, y: 650 }}

			onRow={(rowData) => {
				return {
					onClick: () => onClick(rowData)
				};
			}}
		/>
	);
};

interface IPopulatedLatestActivityCardProps {
	tableData: IPostsRowData[];
	onClick: (rowData: IPostsRowData) => any;
}

interface IGov2PopulatedLatestActivityCardProps {
	tableData: IPostsRowData[];
	onClick: (rowData: IPostsRowData) => any;
}

export const PopulatedLatestActivityCard: FC<IPopulatedLatestActivityCardProps> = ({ tableData, onClick }) => {
	return (
		<div>
			{
				tableData.map(rowData => (
					<div key={rowData.key} className="bg-white rounded shadow-md mb-6 p-3 border border-gray-200 cursor-pointer" onClick={() => onClick(rowData)}>
						{/* Meta Data Row */}
						<div className="flex items-center justify-between text-sidebarBlue">
							<span>{rowData.status && <StatusTag status={rowData.status} />}</span>
							<div className="flex items-center">
								{/* {rowData.icon} */}
								<span className='capitalize ml-2 flex items-center'>
									<span className='text-navBlue'><ClockCircleOutlined className='align-middle' /> {rowData.created_at ? dayjs(rowData.created_at).isAfter(dayjs().subtract(1, 'w')) ? dayjs(rowData.created_at).startOf('day').fromNow() : dayjs(rowData.created_at).format('Do MMM \'YY') : null}</span>
								</span>
							</div>
						</div>

						{/* Title */}
						<div className="my-4">
							<h4>
								<div style={{
									height: '3em',
									lineHeight: '1.5em',
									overflow: 'hidden',
									textAlign: 'justify',
									textOverflow: 'ellipsis'
								}}>
									{rowData.title}
								</div>
							</h4>
						</div>

						{/* Created by and on */}
						<div className='flex items-center justify-between'>
							<span>
								{
									!rowData.proposer ? <span className='username text-sidebarBlue'> { rowData.username } </span> :
										<Address
											address={rowData.proposer}
											className='text-sm'
											displayInline={true}
											disableIdenticon={false}
										/>
								}
							</span>
						</div>
					</div>
				))
			}
		</div>
	);
};

export const Gov2PopulatedLatestActivityCard: FC<IGov2PopulatedLatestActivityCardProps> = ({ tableData, onClick }) => {
	return (
		<div>
			{
				tableData.map(rowData => (
					<div key={rowData.key} className="bg-white rounded shadow-md mb-6 p-3 border border-gray-200 cursor-pointer" onClick={() => onClick(rowData)}>
						{/* Meta Data Row */}
						<div className="flex items-center justify-between text-sidebarBlue">
							<div className="flex items-center">
								<span className='capitalize flex items-center'>
									<span className='w-min'>
										{rowData.origin?.toString().split(/(?=[A-Z])/).join(' ')}
									</span>
									<span className="h-[4px] w-[4px] bg-sidebarBlue mx-1 rounded-full inline-block"></span>
									<span>#{rowData.post_id}</span>
								</span>
							</div>
							<span>{rowData.status && <StatusTag status={rowData.status} />}</span>
						</div>

						{/* Title */}
						<div className="my-4">
							<h4>
								<div style={{
									height: '3em',
									lineHeight: '1.5em',
									overflow: 'hidden',
									textAlign: 'justify',
									textOverflow: 'ellipsis'
								}}>
									{rowData.title}
								</div>
							</h4>
							{rowData.sub_title && <div className='text-sm text-sidebarBlue'>{rowData.sub_title}</div>}
						</div>

						{/* Created by and on */}
						<div className='flex items-center justify-between'>
							<span>
								{
									!rowData.proposer ? <span className='username text-sidebarBlue'> { rowData.username } </span> :
										<Address
											address={rowData.proposer}
											className='text-sm'
											displayInline={true}
											disableIdenticon={false}
										/>
								}
							</span>
							<span>{rowData.created_at ? dayjs(rowData.created_at).isAfter(dayjs().subtract(1, 'w')) ? dayjs(rowData.created_at).startOf('day').fromNow() : dayjs(rowData.created_at).format('Do MMM \'YY') : null}</span>
						</div>
					</div>
				))
			}
		</div>
	);
};