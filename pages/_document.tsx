// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
	return (
		<Html lang='en'>
			<Head />
			<body>
				<Main />
				<NextScript />

				<Script
					strategy='afterInteractive'
					src={'https://www.googletagmanager.com/gtag/js?id=GTM-MPZ9N2MW'}
				/>
				<Script
					id='ga-tracking'
					strategy='afterInteractive'
					dangerouslySetInnerHTML={{
						__html: `window.dataLayer = window.dataLayer || [];
						function gtag() {
						  window.dataLayer.push(arguments);
						}
						gtag('js', new Date());
						gtag('config', 'GTM-MPZ9N2MW');`
					}}
				/>
			</body>
		</Html>
	);
}
