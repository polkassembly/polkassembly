// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect } from 'react';
import { dmSans } from 'pages/_app';
import { Modal } from 'antd';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import { ESocials } from '~src/types';
import { useNetworkSelector, useOnchainIdentitySelector } from '~src/redux/selectors';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import ImageIcon from '~src/ui-components/ImageIcon';
import { ESetIdentitySteps, IIdentityInProgress } from './types';
import Image from 'next/image';

const SocialVerificationInprogress = ({ className, open, close, openPreModal, handleVerify, changeStep }: IIdentityInProgress) => {
	const { network } = useNetworkSelector();
	const { socials } = useOnchainIdentitySelector();
	const { email } = socials;

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const handleVerified = async () => {
		await handleVerify(ESocials.EMAIL, true);
	};

	return (
		<Modal
			centered
			open={open}
			className={`${dmSans.variable} ${dmSans.className} w-[650px] max-sm:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			onCancel={() => {
				close(true);
				changeStep(ESetIdentitySteps.SOCIAL_VERIFICATION);
				openPreModal(false);
			}}
			footer={false}
			maskClosable={false}
		>
			<>
				<div className='-mt-[132px] flex flex-col items-center justify-center'>
					{/* <SuccessIcon /> */}
					<ImageIcon
						src='/assets/icons/identity-success.svg'
						alt='identity success icon'
					/>
					<label className='mt-4 text-xl font-semibold tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>Email verification in progress</label>
					<div className='mt-4 text-2xl font-semibold text-pink_primary'>Check primary inbox or spam</div>
					<div className=' mt-4 flex w-full shrink-0 flex-col items-center justify-center text-center text-sm tracking-wide '>
						<span className='flex shrink-0 dark:text-blue-dark-high'>A verification link has been sent to your mail address</span>
						<u className='font-medium text-pink_primary'>
							<a
								target='_blank'
								href='https://mail.google.com/'
								rel='noreferrer'
							>
								{email?.value}
							</a>
						</u>
					</div>
					<div className='mb-2 mt-4 flex w-full items-center justify-center gap-1 text-sm text-bodyBlue dark:text-blue-dark-high'>
						Regarding any query Contact us
						<a href='mailto:hello@polkassembly.io'>
							<Image
								width={16}
								height={16}
								src='/assets/icons/redirect.svg'
								alt=''
							/>
						</a>
					</div>
				</div>

				<CustomButton
					onClick={() => {
						close(true);
						handleVerified();
						changeStep(ESetIdentitySteps.SOCIAL_VERIFICATION);
						openPreModal(true);
					}}
					className='mb-2 mt-4 w-full tracking-wide'
					height={40}
					variant='primary'
					text='Verified successfully'
				/>
			</>
		</Modal>
	);
};

export default SocialVerificationInprogress;
