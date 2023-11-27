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
				className={`${className} dark:border-errorAlertBorderDark dark:bg-errorAlertBgDark max-w-sm text-center`}
				message={<span className='dark:text-blue-dark-high'>{text}</span>}
				type='error'
			/>
		</div>
	);
};

export default FilteredError;
