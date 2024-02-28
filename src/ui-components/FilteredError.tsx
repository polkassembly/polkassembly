// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Alert from '~src/basic-components/Alert';

interface ErrorProps {
	text: string;
	className?: string;
	type?: any;
}
// TODO: Remove the file
const FilteredError = ({ className, text, type = 'error' }: ErrorProps) => {
	return (
		<div className='flex place-content-center'>
			<Alert
				className={`${className} max-w-sm text-center`}
				message={<span className='dark:text-blue-dark-high'>{text}</span>}
				type={type ? type : 'error'}
			/>
		</div>
	);
};

export default FilteredError;
