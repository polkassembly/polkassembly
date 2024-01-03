// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Alert as AntdAlert } from 'antd';
import { ReactNode } from 'react';

interface Props {
	className?: string;
	showIcon?: boolean;
	type?: 'success' | 'info' | 'warning' | 'error';
	message?: ReactNode;
	description?: ReactNode;
}

export default function Alert({ className, showIcon = false, type, message, description }: Props) {
	const typeClasses =
		type === 'info'
			? 'dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark'
			: type === 'error'
			? 'dark:border-errorAlertBorderDark dark:bg-errorAlertBgDark'
			: type === 'success'
			? 'dark:border-[#026630] dark:bg-[#063E20] dark:text-blue-dark-high'
			: type === 'warning'
			? 'dark:border-warningAlertBorderDark dark:bg-warningAlertBgDark'
			: '';
	return (
		<AntdAlert
			className={`${className} ${typeClasses}`}
			showIcon={showIcon}
			type={type}
			message={message}
			description={description}
		/>
	);
}
