// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Image from 'next/image';
import { useUserDetailsSelector } from '~src/redux/selectors';

const ProposalLive = () => {
	const { id } = useUserDetailsSelector();
	return (
		<a
			href='https://polkadot.polkassembly.io/referenda/183'
			target='_blank'
			rel='noreferrer'
			className='opengov_banner flex flex-col items-center justify-center gap-x-2 rounded-b-[20px] px-4 py-[10px] md:px-9 md:py-6 lg:ml-[80px] lg:flex-row'
			onClick={() => {
				(async () => {
					try {
						const res = await nextApiClientFetch('/api/v1/proposal-tracking', {
							proposal_id: 183,
							user_id: id
						});
						console.log(res);
					} catch (error) {
						// eslint-disable-next-line no-console
					}
				})();
			}}
		>
			<h2 className='m-0 flex items-center gap-x-2 p-0 font-poppins text-sm font-medium leading-[21px] text-white md:text-[24px] md:leading-[36px]'>
				<Image
					alt='party image'
					src='/assets/handshake.svg'
					width={30}
					height={30}
				/>
				<span className='flex flex-col gap-x-1 text-center md:flex-row'>
					<span>Enjoy using Polkassembly?</span>{' '}
					<span>
						Vote Aye for our proposal <span className='underline underline-offset-2'>here</span>
					</span>
				</span>
			</h2>
		</a>
	);
};

export default ProposalLive;
