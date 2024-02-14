// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Table from '~src/basic-components/Tables/Table';
import { ColumnsType } from 'antd/lib/table';
import StarIcon from '~assets/icons/StarIcon.svg';
import InfoIcon from '~assets/info.svg';
import ImageIcon from '~src/ui-components/ImageIcon';
import styled from 'styled-components';

interface Props {
	className: string;
	theme?: string;
	searchedUsername?: string;
}

const LeaderboardData = ({ className, searchedUsername, theme }: Props) => {
	const columns: ColumnsType<any> = [
		{
			dataIndex: 'rank',
			fixed: 'left',
			key: 'rank',
			render: (rank) => <p className='m-0 p-0 text-xs text-bodyBlue dark:text-white'>{rank}</p>,
			title: 'Rank',
			width: 15
		},
		{
			dataIndex: 'user',
			filteredValue: [searchedUsername || ''],
			fixed: 'left',
			key: 'user',
			onFilter: (value, record) => {
				return String(record.user).toLocaleLowerCase().includes(String(value).toLowerCase());
			},
			render: (user) => <p className='m-0 p-0 text-xs text-bodyBlue dark:text-white'>{user}</p>,
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
					<p className='m-0 p-0 text-xs text-bodyBlue dark:text-white'>{userSince}</p>
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
			render: () => (
				<div className=''>
					{theme === 'dark' ? (
						<div className='flex items-center justify-start'>
							<ImageIcon
								src='/assets/icons/auctionIcons/delegateDarkIcon.svg'
								alt='delegation-icon'
								className='icon-container mr-4'
							/>
							<ImageIcon
								src='/assets/icons/auctionIcons/monetizationDarkIcon.svg'
								alt='delegation-icon'
								className='icon-container mr-4'
							/>
							<ImageIcon
								src='/assets/icons/auctionIcons/BookmarkDark.svg'
								alt='delegation-icon'
								className='icon-container'
							/>
						</div>
					) : (
						<div className='flex items-center justify-start'>
							<ImageIcon
								src='/assets/icons/auctionIcons/delegateLightIcon.svg'
								alt='delegation-icon'
								className='icon-container mr-4'
							/>
							<ImageIcon
								src='/assets/icons/auctionIcons/monetizationLightIcon.svg'
								alt='delegation-icon'
								className='icon-container mr-4'
							/>
							<ImageIcon
								src='/assets/icons/auctionIcons/BookmarkLight.svg'
								alt='delegation-icon'
								className='icon-container'
							/>
						</div>
					)}
				</div>
			),
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
			user: 'Vaibhav',
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
	return (
		<Table
			columns={columns}
			className={`${className}`}
			dataSource={dataSource}
			pagination={{ pageSize: 10 }}
			theme={theme}
		></Table>
	);
};

export default styled(LeaderboardData)`
	.ant-table-thead > tr > th {
		color: ${(props) => (props.theme === 'dark' ? '#9E9E9E' : '#485f7d')} !important;
		font-size: 14px !important;
		font-style: normal;
		font-weight: 500;
		line-height: 16px;
		letter-spacing: 0.21px;
	}
	.ant-table-tbody > tr {
		heigth: 56px !important;
	}
	.ant-table-wrapper .ant-table-pagination-right {
		justify-content: center !important;
		margin-top: 36px !important;
	}
`;
