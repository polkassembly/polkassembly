// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Avatar } from 'antd';
import React, { FC } from 'react';
import DefaultProfile from '~assets/icons/dashboard-profile.svg';
import validator from 'validator';

interface IImageComponentProps {
	className?: string;
	src: any;
	alt: string;
	iconClassName?: string;
}

const ImageComponent: FC<IImageComponentProps> = (props) => {
	const { alt, className, src, iconClassName } = props;
	const regex = validator.isURL(src || '', { protocols: ['http', 'https'], require_protocol: true });

	const newSrc = regex && src && src.trim() ? src.trim() : null;
	return (
		<Avatar
			className={className}
			src={newSrc}
			alt={alt}
			icon={
				newSrc ? null : (
					<span className={iconClassName}>
						<DefaultProfile />
					</span>
				)
			}
		/>
	);
};

export default ImageComponent;
