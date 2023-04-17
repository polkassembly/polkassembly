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

const imageMapper:any= {
	acala:{ large:'acala.png',
		small:'acala-small.png' },
	equilibrium:{ large:'equilibrium.png',
		small:'equilibrium-small.png ' },
	frequency:{ large:'frequency.png ',
		small:'frequency-small.png ' },
	kilt:{ large:'kilt.png',
		small:'kilt-small.png' },
	kusama:{ large:'kusama.png',
		small:'kusama-small.png' },
	moonbase:{ large:'moonbase.png ',
		small:'moonbase-small.png' },
	moonbeam:{ large:'moonbeam.png ',
		small:'moonbeam-small.png ' },
	moonriver:{ large:'moonriver.png ',
		small:'moonriver-small.png' },
	network:{ large:'network.png ',
		small:'network-small.png' },
	picasso:{ large:'picasso.png',
		small:'picasso-small.png' },
	polkadex:{ large:'polkadex.png',
		small:'polkadex-small.png' },
	polkadot:{ large:'polkadot.png',
		small:'polkadot-small.png' },
	polkassembly:{ large:'polkassembly.png',
		small:'polkassembly-small.png' },
	polymesh:{ large:'polymesh.png',
		small:'polymesh-small.png' },
	robonomics:{ large:'robonomics.png',
		small:'robonomics-small.png' },
	turing:{ large:'turing.png',
		small:'turing-small.png' }
};

const SEOHead = ({ title, desc } : Props) => {
	const { network } = useContext(NetworkContext);

	// need these consts because : https://github.com/vercel/next.js/discussions/38256
	const descString = sanitizeMarkdown(desc) || `Polkassembly, discussion platform for ${network} governance`;
	const titleString = `${title} | Polkassembly`;
	const image = imageMapper?.[network]?.large || 'polkassembly.png';
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
			<meta property="og:image" content={`/assets/images/${image}`} />
			<link rel="apple-touch-icon" href="/logo192.png" />
		</Head>
	);
};

export default SEOHead;