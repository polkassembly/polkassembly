// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Alert } from 'antd';
import React from 'react';

interface ErrorProps {
	text: string;
	className?: string;
}
// TODO: Remove the file
const FilteredError = ({ className, text }: ErrorProps) => {
	return (
		<div className='flex place-content-center'>
			<Alert
				className={`${className} max-w-sm text-center dark:border-[#FF3C5F] dark:bg-[rgba(255_60_95_0.2)]`}
				message={<span className='dark:text-blue-dark-high'>{text}</span>}
				type='error'
			/>
		</div>
	);
};

export default FilteredError;
