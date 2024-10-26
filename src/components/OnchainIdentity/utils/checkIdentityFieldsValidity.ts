// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { WHITESPACE } from '../types';

export function checkIdentityFieldsValidity(
	hasValue: boolean,
	value: string | null | undefined,
	minLength: number,
	includes: string[],
	excludes: string[],
	starting: string[],
	notStarting: string[] = WHITESPACE,
	notEnding: string[] = WHITESPACE
): boolean {
	return (
		!hasValue ||
		(!!value &&
			value.length >= minLength &&
			includes.reduce((hasIncludes: boolean, check) => hasIncludes && value.includes(check), true) &&
			(!starting.length || starting.some((check) => value.startsWith(check))) &&
			!excludes.some((check) => value.includes(check)) &&
			!notStarting.some((check) => value.startsWith(check)) &&
			!notEnding.some((check) => value.endsWith(check)))
	);
}
