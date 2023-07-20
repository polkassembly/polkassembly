// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { marked } from 'marked';
import { convert } from 'html-to-text';

function convertStringToHtml(markdown: string): string {
	return marked.parse(markdown);
}

function parseHTML(html: string): string {
	return convert(html, {
		wordwrap: false,
		preserveNewlines: false,
		selectors: [
			{
				selector: 'a',
				options: {
					hideLinkHrefIfSameAsText: true,
					ignoreHref: true,
					noLinkBrackets: true
				}
			},
			{ selector: 'img', format: 'skip' }
		]
	});
}

export function htmlOrMarkdownToText(str: string): string {
	const input = convertStringToHtml(str);
	return parseHTML(input);
}
