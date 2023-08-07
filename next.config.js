// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { withSentryConfig } = require("@sentry/nextjs");

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
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,OPTIONS,PATCH,DELETE,POST,PUT"
                    },
                    { key: "Access-Control-Allow-Headers", value: "*" },
                    { key: "X-Frame-Options", value: "SAMEORIGIN" },
                    {
                        key: "Content-Security-Policy",
                        value: `default-src 'self'; img-src '*'`
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
                    source: "/:path*",
                    destination: "http://kusama-old.polkassembly.io/:path*",
                    has: [
                        {
                            type: "host",
                            value: "kusama.polkassembly.io"
                        }
                    ]
                },
                {
                    source: "/:path*",
                    destination: "http://polkadot-old.polkassembly.io/:path*",
                    has: [
                        {
                            type: "host",
                            value: "polkadot.polkassembly.io"
                        }
                    ]
                }
            ]
        };
    },
    images: {
        domains: ["parachains.info"]
    },
    reactStrictMode: true,
    compiler: {
        styledComponents: true
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        });

        return config;
    }
};

module.exports = nextConfig;

module.exports = withSentryConfig(
    module.exports,
    { silent: true },
    { hideSourcemaps: true }
);
