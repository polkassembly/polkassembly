// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { message } from 'antd';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import SkeletonAvatar from '~src/basic-components/Skeleton/SkeletonAvatar';
import ImageComponent from '~src/components/ImageComponent';
import copyToClipboard from '~src/util/copyToClipboard';

const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
	loading: () => (
		<SkeletonAvatar
			active
			size='large'
			shape='circle'
		/>
	),
	ssr: false
});

const IdenticonAndProfileImage = ({
	address,
	withUserProfileImage,
	iconSize,
	displayInline,
	imgUrl
}: {
	address: string;
	withUserProfileImage: boolean;
	iconSize: number;
	displayInline: boolean;
	imgUrl: string;
}) => {
	const [messageApi, contextHolder] = message.useMessage();
	const [isValidImgUrl, setIsValidImgUrl] = useState(false);

	const checkIsValidProfileImage = (imgUrl: string) => {
		try {
			const obj = new Image();
			obj.src = imgUrl || '';
			obj.onload = () => setIsValidImgUrl(true);
			obj.onerror = () => setIsValidImgUrl(false);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		if (!imgUrl) {
			setIsValidImgUrl(false);
			return;
		}
		checkIsValidProfileImage(imgUrl);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [imgUrl]);

	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};

	return (
		<div className='flex items-center'>
			<button
				className='flex items-center border-none bg-transparent p-0'
				onClick={(e) => {
					e.preventDefault();
					copyToClipboard(address);
					success();
				}}
			>
				{withUserProfileImage && isValidImgUrl && imgUrl ? (
					<ImageComponent
						src={imgUrl}
						alt='user-profile-image'
						className='h-5 w-5 cursor-copy rounded-full'
					/>
				) : (
					<Identicon
						className='image identicon'
						value={address}
						size={iconSize ? iconSize : displayInline ? 20 : 32}
						theme={'polkadot'}
					/>
				)}
				{contextHolder}
			</button>
		</div>
	);
};

export default IdenticonAndProfileImage;
