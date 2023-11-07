// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Result } from 'antd';
import Link from 'next/link';
import React from 'react';

import NothingFoundSVG from '~assets/nothing-found.svg';

const NotFound = () => {
	return (
		<Result
			icon={
				<div className='mx-auto h-auto w-1/2 max-w-[900px]'>
					<NothingFoundSVG />
				</div>
			}
			title="Uh oh, it seems this route doesn't exist."
			extra={
				<Link
					href='/'
					className='h-[50px] w-[215px] rounded-md border-white bg-pink_primary px-6 py-2 text-lg text-white hover:bg-pink_secondary dark:border-[#3B444F]'
				>
					Go To Home
				</Link>
			}
		/>
	);
};

export default NotFound;
