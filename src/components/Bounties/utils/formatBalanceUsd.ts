// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import formatBnBalance from '~src/util/formatBnBalance';

export const formatNumberWithSuffix = (value: number): string => {
	const cleanedValue = Number(value.toString().replace(/,/g, ''));

	if (cleanedValue >= 1e6) {
		return (cleanedValue / 1e6).toFixed(1) + 'm';
	} else if (cleanedValue >= 1e3) {
		return (cleanedValue / 1e3).toFixed(1) + 'k';
	}
	return cleanedValue.toFixed(1);
};

export const getFormattedValue = (value: string, network: string, currentTokenPrice: { isLoading: boolean; value: string }): string => {
	const numericValue = Number(formatBnBalance(value, { numberAfterComma: 1, withThousandDelimitor: false }, network));

	if (isNaN(Number(currentTokenPrice.value))) {
		return formatNumberWithSuffix(numericValue);
	}

	const tokenPrice = Number(currentTokenPrice.value);
	const dividedValue = numericValue * tokenPrice;

	return formatNumberWithSuffix(dividedValue);
};

export const getDisplayValue = (value: string, network: string, currentTokenPrice: { isLoading: boolean; value: string }, unit: string): string => {
	if (currentTokenPrice.isLoading || isNaN(Number(currentTokenPrice.value))) {
		return `${getFormattedValue(value, network, currentTokenPrice)} ${unit}`;
	}
	return `$${getFormattedValue(value, network, currentTokenPrice)}`;
};

export function formatTrackName(str: string) {
	return str
		.split('_')
		.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
