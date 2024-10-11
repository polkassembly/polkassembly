// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import { useRouter } from 'next/router';
import React from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';

const BatchVotingWebView = () => {
	const router = useRouter();
	return (
		<>
			<section className='relative mb-[70px] '>
				<ImageIcon
					src='/assets/icons/tinder-web-banner.svg'
					alt='vote-badge'
					imgWrapperClassName='flex justify-center items-center w-full'
					imgClassName='relative -mt-1 w-full'
				/>

				<Button
					className='absolute right-[132px] top-[48px] flex h-[40px] w-[155px] items-center justify-center rounded-[40px] border-none bg-black text-xl font-semibold text-white'
					onClick={() => {
						router.push('/batch-voting');
					}}
				>
					Lets Begin
				</Button>
			</section>
		</>
	);
};

export default BatchVotingWebView;