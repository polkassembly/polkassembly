// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import Table from '~src/basic-components/Tables/Table';
import { ColumnsType } from 'antd/lib/table';
import StarIcon from '~assets/icons/StarIcon.svg';
import InfoIcon from '~assets/info.svg';
import ImageIcon from '~src/ui-components/ImageIcon';
import styled from 'styled-components';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useRouter } from 'next/router';
import { LeaderboardResponse } from 'pages/api/v1/leaderboard';
import ImageComponent from '~src/components/ImageComponent';
import dayjs from 'dayjs';
import NameLabel from '~src/ui-components/NameLabel';
import { useTheme } from 'next-themes';
import DelegateModal from '~src/components/Listing/Tracks/DelegateModal';

interface Props {
	className: string;
	searchedUsername?: string;
}

const LeaderboardData = ({ className, searchedUsername }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const [currentPage, setCurrentPage] = useState(1);
	const [address, setAddress] = useState<string>('');
	const [tableData, setTableData] = useState<any>();
	const [totalData, setTotalData] = useState<number>(0);
	const [open, setOpen] = useState<boolean>(false);

	const router = useRouter();

	const getLeaderboardData = async () => {
		const { data, error } = await nextApiClientFetch<LeaderboardResponse>('api/v1/leaderboard', { page: currentPage });
		if (!data || error) {
			console.log(error);
		}
		if (data) {
			let limitedData = data?.data;
			if (currentPage === 1) {
				limitedData = limitedData.slice(3);
				setTotalData(47);
			} else {
				setTotalData(50);
			}
			setTableData(limitedData);
		}
	};
	useEffect(() => {
		router.isReady && getLeaderboardData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, router.isReady]);

	const getUserProfile = async (username: string) => {
		const { data, error } = await nextApiClientFetch<any>(`api/v1/auth/data/userProfileWithUsername?username=${username}`);
		if (!data || error) {
			console.log(error);
		}
		if (data) {
			setAddress(data?.addresses[0]);
		}
	};

	const handleTableChange = (pagination: any) => {
		setCurrentPage(pagination.current);
	};

	function getDaySuffix(day: any) {
		if (day > 3 && day < 21) return 'th';
		switch (day % 10) {
			case 1:
				return 'st';
			case 2:
				return 'nd';
			case 3:
				return 'rd';
			default:
				return 'th';
		}
	}

	function formatTimestamp(seconds: number) {
		const date = dayjs.unix(seconds);
		const day = date.date();
		const month = date.format('MMM');
		const year = date.format('YY');
		return `${day}${getDaySuffix(day)} ${month}' ${year}`;
	}

	const columns: ColumnsType<any> = [
		{
			dataIndex: 'rank',
			fixed: 'left',
			key: 'rank',
			render: (rank) => <p className='m-0 p-0 text-sm text-bodyBlue dark:text-white'>{rank < 10 ? `0${rank}` : rank}</p>,
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
			render: (user, userImage) => (
				<div className='flex items-center gap-x-2'>
					<ImageComponent
						src={userImage || ''}
						alt='User Picture'
						className='flex h-[36px] w-[36px] items-center justify-center '
						iconClassName='flex items-center justify-center text-[#FCE5F2] w-full h-full rounded-full'
					/>
					<NameLabel
						usernameClassName='max-w-[9vw] 2xl:max-w-[12vw] text-sm text-bodyBlue dark:text-white'
						// defaultAddress={proposer}
						username={user}
						usernameMaxLength={15}
						truncateUsername={false}
						isUsedInLeadership={true}
					/>
				</div>
			),
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
			sorter: (a, b) => a.profileScore - b.profileScore,
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
			sorter: (a, b) => {
				const timestampA = dayjs(a.userSince, "DD[th] MMM 'YY").unix();
				const timestampB = dayjs(b.userSince, "DD[th] MMM 'YY").unix();
				return timestampA - timestampB;
			},
			title: 'User Since',
			width: 150
		},
		{
			dataIndex: 'auction',
			fixed: 'left',
			key: 'auction',
			render: (text, record) => (
				<div className='flex cursor-pointer items-center justify-start'>
					<div
						onClick={() => {
							getUserProfile(record.user);
							setOpen(true);
						}}
					>
						<ImageIcon
							src={theme === 'dark' ? '/assets/icons/auctionIcons/delegateDarkIcon.svg' : '/assets/icons/auctionIcons/delegateLightIcon.svg'}
							alt='delegation-icon'
							className='icon-container mr-4 cursor-pointer'
						/>
					</div>
					<div className='cursor-not-allowed'>
						<ImageIcon
							src={theme === 'dark' ? '/assets/icons/auctionIcons/monetizationDarkIcon.svg' : '/assets/icons/auctionIcons/monetizationLightIcon.svg'}
							alt='monetization-icon'
							className='icon-container mr-4 cursor-not-allowed opacity-50'
						/>
					</div>
					<div className='cursor-not-allowed'>
						<ImageIcon
							src={theme === 'dark' ? '/assets/icons/auctionIcons/BookmarkDark.svg' : '/assets/icons/auctionIcons/BookmarkLight.svg'}
							alt='bookmark-icon'
							className='icon-container cursor-not-allowed opacity-50'
						/>
					</div>
				</div>
			),
			title: 'Action',
			width: 150
		}
	];

	const dataSource = tableData?.map((item: any, index: number) => ({
		key: item?.user_id,
		profileScore: item?.profile_score,
		rank: currentPage === 1 ? index + 4 : currentPage * 10 + index + 1 - 10,
		user: item?.username,
		userImage: item?.image,
		userSince: formatTimestamp(item?.created_at._seconds)
	}));

	return (
		<div className={theme}>
			{address && (
				<DelegateModal
					// trackNum={trackDetails?.trackId}
					defaultTarget={address}
					open={open}
					setOpen={setOpen}
				/>
			)}
			<Table
				columns={columns}
				className={`${className} w-full overflow-x-auto`}
				dataSource={dataSource}
				pagination={{ pageSize: 10, total: totalData }}
				onChange={handleTableChange}
				theme={theme}
			></Table>
		</div>
	);
};

