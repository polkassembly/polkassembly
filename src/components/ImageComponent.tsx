// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import React, { FC } from 'react';

interface IImageComponentProps{
    className?: string;
    src: any;
    alt: string;
    iconClassName?: string;
}

const ImageComponent: FC<IImageComponentProps> = (props) => {
	const { alt, className, src, iconClassName } = props;
	const newSrc = (src && src.trim())? src.trim(): null;
	return (
		<>
			<Avatar
				className={className}
				src={newSrc}
				alt={alt}
				icon={
					<span className={iconClassName}>
						<UserOutlined />
					</span>
				}
			/>
		</>
	);
};

export default ImageComponent;