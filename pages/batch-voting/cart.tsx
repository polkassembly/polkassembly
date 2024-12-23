// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { message, Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import ImageIcon from '~src/ui-components/ImageIcon';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import copyToClipboard from '~src/util/copyToClipboard';
import CopyContentIcon from '~assets/icons/content_copy_small.svg';
import CopyContentIconWhite from '~assets/icons/content_copy_small_white.svg';

const VoteCart = dynamic(() => import('~src/components/TinderStyleVoting/VoteCart'), {
	loading: () => <Skeleton active />,
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const CouncilBoard = (props: { network: string }) => {
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const { asPath } = useRouter();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleCopylink = () => {
		const url = `https://${props.network}.polkassembly.io${asPath.split('#')[0]}`;

		copyToClipboard(url);

		message.success('Link copied to clipboard');
	};

	return (
		<>
			<SEOHead
				title='Votes Cart'
				network={props.network}
			/>
			{props?.network === 'polkadot' && (
				<div className='batch-voting-mobile-container block sm:hidden'>
					<VoteCart />
				</div>
			)}
			<div className='batch-voting-desktop-container hidden sm:block'>
				<h1 className='text-center text-2xl font-semibold text-bodyBlue dark:text-blue-dark-high'>Cart Page</h1>
				<div className='mt-12 flex flex-col items-center justify-center'>
					<ImageIcon
						src='/assets/icons/delegation-empty-state.svg'
						alt='delegation empty state icon'
					/>
					<p className='mt-6 text-center text-base text-bodyBlue dark:text-blue-dark-high'>
						{props?.network === ' polkadot' ? 'Please visit Batch Voting Page from your Mobile Device' : 'Feature is currently active only for polkadot network'}
					</p>
					<button
						className='mt-5 flex items-center justify-center rounded-full border border-solid border-section-light-container bg-transparent px-3.5 py-1.5 text-bodyBlue dark:border-[#3B444F] dark:text-blue-dark-high'
						onClick={() => {
							handleCopylink();
						}}
					>
						Copy Page Link <span className='ml-1'>{theme === 'dark' ? <CopyContentIconWhite /> : <CopyContentIcon />}</span>
					</button>
				</div>
			</div>
		</>
	);
};

export default CouncilBoard;
