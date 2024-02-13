// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Table from '~src/basic-components/Tables/Table';
import { ColumnsType } from 'antd/lib/table';
import StarIcon from '~assets/icons/StarIcon.svg';
import InfoIcon from '~assets/info.svg';
import ImageIcon from '~src/ui-components/ImageIcon';

interface Props {
	className: string;
	theme?: string;
}

const columns: ColumnsType<any> = [
	{
		dataIndex: 'rank',
		fixed: 'left',
		key: 'rank',
		// render: () => <div className='text-blue-light-high dark:text-blue-dark-high'>Rank</div>,
		title: 'Rank',
		width: 15
	},
	{
		dataIndex: 'user',
		fixed: 'left',
		key: 'user',
		// render: () => <div className='text-blue-light-high dark:text-blue-dark-high'>User</div>,
		title: 'User',
		width: 250
	},
	{
		dataIndex: 'profileScore',
		fixed: 'left',
		key: 'profileScore',
		render: (profileScore) => (
			<div
				className='flex h-7 w-[93px] items-center justify-center gap-x-0.5 rounded-md px-2 py-2'
				style={{ background: 'linear-gradient(0deg, #FFD669 0%, #FFD669 100%), #FCC636' }}
			>
				<StarIcon />
				<p className='m-0 p-0 text-sm text-[#534930]'>{profileScore}</p>
				<InfoIcon style={{ transform: 'scale(0.8)' }} />
			</div>
		),
		// sorter: (record1, record2) => {
		// return record1.profileScore > record2.profileScore;
		// },
		title: 'Profile Score',
		width: 150
	},
	{
		dataIndex: 'userSince',
		fixed: 'left',
		key: 'userSince',
		render: (userSince) => (
			<div className='flex items-center justify-start gap-x-1'>
				<ImageIcon
					src='/assets/icons/Calendar.svg'
					alt='calenderIcon'
					className='icon-container'
				/>
				<p className='m-0 p-0 text-xs text-bodyBlue dark:text-separatorDark'>{userSince}</p>
			</div>
		),
		// sorter: (record1, record2) => {
		// return record1.userSince > record2.userSince;
		// },
		title: 'Index',
		width: 150
	},
	{
		dataIndex: 'auction',
		fixed: 'left',
		key: 'auction',
		// render: () => <div className='text-blue-light-high dark:text-blue-dark-high'>Auction</div>,
		title: 'Auction',
		width: 150
	}
];

const dataSource = [
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	},
	{
		action: '10 Downing Street',
		profileScore: '1000',
		rank: 32,
		user: 'Mike',
		userSince: '10'
	}
];

const LeaderboardData = ({ className }: Props) => {
	return (
		<Table
			columns={columns}
			className={`${className}`}
			dataSource={dataSource}
		></Table>
	);
};

export default LeaderboardData;
