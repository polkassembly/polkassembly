// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import Image from 'next/image';
import { poppins } from 'pages/_app';
import React from 'react';
import { CloseIcon } from '~src/ui-components/CustomIcons';

interface Props {
	className?: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
	onConfirm: (pre: boolean) => void;
}
const RapidCreationConfirmation = ({ className, open, setOpen, onConfirm }: Props) => {
	return (
		<Modal
			open={open}
			onCancel={() => {
				setOpen(false);
			}}
			maskClosable={false}
			wrapClassName='dark:bg-modalOverlayDark'
			className={classNames(className, poppins.className, poppins.variable, 'shadow-[0px 8px 18px rgba(0, 0, 0, 0.06)]')}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive ' />}
			title={
				<>
					<label className='flex items-center gap-2 text-lg font-medium tracking-wide text-warningAlertBorderDark'>
						<Image
							width={20}
							height={20}
							src='/assets/icons/warning-icon.svg'
							alt='warning'
							className={'warning-color'}
						/>
						Warning
					</label>
					<div className='-ml-6 -mr-6 mt-2 border-[0.5px] border-solid border-navBlue dark:border-icon-dark-inactive' />
				</>
			}
			footer={[
				<>
					<div
						className='-ml-6 -mr-6 border-[0.5px] border-solid border-navBlue dark:border-icon-dark-inactive'
						key={'confirm'}
					/>

					<Button
						className='mt-4 h-[32px] border-pink_primary bg-pink_primary px-4 text-xs font-medium tracking-wide text-white'
						onClick={() => {
							onConfirm(true);
							setOpen(false);
						}}
					>
						OK, Got it
					</Button>
				</>
			]}
		>
			<div className='py-4 text-sm text-bodyBlue dark:text-blue-dark-high'>
				A Referendum has been created in the last 5 minutes from this device. Please confirm if you want to create another referendum.
			</div>
		</Modal>
	);
};
export default RapidCreationConfirmation;
