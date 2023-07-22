// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<link rel="manifest" href="/manifest.json" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="#e5007a" />
				<meta name="apple-mobile-web-app-title" content="Polkassembly" />
				<link rel="apple-touch-icon" href="/apple-icon-57.png" sizes='57x57' />
				<link rel="apple-touch-icon" href="/apple-icon-60.png" sizes='60x60' />
				<link rel="apple-touch-icon" href="/apple-icon-72.png" sizes='72x72' />
				<link rel="apple-touch-icon" href="/apple-icon-76.png" sizes='76x76' />
				<link rel="apple-touch-icon" href="/apple-icon-114.png" sizes='114x114' />
				<link rel="apple-touch-icon" href="/apple-icon-120.png" sizes='120x120' />
				<link rel="apple-touch-icon" href="/apple-icon-144.png" sizes='144x144' />
				<link rel="apple-touch-icon" href="/apple-icon-152.png" sizes='152x152' />
				<link rel="apple-touch-icon" href="/apple-icon-180.png" sizes='180x180' />
				<meta name='msapplication-TileImage' content='/logo144.png'/>
				<meta name='msapplication-TileColor' content='#fff'/>
				<meta name='theme-color' content='#e5007a'/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
