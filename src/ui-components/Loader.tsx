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
}
const Loader = ({ className, timeout, text, timeoutText = 'Process timeout', size = 'default' }: Props) => {
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
						indicator={<LoadingOutlined />}
					/>
				) : (
					<Alert
						className='w-2/3 text-center dark:border-[#FF3C5F] dark:bg-[#FF3C5F]/20'
						type='error'
						message={<span className='dark:text-blue-dark-high'>{timeoutText}</span>}
					/>
				)}
			</div>
		</>
	);
};

export default Loader;
