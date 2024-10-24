// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { subscanApiHeaders } from '~src/global/apiHeaders';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import dayjs from 'dayjs';
import { BN, BN_ZERO, u8aConcat, u8aToHex } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import formatBnBalance from '~src/util/formatBnBalance';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { IMonthlyTreasuryTally } from 'pages/api/v1/treasury-amount-history';

const BN_MILLION = new BN(10).pow(new BN(6));
const EMPTY_U8A_32 = new Uint8Array(32);

export const fetchTreasuryData = async () => {
	try {
		const { data, error } = await nextApiClientFetch('/api/v1/treasury-amount-history/old-treasury-data');
		if (error) {
			console.error('Error fetching data:', error);
		}
		return data || null;
	} catch (error) {
		console.error('Unexpected error:', error);
		return null;
	}
};

export const fetchDailyTreasuryData = async () => {
	try {
		const { data, error } = await nextApiClientFetch('/api/v1/treasury-amount-history/daily-treasury-tally');
		if (error) {
			console.error('Error fetching daily data:', error);
		}
		return data || null;
	} catch (error) {
		console.error('Unexpected error:', error);
		return null;
	}
};

export const fetchGraphData = async () => {
	try {
		const { data, error } = await nextApiClientFetch<IMonthlyTreasuryTally[]>('/api/v1/treasury-amount-history');
		if (error) {
			console.error('Error fetching graph data:', error);
		}
		return data || [];
	} catch (error) {
		console.error('Unexpected error:', error);
		return [];
	}
};

export const calculateTreasuryValues = async (api: any, network: string, currentTokenPrice: any, setAvailable: any, setNextBurn: any, setTokenValue: any) => {
	try {
		const treasuryAccount = u8aConcat('modl', api.consts.treasury?.palletId?.toU8a(true) || `${['polymesh', 'polymesh-test'].includes(network) ? 'pm' : 'pr'}/trsry`, EMPTY_U8A_32);

		const treasuryBalance = await api.derive.balances.account(u8aToHex(treasuryAccount));
		const res = await api.query.system.account(treasuryAccount);

		const freeBalance = new BN(res?.data?.free) || BN_ZERO;
		treasuryBalance.freeBalance = freeBalance;
		const burn =
			treasuryBalance.freeBalance.gt(BN_ZERO) && !api.consts.treasury.burn.isZero() ? api.consts.treasury.burn.mul(treasuryBalance.freeBalance).div(BN_MILLION) : BN_ZERO;

		let valueUSD = '';
		let value = '';

		if (burn) {
			const nextBurnValueUSD = parseFloat(formatBnBalance(burn.toString(), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: false }, network));
			if (nextBurnValueUSD && currentTokenPrice && currentTokenPrice.value) {
				valueUSD = formatUSDWithUnits((nextBurnValueUSD * Number(currentTokenPrice.value)).toString());
			}
			value = formatUSDWithUnits(formatBnBalance(burn.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network));
		}

		setNextBurn({
			isLoading: false,
			value,
			valueUSD
		});

		let availableValueUSD = '';
		let availableValue = '';

		const availableBalance = treasuryBalance.freeBalance;
		const availableBalanceUSD = parseFloat(formatBnBalance(availableBalance.toString(), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: false }, network));

		setTokenValue(availableBalanceUSD);

		if (availableBalanceUSD && currentTokenPrice.value !== 'N/A') {
			availableValueUSD = formatUSDWithUnits((availableBalanceUSD * Number(currentTokenPrice.value)).toString());
		}
		availableValue = formatUSDWithUnits(formatBnBalance(availableBalance.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network));

		setAvailable({
			isLoading: false,
			value: availableValue,
			valueUSD: availableValueUSD
		});
	} catch (error) {
		console.error('Error calculating treasury values:', error);
		setAvailable({ isLoading: false, value: '', valueUSD: '' });
		setNextBurn({ isLoading: false, value: '', valueUSD: '' });
	}
};

export const fetchWeekAgoTokenPrice = async (
	network: string,
	currentTokenPrice: { value: string },
	setPriceWeeklyChange: (value: { isLoading: boolean; value: string }) => void
) => {
	const weekAgoDate = dayjs().subtract(7, 'd').format('YYYY-MM-DD');
	try {
		const response = await fetch(`${chainProperties[network].externalLinks}/api/scan/price/history`, {
			body: JSON.stringify({ end: weekAgoDate, start: weekAgoDate }),
			headers: subscanApiHeaders,
			method: 'POST'
		});
		const responseJSON = await response.json();

		if (responseJSON.message === 'Success') {
			const weekAgoPrice = responseJSON.data?.list?.[0]?.price || responseJSON.data?.ema7_average;
			const currentPrice = parseFloat(currentTokenPrice.value);
			const weekAgoPriceNum = parseFloat(weekAgoPrice);

			if (weekAgoPriceNum === 0) {
				setPriceWeeklyChange({ isLoading: false, value: 'N/A' });
				return;
			}

			const percentChange = ((currentPrice - weekAgoPriceNum) / weekAgoPriceNum) * 100;
			setPriceWeeklyChange({ isLoading: false, value: percentChange.toFixed(2) });
			return;
		}
		setPriceWeeklyChange({ isLoading: false, value: 'N/A' });
	} catch (error) {
		setPriceWeeklyChange({ isLoading: false, value: 'N/A' });
	}
};
