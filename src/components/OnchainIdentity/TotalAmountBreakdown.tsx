// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import UpArrowIcon from '~assets/icons/up-arrow.svg';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import styled from 'styled-components';
import { useNetworkSelector, useOnchainIdentitySelector, useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';
import executeTx from '~src/util/executeTx';
import { NotificationStatus } from '~src/types';
import queueNotification from '~src/ui-components/QueueNotification';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import ImageIcon from '~src/ui-components/ImageIcon';
import { DownArrowIcon } from '~src/ui-components/CustomIcons';
import Alert from '~src/basic-components/Alert';
import getIdentityRegistrarIndex from '~src/util/getIdentityRegistrarIndex';
import { ESetIdentitySteps, IAmountBreakDown } from './types';
import getIdentityLearnMoreRedirection from './utils/getIdentityLearnMoreRedirection';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import classNames from 'classnames';

const TotalAmountBreakdown = ({ className, txFee, loading, setStartLoading, changeStep }: IAmountBreakDown) => {
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi } = usePeopleChainApiContext();
	const { identityAddress, identityInfo } = useOnchainIdentitySelector();
	const { registerarFee, minDeposite } = txFee;
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [amountBreakup, setAmountBreakup] = useState<boolean>(false);
	const [showAlert, setShowAlert] = useState<boolean>(false);

	const handleRequestJudgement = async () => {
		if (identityInfo?.verifiedByPolkassembly) return;
		// GAEvent for request judgement button clicked
		trackEvent('request_judgement_cta_clicked', 'initiated_judgement_request', {
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});
		if (identityInfo.isIdentitySet && !!identityInfo?.email) {
			const registrarIndex = getIdentityRegistrarIndex({ network: network });

			if (!api || !apiReady || registrarIndex === null || !identityAddress) return;

			setStartLoading({ isLoading: true, message: 'Awaiting Confirmation' });
			const requestedJudgementTx = (peopleChainApi ?? api).tx?.identity?.requestJudgement(registrarIndex, txFee.registerarFee.toString());

			const onSuccess = async () => {
				changeStep(ESetIdentitySteps.SOCIAL_VERIFICATION);
				setStartLoading({ isLoading: false, message: 'Success!' });
			};
			const onFailed = (error: string) => {
				queueNotification({
					header: 'failed!',
					message: error || 'Transaction failed!',
					status: NotificationStatus.ERROR
				});
				setStartLoading({ isLoading: false, message: error || 'Failed' });
			};

			await executeTx({
				address: identityAddress,
				api: peopleChainApi ?? api,
				apiReady,
				errorMessageFallback: 'failed.',
				network,
				onFailed,
				onSuccess,
				setStatus: (message: string) => setStartLoading({ isLoading: true, message }),
				tx: requestedJudgementTx
			});
		} else {
			setShowAlert(true);
		}
	};

	return (
		<div className={className}>
			{(!identityInfo.isIdentitySet || identityInfo?.verifiedByPolkassembly) && showAlert && !identityInfo?.email && (
				<Alert
					showIcon
					type='info'
					className='mt-4 h-10 rounded-[4px] text-[13px] text-bodyBlue '
					message={<span className='dark:text-blue-dark-high'>No identity request found for judgment.</span>}
				/>
			)}

			{identityInfo.isIdentitySet && showAlert && !identityInfo?.email && !identityInfo?.verifiedByPolkassembly && (
				<Alert
					showIcon
					type='info'
					className='mt-4 rounded-[4px] text-[13px] text-bodyBlue '
					description={<span className='dark:text-blue-dark-high'>To request judgement from Polkassembly please provide email for verification before requesting judgement.</span>}
				/>
			)}
			<ImageIcon
				alt='amount breakdown identity icon'
				src='/assets/icons/amount-breakdown-identity.svg'
				imgClassName='h-[210px] w-[350px]'
				imgWrapperClassName='py-10 flex items-center justify-center '
			/>
			<ul className='flex flex-col gap-2 pl-4 text-sm tracking-[0.001em] text-bodyBlue dark:text-blue-dark-high'>
				<li>Polkadot offers on-chain identities that verify users&apos;s credentials through appointed registrars, instilling greater trust and support. </li>
				<li>
					Once successfully verified, users receive a green checkmark, symbolising their trusted status. This verified status symbol enhances trustworthiness when requesting funds
					from the treasury or participating in discussions and proposals.
					<u className='text-pink_primary'>
						<a
							className='ml-1 text-sm text-pink_primary'
							href={getIdentityLearnMoreRedirection(network)}
						>
							Learn more
						</a>
					</u>
				</li>
			</ul>
			<div className='min-h-[60px] rounded-lg bg-[#F6F7F9] px-3 py-[14px] dark:bg-[#1D1D1D]'>
				<div className={`flex justify-between ${amountBreakup && 'border-0 border-b-[1px] border-solid border-[#E1E6EB] pb-3 dark:border-separatorDark'}`}>
					<span className='text-sm text-lightBlue dark:text-blue-dark-high'>Total Amount Required</span>
					<div className='flex cursor-pointer flex-col text-base font-semibold text-bodyBlue dark:text-blue-dark-high'>
						<span
							className='flex justify-end'
							onClick={() => setAmountBreakup(!amountBreakup)}
						>
							{formatedBalance(registerarFee?.add(minDeposite).toString(), unit, 2)} {unit}
							{amountBreakup ? <DownArrowIcon className='ml-2 text-2xl' /> : <UpArrowIcon className='ml-2 text-xl' />}
						</span>
						<span className='mr-1 mt-[-2px] text-xs font-normal text-lightBlue dark:text-blue-dark-medium'>{amountBreakup ? 'Hide' : 'View'} Amount Breakup</span>
					</div>
				</div>
				{amountBreakup && (
					<div className='mt-3 flex flex-col gap-2'>
						<span className='flex justify-between text-sm'>
							<span className='text-lightBlue dark:text-blue-dark-medium'>
								Min Deposit{' '}
								<HelperTooltip
									className='ml-1'
									text='Amount that needs held in an address for a verified account.'
								/>
							</span>
							<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
								{formatedBalance(minDeposite.toString(), unit, 2)} {unit}
							</span>
						</span>
						<span className='flex justify-between text-sm'>
							<span className='text-lightBlue dark:text-blue-dark-medium'>
								Registrar fees{' '}
								<HelperTooltip
									text='Fee charged for on chain verification by registrar.'
									className='ml-1'
								/>
							</span>
							<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
								{formatedBalance(registerarFee.toString(), unit)} {unit}
							</span>
						</span>
					</div>
				)}
			</div>
			<div className='-mx-6 mt-6 border-0 border-t-[1px] border-solid border-[#E1E6EB] px-6 pt-5 dark:border-separatorDark'>
				<CustomButton
					text="Let's Begin"
					loading={loading}
					onClick={() => {
						// GAEvent for let's begin button clicked
						trackEvent('lets_begin_cta_clicked', 'initiated_verification_process', {
							userId: currentUser?.id || '',
							userName: currentUser?.username || ''
						});
						changeStep(ESetIdentitySteps.SET_IDENTITY_FORM);
					}}
					height={40}
					className={classNames('w-full')}
					variant='primary'
				/>
				<button
					onClick={handleRequestJudgement}
					className={classNames('mt-2 h-10 w-full cursor-pointer rounded-[4px] bg-white text-sm tracking-wide text-pink_primary dark:bg-section-dark-overlay')}
				>
					Request Judgement
					<HelperTooltip
						className='ml-2 w-5'
						text={<span className='break-words'>If you have already set your identity, you can request a judgment directly from here </span>}
					/>
				</button>
			</div>
		</div>
	);
};

export default styled(TotalAmountBreakdown)`
	button {
		border: 1px solid var(--pink_primary);
	}
	.ant-alert-with-description {
		padding-block: 12px !important;
		padding-inline: 12px;
	}
	.ant-alert-with-description .ant-alert-icon {
		font-size: 18px !important;
		margin-top: 4px;
	}
`;
