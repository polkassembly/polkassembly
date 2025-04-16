// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTheme } from 'next-themes';
import React, { MutableRefObject, useRef } from 'react';
import InitializedMDXEditor from './InitializedMDXEditor';
import { type MDXEditorMethods } from '@mdxeditor/editor';
interface Props {
	className?: string;
	height?: number;
	onChange?: (content: string) => void | string | null;
	value?: string;
	autofocus?: boolean;
	readOnly?: boolean;
	isUsedInCreatePost?: boolean;
	editorRef: MutableRefObject<MDXEditorMethods | null>;
}

const MarkdownEditor = ({ className, height, onChange: handleOnChange, value, autofocus = false, readOnly, isUsedInCreatePost = false, editorRef }: Props): JSX.Element => {
	const { resolvedTheme: theme } = useTheme();
	const ref = useRef<HTMLDivElement>(null);

	return (
		<div
			className={className}
			ref={ref}
		>
			<InitializedMDXEditor
				id='mdxEditor'
				markdown={value || ''}
				theme={theme as any}
				height={height}
				onChange={(content) => handleOnChange?.(content || '')}
				autofocus={autofocus}
				readOnly={readOnly}
				isUsedInCreatePost={isUsedInCreatePost}
				editorRef={editorRef}
			/>
		</div>
	);
};

export default MarkdownEditor;
