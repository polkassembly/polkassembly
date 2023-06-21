// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Checkbox, Divider, Space } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ParachainNotification from '~assets/icons/parachain-notification-icon.svg';
import ImportIcon from '~assets/icons/import-icon.svg';
import DisabledImportIcon from '~assets/icons/disabled-state-import-icon.svg';
import NetworkTags from './NetworkTags';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkContext } from '~src/context';
import AddNetworkModal from './AddNetworkModal';
import ImportPrimaryNetworkSettingModal from './ImportPrinaryBetwork';
import SetPrimaryNetworkSettingModal from './PrimaryNetworkConfirmModal';
import { ISelectedNetwork } from '../types';
import Image from 'next/image';
import { Collapse } from '../common-ui/Collapse';

const { Panel } = Collapse;
type Props = {
	primaryNetwork: string;
	onSetPrimaryNetwork: (network: string) => Promise<void>;
	onSetNetworkPreferences: (networks: Array<string>) => Promise<void>;
	onCopyPrimaryNetworkNotification: (
		selectedNetwork: Array<string>
	) => Promise<void>;
	selectedNetwork: ISelectedNetwork;
	setSelectedNetwork: React.Dispatch<React.SetStateAction<ISelectedNetwork>>;
};

// eslint-disable-next-line no-empty-pattern
export default function Parachain({
	primaryNetwork,
	onSetPrimaryNetwork,
	onSetNetworkPreferences,
	onCopyPrimaryNetworkNotification,
	selectedNetwork,
	setSelectedNetwork
}: Props) {
	const { network } = useNetworkContext();
	const [openModal, setOpenModal] = useState(false);
	const [active, setActive] = useState<boolean | undefined>(false);
	const handleModalConfirm = (networks: ISelectedNetwork) => {
		setSelectedNetwork(networks);
		setOpenModal(false);
		onSetNetworkPreferences(
			Object.values(networks)
				.flatMap((chain) => chain)
				.filter((net: any) => net.selected)
				.map((net) => net.name)
		);
	};

	const [copyPreferencesModal, setCopyPreferencesModal] = useState(false);
	const [primaryPreferencesModal, setPrimaryPreferencesModal] =
		useState(false);

	const handlePrimaryNetworkChange = () => {
		onSetPrimaryNetwork(network);
		setPrimaryPreferencesModal(false);
	};

	const handleClose = (name: string) => {
		const networks = selectedNetwork[chainProperties[name].category].map(
			(net) => (net.name == name ? { ...net, selected: false } : net)
		);
		setSelectedNetwork({
			...selectedNetwork,
			[chainProperties[name].category]: networks
		});
	};

	const selectedNetworkArray = Object.values(selectedNetwork)
		.flatMap((chain) => chain)
		.filter(({ selected }: { selected: boolean }) => selected);

	return (
		<Collapse
			className='bg-white'
			size='large'
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				setActive(isActive);
				return isActive ? <CollapseIcon /> : <ExpandIcon />;
			}}
		>
			<Panel
				header={
					<div className='flex justify-between gap-[8px] items-center'>
						<div className='flex items-center gap-[6px] channel-header'>
							<ParachainNotification />
							<h3 className='font-semibold text-[16px] text-[#243A57] md:text-[18px] tracking-wide leading-[21px] mb-0'>
								Parachains
							</h3>
						</div>
						{!!active && (
							<div className='gap-2 hidden md:flex'>
								{selectedNetworkArray.slice(0, 5).map((net) => (
									<Image
										key={net.name}
										className='w-[20px] h-[20px] rounded-full'
										src={chainProperties[net.name].logo}
										alt='Logo'
									/>
								))}
								{selectedNetworkArray.length > 5 && (
									<span className='text-[10px] bg-[#D2D8E080] px-2 py-[3px] rounded-xl'>
										+{selectedNetworkArray.length - 5}
									</span>
								)}
							</div>
						)}
					</div>
				}
				key={13}
			>
				<Space size={[16, 16]} wrap>
					{selectedNetworkArray.map(({ name }: { name: string }) => (
						<NetworkTags
							key={name}
							icon={chainProperties[name].logo}
							name={name}
							onClose={name === network ? undefined : handleClose}
						/>
					))}
					<NetworkTags
						name={'Add Networks'}
						selected={false}
						onActionClick={() => setOpenModal(true)}
					/>
				</Space>
				<Divider className='border-[#D2D8E0] border-2' dashed />
				<div className='flex flex-col item-center gap-6'>
					<Checkbox
						value={false}
						onChange={() => {
							if (primaryNetwork === network) {
								return;
							}
							setPrimaryPreferencesModal(true);
						}}
						checked={primaryNetwork === network}
						className='text-pink_primary text-[16px] flex item-center'
					>
						Set as Primary Network Settings
					</Checkbox>
					<div
						className={`flex item-center gap-2 max-w-[560px] text-[16px] ${primaryNetwork !== network
							? 'text-pink_primary cursor-pointer'
							: 'text-[#96A4B6] cursor-not-allowed'} whitespace-normal md:whitespace-nowrap`}
						onClick={primaryNetwork !== network ? () => {
							setCopyPreferencesModal(true);
						} : () => { }}
					>
						<span>
							{primaryNetwork !== network ? (
								<ImportIcon />
							) : (
								<DisabledImportIcon />
							)}
						</span>
						Importing Primary Network Settings to the networks
						selected above
					</div>
				</div>
			</Panel>
			<AddNetworkModal
				open={openModal}
				onConfirm={handleModalConfirm}
				onCancel={() => setOpenModal(false)}
				selectedNetwork={selectedNetwork}
			/>
			{primaryNetwork && (
				<ImportPrimaryNetworkSettingModal
					open={copyPreferencesModal}
					primaryNetwork={primaryNetwork}
					onConfirm={() => {
						if (!primaryNetwork) {
							return;
						}
						onCopyPrimaryNetworkNotification(
							Object.values(selectedNetwork)
								.flatMap((chain) => chain).filter((network) => network.selected)
								.map(({ name }: { name: string }) => name)
						);
						setCopyPreferencesModal(false);
					}}
					onCancel={() => setCopyPreferencesModal(false)}
				/>
			)}
			<SetPrimaryNetworkSettingModal
				open={primaryPreferencesModal}
				network={network}
				onConfirm={handlePrimaryNetworkChange}
				onCancel={() => setPrimaryPreferencesModal(false)}
			/>
		</Collapse>
	);
}
