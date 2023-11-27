// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Spin } from 'antd';
import React, { useEffect, useState } from 'react';

interface Props {
	className?: string;
	text?: string;
	timeout?: number;
	timeoutText?: string;
	size?: 'default' | 'small' | 'large';
	iconClassName?: string;
}
const Loader = ({ className, timeout, text, timeoutText = 'Process timeout', size = 'default', iconClassName }: Props) => {
	const [displayLoader, setDisplayLoader] = useState(true);

	useEffect(() => {
		if (timeout) {
			const timer = setTimeout(() => {
				setDisplayLoader(false);
			}, timeout);

			return () => {
				clearTimeout(timer);
			};
		}
	}, [timeout]);

	return (
		<>
			<div className={`${className} flex items-center justify-center`}>
				{displayLoader ? (
					<Spin
						tip={text}
						size={size}
						indicator={<LoadingOutlined className={iconClassName} />}
					/>
				) : (
					<Alert
						className='w-2/3 text-center'
						type='error'
						message={timeoutText}
					/>
				)}
			</div>
		</>
	);
};

export default Loader;
