// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import TrophyIcon from '~assets/trophy.svg';

const index = () => {
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
					<h1 className='m-0 flex items-center justify-center p-0 text-[40px] font-semibold'>Leaderboard</h1>
					<p className='m-0 flex items-center justify-center p-0 text-sm '>Find your rank in Polkadot ecosystem</p>
				</div>
			</div>
		</section>
	);
};

export default index;
