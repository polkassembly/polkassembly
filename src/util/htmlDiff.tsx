// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { diffWords } from 'diff';
import { useTheme } from 'next-themes';
import striptags from 'striptags';
import removeMd from 'remove-markdown';

export function removeSymbols(input: string) {
	return removeMd(striptags(String(input)));
}

export function GenerateDiffHtml(originalHtml: string, modifiedHtml: string) {
	const { resolvedTheme: theme } = useTheme();
	const diff = diffWords(originalHtml, modifiedHtml);

	let diffHtml = '';
	diff.forEach((part) => {
		if (part.added) {
			diffHtml += `<span class=${theme === 'light' ? 'added' : 'added-dark'}>${part.value}</span>`;
		} else if (part.removed) {
			diffHtml += `<span class=${theme === 'light' ? 'removed' : 'removed-dark'}>${part.value}</span>`;
		} else {
			diffHtml += part.value;
		}
	});
	return diffHtml;
}
