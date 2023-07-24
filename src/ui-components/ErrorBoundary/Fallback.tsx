// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';

const Fallback = () => {
	return (
		<section className='flex flex-col items-center justify-center h-screen w-screen'>
			<h2>Something went wrong</h2>
			<a href='https://polkassembly.hellonext.co/' target='_blank' className='text-pink_primary underline underline-offset-4' rel='noreferrer'>
                Report an Issue
			</a>
		</section>
	);
};

export default Fallback;