// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState, useEffect, FC, PropsWithChildren } from 'react';
import Fallback from './Fallback';

interface IErrorBoundaryProps extends PropsWithChildren {}

const ErrorBoundary: FC<IErrorBoundaryProps> = (props) => {
	const { children } = props;
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		const handleGlobalError = (error: ErrorEvent) => {
			console.error('Error caught by ErrorBoundary:', error);
			setHasError(true);
		};

		window.addEventListener('error', handleGlobalError);

		return () => {
			window.removeEventListener('error', handleGlobalError);
		};
	}, []);

	return (
		<div className='relative'>
			{
				hasError? <Fallback onReset={() => setHasError(false)}  />: null
			}
			{children}
		</div>
	);
};

export default ErrorBoundary;
