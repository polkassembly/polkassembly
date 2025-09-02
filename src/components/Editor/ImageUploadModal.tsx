// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { MDXEditorMethods } from '@mdxeditor/editor';
import { Input, Modal, Upload } from 'antd';
import classNames from 'classnames';
import { useTheme } from 'next-themes';
import { dmSans } from 'pages/_app';
import { useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { NotificationStatus } from '~src/types';
import queueNotification from '~src/ui-components/QueueNotification';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';

const ImageUploadModal = ({
	className,
	editorRef,
	setOpen,
	isImageModalVisible,
	imageUploadHandler
}: {
	className?: string;
	editorRef: React.RefObject<MDXEditorMethods>;
	setOpen: (open: boolean) => void;
	isImageModalVisible: boolean;
	imageUploadHandler: (image: File) => Promise<string>;
}) => {
	const { resolvedTheme: theme } = useTheme();
	const [imageAlt, setImageAlt] = useState('');
	const [imageTitle, setImageTitle] = useState('');
	const [imageUrl, setImageUrl] = useState('');
	const [imageUploadTab, setImageUploadTab] = useState<'upload' | 'url'>('upload');
	const [imageUploading, setImageUploading] = useState(false);

	const handleImageInsertion = () => {
		try {
			const alt = imageAlt.trim() || 'image';
			const url = imageUrl.trim();

			if (!url || !editorRef.current) return;

			const imageMarkdown = `![${alt}](${url})\n`;
			editorRef.current.insertMarkdown(imageMarkdown);

			// Reset form and close modal
			setImageAlt('');
			setImageTitle('');
			setImageUrl('');
			setOpen(false);
			setImageUploadTab('upload');
		} catch (error) {
			console.error('Error inserting image:', error);
		}
	};

	const handleFileUpload = async (file: File) => {
		try {
			setImageUploading(true);
			const url = await imageUploadHandler(file);
			if (url) {
				setImageUrl(url);
				if (!imageAlt) {
					setImageAlt(file.name.replace(/[^\w\s.-]/g, '').trim() || 'image');
				}
			}
			setImageUploading(false);
			return false; // Prevent auto-upload
		} catch (error) {
			console.error('Error handling file upload:', error);
			setImageUploading(false);
			queueNotification({
				header: 'Error!',
				message: error || 'Failed to upload image',
				status: NotificationStatus.ERROR
			});
			return false;
		}
	};
	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			open={isImageModalVisible}
			onCancel={() => setOpen(false)}
			title={<div className='dark:text-blue-dark-high'>Upload an image</div>}
			footer={
				<div className='flex items-center justify-end gap-1'>
					<CustomButton
						key='cancel'
						variant='solid'
						onClick={() => setOpen(false)}
						className={`${theme === 'dark' ? 'border-separatorDark bg-transparent text-white' : ''}`}
					>
						Cancel
					</CustomButton>
					<CustomButton
						key='save'
						variant='solid'
						onClick={handleImageInsertion}
						disabled={!imageUrl}
						loading={imageUploading}
						className='border-none bg-pink_primary text-white'
					>
						Save
					</CustomButton>
				</div>
			}
			className={classNames(className, 'dark:[&>.ant-modal-content]:bg-section-dark-overlay', dmSans.className, dmSans.variable)}
		>
			<div className={`${theme === 'dark' ? 'text-white' : ''}`}>
				<div className='mb-4'>
					<div className='mb-4 flex'>
						<CustomButton
							variant={imageUploadTab === 'upload' ? 'solid' : 'outlined'}
							onClick={() => setImageUploadTab('upload')}
							className={`mr-2 ${imageUploadTab === 'upload' ? 'bg-pink_primary' : ''}`}
							height={30}
							disabled={imageUploading}
						>
							<UploadOutlined /> Upload from device
						</CustomButton>
						<CustomButton
							variant={imageUploadTab === 'url' ? 'solid' : 'outlined'}
							onClick={() => setImageUploadTab('url')}
							className={`${imageUploadTab === 'url' && 'bg-pink_primary'}`}
							height={30}
							disabled={imageUploading}
						>
							<LinkOutlined /> Add from URL
						</CustomButton>
					</div>

					{imageUploadTab === 'upload' ? (
						<Upload.Dragger
							name='file'
							accept='image/*'
							showUploadList={false}
							beforeUpload={handleFileUpload}
							className={`${theme === 'dark' ? 'dark-upload-area' : ''}`}
						>
							<p className='ant-upload-drag-icon'>
								<UploadOutlined className={theme === 'dark' ? 'text-white' : ''} />
							</p>
							<p className={`ant-upload-text ${theme === 'dark' ? 'text-white' : ''}`}>Choose File or Drop Files Here</p>
						</Upload.Dragger>
					) : (
						<Input
							placeholder='https://example.com/image.jpg'
							value={imageUrl}
							onChange={(e) => setImageUrl(e.target.value)}
							className={`${theme === 'dark' ? 'border-separatorDark bg-section-dark-overlay text-white' : ''}`}
						/>
					)}
				</div>

				<div className='mb-4'>
					<label className='mb-1 block'>Alt:</label>
					<Input
						placeholder='Alternative text'
						value={imageAlt}
						onChange={(e) => setImageAlt(e.target.value)}
						className={`${theme === 'dark' ? 'border-separatorDark bg-section-dark-overlay text-white' : ''}`}
					/>
				</div>

				<div className='mb-4'>
					<label className='mb-1 block'>Title:</label>
					<Input
						placeholder='Image title'
						value={imageTitle}
						onChange={(e) => setImageTitle(e.target.value)}
						className={`${theme === 'dark' ? 'border-separatorDark bg-section-dark-overlay text-white' : ''}`}
					/>
				</div>
			</div>
		</Modal>
	);
};

export default ImageUploadModal;
