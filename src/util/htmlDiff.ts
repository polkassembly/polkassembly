// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { diffWords } from 'diff';
import { useTheme } from 'next-themes';

export function removeNbsp(input: string) {
	return input.replace(/&nbsp;/g, ' ');
}

export function generateDiffHtml(originalHtml: string, modifiedHtml: string) {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { resolvedTheme: theme } = useTheme();

	const diff = diffWords(originalHtml, modifiedHtml);

	let diffHtml = '';
	if (theme === 'dark') {
		diff.forEach((part) => {
			if (part.added) {
				diffHtml += `<span class="added-dark">${part.value}</span>`;
			} else if (part.removed) {
				diffHtml += `<span class="removed-dark">${part.value}</span>`;
			} else {
				diffHtml += part.value;
			}
		});
	} else {
		diff.forEach((part) => {
			if (part.added) {
				diffHtml += `<span class="added">${part.value}</span>`;
			} else if (part.removed) {
				diffHtml += `<span class="removed">${part.value}</span>`;
			} else {
				diffHtml += part.value;
			}
		});
	}

	return diffHtml;
}

export function generateDiffHtmlDark(originalHtml: string, modifiedHtml: string) {
	const diff = diffWords(originalHtml, modifiedHtml);

	let diffHtml = '';
	diff.forEach((part) => {
		if (part.added) {
			diffHtml += `<span class="added-dark">${part.value}</span>`;
		} else if (part.removed) {
			diffHtml += `<span class="removed-dark">${part.value}</span>`;
		} else {
			diffHtml += part.value;
		}
	});

	return diffHtml;
}
