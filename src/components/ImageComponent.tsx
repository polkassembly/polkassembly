// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Avatar } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import DefaultProfile from '~assets/icons/dashboard-profile.svg';

interface IImageComponentProps {
	className?: string;
	src: any;
	alt: string;
	iconClassName?: string;
}

const ImageComponent: FC<IImageComponentProps> = (props) => {
	const { alt, className, src = '', iconClassName } = props;
	const [isValid, setIsValid] = useState(false);
	const regex = /\.(jpg|jpeg|png|gif|bmp|svg|tiff|ico)$/;

	useEffect(() => {
		if (!regex.test(src)) return;
		(async () => {
			const res = await fetch(src);
			setIsValid(res.ok);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Avatar
			className={className}
			src={isValid ? src : '/assets/icons/user-profile.png'}
			alt={alt}
			icon={
				<span className={iconClassName}>
					<DefaultProfile />
				</span>
			}
		/>
	);
};

export default ImageComponent;
