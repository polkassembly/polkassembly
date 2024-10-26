// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton as AntdSkeleton } from 'antd';
import { SkeletonInputProps } from 'antd/es/skeleton/Input';
import { FC } from 'react';

interface Props extends SkeletonInputProps {
	className?: string;
}

const SkeletonInput: FC<Props> = (props) => {
	const { className } = props;
	return (
		<AntdSkeleton.Input
			{...props}
			className={`${className} h-[22px] w-min flex-1 rounded-[4px] bg-[#E6E6E6] text-white dark:bg-[#5959599E]`}
		/>
	);
};

export default SkeletonInput;
