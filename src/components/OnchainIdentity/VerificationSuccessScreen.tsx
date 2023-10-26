// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { poppins } from 'pages/_app';
import { Button, Modal } from 'antd';
import SuccessIcon from '~assets/icons/success-verification.svg';
import { useRouter } from 'next/router';
import { CloseIcon } from '~src/ui-components/CustomIcons';

interface Props {
	className?: string;
	socialHandle?: string;
	social: string;
	open: boolean;
	onClose: (pre: boolean) => void;
}

const VerificationSuccessScreen = ({ className, open, social, socialHandle, onClose }: Props) => {
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);
	return (
		<Modal
			zIndex={100000}
			open={open}
			className={`${poppins.variable} ${poppins.className} h-[300px] w-[600px] max-sm:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			onCancel={() => {
				onClose(false);
			}}
			footer={false}
			closable={false}
			maskClosable={false}
		>
			<div className='-mt-[110px] flex flex-col items-center justify-center'>
				<SuccessIcon />
				<label className='-mt-2 text-xl font-semibold tracking-[0.15%] text-bodyBlue dark:text-blue-dark-high'>{social} verified successfully</label>
				{socialHandle && <div className='mt-4 text-2xl font-semibold text-pink_primary'>{socialHandle}</div>}
				<Button
					className='mt-6 h-[40px] rounded-[4px] border-none bg-pink_primary text-sm text-white'
					onClick={() => {
						setLoading(true);
						router.push(`/?identityVerification=${true}`);
					}}
					loading={loading}
				>
					Continue verification
				</Button>
				<div className='-mb-5 -ml-12 -mr-12 mt-12 h-[18px] w-[600px] rounded-b-lg bg-[#51D36E] max-sm:w-full ' />
			</div>
		</Modal>
	);
};

export default VerificationSuccessScreen;
