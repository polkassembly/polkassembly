// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Result } from 'antd';
import Link from 'next/link';
import React, { FC } from 'react';

import NothingFoundSVG from '~assets/nothing-found.svg';

interface IFallbackProps {
	onReset: () => void;
}

const Fallback: FC<IFallbackProps> = (props) => {
	return (
<<<<<<< HEAD
		<section className='absolute inset-0 z-[9999999] flex flex-col items-center justify-center h-screen w-screen bg-section-light-background dark:bg-section-dark-background'>
=======
		<section className='absolute inset-0 z-[9999999] flex h-screen w-screen flex-col items-center justify-center bg-[#F5F6F8]'>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
			<Result
				icon={
					<div className='mx-auto h-auto w-1/2 max-w-[900px]'>
						<NothingFoundSVG />
					</div>
				}
				title='Unfortunately something has gone wrong. Please try again.'
				extra={
					<Link
						onClick={props.onReset}
						href='/'
						className='h-[50px] w-[215px] rounded-md border-white bg-pink_primary px-6 py-2 text-lg text-white hover:bg-pink_secondary'
					>
						Go To Home
					</Link>
				}
			/>
		</section>
	);
};

export default Fallback;
