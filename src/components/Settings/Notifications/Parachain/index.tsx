// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Checkbox, Collapse, Divider, Space } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ParachainNotification from '~assets/icons/parachain-notification-icon.svg';
import ImportIcon from '~assets/icons/import-icon.svg';
import NetworkTags from './NetworkTags';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkContext } from '~src/context';
import AddNetworkModal from './AddNetworkModal';

const { Panel } = Collapse;
type Props = {};

// eslint-disable-next-line no-empty-pattern
export default function Parachain({}: Props) {
	const { network } = useNetworkContext();
	const [selectedNetwork, setSelectedNetwork] = useState([]);
	const [openModal, setOpenModal] = useState(false);
	const handleModalConfirm = (networks: any) => {
		setSelectedNetwork(networks);
		setOpenModal(false);
	};
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
				key='1'
			>
				<Space size={[16, 16]} wrap>
					<NetworkTags
						icon={chainProperties[network].logo}
						name={network}
					/>
					{selectedNetwork.map(({ name }) =>
						name === network ? null : (
							<NetworkTags
								key={name}
								icon={chainProperties[name].logo}
								name={name}
							/>
						)
					)}
					<NetworkTags
						name={'Add Networks'}
						selected={false}
						onActionClick={() => setOpenModal(true)}
					/>
				</Space>
				<Divider className='border-[#D2D8E0] border-2' dashed />
				<div className='flex flex-col item-center gap-2'>
					<Checkbox value={false} className='text-pink_primary text-[16px] flex item-center'>Set as Primary Network Settings</Checkbox>
					<p className='flex item-center gap-2 text-pink_primary text-[16px]'><ImportIcon/> Import Primary Network Settings</p>
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

