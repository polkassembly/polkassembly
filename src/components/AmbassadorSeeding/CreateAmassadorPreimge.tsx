// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { ICreateAmassadorPreimge } from './types';
import classNames from 'classnames';
import { useAmbassadorSeedingSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import Address from '~src/ui-components/Address';
import getRankNameByRank from './utils/getRankNameByRank';
import { Button, Spin } from 'antd';
import { EAmbassadorSeedingSteps } from '~src/redux/ambassadorSeeding/@types';
import { useDispatch } from 'react-redux';
import { ambassadorSeedingActions } from '~src/redux/ambassadorSeeding';
import { useApiContext } from '~src/context';
import executeTx from '~src/util/executeTx';
import queueNotification from '~src/ui-components/QueueNotification';
import { ILoading, NotificationStatus } from '~src/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { IPreimage } from '../OpenGovTreasuryProposal';
import { HexString } from '@polkadot/util/types';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise } from '@polkadot/api';

const EMPTY_HASH = blake2AsHex('');

const CreateAmassadorPreimge = ({ className, setOpenSuccessModal, closeCurrentModal }: ICreateAmassadorPreimge) => {
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { loginAddress } = useUserDetailsSelector();
	const { inductAddress, proposer, rank, xcmCallData } = useAmbassadorSeedingSelector();
	const [loading, setLoading] = useState<ILoading>({ isLoading: false, message: '' });

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

	const onSuccess = (preimage: IPreimage) => {
		dispatch(ambassadorSeedingActions.updateAmbassadorPreimage({ hash: preimage?.preimageHash || '', length: preimage?.preimageLength || 0 }));
		closeCurrentModal();
		setOpenSuccessModal(true);
		setLoading({ isLoading: false, message: '' });
	};

	const onFailed = () => {
		queueNotification({
			header: 'failed!',
			message: 'Transaction failed!',
			status: NotificationStatus.ERROR
		});
		setLoading({ isLoading: false, message: '' });
	};

	const handleCreatePreimage = async () => {
		if (!api || !apiReady || !xcmCallData || !proposer) return;
		setLoading({ isLoading: true, message: 'Awaiting Confirmation!' });

		const preimage: any = getState(api, xcmCallData as HexString);

		await executeTx({
			address: proposer || loginAddress,
			api,
			apiReady,
			errorMessageFallback: 'failed!',
			network,
			onFailed,
			onSuccess: () => onSuccess(preimage),
			setStatus: (message: string) => setLoading({ ...loading, message: message }),
			tx: preimage.notePreimageTx
		});
	};

	useEffect(() => {
		if (loginAddress && !proposer) {
			dispatch(ambassadorSeedingActions.updateProposer(loginAddress));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Spin
			spinning={loading.isLoading}
			tip={loading?.message || ''}
			className='h-[150px]'
		>
			<div className={classNames(className, 'flex w-full flex-shrink-0 flex-col items-center justify-center')}>
				<div className='flex flex-col gap-3 py-6'>
					<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>Details: </span>
					<div className='flex items-start justify-start gap-5'>
						<span className='w-[150px] text-lightBlue dark:text-blue-dark-medium'> Proposer Address:</span>
						<Address
							iconSize={22}
							address={proposer}
							displayInline
							isTruncateUsername={false}
							disableTooltip
						/>
					</div>

					<div className='flex items-start justify-start gap-5'>
						<span className='w-[150px] text-lightBlue dark:text-blue-dark-medium'>Induct Address:</span>
						<Address
							iconSize={22}
							address={inductAddress}
							displayInline
							isTruncateUsername={false}
							disableTooltip
						/>
					</div>
					<div className='flex items-start justify-start gap-5'>
						<span className='w-[150px] text-lightBlue dark:text-blue-dark-medium'>Rank:</span>
						<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
							{getRankNameByRank(rank)} ({rank})
						</span>
					</div>
				</div>
			</div>
			<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 dark:border-separatorDark'>
				<Button
					className='mt-4 h-10 w-[150px] rounded-[4px] border-[1px] border-pink_primary bg-transparent text-sm font-medium text-pink_primary'
					onClick={() => dispatch(ambassadorSeedingActions.updateAmbassadorSteps(EAmbassadorSeedingSteps.PROMOTES_CALL))}
				>
					Back
				</Button>
				<Button
					className='mt-4 h-10 w-[150px] rounded-[4px] border-none bg-pink_primary text-sm font-medium text-white'
					onClick={() => handleCreatePreimage()}
				>
					Create Preimage
				</Button>
			</div>
		</Spin>
	);
};
export default CreateAmassadorPreimge;
