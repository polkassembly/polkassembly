// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import xss from 'xss';

export const sanitizeHTML = (html: string): string => {
	return xss(html, {
		whiteList: {
			a: ['href', 'title', 'target', 'rel'],
			blockquote: ['style'],
			br: [],
			code: ['class'],
			div: ['class', 'style', 'id', 'contenteditable'],
			em: [],
			h1: [],
			h2: [],
			h3: [],
			h4: [],
			h5: [],
			h6: [],
			hr: [],
			img: ['src', 'alt', 'title', 'width', 'height', 'data-mce-src'],
			li: ['style'],
			mark: [],
			ol: ['style', 'type'],
			p: ['style', 'contenteditable'],
			pre: ['class'],
			span: ['class', 'style', 'contenteditable'],
			strong: [],
			table: ['style', 'border', 'cellpadding', 'cellspacing'],
			tbody: [],
			td: ['style', 'colspan', 'rowspan'],
			th: ['style', 'colspan', 'rowspan'],
			thead: [],
			tr: [],
			ul: ['style']
		}
	});
};
