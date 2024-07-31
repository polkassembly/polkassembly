// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise } from '@polkadot/api';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useApiContext } from '~src/context';
import { useAmbassadorSeedingSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { EAmbassadorActions, EAmbassadorSeedingRanks } from '../types';
import { ambassadorSeedingActions } from '~src/redux/ambassadorSeeding';
import { Button, Form, Radio, Spin } from 'antd';
import getEncodedAddress from '~src/util/getEncodedAddress';
import Balance from '~src/components/Balance';
import Address from '~src/ui-components/Address';
import AddressInput from '~src/ui-components/AddressInput';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import getRankNameByRank from '../utils/getRankNameByRank';
import classNames from 'classnames';
import { EAmbassadorSeedingSteps } from '~src/redux/ambassadorSeeding/@types';
import getCollectiveApi from '../utils/getCollectiveApi';
import getAmbassadorXcmTx from '../utils/getAmbassadorXcmTx';

interface IReplacementCall {
	className?: string;
}

const ReplacementCall = ({ className }: IReplacementCall) => {
	const { api, apiReady } = useApiContext();
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const ambassadorStoreData = useAmbassadorSeedingSelector();
	const [form] = Form.useForm();
	const [collectivesApi, setCollectivesApi] = useState<ApiPromise | null>(null);
	const [collectivesApiReady, setCollectivesApiReady] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const handleInductAddressChange = (address: string) => {
		dispatch(ambassadorSeedingActions.updateApplicantAddress({ type: EAmbassadorActions.REPLACE_AMBASSADOR, value: address }));
	};
	const checkDisabled = () => {
		let check = false;
		check =
			!ambassadorStoreData?.replaceAmbassadorForm?.applicantAddress ||
			!ambassadorStoreData?.replaceAmbassadorForm?.promoteCallData ||
			!ambassadorStoreData?.replaceAmbassadorForm?.xcmCallData ||
			!collectivesApi ||
			!collectivesApiReady ||
			!ambassadorStoreData?.replaceAmbassadorForm.removingApplicantAddress;
		if (ambassadorStoreData?.replaceAmbassadorForm?.applicantAddress) {
			check = !getEncodedAddress(ambassadorStoreData?.replaceAmbassadorForm?.applicantAddress, network);
		}
		return check;
	};

	const handlePromotesCall = async () => {
		if (
			!collectivesApi ||
			!collectivesApiReady ||
			!ambassadorStoreData?.replaceAmbassadorForm?.applicantAddress ||
			!api ||
			!apiReady ||
			!ambassadorStoreData?.replaceAmbassadorForm?.removingApplicantAddress
		)
			return;
		if (
			!getEncodedAddress(ambassadorStoreData?.replaceAmbassadorForm?.applicantAddress, network) ||
			!getEncodedAddress(ambassadorStoreData?.replaceAmbassadorForm?.removingApplicantAddress, network)
		)
			return;

		dispatch(ambassadorSeedingActions.updatePromoteCallData({ type: EAmbassadorActions.REPLACE_AMBASSADOR, value: '' }));
		dispatch(ambassadorSeedingActions.updateXcmCallData({ type: EAmbassadorActions.REPLACE_AMBASSADOR, value: '' }));

		setLoading(true);

		const inductCall = collectivesApi.tx.ambassadorCore.induct(ambassadorStoreData?.replaceAmbassadorForm?.applicantAddress);
		const payload: any = [];
		for (let i = 1; i <= ambassadorStoreData?.replaceAmbassadorForm?.rank; i++) {
			const promoteCall = collectivesApi.tx.ambassadorCore.promote(ambassadorStoreData?.replaceAmbassadorForm?.applicantAddress, i);
			payload.push(promoteCall);
		}

		const removelCollectivePreimage = collectivesApi.tx.ambassadorCollective.removeMember(
			{ id: ambassadorStoreData?.replaceAmbassadorForm?.removingApplicantAddress },
			ambassadorStoreData?.replaceAmbassadorForm?.rank
		);
		const removeAmbassadorCallData = removelCollectivePreimage.method.toHex();
		const collectivePreimage = collectivesApi.tx.utility.forceBatch([inductCall, ...payload]);
		const promoteCallData = collectivePreimage.method.toHex();
		dispatch(ambassadorSeedingActions.updatePromoteCallData({ type: EAmbassadorActions.REPLACE_AMBASSADOR, value: promoteCallData }));

		if (promoteCallData && removeAmbassadorCallData) {
			const removeXcmCallData = getAmbassadorXcmTx(removeAmbassadorCallData, api);
			const addXcmCallData = getAmbassadorXcmTx(promoteCallData, api);

			const tx = api.tx.utility.batchAll([removeXcmCallData, addXcmCallData]);
			const xcmCallData = tx?.method?.toHex() || '';

			dispatch(ambassadorSeedingActions.updateXcmCallData({ type: EAmbassadorActions.REPLACE_AMBASSADOR, value: xcmCallData }));
		}
		setLoading(false);
	};

	useEffect(() => {
		handlePromotesCall();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		collectivesApi,
		collectivesApiReady,
		ambassadorStoreData?.replaceAmbassadorForm?.applicantAddress,
		ambassadorStoreData?.replaceAmbassadorForm.removingApplicantAddress,
		ambassadorStoreData?.replaceAmbassadorForm?.rank,
		api,
		apiReady
	]);

	useEffect(() => {
		(async () => {
			const { collectiveApi, collectiveApiReady } = await getCollectiveApi();
			setCollectivesApi(collectiveApi);
			setCollectivesApiReady(collectiveApiReady);
		})();
	}, []);

	return (
		<Spin spinning={loading}>
			<div className={className}>
				<Form
					form={form}
					initialValues={{
						applicantAddress: ambassadorStoreData?.replaceAmbassadorForm?.applicantAddress || '',
						removalApplicantAddress: ambassadorStoreData?.replaceAmbassadorForm.removingApplicantAddress || ''
					}}
				>
					<div>
						<div className='flex items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
							<label className='text-sm text-bodyBlue dark:text-blue-dark-medium'>
								Your Address{' '}
								{/* <HelperTooltip
									className='ml-1'
									text='Please note the verification cannot be transferred to another address.'
								/> */}
							</label>
							{(!!ambassadorStoreData?.replaceAmbassadorForm?.proposer || loginAddress) && (
								<Balance
									address={ambassadorStoreData?.replaceAmbassadorForm?.proposer || loginAddress}
									usedInIdentityFlow
								/>
							)}
						</div>
						<div className='flex w-full items-end gap-2 text-sm '>
							<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
								<Address
									address={ambassadorStoreData?.replaceAmbassadorForm?.proposer || loginAddress}
									displayInline
									disableTooltip
									isTruncateUsername={false}
								/>
							</div>
						</div>
					</div>
					<div className='mt-4'>
						<div className='text-sm text-bodyBlue dark:text-blue-dark-medium'>Applicant Address</div>
						<div className='flex w-full items-end gap-2 text-sm'>
							<AddressInput
								skipFormatCheck
								className='-mt-6 w-full border-section-light-container dark:border-separatorDark'
								defaultAddress={ambassadorStoreData?.replaceAmbassadorForm?.applicantAddress || ''}
								name={'applicantAddress'}
								placeholder='Enter Applicant Address'
								iconClassName={'ml-[10px]'}
								identiconSize={26}
								onChange={(address) => handleInductAddressChange(getEncodedAddress(address, network) || address)}
							/>
						</div>
					</div>

					<div className='mt-4'>
						<div className='text-sm text-bodyBlue dark:text-blue-dark-medium'>Remove (Who)</div>
						<div className='flex w-full items-end gap-2 text-sm'>
							<AddressInput
								skipFormatCheck
								className='-mt-6 w-full border-section-light-container dark:border-separatorDark'
								defaultAddress={ambassadorStoreData?.replaceAmbassadorForm?.removingApplicantAddress || ''}
								name={'removalApplicantAddress'}
								placeholder='Enter Removal Address'
								iconClassName={'ml-[10px]'}
								identiconSize={26}
								onChange={(address) => dispatch(ambassadorSeedingActions.updateRemovingAmbassadorApplicantAddress(getEncodedAddress(address, network) || address))}
							/>
						</div>
					</div>
					{/* ambassador ranks */}
					<div className='mt-4 flex gap-1.5 text-sm text-bodyBlue dark:text-blue-dark-medium'>
						Promote Rank <HelperTooltip text={<div className='text-xs'>This indicate at what rank you would like to promote yourself</div>} />
					</div>

					<div>
						<Radio.Group
							onChange={({ target }) => dispatch(ambassadorSeedingActions.updateAmbassadorRank(target?.value))}
							value={ambassadorStoreData?.replaceAmbassadorForm?.rank}
							className='radio-input-group mt-2 dark:text-white'
						>
							<Radio
								value={EAmbassadorSeedingRanks.HEAD_AMBASSADOR}
								checked={ambassadorStoreData?.replaceAmbassadorForm?.rank === EAmbassadorSeedingRanks.HEAD_AMBASSADOR}
								className='capitalize text-lightBlue dark:text-white'
								key={EAmbassadorSeedingRanks.HEAD_AMBASSADOR}
							>
								{getRankNameByRank(EAmbassadorSeedingRanks.HEAD_AMBASSADOR)}
							</Radio>
						</Radio.Group>
					</div>

					<div className='-mx-6 mt-6 flex justify-end border-0 border-t-[1px] border-solid border-section-light-container px-6 dark:border-separatorDark'>
						<Button
							disabled={checkDisabled()}
							className={classNames('mt-4 h-10 w-[150px] rounded-[4px] border-none bg-pink_primary text-white', checkDisabled() ? 'opacity-50' : '')}
							onClick={() =>
								dispatch(ambassadorSeedingActions.updateAmbassadorSteps({ type: EAmbassadorActions.REPLACE_AMBASSADOR, value: EAmbassadorSeedingSteps.CREATE_PREIMAGE }))
							}
						>
							Next
						</Button>
					</div>
				</Form>
			</div>
		</Spin>
	);
};

export default ReplacementCall;
