// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState, useEffect, FC } from 'react';
import { Helmet } from 'react-helmet';

const ClientOnly: FC<any> = ({ children }) => {
	const [hasMounted, setHasMounted] = useState(false);
	useEffect(() => {
		setHasMounted(true);
	}, []);
	if (!hasMounted) {
		return null;
	}
	return <> {children} </>;
};
export default ClientOnly;

const Search: FC<{ network: string }> = (props) => {
	const { network } = props;
	return (
		<>
			<Helmet>
				<script
					async
					src='https://cse.google.com/cse.js?cx=27ceb2d02ebf44c39'
				></script>
			</Helmet>
<<<<<<< HEAD
			<div className="gcse-search" data-as_sitesearch={ ['moonbase', 'moonbeam', 'moonriver', 'kilt'].includes(network) ? `${network}.polkassembly.network` : `${network}.polkassembly.io` }></div>
			<div className='text-sm font-medium text-blue-light-high dark:text-blue-dark-high pt-4 pb-2 text-center'> If you&apos;d like to enable search and super search for your chain, please reach out to us on <a className='text-pink_primary' href="mailto:hello@polkassembly.io">hello@polkassembly.io</a></div>
=======
			<div
				className='gcse-search'
				data-as_sitesearch={['moonbase', 'moonbeam', 'moonriver', 'kilt'].includes(network) ? `${network}.polkassembly.network` : `${network}.polkassembly.io`}
			></div>
			<div className='pb-2 pt-4 text-center text-sm font-medium text-bodyBlue'>
				{' '}
				If you&apos;d like to enable search and super search for your chain, please reach out to us on{' '}
				<a
					className='text-pink_primary'
					href='mailto:hello@polkassembly.io'
				>
					hello@polkassembly.io
				</a>
			</div>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
		</>
	);
};
export { Search };
