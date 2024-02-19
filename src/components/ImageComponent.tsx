// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Avatar } from 'antd';
import React, { FC, useEffect, useState } from 'react';
// import DefaultProfile from '~assets/icons/dashboard-profile.svg';
import ImageIcon from '~src/ui-components/ImageIcon';

interface IImageComponentProps {
	className?: string;
	src: any;
	alt: string;
	iconClassName?: string;
}

const ImageComponent: FC<IImageComponentProps> = (props) => {
	const { alt, className, src = '', iconClassName } = props;
	const [isValid, setIsValid] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				const obj = new Image();
				obj.src = src || '';
				obj.onload = () => setIsValid(true);
				obj.onerror = () => setIsValid(false);
			} catch (err) {
				console.log(err);
			}
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
					<ImageIcon
						src='/assets/icons/dashboard-profile.svg'
						alt='dashboard profile icon'
						imgClassName='h-full w-full'
					/>
				</span>
			}
		/>
	);
};

export default ImageComponent;
