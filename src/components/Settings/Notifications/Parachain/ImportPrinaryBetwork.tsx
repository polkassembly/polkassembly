// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Button, Divider, Image, Tag } from 'antd';
import { chainProperties } from '~src/global/networkConstants';
import DisabledImportIcon from '~assets/icons/disabled-state-import-icon.svg';
import Modal from '~src/ui-components/Modal';

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
			className='dark:[&>.ant-modal-content]:bg-section-dark-overlay'
			title='Import Primary Network Settings'
			titleIcon={<DisabledImportIcon />}
			open={open}
			onCancel={onCancel}
			onConfirm={onConfirm}
			footer={[
				<Button
					key='1'
					onClick={onCancel}
					className='h-10 rounded-[6px] border border-solid border-pink_primary bg-[#FFFFFF] px-[36px] py-[4px] text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-pink_primary'
				>
					Cancel
				</Button>,
				<Button
					onClick={onConfirm}
					key='2'
					className='h-10 rounded-[6px] border border-solid border-pink_primary bg-[#E5007A] px-[36px] py-[4px] text-sm font-medium capitalize leading-[21px] tracking-[0.0125em] text-white'
				>
					Confirm
				</Button>
			]}
		>
			<div className='mb-6 flex flex-wrap items-center gap-[10px]'>
				<Tag
					className={
						'max-w-[200px] cursor-pointer items-center rounded-[34px] border border-solid border-[#E5007A] bg-[#FEF2F8] px-[12px] py-[8px] pb-[5px] text-navBlue hover:bg-[#FEF2F8] dark:bg-[#33071E] dark:bg-[#33071E]'
					}
				>
					<Image
						className='-mt-[10px] h-[20px] w-[20px] rounded-full'
						src={chainProperties[primaryNetwork].logo.src}
						alt='Logo'
					/>
					<span className={'ml-[10px] mr-[12px] items-center justify-center text-sm font-medium leading-[18px] tracking-[0.02em] text-blue-light-high dark:text-blue-dark-high'}>
						<span className='m-0 inline-block max-w-[100px] overflow-hidden text-ellipsis capitalize'>{primaryNetwork}</span>
					</span>
				</Tag>
				<p className='m-0 text-[16px] font-medium text-blue-light-high dark:text-blue-dark-high'>is set as your Primary Network.</p>
			</div>
			<p className='text-[16px] font-medium text-blue-light-high dark:text-blue-dark-high'>
				Are you sure you want to import your primary network settings to all selected networks?
			</p>
			<div className='ml-[-24px] mr-[-24px]'>
				<Divider className='my-4' />
			</div>
		</Modal>
	);
};

export default ImportPrimaryNetworkSettingModal;
