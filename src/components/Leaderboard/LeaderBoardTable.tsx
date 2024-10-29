// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useCallback, useState } from 'react';
import LeaderboardData from './LeaderboardData';
import { Input } from 'antd';
import styled from 'styled-components';
import { useTheme } from 'next-themes';
import { ILeaderboardTable } from './types';
import { poppins } from 'pages/_app';
import _ from 'lodash';
import { useTranslation } from 'next-i18next';

const LeaderBoardTable: FC<ILeaderboardTable> = ({ className }) => {
	const { resolvedTheme: theme } = useTheme();
	const [searchedUsername, setSearchedUsername] = useState<string | undefined>();
	const [inputValue, setInputValue] = useState<string>('');
	const { t } = useTranslation('common');

	// eslint-disable-next-line
	const debouncedSearch = useCallback(
		_.debounce((value: string) => {
			handleSearch(value);
		}, 300),
		[]
	);

	const handleSearch = (value: string) => {
		if (value.length >= 1) {
			setSearchedUsername(value.trim().toLowerCase());
		} else {
			setSearchedUsername(undefined);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);
		debouncedSearch(value);
	};

	return (
		<section className={`${className}`}>
			<div className='leaderboard-table-mobile rounded-xxl bg-white px-6 py-4 shadow-md dark:bg-section-dark-overlay'>
				<div className='table-header items-center'>
					<p className={`${poppins.className} ${poppins.variable} m-0 mt-1 p-0 text-xl font-semibold text-bodyBlue dark:text-white`}>{t('top_50_ranks')}</p>
					<div className='search-box mr-8 flex'>
						<Input.Search
							placeholder='Enter username to search'
							className='m-0 rounded-[4px] p-0 px-3.5 py-2.5 text-[#7788a0] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							onSearch={handleSearch}
							onChange={handleInputChange}
							value={inputValue}
							allowClear
						/>
					</div>
				</div>
				<LeaderboardData
					className='mt-4'
					theme={theme as any}
					searchedUsername={searchedUsername}
				/>
			</div>
		</section>
	);
};

export default styled(LeaderBoardTable)`
	.ant-input-group .ant-input {
		height: 32px !important;
		width: 245px !important;
	}
	.ant-input {
		border-color: ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#D2D8E0')};
		color: ${(props: any) => (props.theme === 'dark' ? '#9e9e9e' : '#243a57')};
	}
	.ant-input-search .ant-input-search-button {
		height: 42px !important;
		width: 42px !important;
		background-color: transparent !important;
		border-color: ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#D2D8E0')};
	}
	.ant-input-affix-wrapper {
		background-color: transparent !important;
		border-color: ${(props: any) => (props.theme === 'dark' ? '#4B4B4B' : '#D2D8E0')};
	}
	.ant-input-search .ant-input-search-button svg {
		fill: ${(props: any) => (props.theme === 'dark' ? '#9E9E9E' : '#4B4B4B')};
	}
	.ant-input-group {
		display: flex !important;
	}
	.ant-table-wrapper .ant-table-pagination-right {
		margin-top: 36px !important;
		justify-content: center !important;
	}
	.table-header {
		display: flex !important;
	}
	.search-box {
		margin-left: auto !important;
	}
	@media (max-width: 767px) and (min-width: 319px) {
		.leaderboard-table-mobile {
			margin-top: -124px !important;
		}
		.table-header {
			display: inline !important;
		}
		.search-box {
			margin-left: -16px !important;
		}
	}
`;
