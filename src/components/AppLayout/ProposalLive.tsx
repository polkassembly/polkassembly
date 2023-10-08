// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';

const ProposalLive = () => {
	return (
		<a
			href='https://polkadot.polkassembly.io/referenda/183'
			target='_blank'
			rel='noreferrer'
			className='opengov_banner flex flex-col items-center justify-center gap-x-2 rounded-b-[20px] px-4 py-[10px] md:px-9 md:py-6 lg:ml-[80px] lg:flex-row'
		>
			<h2 className='m-0 flex items-center gap-x-2 p-0 font-poppins text-sm font-medium leading-[21px] text-white md:text-[24px] md:leading-[36px]'>
				<span>
					Enjoy using Polkassembly? Vote Aye for our proposal <span className='underline underline-offset-2'>here</span>
				</span>
			</h2>
		</a>
	);
};

export default ProposalLive;
