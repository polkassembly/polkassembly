// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Button, Divider, Image, Switch, Tag } from 'antd';
import SmallParachainIcon from '~assets/icons/parachain-small.svg';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkContext } from '~src/context';
import { PlusCircleOutlined } from '@ant-design/icons';
import { networkLabel } from './utils';
import { ISelectedNetwork } from '../types';
import Modal from '~src/ui-components/Modal';
import { useTheme } from 'next-themes';

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
	const { network } = useNetworkContext();
	const [showSureModal, setShowSureModal] = useState(false);
	const { resolvedTheme:theme } = useTheme();

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
				theme={theme}
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
					<Button
						key='1'
						onClick={() => {
							if (showSureModal) {
								setShowSureModal(false);
								return;
							}
							onCancel();
						}}
<<<<<<< HEAD
						className='h-10 rounded-[6px] bg-[#FFFFFF] border border-solid border-pink_primary px-[36px] py-[4px] text-pink_primary font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize dark:bg-transparent'
=======
						className='h-10 rounded-[6px] border border-solid border-pink_primary bg-[#FFFFFF] px-[36px] py-[4px] text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-pink_primary'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
					>
						Cancel
					</Button>,
					<Button
						onClick={handleConfirm}
						key='2'
						className='h-10 rounded-[6px] border border-solid border-pink_primary bg-[#E5007A] px-[36px] py-[4px] text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-white'
					>
						Confirm
					</Button>
				]}
			>
<<<<<<< HEAD
				<p className='font-medium text-blue-light-high dark:text-blue-dark-high text-[16px]'>
					{showSureModal
						? 'Pre-existing settings will be changed for the following networks:'
						: 'Please select network(s) for which you want to replicate settings:'}
				</p>
				{showSureModal ? (
					<div className='flex gap-[10px] flex-wrap dark:text-blue-dark-medium'>
=======
				<p className='text-[16px] font-medium text-[#243A57]'>
					{showSureModal ? 'Pre-existing settings will be changed for the following networks:' : 'Please select network(s) for which you want to replicate settings:'}
				</p>
				{showSureModal ? (
					<div className='flex flex-wrap gap-[10px]'>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
						{Object.keys(allNetworks).map((chain) => {
							return allNetworks[chain]
								.filter((net) => net.selected)
								.map(({ name }: { name: string }) => {
									return (
										<Tag
											key={name}
											className={
												'max-w-[200px] cursor-pointer items-center rounded-[34px] border border-solid border-[#E5007A] bg-[#FEF2F8] px-[12px] py-[8px] pb-[5px] text-navBlue hover:bg-[#FEF2F8]'
											}
										>
											<Image
												className='-mt-[10px] h-[20px] w-[20px] rounded-full'
												src={chainProperties[name].logo.src}
												alt='Logo'
											/>
<<<<<<< HEAD
											<span
												className={
													'items-center justify-center ml-[10px] mr-[12px] font-semibold text-blue-light-high dark:text-blue-dark-high text-sm leading-[18px] tracking-[0.02em] '
												}
											>
												<span className='inline-block capitalize max-w-[100px] overflow-hidden text-ellipsis m-0'>
													{name === 'xx' ? 'XX' : name}
												</span>
=======
											<span className={'ml-[10px] mr-[12px] items-center justify-center text-sm font-semibold leading-[18px] tracking-[0.02em] text-[#243A57] '}>
												<span className='m-0 inline-block max-w-[100px] overflow-hidden text-ellipsis capitalize'>{name === 'xx' ? 'XX' : name}</span>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
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
<<<<<<< HEAD
									<h3 className='font-semibold text-sm tracking-wide leading-[21px] text-sidebarBlue dark:text-blue-dark-medium mb-0'>
										{networkLabel[chain] === 'Kusama' ||
                                    networkLabel[chain] === 'Polkadot'
											? `${networkLabel[chain]} and Parachains`
											: networkLabel[chain]}
=======
									<h3 className='mb-0 text-sm font-semibold leading-[21px] tracking-wide text-sidebarBlue'>
										{networkLabel[chain] === 'Kusama' || networkLabel[chain] === 'Polkadot' ? `${networkLabel[chain]} and Parachains` : networkLabel[chain]}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
									</h3>
									<span className='flex items-center gap-[8px]'>
										<Switch
											size='small'
											id='postParticipated'
											onChange={(checked) => handleAllClick(checked, chain)}
											checked={allNetworks[chain].every((network: any) => network.selected)}
										/>
										<p className='m-0 text-[#485F7D] dark:text-blue-dark-medium'>All</p>
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
														selected ? 'border border-solid border-[#E5007A] bg-[#FEF2F8]' : 'border-[#fff] bg-white'
													} max-w-[200px] cursor-pointer pb-[5px] hover:bg-[#FEF2F8]`}
												>
<<<<<<< HEAD
													<Tag
														onClick={() =>
															handleClick(name, chain)
														}
														className={`items-center text-navBlue rounded-[34px] px-[12px] py-[8px] ${
															selected
																? 'border-solid border bg-[#FEF2F8] dark:bg-[#29323c33] dark:border-[#3B444F] border-[#E5007A]'
																: 'bg-white dark:bg-section-dark-overlay border-[#fff]'
														} cursor-pointer hover:bg-[#FEF2F8] dark:bg-[#29323c33] dark:border-[#3B444F] max-w-[200px] pb-[5px]`}
													>
														<Image
															className='w-[20px] h-[20px] rounded-full -mt-[12px]'
															src={
																chainProperties[
																	name
																].logo.src
															}
															alt='Logo'
														/>
														<span
															className={
																'items-center justify-center ml-[10px] mr-[12px] font-normal text-blue-light-high dark:text-blue-dark-high text-sm leading-[21px] tracking-[0.02em]'
															}
														>
															<span className='inline-block capitalize max-w-[100px] overflow-hidden text-ellipsis m-0'>
																{name === 'xx'
																	? 'XX'
																	: name}
															</span>
														</span>
													</Tag>
												</div>
											);
										}
									)}
								</div>
								{i < Object.keys(allNetworks).length - 1 && (
									<Divider
										className='border-[#D2D8E0] dark:border-separatorDark dark:border-[1px] border-2'
=======
													<Image
														className='-mt-[12px] h-[20px] w-[20px] rounded-full'
														src={chainProperties[name].logo.src}
														alt='Logo'
													/>
													<span className={'ml-[10px] mr-[12px] items-center justify-center text-sm font-normal leading-[21px] tracking-[0.02em] text-[#243A57]'}>
														<span className='m-0 inline-block max-w-[100px] overflow-hidden text-ellipsis capitalize'>{name === 'xx' ? 'XX' : name}</span>
													</span>
												</Tag>
											</div>
										);
									})}
								</div>
								{i < Object.keys(allNetworks).length - 1 && (
									<Divider
										className='border-2 border-[#D2D8E0]'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
										dashed
									/>
								)}
							</div>
						);
					})
				)}
				<div className='ml-[-24px] mr-[-24px]'>
					<Divider className='my-4' />
				</div>
			</Modal>
		</>
	);
};

export default AddNetworkModal;
