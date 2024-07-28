// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Divider, Modal } from 'antd';
import { poppins } from 'pages/_app';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import Image from 'next/image';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Link from 'next/link';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';

interface Props {
	className?: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
	badge: string;
	icon: string;
}

const BadgeUnlockedModal = ({ className, open, setOpen, badge, icon }: Props) => {
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const { username } = currentUser;
	return (
		<Modal
			open={open}
			className={`${poppins.variable} ${poppins.className} delegate mt-[5vh] w-[604px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			onCancel={() => {
				setOpen(false);
			}}
			footer={
				<>
					<Divider
						type='horizontal'
						className='mb-6 mt-4 bg-section-light-container dark:bg-separatorDark'
					/>
					<Link
						href={`https://${network}.polkassembly.io/user/${username}`}
						className='-mt-2 flex items-center pb-2'
						target='_blank'
						rel='noopener noreferrer'
					>
						<CustomButton
							onClick={() => setOpen(false)}
							variant='primary'
							text='View Badge'
							height={32}
							className='w-full p-5'
						/>
					</Link>
				</>
			}
			closable
		>
			<div className='-mt-[100px] flex flex-col items-center justify-center'>
				<Image
					src={icon}
					alt=''
					width={218}
					height={136}
				/>
				<h1 className='mt-2 text-[20px] font-semibold tracking-[0.0015em] dark:text-white'>Achievement Unlocked</h1>
				<h2 className='mt-2 text-[20px] tracking-[0.0015em] dark:text-white'>
					You Earned <span className='font-semibold text-pink_primary'>{badge}</span> Badge
				</h2>
			</div>
		</Modal>
	);
};
export default BadgeUnlockedModal;
