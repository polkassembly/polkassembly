// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import LeaderboardData from './LeaderboardData';
import { Input } from 'antd';
import styled from 'styled-components';
import { useTheme } from 'next-themes';

interface Props {
	theme?: string;
	className?: string;
}

const LeaderBoardTable = ({ className }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const [searchedUsername, setSearchedUsername] = useState<string | undefined>();

	return (
		<section className={`${className}`}>
			<div className='rounded-xxl bg-white px-6 py-4 shadow-md dark:bg-section-dark-overlay'>
				<div className='flex items-center'>
					<p className='m-0 p-0 text-xl font-semibold text-bodyBlue dark:text-white'>Top 50 Ranks</p>
					<div className='ml-auto flex'>
						<Input.Search
							placeholder='enter address to search'
							className='m-0 rounded-[4px] p-0 px-3.5 py-2.5 text-[#7788a0] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							onSearch={(value) => {
								setSearchedUsername?.(value);
							}}
							onChange={(e) => {
								setSearchedUsername?.(e.target.value);
							}}
						/>
					</div>
				</div>
				<LeaderboardData
					className='mt-4'
					theme={theme}
					searchedUsername={searchedUsername}
				/>
			</div>
		</section>
	);
};

export default styled(LeaderBoardTable)`
	.ant-input-group .ant-input {
		height: 42px !important;
		width: 245px !important;
	}
	.ant-input-search .ant-input-search-button {
		height: 42px !important;
		width: 40px !important;
	}
`;
