// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import TrophyIcon from '~assets/trophy.svg';
import { useNetworkSelector } from '~src/redux/selectors';
import LeaderboardData from './LeaderboardData';
import { useTheme } from 'next-themes';

const Leaderboard = () => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

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
					<p className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-separatorDark'>Top 50 Ranks</p>
					<LeaderboardData
						className='mt-6'
						theme={theme}
					/>
				</div>
			</div>
		</section>
	);
};

export default Leaderboard;
