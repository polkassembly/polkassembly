// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { REACT_APP_SUBSCAN_API_KEY } from './apiKeys';

export const subscanApiHeaders = {
	Accept: 'application/json',
	'Content-Type': 'application/json',
	'X-API-Key': REACT_APP_SUBSCAN_API_KEY || ''
};

export const subsquidApiHeaders = {
	'Accept': 'application/json, multipart/mixed',
	'Sec-Fetch-Dest': 'empty',
	'Sec-Fetch-Mode': 'cors',
	'Sec-Fetch-Site': 'same-origin',
	'content-type': 'application/json'
};