// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect, useState } from 'react';
import Table from '~src/basic-components/Tables/Table';
import { ColumnsType } from 'antd/lib/table';
import { InfoCircleOutlined } from '@ant-design/icons';
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
import Tipping from '~src/components/Tipping';
import { IleaderboardData } from './types';
import { useUserDetailsSelector } from '~src/redux/selectors';
// import { MenuProps } from 'antd';
import { dmSans } from 'pages/_app';
import { MenuProps, Spin } from 'antd';
import Image from 'next/image';
// import Link from 'next/link';
import { Dropdown } from '~src/ui-components/Dropdown';
import ScoreTag from '~src/ui-components/ScoreTag';
import { useTranslation } from 'next-i18next';
// import Link from 'next/link';
// import Image from 'next/image';

const LeaderboardData: FC<IleaderboardData> = ({ className, searchedUsername }) => {
	const { resolvedTheme: theme } = useTheme();
	const [currentPage, setCurrentPage] = useState(1);
	const [address, setAddress] = useState<string>('');
	const [tableData, setTableData] = useState<any>([]);
	const [totalData, setTotalData] = useState<number>(0);
	const [open, setOpen] = useState<boolean>(false);
	const [openTipping, setOpenTipping] = useState<boolean>(false);
	const [openAddressChangeModal, setOpenAddressChangeModal] = useState<boolean>(false);
	const [tippingUser, setTippingUser] = useState<string>('');
	const [currentUserData, setCurrentUserData] = useState<any>();
	const { username } = useUserDetailsSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [baseUrl, setBaseUrl] = useState<string>('');
	const [loadingCurrentUser, setLoadingCurrentUser] = useState<boolean>(false);
	const { t } = useTranslation('common');

	const router = useRouter();
	useEffect(() => {
		const fetchData = async () => {
			if (router.isReady) {
				setLoading(true);
				await getLeaderboardData();
				setLoading(false);

				setLoadingCurrentUser(true);
				await getCurrentuserData();
				setLoadingCurrentUser(false);
			}
		};
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, router.isReady, searchedUsername, username]);

	useEffect(() => {
		const url = new URL(window.location.href);
		setBaseUrl(`${url.origin}`);
	}, []);

	const getCurrentuserData = async () => {
		if (username) {
			try {
				const response = await nextApiClientFetch<LeaderboardResponse>('api/v1/leaderboard', { username });
				if (response?.data) {
					setCurrentUserData(response?.data?.data);
				}
			} catch (error) {
				console.error('Failed to fetch current user data:', error);
			}
		}
	};

	const currentUserDataSource = currentUserData?.map((item: any) => ({
		key: item?.user_id,
		profileScore: item?.profile_score,
		rank: item?.rank,
		user: item?.username,
		userImage: item?.image,
		userSince: dayjs(item?.created_at).format("DD[th] MMM 'YY")
	}));

	const items: MenuProps['items'] = [
		{
			key: '1',
			label: (
				<div className=' flex w-[260px] flex-col '>
					<div className={`${dmSans.className} ${dmSans.variable} mt-1 flex items-center gap-1`}>
						<ImageIcon
							src='/assets/icons/astrals-icon.svg'
							alt='astrals icon'
							className=''
						/>
						<span className='text-sm font-semibold text-blue-light-high dark:text-blue-dark-high'>{t('astrals')}</span>
					</div>
					<div className={`${dmSans.className} ${dmSans.variable} mt-3 text-xs font-normal text-blue-light-high dark:text-blue-dark-high`}>
						<div className='mb-2'>
							{t('score_system')}
							<a
								className='ml-[2px] text-pink_primary'
								target='_blank'
								rel='noreferrer'
								href={`${baseUrl}/astral-scoring`}
							>
								{t('learn_more')}

								<Image
									src='/assets/icons/redirect.svg'
									alt='redirection-icon'
									width={13}
									height={13}
									className='-mt-[3px]'
								/>
							</a>
						</div>
						<div className='inline'>
							{t('earn_points')}
							<ImageIcon
								src='/assets/icons/medal.svg'
								alt='medal icon'
								className='ml-1 inline'
							/>
						</div>
						{/* <div className='mb-2 mt-1 rounded-[6px] bg-[#f7f8f9] p-2 text-blue-light-medium dark:text-blue-dark-medium'>
							To view detailed off-chain and on-chain activity{' '}
							<Link
								className='text-xs font-medium text-pink_primary'
								href={`/user/${username}`}
								target='_blank'
							>
								Visit Profile
							</Link>
						</div> */}
					</div>
				</div>
			)
		}
	];

	const getLeaderboardData = async () => {
		const body = { page: currentPage };
		const { data, error } = await nextApiClientFetch<LeaderboardResponse>('api/v1/leaderboard', body);

		if (error) {
			console.error(error);
			return;
		}

		let modifiedData = data?.data || [];

		if (searchedUsername) {
			modifiedData = modifiedData.filter((item) => item?.username.toLowerCase().includes(searchedUsername.toLowerCase()));
		}

		if (!searchedUsername && currentPage === 1) {
			modifiedData = modifiedData.slice(3);
		}

		setTableData(modifiedData);
		setTotalData(searchedUsername ? modifiedData.length : currentPage === 1 ? 47 : 50);
	};

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

	const columns: ColumnsType<any> = [
		{
			dataIndex: 'rank',
			key: 'rank',
			render: (rank) => <p className='m-0 p-0 text-sm text-bodyBlue dark:text-white'>{rank}</p>,
			title: <span className={`${dmSans.className} ${dmSans.variable}`}>{t('rank')}</span>,
			width: 15
		},
		{
			dataIndex: 'user',
			filteredValue: [searchedUsername || ''],
			key: 'user',
			onFilter: (value, record) => {
				return String(record.user).toLowerCase().includes(String(value).toLowerCase());
			},
			render: (user, obj) => (
				<div className='flex items-center gap-x-2'>
					<ImageComponent
						src={obj?.userImage || ''}
						alt='User Picture'
						className='flex h-[36px] w-[36px] items-center justify-center '
						iconClassName='flex items-center justify-center text-[#FCE5F2] w-full h-full rounded-full'
					/>
					{user === username ? (
						<p className='m-0 p-0'>{username}</p>
					) : (
						<NameLabel
							className={`min-w-[120px] max-w-[12vw] text-sm font-semibold text-bodyBlue 2xl:max-w-[16vw] ${user === username ? 'dark:text-bodyBlue' : 'dark:text-white'}`}
							username={user}
							usernameMaxLength={15}
							truncateUsername={false}
							isUsedInLeadership={true}
						/>
					)}
				</div>
			),
			title: <span className={`${dmSans.className} ${dmSans.variable}`}>{t('user')}</span>,
			width: 250
		},
		{
			dataIndex: 'profileScore',
			key: 'profileScore',
			render: (profileScore) => (
				<ScoreTag
					className='h-7 w-[90px] py-2'
					score={profileScore}
					scale={1.1}
					iconWrapperClassName='ml-1.5 mt-[5.5px]'
				/>
			),
			showSorterTooltip: { open: false },
			sorter: (a, b) => a.profileScore - b.profileScore,
			title: (
				<div className='flex items-center gap-1 text-sm font-medium'>
					<span>{t('astrals')}</span>
					<Dropdown
						theme={theme}
						className={'cursor-pointer rounded-md border-none bg-none'}
						overlayClassName='z-[1056]'
						placement='topRight'
						menu={{ items }}
						arrow
					>
						<span className='ml-[2px]'>
							<InfoCircleOutlined style={{ color: '#485F7D' }} />
						</span>
					</Dropdown>
				</div>
			),
			width: 150
		},
		{
			dataIndex: 'userSince',
			key: 'userSince',
			render: (userSince, record) => (
				<div className='flex w-[120px] items-center justify-start gap-x-1'>
					<ImageIcon
						src='/assets/icons/Calendar.svg'
						alt='calenderIcon'
						className='icon-container scale-[0.8]'
					/>
					<p className={`text-bodyBlue ${record.user === username ? 'dark:text-white' : 'dark:text-white'} m-0 p-0 text-xs`}>{userSince}</p>
				</div>
			),
			showSorterTooltip: { open: false },
			sorter: (a, b) => {
				const timestampA = dayjs(a.userSince, "DD[th] MMM 'YY").unix();
				const timestampB = dayjs(b.userSince, "DD[th] MMM 'YY").unix();
				return timestampA - timestampB;
			},
			title: <span className={`${dmSans.className} ${dmSans.variable}`}>{t('user_since')}</span>,
			width: 150
		},
		{
			dataIndex: 'auction',
			key: 'auction',
			render: (text, record) => (
				<article>
					{record.user !== username && (
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
							<div
								onClick={() => {
									getUserProfile(record.user);
									setTippingUser(record.user);
									setOpenTipping(true);
								}}
								className='cursor-pointer'
							>
								<ImageIcon
									src={theme === 'dark' ? '/assets/icons/auctionIcons/monetizationDarkIcon.svg' : '/assets/icons/auctionIcons/monetizationLightIcon.svg'}
									alt='monetization-icon'
									className='icon-container mr-4'
								/>
							</div>
							{/* <div className='cursor-not-allowed'>
						<ImageIcon
							src={theme === 'dark' ? '/assets/icons/auctionIcons/BookmarkDark.svg' : '/assets/icons/auctionIcons/BookmarkLight.svg'}
							alt='bookmark-icon'
							className='icon-container cursor-not-allowed opacity-50'
						/>
					</div> */}
						</div>
					)}
				</article>
			),
			title: <span className={`${dmSans.className} ${dmSans.variable}`}>{t('actions')}</span>,
			width: 150
		}
	];

	const dataSource = tableData?.map((item: any) => ({
		key: item?.user_id,
		profileScore: item?.profile_score,
		rank: item?.rank,
		user: item?.username,
		userImage: item?.image,
		userSince: dayjs(item?.created_at).format("DD[th] MMM 'YY")
	}));

	console.log(dataSource, currentUserDataSource);

	const combinedDataSource = [...(dataSource || []), ...(currentUserDataSource || [])];
	console.log('combined: ', combinedDataSource);

	return (
		<Spin spinning={loading || loadingCurrentUser}>
			<div className={theme}>
				{address && (
					<DelegateModal
						// trackNum={trackDetails?.trackId}
						defaultTarget={address}
						open={open}
						setOpen={setOpen}
					/>
				)}
				{address && (
					<Tipping
						username={tippingUser || ''}
						open={openTipping}
						setOpen={setOpenTipping}
						key={address}
						paUsername={tippingUser as any}
						setOpenAddressChangeModal={setOpenAddressChangeModal}
						openAddressChangeModal={openAddressChangeModal}
					/>
				)}
				<Table
					columns={columns}
					className={`${className} w-full overflow-x-auto`}
					dataSource={combinedDataSource}
					pagination={{ pageSize: searchedUsername ? 1 : 11, total: searchedUsername ? tableData.length : totalData }}
					onChange={handleTableChange}
					theme={theme}
					rowClassName={(record) => {
						return username === record.user ? 'user-row' : '';
					}}
				/>
			</div>
		</Spin>
	);
};

