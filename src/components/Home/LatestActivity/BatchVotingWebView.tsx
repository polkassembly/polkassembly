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
			<section className=''>
				<ImageIcon
					src='/assets/icons/tinder-web-banner.svg'
					alt='vote-badge'
					imgWrapperClassName='flex justify-center items-center w-full'
					imgClassName='-mt-1 w-full'
				/>
				<div className='relative -top-[152px] z-[100] -ml-[80px] flex w-full justify-end'>
					<Button
						className='flex h-[40px] w-[155px] items-center justify-center rounded-[40px] border-none bg-black text-xl text-white'
						onClick={() => {
							router.push('/batch-voting');
						}}
					>
						Lets Begin
					</Button>
				</div>
			</section>
		</>
	);
};

export default BatchVotingWebView;
