// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import copyToClipboard from '~src/util/copyToClipboard';
import CopyContentIcon from '~assets/icons/content_copy_small.svg';
import CopyContentIconWhite from '~assets/icons/content_copy_small_white.svg';
import { useTheme } from 'next-themes';
import { GetServerSideProps } from 'next';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { message } from 'antd';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const props = { network: network };

	return { props };
};

const Voting = (props: { network: string }) => {
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useDispatch();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const router = useRouter();
	const [previousPath, setPreviousPath] = useState<string | null>(null);
	const [referendaId, setReferendaId] = useState<string | null>(null);

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (document.referrer) {
			const referrerUrl = new URL(document.referrer);
			if (referrerUrl.pathname) {
				setPreviousPath(referrerUrl.pathname);

				const match = referrerUrl.pathname.match(/\/referenda\/(\d+)/);
				if (match) {
					setReferendaId(match[1]);
				}
			}
		}
	}, []);

	const handleCopylink = () => {
		const url = previousPath ? `https://${props.network}.polkassembly.io/${previousPath}` : `https://${props.network}.polkassembly.io/`;
		copyToClipboard(url);
		message.success('Link copied to clipboard');
	};
	return (
		<div className='w-full'>
			<h1 className='text-center text-2xl font-semibold text-bodyBlue dark:text-blue-dark-high'>Cast Your Vote</h1>
			<div className='mb-4 mt-8 flex flex-col items-center justify-center'>
				<ImageIcon
					src='/assets/icons/delegation-empty-state.svg'
					alt='delegation empty state icon'
				/>
				<p className='mt-6 text-center text-base text-bodyBlue dark:text-blue-dark-high'>
					Please visit Proposal {referendaId ? `#${referendaId}` : 'page'} from your Desktop computer
				</p>
				<button
					className='mt-5 flex items-center justify-center rounded-full border border-solid border-[#D2D8E0] bg-transparent px-3.5 py-1.5 text-bodyBlue dark:border-[#3B444F] dark:text-blue-dark-high'
					onClick={() => {
						handleCopylink();
					}}
				>
					Copy Page Link <span className='ml-1'>{theme === 'dark' ? <CopyContentIconWhite /> : <CopyContentIcon />}</span>
				</button>
			</div>
		</div>
	);
};

export default Voting;
