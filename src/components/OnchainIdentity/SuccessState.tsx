// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect } from 'react';
import { ESetIdentitySteps, IName, ISocials, ITxFee } from '.';
import { poppins } from 'pages/_app';
import { Button, Modal } from 'antd';
import Address from '~src/ui-components/Address';
import SuccessIcon from '~assets/icons/identity-success.svg';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { trackEvent } from 'analytics';

interface Props {
	className?: string;
	socials: ISocials;
	name: IName;
	txFee: ITxFee;
	open?: boolean;
	address: string;
	changeStep: (step: ESetIdentitySteps) => void;
	close: (pre: boolean) => void;
	openPreModal: (pre: boolean) => void;
}

const SuccessState = ({ className, open, close, changeStep, openPreModal, name, socials, address }: Props) => {
	const { network } = useNetworkSelector();
	const { displayName } = name;
	const { email, web, twitter, riot } = socials;
	const currentUser = useUserDetailsSelector();

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
			className={`${poppins.variable} ${poppins.className} w-[600px] max-sm:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
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
					<SuccessIcon />
					<label className='mt-4 text-xl font-semibold tracking-[0.0015em] text-bodyBlue dark:text-blue-dark-high'>On-chain identity registration initiated</label>
					<div className='mt-4 text-2xl font-semibold text-pink_primary'>{displayName}</div>
					<div className='mt-4 flex flex-col gap-2'>
						<span className='flex items-center gap-1'>
							<span className='w-[80px] text-sm tracking-[0.015em] text-lightBlue dark:text-blue-dark-medium'>Address:</span>
							<span>
								<Address
									address={address}
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
						{riot?.value?.length > 0 && (
							<span className='flex items-center gap-1'>
								<span className='w-[80px] text-sm tracking-[0.015em] text-lightBlue dark:text-blue-dark-medium'>Riot: </span>
								<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>{riot?.value}</span>
							</span>
						)}
					</div>
				</div>

				<Button
					onClick={() => {
						// GAEvent for Let’s start your verification process button clicked
						trackEvent('verification_CTA_clicked', 'submitted_verification_request', {
							userId: currentUser?.id || '',
							userName: currentUser?.username || ''
						});
						close(true);
						changeStep(ESetIdentitySteps.SOCIAL_VERIFICATION);
						openPreModal(true);
					}}
					className='mt-6 h-[40px] w-full rounded-[4px] border-none bg-pink_primary text-sm tracking-wide text-white'
				>
					Let’s start your verification process
				</Button>
			</>
		</Modal>
	);
};

export default SuccessState;
