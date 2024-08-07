// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
	dsn: 'https://379482f625f7415a7d9144edfc3d3d1d@o4505085255942144.ingest.us.sentry.io/4507738363068416',

	// Adjust this value in production, or use tracesSampler for greater control
	tracesSampleRate: 1,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false
});
