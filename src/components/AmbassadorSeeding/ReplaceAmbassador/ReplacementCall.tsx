// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise } from '@polkadot/api';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useApiContext } from '~src/context';
import { useAmbassadorReplacementSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { EAmbassadorSeedingRanks } from '../types';
import { Button, Form, Radio, Spin } from 'antd';
import getEncodedAddress from '~src/util/getEncodedAddress';
import Balance from '~src/components/Balance';
import Address from '~src/ui-components/Address';
import AddressInput from '~src/ui-components/AddressInput';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import getRankNameByRank from '../utils/getRankNameByRank';
import classNames from 'classnames';
import getCollectiveApi from '../utils/getCollectiveApi';
import getAmbassadorXcmTx from '../utils/getAmbassadorXcmTx';
import { ambassadorReplacementActions } from '~src/redux/replaceAmbassador';
import { EAmbassadorSeedingSteps } from '~src/redux/addAmbassadorSeeding/@types';
import { useTranslation } from 'next-i18next';

interface IReplacementCall {
	className?: string;
}

const ReplacementCall = ({ className }: IReplacementCall) => {
	const { t } = useTranslation('common');
	const { api, apiReady } = useApiContext();
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const { applicantAddress = '', proposer = loginAddress, rank = 3, xcmCallData = '', promoteCallData = '', removingApplicantAddress = '' } = useAmbassadorReplacementSelector();
	const [form] = Form.useForm();
	const [collectivesApi, setCollectivesApi] = useState<ApiPromise | null>(null);
	const [collectivesApiReady, setCollectivesApiReady] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const handleInductAddressChange = (address: string) => {
		dispatch(ambassadorReplacementActions.updateApplicantAddress(address));
	};
	const checkDisabled = () => {
		let check = false;
		check = !applicantAddress || !promoteCallData || !xcmCallData || !collectivesApi || !collectivesApiReady || !removingApplicantAddress;
		if (applicantAddress) {
			check = !getEncodedAddress(applicantAddress, network);
		}
		return check;
	};

	const handlePromotesCall = async () => {
		if (!collectivesApi || !collectivesApiReady || !applicantAddress || !api || !apiReady || !removingApplicantAddress) return;
		if (!getEncodedAddress(applicantAddress, network) || !getEncodedAddress(removingApplicantAddress, network)) return;

		dispatch(ambassadorReplacementActions.updatePromoteCallData(''));
		dispatch(ambassadorReplacementActions.updateXcmCallData(''));

		setLoading(true);

		const inductCall = collectivesApi.tx.ambassadorCore.induct(applicantAddress);
		const payload: any = [];
		for (let i = 1; i <= rank; i++) {
			const promoteCall = collectivesApi.tx.ambassadorCore.promote(applicantAddress, i);
			payload.push(promoteCall);
		}

		const removelCollectivePreimage = collectivesApi.tx.ambassadorCollective.removeMember({ id: removingApplicantAddress }, rank);
		const removeAmbassadorCallData = removelCollectivePreimage.method.toHex();
		const collectivePreimage = collectivesApi.tx.utility.forceBatch([inductCall, ...payload]);
		const promoteCallData = collectivePreimage.method.toHex();
		dispatch(ambassadorReplacementActions.updatePromoteCallData(promoteCallData));

		if (promoteCallData && removeAmbassadorCallData) {
			const removeXcmCallData = getAmbassadorXcmTx(removeAmbassadorCallData, api);
			const addXcmCallData = getAmbassadorXcmTx(promoteCallData, api);

			const tx = api.tx.utility.batchAll([removeXcmCallData, addXcmCallData]);
			const xcmCallData = tx?.method?.toHex() || '';

			dispatch(ambassadorReplacementActions.updateXcmCallData(xcmCallData));
		}
		setLoading(false);
	};

	useEffect(() => {
		handlePromotesCall();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [collectivesApi, collectivesApiReady, applicantAddress, removingApplicantAddress, rank, api, apiReady]);

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
						applicantAddress: applicantAddress || '',
						removalApplicantAddress: removingApplicantAddress || ''
					}}
				>
					<div>
						<div className='flex items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
							<label className='text-sm text-bodyBlue dark:text-blue-dark-medium'>{t('your_address')}</label>
							{(!!proposer || loginAddress) && (
								<Balance
									address={proposer || loginAddress}
									usedInIdentityFlow
								/>
							)}
						</div>
						<div className='flex w-full items-end gap-2 text-sm '>
							<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
								<Address
									address={proposer || loginAddress}
									displayInline
									disableTooltip
									isTruncateUsername={false}
								/>
							</div>
						</div>
					</div>
					<div className='mt-4'>
						<div className='text-sm text-bodyBlue dark:text-blue-dark-medium'>{t('applicant_address')}</div>
						<div className='flex w-full items-end gap-2 text-sm'>
							<AddressInput
								skipFormatCheck
								className='-mt-6 w-full border-section-light-container dark:border-separatorDark'
								defaultAddress={applicantAddress || ''}
								name={'applicantAddress'}
								placeholder={t('enter_applicant_address')}
								iconClassName={'ml-[10px]'}
								identiconSize={26}
								onChange={(address) => handleInductAddressChange(getEncodedAddress(address, network) || address)}
							/>
						</div>
					</div>

					<div className='mt-4'>
						<div className='text-sm text-bodyBlue dark:text-blue-dark-medium'>{t('remove_who')}</div>
						<div className='flex w-full items-end gap-2 text-sm'>
							<AddressInput
								skipFormatCheck
								className='-mt-6 w-full border-section-light-container dark:border-separatorDark'
								defaultAddress={removingApplicantAddress || ''}
								name={'removalApplicantAddress'}
								placeholder={t('enter_removal_address')}
								iconClassName={'ml-[10px]'}
								identiconSize={26}
								onChange={(address) => dispatch(ambassadorReplacementActions.updateRemovingAddress(getEncodedAddress(address, network) || address))}
							/>
						</div>
					</div>
					<div className='mt-4 flex gap-1.5 text-sm text-bodyBlue dark:text-blue-dark-medium'>
						{t('promote_rank')} <HelperTooltip text={<div className='text-xs'>{t('promote_rank_tooltip')}</div>} />
					</div>

					<div>
						<Radio.Group
							onChange={({ target }) => dispatch(ambassadorReplacementActions.updateAmbassadorRank(target?.value))}
							value={rank}
							className='radio-input-group mt-2 dark:text-white'
						>
							<Radio
								value={EAmbassadorSeedingRanks.HEAD_AMBASSADOR}
								checked={rank === EAmbassadorSeedingRanks.HEAD_AMBASSADOR}
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
							onClick={() => dispatch(ambassadorReplacementActions.updateAmbassadorSteps(EAmbassadorSeedingSteps.CREATE_PREIMAGE))}
						>
							{t('next')}
						</Button>
					</div>
				</Form>
			</div>
		</Spin>
	);
};

export default ReplacementCall;
