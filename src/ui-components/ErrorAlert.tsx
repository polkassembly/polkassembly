// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import cleanError from 'src/util/cleanError';
import Alert from '~src/basic-components/Alert';

interface Props {
	className?: string;
	errorMsg: string;
}

const ErrorAlert = ({ className, errorMsg }: Props) => {
	return (
		<Alert
			message={cleanError(errorMsg)}
			type='error'
			className={`${className}`}
		/>
	);
};

export default ErrorAlert;
