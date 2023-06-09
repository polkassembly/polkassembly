// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Divider, Image, Modal, Switch, Tag } from 'antd';
import SmallParachainIcon from '~assets/icons/parachain-small.svg';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkContext } from '~src/context';
import { PlusCircleOutlined } from '@ant-design/icons';
import { networkLabel, networks } from './utils';

const AddNetworkModal = ({
	open,
	onConfirm,
	onCancel
}: {
    open: boolean;
    onConfirm: any;
    onCancel: any;
}) => {
	//@ts-ignore
	const [allNetworks, setAllNetworks] = useState(networks);
	const { network } = useNetworkContext();
	const [showSureModal, setShowSureModal] = useState(false);

	const handleClick = (name: string, category: string) => {
		const payload = allNetworks[category].map((net: any) =>
			net.name === name ? { ...net, selected: !net.selected } : net
		);
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
		const payload: Array<{
            name: string;
            selected: boolean;
            category: string;
        }> = [];
		Object.keys(allNetworks).forEach((net: string) => {
			allNetworks[net].forEach(
				(element: {
                    name: string;
                    selected: boolean;
                    category: string;
                }) => {
					if (element.selected) {
						payload.push(element);
					}
				}
			);
		});
		onConfirm(payload);
		setShowSureModal(false);
	};

	const handleAllClick = (checked: boolean, chain: string) => {
		const payload = allNetworks[chain].map((net: any) => ({
			...net,
			selected: checked
		}));
		setAllNetworks({ ...allNetworks, [chain]: payload });
	};

	return (
		<Modal
			title={
				<div className='mr-[-24px] ml-[-24px]'>
					<h3 className='ml-[24px] mb-0'>
						<PlusCircleOutlined /> Add Networks
					</h3>
					<Divider />
				</div>
			}
			open={open}
			closable
			className='min-w-[600px]'
			onCancel={() => {
				if (showSureModal) {
					setShowSureModal(false);
					return;
				}
				onCancel();
			}}
			onOk={handleConfirm}
		>
			<p className='font-semibold text-[#243A57] text-[16px]'>
				{showSureModal
					? 'Pre-existing settings will be changed for the following networks:'
					: 'Please select network(s) for which you want to replicate settings:'}
			</p>
			{showSureModal ? (
				<div className='flex gap-[10px] flex-wrap'>
					{Object.keys(allNetworks).map((chain) => {
						return allNetworks[chain].map(
							({
								name,
								selected
							}: {
                                name: string;
                                selected: boolean;
                            }) => {
								selected = selected || name === network;
								if (!selected) {
									return <></>;
								}
								return (
									<Tag
										key={name}
										className={
											'items-center text-navBlue rounded-[34px] px-[12px] py-[8px] border-solid border bg-[#FEF2F8] border-[#E5007A] cursor-pointer hover:bg-[#FEF2F8] max-w-[200px] pb-[5px]'
										}
									>
										<Image
											className='w-[20px] h-[20px] rounded-full -mt-[10px]'
											src={chainProperties[name].logo.src}
											alt='Logo'
										/>
										<span
											className={
												'items-center justify-center ml-[10px] mr-[12px] font-semibold text-[#243A57] text-sm leading-[18px] tracking-[0.02em] '
											}
										>
											<span className='inline-block capitalize max-w-[100px] overflow-hidden text-ellipsis m-0'>
												{name}
											</span>
										</span>
									</Tag>
								);
							}
						);
					})}
				</div>
			) : (
				Object.keys(allNetworks).map((chain) => {
					return (
						<div key={chain}>
							<div className='flex items-center gap-[8px] m-1'>
								<SmallParachainIcon />
								<h3 className='font-semibold text-sm tracking-wide leading-7 text-sidebarBlue mb-0'>
									{networkLabel[chain] === 'Kusama' ||
                                    networkLabel[chain] === 'Polkadot'
										? `${networkLabel[chain]} and Parachains`
										: networkLabel[chain]}
								</h3>
								<span className='flex gap-[8px] items-center'>
									<Switch
										size='small'
										id='postParticipated'
										onChange={(checked) =>
											handleAllClick(checked, chain)
										}
										checked={allNetworks[chain].every((network:any) => network.selected)}
									/>
									<p className='m-0 text-[#243A57B2]'>All</p>
								</span>
							</div>
							<div className='flex gap-[10px] flex-wrap'>
								{allNetworks[chain].map(
									({
										name,
										selected
									}: {
                                        name: string;
                                        selected: boolean;
                                    }) => {
										selected = selected || name === network;
										return (
											<div
												className='flex-[30%] w-auto max-w-[200px]'
												key={name}
											>
												<Tag
													onClick={() =>
														handleClick(name, chain)
													}
													className={`items-center text-navBlue rounded-[34px] px-[12px] py-[8px] ${
														selected
															? 'border-solid border bg-[#FEF2F8] border-[#E5007A]'
															: 'bg-white border-[#fff]'
													} cursor-pointer hover:bg-[#FEF2F8] max-w-[200px] pb-[5px]`}
												>
													<Image
														className='w-[20px] h-[20px] rounded-full -mt-[10px]'
														src={
															chainProperties[
																name
															].logo.src
														}
														alt='Logo'
													/>
													<span
														className={
															'items-center justify-center ml-[10px] mr-[12px] font-semibold text-[#243A57] text-sm leading-[18px] tracking-[0.02em] '
														}
													>
														<span className='inline-block capitalize max-w-[100px] overflow-hidden text-ellipsis m-0'>
															{name}
														</span>
													</span>
												</Tag>
											</div>
										);
									}
								)}
							</div>
							<Divider
								className='border-[#D2D8E0] border-2'
								dashed
							/>
						</div>
					);
				})
			)}
		</Modal>
	);
};

export default AddNetworkModal;
