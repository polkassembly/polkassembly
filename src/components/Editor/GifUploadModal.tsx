// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Gif from '~src/ui-components/Gif';
import { Modal } from 'antd';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import classNames from 'classnames';
import { dmSans } from 'pages/_app';
import { useTheme } from 'next-themes';
import { MDXEditorMethods } from '@mdxeditor/editor';

const GifUploadModal = ({
	className,
	editorRef,
	setOpen,
	isGifModalVisible
}: {
	className?: string;
	editorRef: React.RefObject<MDXEditorMethods>;
	setOpen: (open: boolean) => void;
	isGifModalVisible: boolean;
}) => {
	const { resolvedTheme: theme } = useTheme();
	const handleGifInsertion = (url: string, title: string) => {
		try {
			const imageMarkdown = `![${title}](${url})\n`;

			const editor = editorRef.current;

			if (editor) {
				editor.insertMarkdown(imageMarkdown);

				setOpen(false);
			} else {
				console.error('Editor reference not available');
			}
		} catch (error) {
			console.error('Error inserting GIF:', error);
		}
	};
	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			open={isGifModalVisible}
			onCancel={() => setOpen(false)}
			title={<div className='dark:text-blue-dark-high'>Select GIF</div>}
			footer={null}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			className={classNames(className, 'dark:[&>.ant-modal-content]:bg-section-dark-overlay', dmSans.className, dmSans.variable)}
		>
			<Gif
				onClick={handleGifInsertion}
				theme={theme}
			/>
		</Modal>
	);
};

export default GifUploadModal;