export default styled(LeaderboardData)`
	.ant-table-wrapper .ant-table-thead > tr > th,
	.ant-table-wrapper .ant-table-thead > tr > td {
		background: ${(props: any) => (props.theme === 'dark' ? 'black' : 'white')} !important;
	}
	.ant-table-row .ant-table-row-level-0 {
		background: ${(props: any) => (props.theme === 'dark' ? '#1E1E1E' : 'white')} !important;
	}
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
		height: 56px !important;
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
	td {
		background-color: transparent !important;
	}
	.ant-table-tbody > tr.user-row {
		background-color: ${(props: any) => (props.theme === 'light' ? '#e2ebff' : '#141C2D')} !important;
		color: ${(props: any) => (props.theme === 'light' ? '#243A57' : '#FFFFFF')} !important;
	}
	.ant-table-tbody > tr.user-row > td {
		border-top: ${(props: any) => (props.theme === 'light' ? '1px solid #486ddf' : '1px solid #407BFF')} !important;
		border-bottom: ${(props: any) => (props.theme === 'light' ? '1px solid #486ddf' : '1px solid #407BFF')} !important;
	}
	.ant-table-wrapper .ant-table-cell-fix-left {
		background-color: #fff !important;
	}
	.ant-table-column-sorter-inner {
		color: #9e9e9e !important;
	}
	.ant-table-content {
		overflow: auto hidden !important;
	}
`;
