// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Checkbox, Collapse, Divider, Space } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ParachainNotification from '~assets/icons/parachain-notification-icon.svg';
import ImportIcon from '~assets/icons/import-icon.svg';
import DisabledImportIcon from '~assets/icons/disabled-state-import-icon.svg';
import NetworkTags from './NetworkTags';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkContext } from '~src/context';
import AddNetworkModal from './AddNetworkModal';

const { Panel } = Collapse;
type Props = {
    primaryNetwork: string;
    onSetPrimaryNetwork: any;
    onSetNetworkPreferences: any;
    onCopyPrimaryNetworkNotification: any;
};

// eslint-disable-next-line no-empty-pattern
export default function Parachain({
	primaryNetwork,
	onSetPrimaryNetwork,
	onSetNetworkPreferences,
	onCopyPrimaryNetworkNotification
}: Props) {
	const { network } = useNetworkContext();
	const [selectedNetwork, setSelectedNetwork] = useState([
		{ name: network, selected: true }
	]);
	const [primaryNetworkCheck, setPrimaryNetworkCheck] = useState(
		primaryNetwork ? true : false
	);
	const [openModal, setOpenModal] = useState(false);
	const handleModalConfirm = (networks: any) => {
		setSelectedNetwork(networks);
		setOpenModal(false);
		onSetNetworkPreferences(networks.map((net: any) => net.name));
	};

	const handlePrimaryNetworkChange = () => {
		if (!primaryNetworkCheck) {
			onSetPrimaryNetwork(network);
			setPrimaryNetworkCheck(!primaryNetworkCheck);
		}
	};

	useEffect(() => {
		setPrimaryNetworkCheck(primaryNetwork === network ? true : false);
	}, [primaryNetwork, network]);

	return (
		<Collapse
			className='bg-white'
			size='large'
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				return isActive ? <CollapseIcon /> : <ExpandIcon />;
			}}
		>
			<Panel
				header={
					<div className='flex items-center gap-[8px]'>
						<ParachainNotification />
						<h3 className='font-semibold text-xl tracking-wide leading-7 text-sidebarBlue mb-0'>
                            Parachains
						</h3>
					</div>
				}
				key='2'
			>
				<Space size={[16, 16]} wrap>
					<NetworkTags
						icon={chainProperties[network].logo}
						name={network}
					/>
					{selectedNetwork
						.filter(({ name }) => name !== network)
						.map(({ name }) => (
							<NetworkTags
								key={name}
								icon={chainProperties[name].logo}
								name={name}
							/>
						))}
					<NetworkTags
						name={'Add Networks'}
						selected={false}
						onActionClick={() => setOpenModal(true)}
					/>
				</Space>
				<Divider className='border-[#D2D8E0] border-2' dashed />
				<div className='flex flex-col item-center gap-2'>
					<Checkbox
						value={false}
						onChange={handlePrimaryNetworkChange}
						checked={primaryNetworkCheck}
						className='text-pink_primary text-[16px] flex item-center'
					>
                        Set as Primary Network Settings
					</Checkbox>
					<p
						className={`flex item-center gap-2 text-[16px] ${
							primaryNetwork
								? 'text-pink_primary'
								: 'text-[#96A4B6] cursor-not-allowed'
						}`}
						onClick={() => {
							if (!primaryNetwork) {
								return;
							}
							onCopyPrimaryNetworkNotification(
								selectedNetwork.map((net) => net.name)
							);
						}}
					>
						{primaryNetwork ? (
							<ImportIcon />
						) : (
							<DisabledImportIcon />
						)}{' '}
                        Importing Primary Network Settings to the networks
                        selected above
					</p>
				</div>
			</Panel>
			<AddNetworkModal
				open={openModal}
				onConfirm={handleModalConfirm}
				onCancel={() => setOpenModal(false)}
			/>
		</Collapse>
	);
}