export default styled(LeaderboardData)`
	.ant-table-thead > tr > th {
		font-size: 14px !important;
		font-style: normal;
		font-weight: 500;
		line-height: 16px;
		letter-spacing: 0.21px;
		color: ${(props: any) => (props.theme === 'dark' ? '#9E9E9E' : '#485F7D')} !important;
	}
	.ant-pagination .ant-pagination-item a {
		color: ${(props: any) => (props.theme === 'dark' ? '#9E9E9E' : 'var(--bodyBlue)')};
	}
	.ant-pagination .ant-pagination-prev button,
	.ant-pagination .ant-pagination-next button {
		color: ${(props: any) => (props.theme === 'dark' ? '#9E9E9E' : 'var(--bodyBlue)')};
	}
	.ant-pagination .ant-pagination-item {
		border-color: ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#D2D8E0')};
	}
	.ant-pagination .ant-pagination-item-active {
		color: #e5007a !important;
		border-color: #e5007a;
	}
	.ant-pagination .ant-pagination-item-active a {
		color: #e5007a !important;
	}
	.delegation-modal .ant-modal-root .ant-modal-mask {
		z-index: 1 !important;
	}
	.dark .ant-table-thead > tr > th {
		color: #9e9e9e !important;
	}
	.ant-table-tbody > tr {
		heigth: 56px !important;
	}
	.ant-table-wrapper .ant-table-pagination-right {
		justify-content: center !important;
		margin-top: 36px !important;
	}
	.ant-pagination .ant-pagination-options {
		display: none !important;
	}
	.ant-table-wrapper .ant-table-pagination.ant-pagination {
		justify-content: center !important;
	}
	.ant-input {
		background-color: transparent !important;
	}
`;
