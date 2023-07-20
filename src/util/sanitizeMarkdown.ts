// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import showdown from 'showdown';

const sanitizeMarkdown = (str?: string) => {
	if (str) {
		const converter = new showdown.Converter();
		const html = converter.makeHtml(
			str
				.replace(/&nbsp;/g, ' ')
				.replace(/&amp;/g, '&')
				.replace(/\[.*?\]\((.*?)\)/g, '')
				.replace(/!\[.*?\]\((.*?)\)/g, ''),
		);
		const plainText = html.replace(/(<([^>]+)>)/gi, '');
		return plainText;
	}
};
export default sanitizeMarkdown;
