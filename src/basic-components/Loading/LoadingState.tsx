// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const LoadingState = () => {
	return (
		<Result
			icon={<LoadingOutlined className='text-pink_primary' />}
			title={<div className='dark:text-white'>Loading...</div>}
		/>
	);
};

export default LoadingState;
