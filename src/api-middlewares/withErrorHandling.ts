// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';

import messages from '~src/util/messages';
import * as Sentry from '@sentry/browser';

type TWithErrorHandling = (handler: NextApiHandler) => NextApiHandler;

const withErrorHandling: TWithErrorHandling = (handler) => {
	return async (req, res) => {
		// CORS preflight request
		if (req.method === 'OPTIONS') return res.status(200).end();

		try {
			await handler(req, res);
		} catch (error) {
			// console log needed for logging on server
			console.log('Error in API : ', error);
			Sentry.captureException(error);
			res.status(Number(error.name) || 500).json({
				...error,
				message: error.message || messages.API_FETCH_ERROR,
			});
		}
	};
};

export default withErrorHandling;
