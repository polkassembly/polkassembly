// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// import { Divider, Table } from 'antd';
import { Divider } from 'antd';
import Table from '~src/basic-components/Tables/Table';
import { ColumnsType } from 'antd/lib/table';
import { dayjs } from 'dayjs-init';
import React, { FC, ReactNode } from 'react';

import { IPostsRowData } from '~src/components/Home/LatestActivity/PostsTable';

import Address from './Address';
import StatusTag from './StatusTag';
import { ErrorState, PostEmptyState } from './UIStates';
import { dmSans } from 'pages/_app';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { useTheme } from 'next-themes';
import LoadingState from '~src/basic-components/Loading/LoadingState';

const LatestActivityWrapper = ({ children }: { children: ReactNode }) => <div className='flex h-[500px] items-center justify-center overflow-y-auto'>{children}</div>;

export const LoadingLatestActivity = () => {
	return (
		<LatestActivityWrapper>
			<LoadingState />
		</LatestActivityWrapper>
	);
};

export const ErrorLatestActivity = ({ errorMessage }: { errorMessage: string }) => {
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
	const { resolvedTheme: theme } = useTheme();
	return (
		<Table
			columns={columns}
			dataSource={tableData}
			pagination={false}
			theme={theme}
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
	const { resolvedTheme: theme } = useTheme();

	return (
		<div>
			{tableData.map((rowData, index) => (
				<div
					key={rowData.key}
					className={`${
						(index + 1) % 2 !== 0 ? 'bg-[#FBFBFC] dark:bg-[#161616]' : ''
					} h-auto min-h-[140px] border-2  border-[#DCDFE350] transition-all  duration-200 hover:border-pink_primary hover:shadow-xl dark:border-separatorDark ${dmSans.variable} ${
						dmSans.className
					}`}
					onClick={() => onClick(rowData)}
				>
					{/* Meta Data Row */}
					<div className='m-2.5 flex items-center justify-between text-bodyBlue dark:text-blue-dark-high'>
						<div className='max-xs-hidden'>
							#{rowData.tip_id ? rowData.tip_id : rowData.post_id} {rowData.title.length > 50 ? rowData.title.substring(0, 50) + '...' : rowData.title}
						</div>
					</div>

					{/* Created by and on */}
					<div className='mt-2 flex'>
						<span>
							{!rowData.proposer ? (
								<span className='username mx-2 font-semibold text-bodyBlue dark:text-blue-dark-high'> {rowData.username} </span>
							) : (
								<Address
									address={rowData.proposer}
									className='mx-2 text-sm'
									displayInline
								/>
							)}
						</span>
						<Divider
							type='vertical'
							className='border-l-1 mt-1 border-lightBlue text-xs font-normal dark:border-icon-dark-inactive'
						/>
						<span className='mx-1.5 text-xs font-normal text-lightBlue dark:text-icon-dark-inactive'>
							{rowData.created_at
								? dayjs(rowData.created_at).isAfter(dayjs().subtract(1, 'w'))
									? dayjs(rowData.created_at).startOf('day').fromNow()
									: dayjs(rowData.created_at).format("Do MMM 'YY")
								: null}
						</span>
					</div>
					{rowData.status !== '-' && (
						<div className='mx-2 my-2 flex items-center justify-between'>
							<StatusTag
								theme={theme}
								className='my-1.5'
								status={rowData.status}
							/>
						</div>
					)}
				</div>
			))}
		</div>
	);
};

export const Gov2PopulatedLatestActivityCard: FC<IGov2PopulatedLatestActivityCardProps> = ({ tableData, onClick }) => {
	const { resolvedTheme: theme } = useTheme();

	return (
		<div>
			{tableData.map((rowData, index) => (
				<div
					key={rowData.key}
					className={`${
						(index + 1) % 2 !== 0 ? 'bg-[#FBFBFC] pt-[1.2px] dark:bg-[#161616]' : ''
					} h-auto min-h-[140px] border-2  border-[#DCDFE350] transition-all duration-200 hover:border-pink_primary hover:shadow-xl ${dmSans.variable} ${dmSans.className}`}
					onClick={() => onClick(rowData)}
				>
					{/* Meta Data Row */}
					<div className='m-2.5 flex items-center justify-between text-bodyBlue dark:text-blue-dark-high'>
						<div className='max-xs-hidden'>
							#{rowData.post_id} {rowData.title.length > 50 ? rowData.title.substring(0, 50) + '...' : rowData.title}
							{rowData.sub_title && <div className='text-sm text-bodyBlue dark:text-blue-dark-high'>{rowData.sub_title}</div>}
						</div>
					</div>
					{/* Created by and on */}
					<div className='mt-2 flex'>
						<span>
							{!rowData.proposer ? (
								<span className='username mx-2 font-semibold text-bodyBlue dark:text-blue-dark-high'> {rowData.username} </span>
							) : (
								<Address
									address={rowData.proposer}
									className='mx-2 text-sm'
									displayInline
								/>
							)}
						</span>
						<Divider
							type='vertical'
							className='border-l-1 mt-1 border-lightBlue text-xs font-normal dark:border-icon-dark-inactive'
						/>
						<span className='mx-1.5 text-xs font-normal text-lightBlue dark:text-icon-dark-inactive'>
							{rowData.created_at ? getRelativeCreatedAt(rowData.created_at as any) : null}
						</span>
					</div>
					{rowData.status !== '-' && (
						<div className='mx-2 my-2 flex items-center justify-between'>
							<StatusTag
								theme={theme}
								className='my-1.5'
								status={rowData.status}
							/>
						</div>
					)}
				</div>
			))}
		</div>
	);
};
