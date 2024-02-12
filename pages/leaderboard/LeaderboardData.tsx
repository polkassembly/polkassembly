// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Table from '~src/basic-components/Tables/Table';
import { ColumnsType } from 'antd/lib/table';

interface Props {
	className: string;
	theme?: string;
}

const columns: ColumnsType<any> = [
	{
		dataIndex: 'rank',
		fixed: 'left',
		key: 'rank',
		render: () => <div className='text-blue-light-high dark:text-blue-dark-high'>Rank</div>,
		title: 'Rank',
		width: 15
	},
	{
		dataIndex: 'user',
		fixed: 'left',
		key: 'user',
		render: () => <div className='text-blue-light-high dark:text-blue-dark-high'>User</div>,
		title: 'User',
		width: 250
	},
	{
		dataIndex: 'profileScore',
		fixed: 'left',
		key: 'profileScore',
		render: () => <div className='text-blue-light-high dark:text-blue-dark-high'>Profile Score</div>,
		title: 'Profile Score',
		width: 150
	},
	{
		dataIndex: 'userSince',
		fixed: 'left',
		key: 'userSince',
		render: () => <div className='text-blue-light-high dark:text-blue-dark-high'>User Since</div>,
		title: 'Index',
		width: 150
	},
	{
		dataIndex: 'auction',
		fixed: 'left',
		key: 'auction',
		render: () => <div className='text-blue-light-high dark:text-blue-dark-high'>Auction</div>,
		title: 'Auction',
		width: 150
	}
];
const LeaderboardData = ({ className }: Props) => {
	return (
		<Table
			columns={columns}
			className={`${className}`}
		></Table>
	);
};

export default LeaderboardData;
