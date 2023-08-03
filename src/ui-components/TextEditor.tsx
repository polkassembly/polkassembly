// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import React, { FC, useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import classNames from 'classnames';
import { Modal, Skeleton } from 'antd';
import { IMG_BB_API_KEY } from '~src/global/apiKeys';
import showdown from 'showdown';
import styled from 'styled-components';
import Gif from './Gif';
import { algolia_client } from '~src/components/Search';

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
	autofocus?: boolean;
}

const gifSVGData = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512.000000 512.000000">
<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
fill="#000000" stroke="none">
<path d="M830 5104 c-42 -18 -86 -58 -108 -99 -15 -27 -17 -109 -20 -871 l-3
-842 -92 -4 c-112 -5 -179 -32 -235 -92 -81 -88 -77 -39 -77 -946 0 -801 0
-805 21 -851 54 -116 140 -169 291 -177 l92 -5 3 -536 c3 -588 1 -562 65 -623
65 -62 -61 -58 1793 -58 1854 0 1728 -4 1793 58 64 61 62 35 65 623 l3 536 92
5 c151 8 237 61 291 177 21 46 21 50 21 851 0 907 4 858 -77 946 -56 60 -123
87 -235 92 l-93 4 -1 302 c-1 165 -4 312 -8 326 -8 30 -994 1160 -1033 1184
-24 15 -138 16 -1270 16 -1088 -1 -1247 -3 -1278 -16z m2400 -714 l0 -530 29
-32 29 -33 466 -3 466 -3 0 -249 0 -250 -1660 0 -1660 0 0 815 0 815 1165 0
1165 0 0 -530z m-1136 -1414 c38 -9 88 -23 111 -32 l42 -16 -35 -131 c-19 -73
-35 -133 -36 -134 0 -1 -39 10 -86 24 -114 33 -304 42 -403 19 -90 -21 -159
-58 -222 -117 -95 -90 -142 -230 -131 -389 17 -234 125 -375 330 -435 44 -13
86 -16 170 -13 61 2 117 7 124 11 9 6 12 50 12 163 l0 154 -115 0 -115 0 0
135 0 135 278 -2 277 -3 0 -395 0 -394 -45 -14 c-179 -53 -421 -79 -580 -63
-139 14 -217 35 -320 83 -70 33 -100 56 -170 127 -141 142 -200 293 -201 511
-1 235 57 401 191 544 116 123 273 206 459 241 97 18 366 13 465 -9z m806
-736 l0 -750 -170 0 -170 0 0 750 0 750 170 0 170 0 0 -750z m1210 610 l0
-140 -287 -2 -288 -3 -3 -167 -2 -168 270 0 270 0 0 -140 0 -140 -270 0 -270
0 0 -300 0 -300 -170 0 -170 0 0 743 c0 409 3 747 7 750 3 4 210 7 460 7 l453
0 0 -140z m110 -2110 l0 -480 -1660 0 -1660 0 0 480 0 480 1660 0 1660 0 0
-480z"/>
</g>
</svg>
`;

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
	const { className, height, onChange, isDisabled, value, name, autofocus } = props;

	const [loading, setLoading] = useState(true);
	const ref = useRef<Editor | null>(null);
	const [isModalVisible, setIsModalVisible] = useState(false);

	useEffect(() => {
		//if value is a link with a username it it, shift caret position to the end of the text
		if (!value ||
			!(value.startsWith('<p><a href="../user/') || value.startsWith('<p><a href="../address/')) ||
			!value.endsWith('</a>&nbsp;</p>')
		) return;

		ref.current?.editor?.selection.setCursorLocation(ref.current?.editor?.getBody(), 1);
		ref.current?.editor?.focus();
	}, [value]);

	return (
		<>
			{loading &&  (
				<Skeleton.Input block={true} active={true} style={{ height: '300px' }} />
			)}
			<Modal
				open={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				title='Select Gif'
				footer={null}
			>
				<Gif
					onClick={(url, title) => {
						const caretPosition = ref.current?.editor?.selection.getRng();
						const content = `<img src="${url}" alt="${title}" data-mce-src="${url}">`;
						ref.current?.editor?.insertContent(content, { format: 'html', caretPosition });
						setIsModalVisible(false);
					}}
				/>
			</Modal>
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
							const parsed_content = converter.makeHtml(sanitisedContent);
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
						cloudChannel='5-stable'
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
								'insertdatetime', 'media', 'table', 'textpattern', 'emoticons'
							],
							setup: (editor) => {
								editor.on('init', () => {
									if (autofocus) editor.focus();
								});

								editor.ui.registry.addAutocompleter('specialchars_cardmenuitems', {
									ch: '@',
									minChars: 1,
									columns: 1,
									fetch: (pattern: string) => {
										// eslint-disable-next-line no-async-promise-executor
										return new Promise(async (resolve) => {
											const queries = [{
												indexName: 'polkassembly_users',
												query: pattern,
												params: {
													hitsPerPage: 6,
													restrictSearchableAttributes: ['username']
												}
											}, {
												indexName: 'polkassembly_addresses',
												query: pattern,
												params: {
													hitsPerPage: 4,
													restrictSearchableAttributes: ['address']
												}
											}];

											const hits = await algolia_client.search(queries, { strategy: 'none' });

											const usernameHits = hits.results[0]?.hits || [];
											const addressHits = hits.results[1]?.hits || [];

											const usernameResults = (usernameHits || [])?.map((user: any) => ({
												type: 'cardmenuitem',
												value: `<a target="_blank" href="/user/${user.username}">@${user.username}</a>`,
												label: user.username,
												items: [
													{
														type: 'cardcontainer',
														direction: 'vertical',
														items: [
															{
																type: 'cardtext',
																text: user.username,
																name: 'char_name'
															}
														]
													}
												]
											}));

											const addressResults = (addressHits || [])?.map((user: any) => ({
												type: 'cardmenuitem',
												value: `<a target="_blank" href="/address/${user.address}">@${user.address}</a>`,
												label: user.address,
												items: [
													{
														type: 'cardcontainer',
														direction: 'vertical',
														items: [
															{
																type: 'cardtext',
																text: user.address,
																name: 'char_name'
															}
														]
													}
												]
											}));

											resolve((usernameResults || []).concat(addressResults || []) as any);
										});
									},
									highlightOn: ['char_name'],
									onAction: (autocompleteApi, rng, value) => {
										editor.selection.setRng(rng);
										editor.insertContent(value);
										autocompleteApi.hide();
									}
								});

								editor.ui.registry.addIcon('custom-icon', gifSVGData);
								editor.ui.registry.addButton('customButton', { icon: 'custom-icon', onAction: () => setIsModalVisible(true) });
							},
							toolbar: 'undo redo preview | ' +
								'bold italic backcolor | ' +
								'bullist numlist table customButton | ' +
								'removeformat link image emoticons',
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
								{ start: 'i) ', cmd: 'InsertOrderedList', value: { 'list-style-type': 'lower-roman' } },
								{ start: '---', replacement: '<hr/>' },
								{ start: '--', replacement: '—' },
								{ start: '-', replacement: '—' },
								{ start: '(c)', replacement: '©' }
							]
						}}
					/>
				</div>
			</div>
		</>

	);
};

export default styled(TextEditor)`
	.tox-tinymce {
		border-radius: 1rem;
	}

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