// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Divider, Image, Switch, Tag } from 'antd';
import SmallParachainIcon from '~assets/icons/parachain-small.svg';
import { chainProperties } from '~src/global/networkConstants';
import { PlusCircleOutlined } from '@ant-design/icons';
import { networkLabel } from './utils';
import { ISelectedNetwork } from '../types';
import Modal from '~src/ui-components/Modal';
import { useNetworkSelector } from '~src/redux/selectors';
import CustomButton from '~src/basic-components/buttons/CustomButton';

const AddNetworkModal = ({
	open,
	onConfirm,
	onCancel,
	selectedNetwork
}: {
	selectedNetwork: ISelectedNetwork;
	open: boolean;
	onConfirm: (networks: any) => void;
	onCancel: () => void;
}) => {
	const [allNetworks, setAllNetworks] = useState(selectedNetwork);
	const { network } = useNetworkSelector();
	const [showSureModal, setShowSureModal] = useState(false);

	useEffect(() => {
		setAllNetworks(selectedNetwork);
	}, [selectedNetwork]);

	const handleClick = (name: string, category: string) => {
		if (name === network) {
			return;
		}
		const payload = allNetworks[category].map((net: any) => (net.name === name ? { ...net, selected: !net.selected } : net));
		setAllNetworks({ ...allNetworks, [category]: payload });
	};

	const handleSure = () => {
		setShowSureModal(true);
	};

	const handleConfirm = () => {
		if (!showSureModal) {
			handleSure();
			return;
		}
		onConfirm(allNetworks);
		setShowSureModal(false);
	};

	const handleAllClick = (checked: boolean, chain: string) => {
		const payload = allNetworks[chain].map((net: any) =>
			net.name === network
				? net
				: {
						...net,
						selected: checked
				  }
		);
		setAllNetworks({ ...allNetworks, [chain]: payload });
	};

	return (
		<>
			<Modal
				className='dark:[&>.ant-modal-content]:bg-section-dark-overlay'
				title='Add Networks'
				titleIcon={<PlusCircleOutlined />}
				open={open}
				onCancel={() => {
					if (showSureModal) {
						setShowSureModal(false);
						return;
					}
					onCancel();
				}}
				onConfirm={handleConfirm}
				footer={[
					<div
						key='footer'
						className='flex items-center justify-end gap-x-1'
					>
						<CustomButton
							key='1'
							onClick={() => {
								if (showSureModal) {
									setShowSureModal(false);
									return;
								}
								onCancel();
							}}
							variant='default'
							text='Cancel'
						/>
						<CustomButton
							onClick={handleConfirm}
							key='2'
							variant='primary'
							text='Confirm'
						/>
					</div>
				]}
			>
				<p className='text-[16px] font-medium text-blue-light-high dark:text-blue-dark-high'>
					{showSureModal ? 'Pre-existing settings will be changed for the following networks:' : 'Please select network(s) for which you want to replicate settings:'}
				</p>
				{showSureModal ? (
					<div className='flex flex-wrap gap-[10px]'>
						{Object.keys(allNetworks).map((chain) => {
							return allNetworks[chain]
								.filter((net) => net.selected)
								.map(({ name }: { name: string }) => {
									return (
										<Tag
											key={name}
											className={
												'max-w-[200px] cursor-pointer items-center rounded-[34px] border border-solid border-[#E5007A] bg-[#FEF2F8] px-[12px] py-[8px] pb-[5px] text-navBlue hover:bg-[#FEF2F8] dark:bg-[#33071E]'
											}
										>
											<Image
												className='-mt-[10px] h-[20px] w-[20px] rounded-full'
												src={chainProperties[name].logo.src}
												alt='Logo'
											/>
											<span
												className={
													'ml-[10px] mr-[12px] items-center justify-center text-sm font-semibold leading-[18px] tracking-[0.02em] text-blue-light-high dark:text-blue-dark-high '
												}
											>
												<span className='m-0 inline-block max-w-[100px] overflow-hidden text-ellipsis capitalize'>{name === 'xx' ? 'XX' : name}</span>
											</span>
										</Tag>
									);
								});
						})}
					</div>
				) : (
					Object.keys(allNetworks).map((chain, i) => {
						return (
							<div key={chain}>
								<div className='mb-2 flex items-center gap-[8px]'>
									<SmallParachainIcon />
									<h3 className='mb-0 text-sm font-semibold leading-[21px] tracking-wide text-sidebarBlue dark:font-normal dark:text-white'>
										{networkLabel[chain] === 'Kusama' || networkLabel[chain] === 'Polkadot' ? `${networkLabel[chain]} and Parachains` : networkLabel[chain]}
									</h3>
									<span className='flex items-center gap-[8px]'>
										<Switch
											size='small'
											id='postParticipated'
											onChange={(checked) => handleAllClick(checked, chain)}
											checked={allNetworks[chain].every((network: any) => network.selected)}
										/>
										<p className='m-0 text-[#485F7D] dark:text-white'>All</p>
									</span>
								</div>
								<div className='flex flex-wrap gap-[10px]'>
									{allNetworks[chain].map(({ name, selected }: { name: string; selected: boolean }) => {
										selected = selected || name === network;
										return (
											<div
												className='w-auto max-w-[175px] flex-[170px]'
												key={name}
											>
												<Tag
													onClick={() => handleClick(name, chain)}
													className={`items-center rounded-[34px] px-[12px] py-[8px] text-navBlue ${
														selected
															? 'border border-solid border-[#E5007A] bg-[#FEF2F8] dark:bg-[#33071E]'
															: 'border-white bg-white dark:border-[#3B444F] dark:bg-section-dark-overlay'
													} max-w-[200px] cursor-pointer pb-[5px] hover:bg-[#FEF2F8] dark:bg-[#33071E]`}
												>
													<Image
														className='-mt-[12px] h-[20px] w-[20px] rounded-full'
														src={chainProperties[name].logo.src}
														alt='Logo'
													/>
													<span
														className={
															'ml-[10px] mr-[12px] items-center justify-center text-sm font-normal leading-[21px] tracking-[0.02em] text-blue-light-high dark:text-blue-dark-high'
														}
													>
														<span className='m-0 inline-block max-w-[100px] overflow-hidden text-ellipsis capitalize'>{name === 'xx' ? 'XX' : name}</span>
													</span>
												</Tag>
											</div>
										);
									})}
								</div>
								{i < Object.keys(allNetworks).length - 1 && (
									<Divider
										className='border-2 border-section-light-container dark:border-[#3B444F] dark:border-separatorDark'
										dashed
									/>
								)}
							</div>
						);
					})
				)}
				<div className='ml-[-24px] mr-[-24px]'>
					<Divider className='my-4 dark:border-separatorDark' />
				</div>
			</Modal>
		</>
	);
};

export default AddNetworkModal;
