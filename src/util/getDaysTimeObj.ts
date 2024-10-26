// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default function getDaysTimeObj(line: string) {
	const daysTimeObj = { d: 0, h: 0, m: 0 };
	if (line && typeof line === 'string') {
		const words = line.split(' ');
		words.forEach((word) => {
			if (word && typeof word === 'string' && word.length > 1) {
				const lastChar = word.charAt(word.length - 1) as keyof typeof daysTimeObj;
				if (!['d', 'h', 'm'].includes(lastChar)) return;

				const num = Number(word.replace(lastChar, ''));
				if (isNaN(num)) return;
				daysTimeObj[lastChar] = num;
			}
		});
	}
	return daysTimeObj;
}
