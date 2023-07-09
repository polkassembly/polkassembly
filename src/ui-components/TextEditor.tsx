// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import React, { FC, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import classNames from 'classnames';
import { Skeleton } from 'antd';
import { IMG_BB_API_KEY } from '~src/global/apiKeys';
import showdown from 'showdown';
import styled from 'styled-components';

const converter = new showdown.Converter({
	simplifiedAutoLink: true,
	strikethrough: true,
	tables: true,
	tasklists: true
});

interface ITextEditorProps {
    className?: string;
    height?: number | string;
    value?: string;
    onChange: (value: string) => void;
		isDisabled?: boolean;
    name: string;
}

const editorContentStyle = `
@import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&display=swap");
body {
	font-family: "Poppins", sans-serif;
	font-size: 14px;
	line-height: 1.5;
}

th, td {
	border: 1px solid #243A57;
	padding: 0.5rem;
}

img {
	max-width: 100%;
}
`;

const TextEditor: FC<ITextEditorProps> = (props) => {
	const { className, height, onChange, isDisabled, value, name } = props;
	const [loading, setLoading] = useState(true);
	const ref = useRef<Editor | null>(null);

	return (
		<>
			{loading &&  (
				<Skeleton.Input block={true} active={true} style={{ height: '300px' }} />
			)}

			<div style={{
				minHeight: `${height || 300}px`
			}} className={classNames('flex-1 w-full', className, { 'invisible' : loading })}>
				<div className={`${loading && 'invisible'}`}>
					<Editor
						onPaste={(e) => {
							e.stopPropagation();
							e.preventDefault();
							const content = e.clipboardData?.getData('text/plain') || '';
							const caretPosition = ref.current?.editor?.selection.getRng();
							const sanitisedContent = content.replace(/\\n/g, '\n'); // req. for subsquare style md
							const parsed_content = converter.makeHtml(sanitisedContent).replace(/<p>|<\/p>/g, '');
							ref.current?.editor?.insertContent(parsed_content || sanitisedContent, { format: 'html', caretPosition });
						}}
						textareaName={name}
						value={converter.makeHtml(value || '')}
						ref={ref}
						disabled={isDisabled}
						onEditorChange={(content) => {
							onChange(content);
						}}
						apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY}
						onInit={() => setLoading(false)}
						onFocusIn={() => document.querySelectorAll('.tox-editor-header').forEach(elem => elem.classList?.add('focused'))}
						onFocusOut={() => document.querySelectorAll('.tox-editor-header').forEach(elem => elem.classList?.remove('focused'))}
						init={{
							block_unsupported_drop: false,
							branding: false,
							content_style: editorContentStyle,
							height: height || 400,
							icons: 'thin',
							images_file_types: 'jpg,png,jpeg,gif,svg',
							images_upload_handler: (blobInfo, progress) => {
								return new Promise<string>((resolve, reject) => {
									const xhr = new XMLHttpRequest();
									xhr.withCredentials = false;
									xhr.open('POST', 'https://api.imgbb.com/1/upload?key=' + IMG_BB_API_KEY);

									xhr.upload.onprogress = (e) => {
										progress(Number((e.loaded / e.total * 100).toPrecision(2)));
									};

									xhr.onload = () => {
										if (xhr.status === 403) {
											reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
											return;
										}

										if (xhr.status < 200 || xhr.status >= 300) {
											reject('HTTP Error: ' + xhr.status);
											return;
										}

										const json = JSON.parse(xhr.responseText);

										if (!json || typeof json?.data?.display_url != 'string') {
											reject('Invalid JSON: ' + xhr.responseText);
											return;
										}

										resolve(json?.data?.display_url);
									};
									xhr.onerror = () => {
										reject('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
									};
									const formData = new FormData();
									formData.append('image', blobInfo.blob(), `${blobInfo.filename()}`);
									xhr.send(formData);
								});
							},
							menubar: false,
							paste_data_images: true,
							placeholder: 'Please type here...',
							plugins: [
								'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
								'searchreplace', 'visualblocks', 'fullscreen',
								'insertdatetime', 'media', 'table', 'textpattern'
							],
							toolbar: 'undo redo preview | ' +
								'bold italic backcolor | ' +
								'bullist numlist table | ' +
								'removeformat link image',
							xss_sanitization: true,
							textpattern_patterns: [
								{ start: '*', end: '*', format: 'italic' },
								{ start: '**', end: '**', format: 'bold' },
								{ start: '#', format: 'h1' },
								{ start: '##', format: 'h2' },
								{ start: '###', format: 'h3' },
								{ start: '####', format: 'h4' },
								{ start: '#####', format: 'h5' },
								{ start: '######', format: 'h6' },
								{ start: '* ', cmd: 'InsertUnorderedList' },
								{ start: '- ', cmd: 'InsertUnorderedList' },
								{ start: '1. ', cmd: 'InsertOrderedList', value: { 'list-style-type': 'decimal' } },
								{ start: '1) ', cmd: 'InsertOrderedList', value: { 'list-style-type': 'decimal' } },
								{ start: 'a. ', cmd: 'InsertOrderedList', value: { 'list-style-type': 'lower-alpha' } },
								{ start: 'a) ', cmd: 'InsertOrderedList', value: { 'list-style-type': 'lower-alpha' } },
								{ start: 'i. ', cmd: 'InsertOrderedList', value: { 'list-style-type': 'lower-roman' } },
								{ start: 'i) ', cmd: 'InsertOrderedList', value: { 'list-style-type': 'lower-roman' } }
							]
						}}
					/>
				</div>
			</div>
		</>

	);
};

export default styled(TextEditor)`
	.tox-editor-header {
		opacity: 0.3;
		box-shadow: none !important;
		transition: opacity 0.2s ease-in-out !important;

		&.focused {
			opacity: 1 !important;
		}

		.tox-tbtn {
			scale: 0.85;
		}
	}
`;