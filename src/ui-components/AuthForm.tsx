// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form } from 'antd';
import React, { FC, PropsWithChildren } from 'react';

interface Props extends PropsWithChildren{
    className?: string;
    onSubmit?: ((values: React.BaseSyntheticEvent<object, any, any> | undefined) => void);
}

const AuthForm: FC<Props> = ({ children, onSubmit, className }) => {
	return (
		<Form onFinish={onSubmit} className={className}>
			{children}
		</Form>
	);
};

export default AuthForm;