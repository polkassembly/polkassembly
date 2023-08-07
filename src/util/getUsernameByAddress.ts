// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IGetProfileWithAddressResponse } from "pages/api/v1/auth/data/profileWithAddress";
import getSubstrateAddress from "./getSubstrateAddress";
import nextApiClientFetch from "./nextApiClientFetch";

export default async function getUsernameByAddress(address: string) {
    const substrateAddress = getSubstrateAddress(address);
    if (!substrateAddress) return null;

    const { data, error } =
        await nextApiClientFetch<IGetProfileWithAddressResponse>(
            `api/v1/auth/data/profileWithAddress?address=${substrateAddress}`
        );
    if (error || !data || !data.username) return null;

    return data.username || null;
}
