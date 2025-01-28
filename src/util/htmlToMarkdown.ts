// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import TurndownService from 'turndown';

const turndownService = new TurndownService();

export const convertHtmlToMarkdown = (html: string) => {
	if (!html?.length) return '';
	return turndownService.turndown(html);
};
