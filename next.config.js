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
							"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.tinymce.com *.tiny.cloud *.google-analytics.com *.googletagmanager.com *.twitter.com platform.twitter.com syndication.twitter.com *.bmcdn6.com; worker-src 'self' blob:; connect-src 'self' *.bmcdn6.com *.tinymce.com *.tiny.cloud *.imgbb.com *.giphy.com api.giphy.com blob: wss://*.polkadot.io wss://*.onfinality.io wss://*.dwellir.com wss://*.pinknode.io wss://*.ibp.network wss://*.dotters.network wss://*.radiumblock.co wss://*.luckyfriday.io wss://*.subsquid.io wss://*.squids.live wss://*.stakeworld.io wss://*.composablenodes.tech wss://*.hydradx.cloud wss://*.helikon.io wss://*.paras.ibp.network wss://*.subscan.io https://*.subscan.io https://*.squids.live https://*.subsquid.io https://*.google-analytics.com https://*.googletagmanager.com https://*.polkassembly.io https://*.subsquid.io/graphql https://squid.subsquid.io/*/graphql https://*.algolia.net https://*.algolianet.com https://api.firebase.google.com https://*.walletconnect.org https://*.walletconnect.com wss://*.walletconnect.org wss://*.walletconnect.com https://*.coingecko.com api.coingecko.com https://api.github.com https://vitals.vercel-insights.com wss://*.aca-api.network wss://*.acala-rpc.dwellir.com wss://*.acuity.social wss://*.api.integritee.network wss://*.api.phala.network wss://*.astar.network wss://*.basilisk.cloud wss://*.bldnodes.org wss://*.blockops.network wss://*.calamari.systems wss://*.centrifuge.io wss://*.cere.network wss://*.composable.finance wss://*.crustapps.net wss://*.curioinvest.com wss://*.frequency.xyz wss://*.gear-tech.io wss://*.genshiro.io wss://*.gmordie.com wss://*.hashed.live wss://*.hashed.network wss://*.icenetwork.io wss://*.kilt.io wss://*.kylin-node.co.uk wss://*.laosfoundation.io wss://*.mandalachain.io wss://*.moonbeam.network wss://*.myriad.social wss://*.mythos.foundation wss://*.oak.tech wss://*.octopus.network wss://*.parallel.fi wss://*.pendulumchain.tech wss://*.phala.network wss://*.picasso.composable.finance wss://*.polimec.org wss://*.polymesh.live wss://*.polymesh.network wss://*.robonomics.network wss://*.terrabiodao.org wss://*.tidefi.io wss://*.vara-network.io wss://*.xx.network wss://*.zeitgeist.pm https://*.explorer.polimec.org https://*.polkassembly-hasura.herokuapp.com https://*.hashed.live https://*.explorer.xx.network https://*.polymesh.live wss://1rpc.io wss://*.public.blastapi.io wss://*.rpc.amforc.com wss://*.dolphin.engineering wss://*.unitedbloc.com wss://*.datahighway.com wss://*.vara.network wss://calamari.systems wss://rpc-shadow.crust.network wss://pichiu-rococo-01.onebitdev.com; img-src 'self' * data: blob: upload:; style-src 'self' 'unsafe-inline' *.tinymce.com *.tiny.cloud abs.twimg.com platform.twitter.com fonts.googleapis.com; frame-src 'self' *.twitter.com platform.twitter.com syndication.twitter.com *.walletconnect.org *.walletconnect.com *.google.com; font-src 'self' *.tinymce.com *.tiny.cloud data: fonts.gstatic.com; media-src 'self' * blob:;"
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
	transpilePackages: ['@mdxeditor/editor'],
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
		config.experiments = { ...config.experiments, topLevelAwait: true };
		return config;
	}
};

module.exports = nextConfig;
