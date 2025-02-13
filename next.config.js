// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable indent */
/* eslint-disable sort-keys */

/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				// matching all v1 API routes
				source: '/api/:path*',
				headers: [
					{ key: 'Access-Control-Allow-Credentials', value: 'true' },
					{ key: 'Access-Control-Allow-Origin', value: '*' },
					{ key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
					{ key: 'Access-Control-Allow-Headers', value: '*' },
					{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
					{ key: 'X-XSS-Protection', value: '1; mode=block' },
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'Content-Security-Policy', value: "default-src 'self'; img-src '*' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" },
					{ key: 'Cache-Control', value: 's-maxage=60, stale-while-revalidate=59' }
				]
			},
			{
				// Add security headers for all other routes
				source: '/:path*',
				headers: [
					{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
					{ key: 'X-XSS-Protection', value: '1; mode=block' },
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{
						key: 'Content-Security-Policy',
						value:
							"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.tinymce.com *.tiny.cloud *.google-analytics.com *.googletagmanager.com *.twitter.com platform.twitter.com syndication.twitter.com; worker-src 'self' blob:; connect-src 'self' *.tinymce.com *.tiny.cloud *.imgbb.com *.giphy.com api.giphy.com blob: wss://*.polkadot.io wss://*.onfinality.io wss://*.dwellir.com wss://*.pinknode.io wss://*.ibp.network wss://*.dotters.network wss://*.radiumblock.co wss://*.luckyfriday.io wss://*.subsquid.io wss://*.squids.live wss://*.stakeworld.io wss://*.composablenodes.tech wss://*.hydradx.cloud wss://*.helikon.io wss://*.paras.ibp.network wss://*.subscan.io https://*.subscan.io https://*.squids.live https://*.subsquid.io https://*.google-analytics.com https://*.googletagmanager.com https://*.polkassembly.io https://*.subsquid.io/graphql https://squid.subsquid.io/*/graphql https://*.algolia.net https://*.algolianet.com https://api.firebase.google.com https://*.walletconnect.org https://*.walletconnect.com wss://*.walletconnect.org wss://*.walletconnect.com https://*.coingecko.com api.coingecko.com https://api.github.com https://vitals.vercel-insights.com https://infragrid.v.network; img-src 'self' * data: blob:; style-src 'self' 'unsafe-inline' *.tinymce.com *.tiny.cloud abs.twimg.com platform.twitter.com fonts.googleapis.com; frame-src 'self' *.twitter.com platform.twitter.com syndication.twitter.com *.walletconnect.org *.walletconnect.com *.google.com; font-src 'self' *.tinymce.com *.tiny.cloud data: fonts.gstatic.com; media-src 'self' * blob:;"
					}
				]
			}
		];
	},
	async rewrites() {
		return {
			fallback: [
				// These rewrites are checked after both pages/public files
				// and dynamic routes are checked
				{
					source: '/:path*',
					destination: 'http://kusama-old.polkassembly.io/:path*',
					has: [
						{
							type: 'host',
							value: 'kusama.polkassembly.io'
						}
					]
				},
				{
					source: '/:path*',
					destination: 'http://polkadot-old.polkassembly.io/:path*',
					has: [
						{
							type: 'host',
							value: 'polkadot.polkassembly.io'
						}
					]
				}
			]
		};
	},
	images: {
		domains: ['parachains.info']
	},
	reactStrictMode: true,
	compiler: {
		styledComponents: true
	},
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			use: ['@svgr/webpack']
		});

		return config;
	}
};

module.exports = nextConfig;

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(module.exports, {
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options

	org: 'polkassembly-oo',
	project: 'polkassembly-nextjs',

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Automatically annotate React components to show their full name in breadcrumbs and session replay
	reactComponentAnnotation: {
		enabled: true
	},

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: '/monitoring',

	// Hides source maps from generated client bundles
	hideSourceMaps: true,

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,

	// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
	// See the following for more information:
	// https://docs.sentry.io/product/crons/
	// https://vercel.com/docs/cron-jobs
	automaticVercelMonitors: true
});
