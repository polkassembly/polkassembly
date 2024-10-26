// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Form, Upload, message } from 'antd';
import { PlusOutlined, LoadingOutlined, CameraOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { RcFile, UploadChangeParam, UploadFile, UploadProps } from 'antd/es/upload';
import { IMG_BB_API_KEY } from '~src/global/apiKeys';
import ImageComponent from '../ImageComponent';

interface Props {
	className?: string;
	updateProfile: (pre: any) => void;
	boxHeight: number;
	boxWidth: number;
	defaultImage: string;
	name: string;
	rules: any[];
	borderRadius?: number;
	imageInside?: boolean;
	borderStyle?: 'dashed' | 'solid' | 'dotted';
}

const beforeUpload = (file: RcFile) => {
	const isJpgOrPngOrSvg = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/svg';
	if (!isJpgOrPngOrSvg) {
		message.error('You can only upload JPG/PNG file!');
	}
	const isLt2M = file.size / 1024 / 1024 < 4;
	if (isJpgOrPngOrSvg && !isLt2M) {
		message.error('Image must smaller than 2MB!');
	}
	return isJpgOrPngOrSvg && isLt2M;
};

const UploadImage = ({ className, updateProfile, imageInside, defaultImage, name, rules }: Props) => {
	const [loading, setLoading] = useState<boolean>(false);

	const handleUploadCoverImage: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
		if (info.file.status == 'uploading') {
			setLoading(true);
			return;
		}

		if (info.file.status === 'done' && info.file.originFileObj) {
			const xhr = new XMLHttpRequest();
			xhr.withCredentials = false;
			xhr.open('POST', 'https://api.imgbb.com/1/upload?key=' + IMG_BB_API_KEY);

			xhr.upload.onprogress = (e) => {
				if (Number(((e.loaded / e.total) * 100).toFixed(1)) == 100) {
					if (loading) {
						setLoading(false);
					}
				}
			};

			xhr.onload = () => {
				setLoading(false);
				if (xhr.status === 403) {
					message.error('HTTP Error: ' + xhr.status);
					return;
				}

				if (xhr.status < 200 || xhr.status >= 300) {
					message.error('HTTP Error: ' + xhr.status);
					return;
				}

				const json = JSON.parse(xhr.responseText);

				if (!json || typeof json?.data?.display_url != 'string') {
					message.error('HTTP Error: ' + xhr.responseText);
					return;
				}

				updateProfile(json?.data?.display_url);
			};
			xhr.onerror = () => {
				message.error('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
				setLoading(false);
			};
			const formData = new FormData();
			formData.append('image', info.file.originFileObj, `${info.file.name}`);
			xhr.send(formData);
		}
	};

	return (
		<div className={className}>
			<Form.Item
				name={name}
				valuePropName='fileList'
				getValueFromEvent={(e) => {
					let images = e;
					if (!Array.isArray(e)) {
						images = e?.fileList;
					}
					const image = images[images.length - 1];
					const isValid = beforeUpload(image);
					if (isValid) {
						setLoading(false);
						return [image];
					}
					setLoading(false);
					updateProfile(defaultImage || '');
					return [];
				}}
				rules={rules}
			>
				<Upload
					name='avatar'
					listType='picture-card'
					className='flex'
					showUploadList={false}
					beforeUpload={(file: RcFile) => {
						const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
						const isLt4M = file.size / 1024 / 1024 < 4;
						return isJpgOrPng && isLt4M;
					}}
					onChange={handleUploadCoverImage}
					multiple={false}
				>
					{imageInside ? (
						loading ? (
							<LoadingOutlined className='text-sm text-bodyBlue dark:text-blue-dark-high' />
						) : (
							<ImageComponent
								src={defaultImage}
								alt='User Picture'
								className='flex h-[90px] w-[90px] items-center justify-center bg-white dark:bg-section-dark-overlay'
								iconClassName='flex items-center justify-center text-[#A0A6AE] w-full h-full rounded-full'
							/>
						)
					) : loading ? (
						<LoadingOutlined className='text-sm text-bodyBlue dark:text-blue-dark-high' />
					) : (
						<PlusOutlined className='text-sm text-bodyBlue dark:text-blue-dark-high' />
					)}
					{imageInside ? (
						<div className='upload-image-plus-icon border-bottom-[2px] absolute left-[70px] flex h-8 w-8 items-center justify-center rounded-full border-[1px] border-dashed border-white bg-white text-white shadow md:bottom-[10px]'>
							<CameraOutlined className='text-bodyBlue' />
						</div>
					) : (
						<div className='ml-2 text-xs text-bodyBlue dark:text-blue-dark-high'>Upload cover</div>
					)}
				</Upload>
			</Form.Item>
		</div>
	);
};

export default styled(UploadImage)`
	.ant-upload-wrapper.ant-upload-picture-card-wrapper .ant-upload.ant-upload-select {
		height: ${(props: any) => props.boxHeight}px !important;
		width: ${(props: any) => props.boxWidth}px !important;
		border-radius: ${(props: any) => props?.borderRadius || 4}px !important;
		border-style: ${(props: any) => props?.borderStyle || 'solid'} !important;
	}
`;
