// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect } from 'react';
import { dmSans } from 'pages/_app';
import { Modal } from 'antd';
import Address from '~src/ui-components/Address';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import { useNetworkSelector, useOnchainIdentitySelector, useUserDetailsSelector } from '~src/redux/selectors';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { trackEvent } from 'analytics';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import ImageIcon from '~src/ui-components/ImageIcon';
import { ESetIdentitySteps, IIdentitySuccessState } from './types';

const IdentitySuccessState = ({ className, open, close, openPreModal, changeStep }: IIdentitySuccessState) => {
	const { network } = useNetworkSelector();
	const { socials, displayName, identityAddress } = useOnchainIdentitySelector();
	const { email, web, twitter, matrix } = socials;
	const { id, username, loginAddress } = useUserDetailsSelector();

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<Modal
			centered
			open={open}
			className={`${dmSans.variable} ${dmSans.className} w-[600px] max-sm:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
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
					<ImageIcon
						src='/assets/icons/identity-success.svg'
						alt='identity success icon'
					/>
					<label className='mt-4 text-xl font-semibold tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>On-chain identity registration initiated</label>
					<div className='mt-4 text-2xl font-semibold text-pink_primary'>{displayName}</div>
					<div className='mt-4 flex flex-col gap-2'>
						<span className='flex items-center gap-1'>
							<span className='w-[80px] text-sm tracking-[0.015em] text-lightBlue dark:text-blue-dark-medium'>Address:</span>
							<span>
								<Address
									address={identityAddress || loginAddress}
									displayInline
									isTruncateUsername={false}
								/>
							</span>
						</span>
						{email?.value?.length > 0 && (
							<span className='flex items-center gap-1'>
								<span className='w-[80px] text-sm tracking-[0.015em] text-lightBlue dark:text-blue-dark-medium'>Email:</span>
								<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>{email?.value}</span>
							</span>
						)}
						{web?.value?.length > 0 && (
							<span className='flex items-center gap-1'>
								<span className='w-[80px] text-sm tracking-[0.015em] text-lightBlue dark:text-blue-dark-medium'>Web: </span>
								<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>{web?.value?.slice(0, 15)}...</span>
							</span>
						)}
						{twitter?.value?.length > 0 && (
							<span className='flex items-center gap-1'>
								<span className='w-[80px] text-sm tracking-[0.015em] text-lightBlue dark:text-blue-dark-medium'>Twitter:</span>
								<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>{twitter?.value}</span>
							</span>
						)}
						{matrix?.value?.length > 0 && (
							<span className='flex items-center gap-1'>
								<span className='w-[80px] text-sm tracking-[0.015em] text-lightBlue dark:text-blue-dark-medium'>Matrix: </span>
								<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>{matrix?.value}</span>
							</span>
						)}
					</div>
				</div>

				<CustomButton
					text='Let’s start your verification process'
					onClick={() => {
						// GAEvent for Let’s start your verification process button clicked
						trackEvent('verification_cta_clicked', 'submitted_verification_request', {
							userId: id || '',
							userName: username || ''
						});
						close(true);

						changeStep(ESetIdentitySteps.SOCIAL_VERIFICATION);
						openPreModal(true);
					}}
					variant='primary'
					height={40}
					className='mt-4 w-full'
				/>
			</>
		</Modal>
	);
};

export default IdentitySuccessState;
