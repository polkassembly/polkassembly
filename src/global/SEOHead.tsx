// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Head from 'next/head';
import React, { useContext } from 'react';

import { NetworkContext } from '~src/context/NetworkContext';
import sanitizeMarkdown from '~src/util/sanitizeMarkdown';

interface Props {
	title: string;
	desc?: string;
}

const SEOHead = ({ title, desc } : Props) => {
	const { network } = useContext(NetworkContext);

	// need these consts because : https://github.com/vercel/next.js/discussions/38256
	const descString = sanitizeMarkdown(desc) || `Polkassembly, discussion platform for ${network} governance`;
	const titleString = `${title} | Polkassembly`;

	return (
		<Head>
			<meta charSet="utf-8" />
			<title>{titleString}</title>
			<meta name="description" content={descString} />
			<link rel="icon" href="/favicon.ico" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<meta name="theme-color" content="#E5007A" />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={descString} />
			<meta property="og:type" content="website" />
			<meta property="og:image" content="https://polkassembly.io/images/polkassembly.png" />
			<link rel="apple-touch-icon" href="/logo192.png" />
		</Head>
	);
};

export default SEOHead;