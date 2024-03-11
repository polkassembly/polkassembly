// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton as AntdSkeleton } from 'antd';
import { AvatarProps } from 'antd/es/skeleton/Avatar';
import { FC } from 'react';

interface Props extends AvatarProps {
	className?: string;
}

const SkeletonAvatar: FC<Props> = (props) => {
	const { className } = props;
	return (
		<AntdSkeleton.Avatar
			{...props}
			className={`${className}`}
		/>
	);
};

export default SkeletonAvatar;
