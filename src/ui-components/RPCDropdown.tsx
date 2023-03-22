// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
import { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import React, { useEffect, useState } from 'react';
import { useApiContext, useNetworkContext } from '~src/context';
import { chainProperties } from '~src/global/networkConstants';
import { SignalTowerIcon } from './CustomIcons';
import Loader from './Loader';

interface Props {
	className?: string
	setSidebarHiddenFunc?: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PolkadotRPCEndpoints = [
	{
		display_label: 'via On-finality',
		endpoint: 'wss://polkadot.api.onfinality.io/public-ws'
	},
	{
		display_label: 'via Dwellir',
		endpoint: 'wss://polkadot-rpc.dwellir.com'
	},
	{
		display_label: 'via Parity',
		endpoint: 'wss://rpc.polkadot.io'
	},
	{
		display_label: 'via Pinknode',
		endpoint: 'wss://public-rpc.pinknode.io/polkadot'
	},
	{
		display_label: 'via IBP-GeoDNS1',
		endpoint: 'wss://rpc.ibp.network/polkadot'
	},
	{
		display_label: 'via IBP-GeoDNS2',
		endpoint: 'wss://rpc.dotters.network/polkadot'
	}

];

const KusamaRPCEndpoints = [
	{
		display_label: 'via On-finality',
		endpoint: 'wss://kusama.api.onfinality.io/public-ws'
	},
	{
		display_label: 'via Dwellir',
		endpoint: 'wss://kusama-rpc.dwellir.com'
	},
	{
		display_label: 'via Parity',
		endpoint: 'wss://kusama-rpc.polkadot.io'
	},
	{
		display_label: 'via IBP-GeoDNS1',
		endpoint: 'wss://rpc.ibp.network/kusama'
	},
	{
		display_label: 'via IBP-GeoDNS2',
		endpoint: 'wss://rpc.dotters.network/kusama'
	}
];

const RPCDropdown = ({ className }: Props) => {
	const { apiReady, setWsProvider } = useApiContext();
	const { network } = useNetworkContext();
	const [endpoint, setEndpoint] = useState<string>(network ? chainProperties?.[network]?.rpcEndpoint : '');
	const [RPCOptions, setRPCOptions] = useState<MenuProps['items']>([]);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [rpcEndpoints, setRPCEndpoints] = useState<{
		display_label: string;
		endpoint: string;
	}[]>(KusamaRPCEndpoints);

	useEffect(() => {
		let cancel = false;
		if(cancel) return;

		const items: MenuProps['items'] = [];

		rpcEndpoints.forEach((endpointData) => {
			const optionObj = {
				key: endpointData.endpoint,
				label: endpointData.display_label
			};

			items.push(optionObj);
		});

		setRPCOptions(items);

		return () => {
			cancel = true;
		};

	}, [rpcEndpoints]);

	useEffect(() => {
		if (network === 'kusama') {
			setRPCEndpoints(KusamaRPCEndpoints);
		} else if (network === 'polkadot') {
			setRPCEndpoints(PolkadotRPCEndpoints);
		}
	}, [network]);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const dropdownLabel = () => {
		let label = '';

		rpcEndpoints.some((endpointData) => {
			if(endpointData.endpoint == endpoint){
				label = `${endpointData.display_label?.substring(4, endpointData.display_label.length)}`;
				return true;
			}
		});

		return <span className='min-w-[75px]'>{label}</span>;
	};

	const handleEndpointChange: MenuProps['onClick'] = ({ key }) => {
		if(endpoint == `${key}`) return;
		setEndpoint(`${key}`);
		setWsProvider(`${key}`);
	};

	return (
		apiReady ?
			<Dropdown
				trigger={['click']}
				menu={{ defaultSelectedKeys: [endpoint], items: RPCOptions, onClick: handleEndpointChange, selectable: true }}
				className={className}
			>
				<span className='flex items-center justify-center border border-solid border-[#D2D8E0] rounded-[2px] md:rounded-[4px] cursor-pointer bg-[rgba(210,216,224,0.2)] p-1 md:p-[8.5px]'>
					<SignalTowerIcon className='text-xs md:text-sm m-0 p-0' />
				</span>
			</Dropdown> :
			<Loader />
	);
};

export default RPCDropdown;
