// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { LeftOutlined } from '@ant-design/icons';
import SEOHead from '~src/global/SEOHead';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';

const CuratorDashboard = dynamic(() => import('src/components/CuratorDashboard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface ICuratorProfileProps {
	network: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const network = getNetworkFromReqHeaders(context.req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	if (network != 'polkadot') {
		return {
			props: {},
			redirect: {
				destination: isOpenGovSupported(network) ? '/opengov' : '/'
			}
		};
	}
	return {
		props: {
			network
		}
	};
};

const CuratorDashboardMain: FC<ICuratorProfileProps> = (props) => {
	const dispatch = useDispatch();
	const { network } = props;

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<div>
			<SEOHead
				title='Curator Dashboard'
				desc='Discover and participate in treasury-funded bounties on Polkassembly, where members can propose and work on projects to improve the governance and growth of our community.'
				network={network}
			/>
			<Link
				className='inline-flex items-center pt-3 text-sidebarBlue hover:text-pink_primary dark:text-white'
				href='/bounty-dashboard'
			>
				<div className='flex items-center'>
					<LeftOutlined className='mr-2 text-xs' />
					<span className='text-sm font-medium'>
						Back to <span className='capitalize'> Bounty Dashboard</span>
					</span>
				</div>
			</Link>
			<CuratorDashboard className='w-full' />
		</div>
	);
};

export default CuratorDashboardMain;
