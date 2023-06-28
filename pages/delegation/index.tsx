// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import React, { useEffect } from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import DelegationDashboard from '~src/components/DelegationDashboard';
import DelegationDashboardEmptyState from '~assets/icons/delegation-empty-state.svg';
import CopyContentIcon from '~assets/icons/content-copy.svg';
import copyToClipboard from 'src/util/copyToClipboard';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/types';
import { message } from 'antd';
import { useNetworkContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	return { props: { network } };
};

const Delegation = ( props : { network: string } ) => {

	const { setNetwork } = useNetworkContext();
	const { asPath } = useRouter();
	const handleClick = () => {
		message.success('Request submitted successfully');
	};

	const handleCopylink = () => {
		const url = `https://${props.network}.polkassembly.io${asPath.split('#')[0]}`;

		copyToClipboard(url);

		queueNotification({
			header: 'Copied!',
			message: 'Comment link copied to clipboard.',
			status: NotificationStatus.INFO
		});
	};

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <>
		<SEOHead title='Delegation Dashboard' network={props.network} />
		<div className='hidden sm:flex'><DelegationDashboard/></div>
		<div className='flex sm:hidden items-center justify-center flex-col mt-10 w-full'>
			<DelegationDashboardEmptyState className='w-[100%] sm:w-64 mr-[-14px]' viewBox='0 0 350 350'/>
			<button className='text-[#E5007A] outline-none border border-pink_primary border-solid rounded-md px-6 py-3 mt-[-15px] flex items-center justify-center' onClick={handleClick}>Request Mobile View</button>
			<div className='mt-[64px] px-4 py-1 rounded-full border border-[#D2D8E0] border-solid flex justify-center items-center' onClick={() => {handleCopylink();}}>Copy Page Link <CopyContentIcon className='ml-1'/></div>
		</div>
	</>;
};

export default Delegation ;