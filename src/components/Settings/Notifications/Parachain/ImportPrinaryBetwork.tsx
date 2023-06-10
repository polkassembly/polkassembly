// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Divider, Image, Modal, Tag } from 'antd';
import { chainProperties } from '~src/global/networkConstants';
import DisabledImportIcon from '~assets/icons/disabled-state-import-icon.svg';

const ImportPrimaryNetworkSettingModal = ({
	open,
	onConfirm,
	onCancel,
	primaryNetwork
}: {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    primaryNetwork: string;
}) => {
	return (
		<Modal
			title={
				<div className='mr-[-24px] ml-[-24px]'>
					<h3 className='ml-[24px] mb-0 flex items-center gap-3'>
						<DisabledImportIcon /> Import Primary Network Settings
					</h3>
					<Divider />
				</div>
			}
			open={open}
			closable
			className='min-w-[600px]'
			onCancel={onCancel}
			onOk={onConfirm}
		>
			<div className='flex gap-[10px] flex-wrap items-center mb-6'>
				<Tag
					className={
						'items-center text-navBlue rounded-[34px] px-[12px] py-[8px] border-solid border bg-[#FEF2F8] border-[#E5007A] cursor-pointer hover:bg-[#FEF2F8] max-w-[200px] pb-[5px]'
					}
				>
					<Image
						className='w-[20px] h-[20px] rounded-full -mt-[10px]'
						src={chainProperties[primaryNetwork].logo.src}
						alt='Logo'
					/>
					<span
						className={
							'items-center justify-center ml-[10px] mr-[12px] font-semibold text-[#243A57] text-sm leading-[18px] tracking-[0.02em]'
						}
					>
						<span className='inline-block capitalize max-w-[100px] overflow-hidden text-ellipsis m-0'>
							{primaryNetwork}
						</span>
					</span>
				</Tag>
				<p className='font-semibold text-[#243A57] text-[16px] m-0'>
                    is set as your Primary Network.
				</p>
			</div>
			<p className='text-[16px] font-normal'>
                Are you sure you want to import Kusama’s Network settings to all
                selected networks?
			</p>
		</Modal>
	);
};

export default ImportPrimaryNetworkSettingModal;
