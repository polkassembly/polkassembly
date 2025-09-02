// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from 'next-themes';
import { MDXEditorMethods } from '@mdxeditor/editor';
import { Modal } from 'antd';
import classNames from 'classnames';
import { dmSans } from 'pages/_app';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import Input from '~src/basic-components/Input';
import CustomButton from '~src/basic-components/buttons/CustomButton';

interface Props {
	className?: string;
	isLinkModalVisible: boolean;
	setOpen: (open: boolean) => void;
	editorRef: React.MutableRefObject<MDXEditorMethods | null>;
}

const CreateLinkModal = ({ className, isLinkModalVisible, setOpen, editorRef }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const [url, setUrl] = useState('');
	const [title, setTitle] = useState('');

	// Get the current selection when the modal opens
	useEffect(() => {
		if (!isLinkModalVisible) return;
		const selectionText = window.getSelection()?.toString() || '';
		setTitle(selectionText);
		setUrl('');
	}, [isLinkModalVisible]);

	const handleCancel = () => {
		setOpen(false);
	};

	const handleInsertLink = () => {
		if (!editorRef.current) return;

		if (url) {
			// Insert a markdown link with the provided title and URL
			if (title) {
				editorRef.current.insertMarkdown(`[${title?.trim()}](${url?.trim()})`);
			} else {
				// Insert just the URL if no title is provided
				editorRef.current.insertMarkdown(`[${url?.trim()}](${url?.trim()})`);
			}
		}

		setOpen(false);
	};

	const modalTitle = (
		<div className='flex items-center justify-between border-0 border-b-[1px] border-section-light-container dark:border-separatorDark '>
			<span className={`text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-bodyBlue'}`}>Create Link</span>
		</div>
	);

	return (
		<Modal
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			title={modalTitle}
			open={isLinkModalVisible}
			onCancel={handleCancel}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			footer={null}
			className={classNames(dmSans.className, dmSans.variable, 'create-link-modal')}
		>
			<div className='py-2'>
				<div className='mb-4'>
					<label
						className={`mb-1.5 block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-bodyBlue'}`}
						htmlFor='url-input'
					>
						URL
					</label>
					<Input
						id='url-input'
						className={classNames(
							'w-full rounded-md border p-2 focus:outline-none focus:ring-1 focus:ring-pink_primary',
							theme === 'dark' ? 'border-separatorDark bg-section-dark-overlay text-white' : 'border-gray-300 bg-white text-bodyBlue'
						)}
						type='text'
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						autoFocus
						placeholder='https://example.com'
					/>
				</div>

				<div className='mb-4'>
					<label
						className={`mb-1.5 block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-bodyBlue'}`}
						htmlFor='title-input'
					>
						Title
					</label>
					<Input
						id='title-input'
						className={classNames(
							'w-full rounded-md border p-2 focus:outline-none focus:ring-1 focus:ring-pink_primary',
							theme === 'dark' ? 'border-separatorDark bg-section-dark-overlay text-white' : 'border-gray-300 bg-white text-bodyBlue'
						)}
						type='text'
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder='Link text'
					/>
				</div>

				<div className='mt-6 flex justify-end gap-2'>
					<CustomButton
						variant='solid'
						onClick={handleCancel}
					>
						Cancel
					</CustomButton>
					<CustomButton
						variant='solid'
						onClick={handleInsertLink}
						className='border-none'
					>
						Save
					</CustomButton>
				</div>
			</div>
		</Modal>
	);
};

export default styled(CreateLinkModal)<{ theme?: 'dark' | 'light' }>`
	.ant-modal-content {
		background-color: ${({ theme }) => (theme === 'dark' ? '#1C1D1F' : '#F5F6F8')};
		color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
		border-radius: 4px;
		padding: 16px;
	}

	.ant-modal-header {
		background-color: ${({ theme }) => (theme === 'dark' ? '#1C1D1F' : '#F5F6F8')};
		border-bottom: 1px solid ${({ theme }) => (theme === 'dark' ? 'var(--separatorDark)' : '#D2D8E0')};
		padding-bottom: 12px;
		margin-bottom: 16px;
	}

	.ant-modal-title {
		color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
	}

	.ant-modal-close-icon {
		color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
	}

	.anticon-close {
		color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
	}

	input {
		font-size: 14px;
		&::placeholder {
			color: ${({ theme }) => (theme === 'dark' ? '#9E9E9E' : '#6F6F6F')};
		}
	}

	button {
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s;
	}
`;
