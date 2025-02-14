// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */

import React, { memo, useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import List from '@editorjs/list';
import Table from '@editorjs/table';
import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';
import EdJsHTML from 'editorjs-html';
import { blockEditorTableParser } from './blockEditorTableParser';

const EDITOR_TOOLS = {
	header: Header,
	paragraph: Paragraph,
	table: Table,
	list: List
};

const BlockEditor = ({ data, onChange }: { data?: any; onChange?: (data: any) => void }) => {
	const ref = useRef<EditorJS>();

	const edjsParser = EdJsHTML({
		table: blockEditorTableParser
	});

	//Initialize editorjs
	useEffect(() => {
		//Initialize editorjs if we don't have a reference
		if (!ref.current) {
			const editor = new EditorJS({
				holder: 'block-editor',
				tools: EDITOR_TOOLS,
				data: data,
				onReady: async () => {
					if (data) {
						await editor.blocks.renderFromHTML(data);
					}
				},
				async onChange(api) {
					const edJsData = await api.saver.save();
					const htmlArr = edjsParser.parse(edJsData);
					onChange?.(htmlArr.join(''));
				},
				placeholder: 'Start writing your content here...'
			});
			ref.current = editor;
		}

		//Add a return function to handle cleanup
		return () => {
			if (ref.current && ref.current.destroy) {
				ref.current.destroy();
			}
		};
	}, []);

	return (
		<div
			className='rounded-md border border-solid border-gray-600 dark:text-white'
			id='block-editor'
		/>
	);
};

export default memo(BlockEditor);
