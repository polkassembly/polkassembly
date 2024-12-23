// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal, Skeleton } from 'antd';
import classNames from 'classnames';
import { dmSans, spaceGrotesk } from 'pages/_app';
import React from 'react';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
const CreateBountyForm = dynamic(() => import('./CreateBountyForm'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const CreateBountyModal = ({ openCreateBountyModal, setOpenCreateBountyModal }: { openCreateBountyModal: boolean; setOpenCreateBountyModal: (pre: boolean) => void }) => {
	const { resolvedTheme: theme } = useTheme();
	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			className={classNames(dmSans.className, dmSans.variable, 'mt-[20px] w-[50%]')}
			open={openCreateBountyModal}
			// open={true}
			maskClosable={false}
			footer={null}
			title={
				<div
					className={`${spaceGrotesk.className} ${spaceGrotesk.variable} -mx-6 flex items-center justify-start gap-x-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-5 text-xl tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high`}
				>
					<Image
						src={'/assets/icons/file-grey-icon.svg'}
						alt='upload-icon'
						width={24}
						height={24}
						className={theme === 'dark' ? 'dark-icons' : ''}
					/>
					Create Bounty
				</div>
			}
			closeIcon={<CloseIcon className='mt-2 text-lightBlue dark:text-icon-dark-inactive' />}
			onCancel={() => {
				setOpenCreateBountyModal?.(false);
			}}
		>
			<CreateBountyForm setOpenCreateBountyModal={setOpenCreateBountyModal} />
		</Modal>
	);
};

export default CreateBountyModal;
