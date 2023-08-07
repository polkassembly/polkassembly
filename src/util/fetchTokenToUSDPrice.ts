// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { coinGeckoNetworks } from "~src/global/coinGeckoNetworkMappings";

import formatUSDWithUnits from "./formatUSDWithUnits";

export default async function fetchTokenToUSDPrice(network: string) {
    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?" +
                new URLSearchParams({
                    ids: coinGeckoNetworks[network]
                        ? coinGeckoNetworks[network]
                        : network,
                    include_24hr_change: "true",
                    vs_currencies: "usd"
                })
        );
        const responseJSON = await response.json();
        if (
            Object.keys(
                responseJSON[
                    coinGeckoNetworks[network]
                        ? coinGeckoNetworks[network]
                        : network
                ] || {}
            ).length == 0
        ) {
            return "N/A";
        } else {
            return formatUSDWithUnits(
                responseJSON[
                    coinGeckoNetworks[network]
                        ? coinGeckoNetworks[network]
                        : network
                ]["usd"]
            );
        }
    } catch (error) {
        return "N/A";
    }
}
