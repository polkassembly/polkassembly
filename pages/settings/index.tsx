// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col, Tabs } from 'antd';
import { GetServerSideProps } from 'next';
import React, { FC, useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import Notifications from '~src/components/Settings/Notifications';
import UserAccount from '~src/components/Settings/UserAccount';
import { useNetworkContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';
import Tracker from '~src/components/Tracker/Tracker';

interface Props {
	network: string
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	return { props: { network } };
};

const tabItems = [
	{ children:<UserAccount/> , key:'Account', label:'Account' },
	{ children:<Notifications/> , key:'Notifications', label:'Notifications' },
	{ children:<Tracker />, key:'Activity', label:'Tracker' }
];

const Settings: FC<Props> = (props) => {
	const { setNetwork, network } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead title='Settings' network={network}/>
			<Col className='w-full h-full'>
				<div className='mt-6 w-full bg-white shadow-md p-8 rounded-md'>
					<h3
						className='font-semibold text-xl tracking-wide leading-7 text-sidebarBlue'
					>
						Settings
					</h3>
					<Tabs
						className='ant-tabs-tab-bg-white text-sidebarBlue font-medium'
						type="card"
						defaultActiveKey='Notification'
						items={tabItems}
					/>
				</div>
			</Col>
		</>
	);
};

export default Settings;