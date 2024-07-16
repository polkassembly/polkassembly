// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang='en'>
			<Head />
			<link
				href='https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap'
				rel='stylesheet'
			/>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
