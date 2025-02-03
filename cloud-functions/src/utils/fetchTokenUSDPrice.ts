import axios from 'axios';

function formatUSDWithUnits(usd: String, numberAfterDot?: number) {
	const toFixed = numberAfterDot && !isNaN(Number(numberAfterDot)) ? numberAfterDot : 2;
	let newUsd = usd;
	let suffix = '';
	if (typeof usd === 'string') {
		const arr = usd.split(' ');
		if (arr.length > 1) {
			newUsd = arr[0];
			suffix = ` ${arr[1]}`;
		}
	}
	// Nine Zeroes for Billions
	const formattedUSD =
		Math.abs(Number(newUsd)) >= 1.0e9
			? (Math.abs(Number(newUsd)) / 1.0e9).toFixed(toFixed) + 'B'
			: // Six Zeroes for Millions
			Math.abs(Number(newUsd)) >= 1.0e6
			? (Math.abs(Number(newUsd)) / 1.0e6).toFixed(toFixed) + 'M'
			: // Three Zeroes for Thousands
			Math.abs(Number(newUsd)) >= 1.0e3
			? (Math.abs(Number(newUsd)) / 1.0e3).toFixed(toFixed) + 'K'
			: Math.abs(Number(newUsd)).toFixed(toFixed);

	return formattedUSD.toString() + suffix;
}

export default async function fetchTokenUSDPrice(networkOrAsset: string) {
	try {
		const coinId = networkOrAsset;

		const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
			params: {
				ids: coinId,
				include_24hr_change: 'true',
				vs_currencies: 'usd'
			}
		});

		const responseData = response.data;

		if (!responseData[coinId] || !responseData[coinId]['usd']) {
			return 'N/A';
		}

		return formatUSDWithUnits(String(responseData[coinId]['usd']));
	} catch (error) {
		console.error(`Error fetching price for ${networkOrAsset}:`, error);
		return 'N/A';
	}
}
