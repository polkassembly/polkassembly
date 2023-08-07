// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export const FIREBASE_FUNCTIONS_URL =
    "https://us-central1-polkasafe-a8042.cloudfunctions.net";

const NOTIFICATION_ENGINE_API_KEY = "47c058d8-2ddc-421e-aeb5-e2aa99001949";

export const firebaseFunctionsHeader = (network: string) => ({
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-api-key": NOTIFICATION_ENGINE_API_KEY,
    "x-network": network,
    "x-source": "polkassembly"
});
