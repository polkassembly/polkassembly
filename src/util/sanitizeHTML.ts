// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import xss from 'xss';

export const sanitizeHTML = (html: string): string => {
	return xss(html, {
		whiteList: {
			a: ['href', 'title', 'target'],
			blockquote: [],
			br: [],
			code: [],
			div: ['class', 'style'],
			em: [],
			h1: [],
			h2: [],
			h3: [],
			h4: [],
			h5: [],
			h6: [],
			hr: [],
			img: ['src', 'alt', 'title', 'width', 'height'],
			li: [],
			ol: [],
			p: ['style'],
			pre: [],
			span: ['class', 'style'],
			strong: [],
			table: ['style', 'border', 'cellpadding', 'cellspacing'],
			tbody: [],
			td: ['style', 'colspan', 'rowspan'],
			th: ['style', 'colspan', 'rowspan'],
			thead: [],
			tr: [],
			ul: []
		}
	});
};
