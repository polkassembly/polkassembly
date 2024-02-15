// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// of the Apache-2.0 license. See the LICENSE file for details.
import { NOTIFICATION_ENGINE_API_KEY } from '~src/util/notification_engine_constants';
export const FIREBASE_FUNCTIONS_URL = 'https://us-central1-polkasafe-a8042.cloudfunctions.net';

export const firebaseFunctionsHeader = (network: string) => ({
	Accept: 'application/json',
	'Content-Type': 'application/json',
	'x-api-key': NOTIFICATION_ENGINE_API_KEY,
	'x-network': network,
	'x-source': 'polkassembly'
});
