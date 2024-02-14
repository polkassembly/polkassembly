// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import TrophyIcon from '~assets/TrophyCup.svg';
import { useNetworkSelector } from '~src/redux/selectors';
import LeaderboardData from './LeaderboardData';
import { useTheme } from 'next-themes';
import { Input } from 'antd';

const Leaderboard = () => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const [searchedUsername, setSearchedUsername] = useState<string | undefined>();

	return (
		<section>
			<div
				className='h-[122px] w-full rounded-[20px] py-6'
				style={{
					background: 'var(--Blue-Linear, linear-gradient(358deg, #262323 31.71%, #1D2182 136.54%))'
				}}
			>
				<div>
					<TrophyIcon className='absolute right-[764px] top-[56px] z-10' />
					<h1 className='m-0 flex items-center justify-center p-0 text-[40px] font-semibold text-white'>Leaderboard</h1>
					<p className='m-0 flex items-center justify-center p-0 text-sm text-white '>Find your rank in {network} ecosystem</p>
				</div>
				<div className='mt-20 rounded-xxl bg-white px-6 py-9 shadow-md dark:bg-section-dark-overlay'>
					<div className='flex items-center'>
						<p className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>Top 50 Ranks</p>
						<div className='ml-auto flex'>
							<Input.Search
								placeholder='enter address to search'
								className='m-0 h-[48px] w-[285px] rounded-[4px] p-0 px-3.5 py-2.5 text-[#7788a0] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								onSearch={(value) => {
									setSearchedUsername(value);
								}}
								onChange={(e) => {
									setSearchedUsername(e.target.value);
								}}
							/>
						</div>
					</div>
					<LeaderboardData
						className='mt-6'
						theme={theme}
						searchedUsername={searchedUsername}
					/>
				</div>
			</div>
		</section>
	);
};

export default Leaderboard;
