// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, PropsWithChildren } from 'react';

interface IErrorBoundaryProps extends PropsWithChildren {}

const ErrorBoundary: FC<IErrorBoundaryProps> = (props) => {
	const { children } = props;

	return <div className='relative'>{children}</div>;
};

export default ErrorBoundary;
