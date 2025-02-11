// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from 'express-rate-limit';

const apiLimiter = rateLimit({
	legacyHeaders: false,
	max: 5, // 5 requests per window
	message: 'Too many requests, please try again later.',
	standardHeaders: true,
	windowMs: 15 * 60 * 1000 // 15 minutes
});

export const applyRateLimit = (req: NextApiRequest, res: NextApiResponse) =>
	new Promise((resolve, reject) => {
		// @ts-ignore - intentionally ignoring type mismatch
		apiLimiter(req, res, (result: any) => {
			if (result instanceof Error) {
				reject(result);
			}
			resolve(result);
		});
	});
