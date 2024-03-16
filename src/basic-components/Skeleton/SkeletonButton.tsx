// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton as AntdSkeleton } from 'antd';
import { SkeletonButtonProps } from 'antd/es/skeleton/Button';
import { FC } from 'react';

interface Props extends SkeletonButtonProps {
	className?: string;
}

const SkeletonButton: FC<Props> = (props) => {
	const { className } = props;
	return (
		<AntdSkeleton.Button
			{...props}
			className={`${className} w-min rounded bg-[#E6E6E6] text-white dark:bg-[#5959599E]`}
		/>
	);
};

export default SkeletonButton;
