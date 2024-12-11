// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { EAmbassadorActions, ICreateAmassadorPreimge } from './types';
import classNames from 'classnames';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import Address from '~src/ui-components/Address';
import getRankNameByRank from './utils/getRankNameByRank';
import { Button, Spin } from 'antd';
import { useDispatch } from 'react-redux';
import { useApiContext } from '~src/context';
import executeTx from '~src/util/executeTx';
import queueNotification from '~src/ui-components/QueueNotification';
import { ILoading, NotificationStatus } from '~src/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { IPreimage } from '../OpenGovTreasuryProposal';
import { HexString } from '@polkadot/util/types';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import Alert from '~src/basic-components/Alert';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { ambassadorRemovalActions } from '~src/redux/removeAmbassador';
import { ambassadorReplacementActions } from '~src/redux/replaceAmbassador';
import { ambassadorSeedingActions } from '~src/redux/addAmbassadorSeeding';
import { EAmbassadorSeedingSteps } from '~src/redux/addAmbassadorSeeding/@types';
import { useTranslation } from 'next-i18next';

const EMPTY_HASH = blake2AsHex('');
const ZERO_BN = new BN(0);

const CreateAmassadorPreimge = ({
	className,
	setOpenSuccessModal,
	closeCurrentModal,
	action,
	applicantAddress,
	proposer,
	rank,
	xcmCallData,
	removingApplicantAddress
}: ICreateAmassadorPreimge) => {
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { loginAddress } = useUserDetailsSelector();
	const { t } = useTranslation('common'); // using t for translations
	const [loading, setLoading] = useState<ILoading>({ isLoading: false, message: '' });
	const [gasFee, setGasFee] = useState<BN>(ZERO_BN);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const baseDeposit = new BN(`${chainProperties[network]?.preImageBaseDeposit}` || 0);

	const getState = (api: ApiPromise, encodedProposal: HexString): IPreimage => {
		let preimageHash = EMPTY_HASH;
		let preimageLength = 0;
		let notePreimageTx: SubmittableExtrinsic<'promise'> | null = null;

		preimageLength = Math.ceil((encodedProposal?.length - 2) / 2);
		preimageHash = blake2AsHex(encodedProposal);
		notePreimageTx = api.tx.preimage.notePreimage(encodedProposal);

		return {
			encodedProposal,
			notePreimageTx,
			preimageHash,
			preimageLength
		};
	};

	const getGasFee = async () => {
		if (!api || !apiReady || !xcmCallData || !proposer) return;

		const info = await api.tx.preimage.notePreimage(xcmCallData as HexString).paymentInfo(proposer);
		const gasFee: BN = new BN((info as any)?.partialFee);
		setGasFee(gasFee);
	};

	const handleUpdateIsPreimageCreationDone = (done: boolean) => {
		switch (action) {
			case EAmbassadorActions.ADD_AMBASSADOR:
				dispatch(ambassadorSeedingActions.updateIsPreimageCreationDone(done));
				break;
			case EAmbassadorActions.REMOVE_AMBASSADOR:
				dispatch(ambassadorRemovalActions.updateIsPreimageCreationDone(done));
				break;
			case EAmbassadorActions.REPLACE_AMBASSADOR:
				dispatch(ambassadorReplacementActions.updateIsPreimageCreationDone(done));
				break;
		}
	};

	const handleUpdateAmbassadorPreimage = (preimage: { hash: string; length: number }) => {
		switch (action) {
			case EAmbassadorActions.ADD_AMBASSADOR:
				dispatch(ambassadorSeedingActions.updateAmbassadorPreimage(preimage));
				break;
			case EAmbassadorActions.REMOVE_AMBASSADOR:
				dispatch(ambassadorRemovalActions.updateAmbassadorPreimage(preimage));
				break;
			case EAmbassadorActions.REPLACE_AMBASSADOR:
				dispatch(ambassadorReplacementActions.updateAmbassadorPreimage(preimage));
				break;
		}
	};
	const handleAmbassadorStepChange = (step: EAmbassadorSeedingSteps) => {
		switch (action) {
			case EAmbassadorActions.ADD_AMBASSADOR:
				dispatch(ambassadorSeedingActions.updateAmbassadorSteps(step));
				break;
			case EAmbassadorActions.REMOVE_AMBASSADOR:
				dispatch(ambassadorRemovalActions.updateAmbassadorSteps(step));
				break;
			case EAmbassadorActions.REPLACE_AMBASSADOR:
				dispatch(ambassadorReplacementActions.updateAmbassadorSteps(step));
				break;
		}
	};

	const onSuccess = (preimage: IPreimage) => {
		handleUpdateIsPreimageCreationDone(true);
		handleUpdateAmbassadorPreimage({ hash: preimage?.preimageHash || '', length: preimage?.preimageLength || 0 });
		closeCurrentModal();
		setOpenSuccessModal(true);
		setLoading({ isLoading: false, message: '' });
	};

	const onFailed = () => {
		queueNotification({
			header: t('failed'),
			message: t('transaction_failed'),
			status: NotificationStatus.ERROR
		});
		setLoading({ isLoading: false, message: '' });
		handleUpdateAmbassadorPreimage({ hash: '', length: 0 });
		handleUpdateIsPreimageCreationDone(false);
	};

	const handleCreatePreimage = async () => {
		if (!api || !apiReady || !xcmCallData || !proposer) return;
		setLoading({ isLoading: true, message: t('awaiting_confirmation') });

		const preimage: any = getState(api, xcmCallData as HexString);
		await executeTx({
			address: proposer || loginAddress,
			api,
			apiReady,
			errorMessageFallback: t('failed'),
			network,
			onFailed,
			onSuccess: () => onSuccess(preimage),
			setStatus: (message: string) => setLoading({ isLoading: true, message: message }),
			tx: preimage.notePreimageTx
		});
	};

	useEffect(() => {
		getGasFee();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network, xcmCallData]);

	return (
		<Spin
			spinning={loading.isLoading}
			tip={loading?.message || ''}
			className='h-[150px]'
		>
			<div className={classNames(className, 'flex w-full flex-shrink-0 flex-col items-center justify-center')}>
				<div className='flex flex-col gap-3 py-6'>
					<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>{t('details')}</span>
					<div className='flex items-start justify-start gap-5'>
						<span className='w-[150px] text-lightBlue dark:text-blue-dark-medium'>{t('proposer_address')}:</span>
						<Address
							iconSize={22}
							address={proposer}
							displayInline
							isTruncateUsername={false}
							disableTooltip
						/>
					</div>

					<div className='flex items-start justify-start gap-5'>
						<span className='w-[150px] text-lightBlue dark:text-blue-dark-medium'>{t('applicant_address')}:</span>
						<Address
							iconSize={22}
							address={applicantAddress}
							displayInline
							isTruncateUsername={false}
							disableTooltip
						/>
					</div>

					{!!removingApplicantAddress && (
						<div className='flex items-start justify-start gap-5'>
							<span className='w-[150px] text-lightBlue dark:text-blue-dark-medium'>{t('removing_address')}:</span>
							<Address
								iconSize={22}
								address={removingApplicantAddress}
								displayInline
								isTruncateUsername={false}
								disableTooltip
							/>
						</div>
					)}
					<div className='flex items-start justify-start gap-5'>
						<span className='w-[150px] text-lightBlue dark:text-blue-dark-medium'>{t('rank')}:</span>
						<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
							{getRankNameByRank(rank)} ({rank})
						</span>
					</div>
				</div>
			</div>
			{!gasFee.eq(ZERO_BN) && (
				<Alert
					type='info'
					className='mt-6 rounded-[4px] text-bodyBlue '
					showIcon
					description={<span className='text-xs dark:text-blue-dark-high'>{t('gas_fees_description', { gasFee: formatedBalance(String(gasFee.toString()), unit), unit })}</span>}
					message={
						<span className='text-[13px] dark:text-blue-dark-high'>{t('base_deposit_required', { baseDeposit: formatedBalance(String(baseDeposit.toString()), unit), unit })}</span>
					}
				/>
			)}
			<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 dark:border-separatorDark'>
				<Button
					className='mt-4 h-10 w-[150px] rounded-[4px] border-[1px] border-pink_primary bg-transparent text-sm font-medium font-semibold text-pink_primary'
					onClick={() => handleAmbassadorStepChange(EAmbassadorSeedingSteps.CREATE_APPLICANT)}
				>
					{t('back')}
				</Button>
				<Button
					className='mt-4 h-10 w-[150px] rounded-[4px] border-none bg-pink_primary text-sm font-medium font-semibold text-white'
					onClick={() => handleCreatePreimage()}
				>
					{t('create_preimage')}
				</Button>
			</div>
		</Spin>
	);
};

export default CreateAmassadorPreimge;
