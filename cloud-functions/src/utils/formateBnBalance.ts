// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';

interface Options {
  numberAfterComma?: number;
  withThousandDelimitor?: boolean;
}

const getTokenDecimal = (network: string) => {
	switch (network) {
	case 'kusama':
		return 12;
	case 'polkadot':
		return 10;
	case 'vara':
		return 12;
	case 'rococo':
		return 12;
	case 'moonbeam':
		return 18;
	case 'moonriver':
		return 18;
	case 'moonbase':
		return 18;
	case 'picasso':
		return 12;
	default:
		return 0;
	}
};

export default function formatBnBalance(value: BN | string, options: Options, network: string): string {
	const tokenDecimals = getTokenDecimal(network);
	const valueString = value.toString();

	let suffix = '';
	let prefix = '';

	if (valueString.length > tokenDecimals) {
		suffix = valueString.slice(-tokenDecimals);
		prefix = valueString.slice(0, valueString.length - tokenDecimals);
	} else {
		prefix = '0';
		suffix = valueString.padStart(tokenDecimals - 1, '0');
	}

	let comma = '.';
	const { numberAfterComma, withThousandDelimitor = true } = options;
	const numberAfterCommaLtZero = numberAfterComma && numberAfterComma < 0;

	if (numberAfterCommaLtZero || numberAfterComma === 0) {
		comma = '';
		suffix = '';
	} else if (numberAfterComma && numberAfterComma > 0) {
		suffix = suffix.slice(0, numberAfterComma);
	}

	if (withThousandDelimitor) {
		prefix = prefix.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}

	return `${prefix}${comma}${suffix}`;
}
