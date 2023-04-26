// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col, Divider, Row } from 'antd';
import { GetServerSideProps } from 'next';
import React, { FC, useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import Account from '~src/components/Settings/Account';
import Delete from '~src/components/Settings/Delete';
import DemocracyUnlock from '~src/components/Settings/DemocracyUnlock';
import Profile from '~src/components/Settings/Profile';
import { useNetworkContext, useUserDetailsContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';
import useHandleMetaMask from '~src/hooks/useHandleMetaMask';

interface Props {
	network: string
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	return { props: { network } };
};

const Settings: FC<Props> = (props) => {
	const { setNetwork, network } = useNetworkContext();
	const { web3signup } = useUserDetailsContext();

	const metaMaskError = useHandleMetaMask();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead title='Settings' network={network}/>
			<Col className='w-full h-full'>
				<Row>
					<h3
						className='font-medium text-lg tracking-wide leading-7 text-sidebarBlue'
					>
						Settings
					</h3>
				</Row>
				<Row className='mt-6 w-full bg-white shadow-md p-8 rounded-md'>
					{!web3signup && <Profile />}
					<Divider />
					<Account />
					<Divider />
					{!metaMaskError && ['moonbase', 'moonriver', 'moonbeam'].includes(network) ? <><DemocracyUnlock/><Divider/></> : null}
					<Delete />
				</Row>
			</Col>
		</>
	);
};

export default Settings;