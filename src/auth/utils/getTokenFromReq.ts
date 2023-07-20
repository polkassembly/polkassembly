// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest } from 'next';

import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

/**
 * Get Token from request
 */
export default function getTokenFromReq(req: NextApiRequest): string {
	// Authorization header is of format:
	// Authorization: Bearer $asdnkjadj32j23kj@#adslkads
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		throw apiErrorWithStatusCode('Authorization header missing', 400);
	}

	const token = `${authHeader}`.split(' ')[1];

	if (!token) {
		throw apiErrorWithStatusCode('Token missing', 400);
	}

	return token;
}
