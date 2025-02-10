// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const sanitizeHTML = (html: string): string => {
	// Remove potentially dangerous tags and their contents
	const dangerousTags = [
		'script',
		'style',
		'iframe',
		'object',
		'embed',
		'form',
		'input',
		'button',
		'textarea',
		'select',
		'meta',
		'link',
		'base',
		'applet',
		'audio',
		'video',
		'canvas',
		'math'
	];

	let sanitized = html;

	// Remove dangerous tags and their contents
	dangerousTags.forEach((tag) => {
		const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>|<${tag}[^>]*/>`, 'gis');
		sanitized = sanitized.replace(regex, '');
	});

	// Remove dangerous attributes
	sanitized = sanitized.replace(/(<[^>]*\s)(on\w+|javascript:|data:|vbscript:)=[^>]*>/gi, '$1>');

	// Remove comments that might contain exploits
	sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');

	return sanitized;
};
