// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Result } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const NotFound = () => {
	const router = useRouter();

	const [errorReason, setErrorReason] = useState<string>('');

	useEffect(() => {
		if (router.query.reason) {
			setErrorReason(router.query.reason as string);
		}
	}, [router.query.reason]);

	return (
		<Result
			title='Uh oh, something went wrong.'
			subTitle={errorReason}
			extra={
				<Link
					href='/'
					className='h-[50px] w-[215px] rounded-md border-white bg-pink_primary px-6 py-2 text-lg text-white hover:bg-pink_secondary'
				>
					Go To Home
				</Link>
			}
		/>
	);
};

export default NotFound;
