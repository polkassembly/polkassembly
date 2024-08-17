// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default async function fetchTokenValueHistory(tokenId = 'polkadot') {
	try {
		const currentDate = new Date();
		const usdValues = [];

		for (let i = 0; i < 12; i++) {
			const secondDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 2);
			const formattedDate = `${secondDayOfMonth.getDate().toString().padStart(2, '0')}-${(secondDayOfMonth.getMonth() + 1)
				.toString()
				.padStart(2, '0')}-${secondDayOfMonth.getFullYear()}`;

			const response = await fetch(`https://api.coingecko.com/api/v3/coins/${tokenId}/history?date=${formattedDate}`);
			const responseJSON = await response.json();
			console.log(responseJSON);

			const usdValue = responseJSON?.market_data?.current_price?.usd || 'Data not available';
			usdValues.push({ date: formattedDate, usdValue });
		}
		console.log('usdValues', usdValues);

		return usdValues;
	} catch (error) {
		console.error('Error fetching data:', error);
		return 'N/A';
	}
}
