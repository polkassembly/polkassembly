// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { convertHtmlToMarkdown } from '~src/util/htmlToMarkdown';

const htmlDetectionRegex = /<(br|p|div|span|h[1-6]|ul|ol|li|table|tr|td|th|img|a|strong|em|code|pre)\b[^>]*>|<\/[a-z]+>/i;

const isMixedContent = (content: string): boolean => {
	// Check for Markdown patterns
	const markdownPatterns = {
		emphasis: /[*_]{1,2}[^*_]+[*_]{1,2}/, // Bold/Italic: *text* or _text_
		headers: /^#{1,6}\s/m, // Headers: # Header
		links: /\[([^\]]+)\]\(([^)]+)\)/, // Links: [text](url)
		lists: /^[-*+]\s/m // Lists: - item
	};

	// Check for HTML patterns
	const htmlPatterns = {
		entities: /&[a-z]+;|&#[0-9]+;/i,
		tags: /<(br|p|div|span|h[1-6]|ul|ol|li|table|tr|td|th|img|a|strong|em|code|pre)\b[^>]*>|<\/[a-z]+>/i
	};

	const hasMarkdown = Object.values(markdownPatterns).some((pattern) => pattern.test(content));
	const hasHTML = Object.values(htmlPatterns).some((pattern) => pattern.test(content));

	return hasMarkdown && hasHTML;
};

const getMarkdownContent = (content: string) => {
	if (isMixedContent(content)) {
		return content;
	}
	if (htmlDetectionRegex.test(content)) {
		return convertHtmlToMarkdown(content);
	}
	return content;
};

export default getMarkdownContent;
