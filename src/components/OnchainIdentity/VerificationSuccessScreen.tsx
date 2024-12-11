// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { dmSans } from 'pages/_app';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { Modal } from 'antd';
import { useRouter } from 'next/router';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import ImageIcon from '~src/ui-components/ImageIcon';
import { IVerificationSuccessState } from './types';
import { useTranslation } from 'next-i18next';

const VerificationSuccessScreen = ({ className, open, social, socialHandle, onClose }: IVerificationSuccessState) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);

	return (
		<Modal
			zIndex={100000}
			open={open}
			className={`${dmSans.variable} ${dmSans.className} h-[300px] w-[600px] max-sm:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
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
				<ImageIcon
					src='/assets/icons/success-verification.svg'
					alt='success verification icon'
				/>
				<label className='-mt-2 text-xl font-semibold tracking-[0.15%] text-bodyBlue dark:text-blue-dark-high'>{t('verified_successfully_social', { social })}</label>
				{socialHandle && <div className='mt-4 text-2xl font-semibold text-pink_primary'>{socialHandle}</div>}
				<CustomButton
					onClick={() => {
						setLoading(true);
						router.push(`/?identityVerification=${true}`);
					}}
					loading={loading}
					text={t('continue_verification')}
					className='mt-6'
					variant='primary'
					height={40}
				/>
				<div className='-mb-5 -ml-12 -mr-12 mt-12 h-[18px] w-[600px] rounded-b-lg bg-[#51D36E] max-sm:w-full ' />
			</div>
		</Modal>
	);
};

export default VerificationSuccessScreen;
