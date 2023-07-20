// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Result } from 'antd';
import Link from 'next/link';
import React from 'react';

const NotFound = () => {
	return (
		<Result
			title="Uh oh, something went wrong."
			extra={
				<Link
					href="/"
					className="py-2 px-6 bg-pink_primary text-white border-white hover:bg-pink_secondary rounded-md text-lg h-[50px] w-[215px]"
				>
					Go To Home
				</Link>
			}
		/>
	);
};

export default NotFound;
