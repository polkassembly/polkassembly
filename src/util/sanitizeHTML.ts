// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import xss from 'xss';

/* eslint-disable sort-keys */

export const sanitizeHTML = (html: string): string => {
	return xss(html, {
		whiteList: {
			a: ['href', 'title', 'target', 'rel', 'class', 'data-mce-href'],
			blockquote: ['style', 'class'],
			br: [],
			code: ['class', 'style'],
			div: ['class', 'style', 'id', 'contenteditable', 'data-mce-style'],
			em: ['class'],
			h1: ['style', 'class'],
			h2: ['style', 'class'],
			h3: ['style', 'class'],
			h4: ['style', 'class'],
			h5: ['style', 'class'],
			h6: ['style', 'class'],
			hr: ['class'],
			img: ['src', 'alt', 'title', 'width', 'height', 'data-mce-src', 'data-mce-style', 'style'],
			li: ['style', 'class', 'data-mce-style'],
			mark: ['class', 'style'],
			ol: ['style', 'type', 'class', 'data-mce-style'],
			p: ['style', 'contenteditable', 'class', 'data-mce-style'],
			pre: ['class', 'style'],
			span: ['class', 'style', 'contenteditable', 'data-mce-style'],
			strong: ['class'],
			table: ['style', 'border', 'cellpadding', 'cellspacing', 'class', 'data-mce-style'],
			tbody: ['class'],
			td: ['style', 'colspan', 'rowspan', 'class', 'data-mce-style'],
			th: ['style', 'colspan', 'rowspan', 'class', 'data-mce-style'],
			thead: ['class'],
			tr: ['class'],
			ul: ['style', 'class', 'data-mce-style'],
			video: ['src', 'controls', 'width', 'height', 'autoplay', 'muted', 'loop', 'playsinline', 'class', 'style'],
			source: ['src', 'type']
		},
		stripIgnoreTagBody: false,
		css: true,
		onTagAttr: function (tag, name, value) {
			if (tag === 'a' && name === 'href') {
				const hasProtocol = /^(?:http|https|ftp|mailto):/i.test(value);
				const url = hasProtocol ? value : `https://${value}`;
				return `${name}="${url}"`;
			}
		}
	});
};
