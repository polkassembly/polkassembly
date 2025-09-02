// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AlertProps, Alert as AntdAlert } from 'antd';
import { FC } from 'react';

interface Props extends AlertProps {
	className?: string;
}

const Alert: FC<Props> = ({ type = 'info', showIcon = false, className, ...props }) => {
	const typeClasses =
		type === 'info'
			? 'dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark rounded-[4px]'
			: type === 'error'
				? 'dark:border-errorAlertBorderDark dark:bg-errorAlertBgDark rounded-[4px]'
				: type === 'success'
					? 'dark:border-[#026630] dark:bg-[#063E20] dark:text-blue-dark-high rounded-[4px]'
					: type === 'warning'
						? 'dark:border-warningAlertBorderDark dark:bg-warningAlertBgDark rounded-[4px]'
						: '';
	return (
		<AntdAlert
			{...props}
			className={`${className} ${typeClasses}`}
			showIcon={showIcon}
			type={type}
		/>
	);
};

export default Alert;
