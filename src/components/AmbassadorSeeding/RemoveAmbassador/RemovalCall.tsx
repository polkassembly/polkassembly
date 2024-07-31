// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { Button, Form, Radio, Spin } from 'antd';
import Balance from '~src/components/Balance';
import Address from '~src/ui-components/Address';
import { useAmbassadorSeedingSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import AddressInput from '~src/ui-components/AddressInput';
import getEncodedAddress from '~src/util/getEncodedAddress';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import getRankNameByRank from '../utils/getRankNameByRank';
import { EAmbassadorActions, EAmbassadorSeedingRanks } from '../types';
import { useApiContext } from '~src/context';
import { ambassadorSeedingActions } from '~src/redux/ambassadorSeeding';
import { EAmbassadorSeedingSteps } from '~src/redux/ambassadorSeeding/@types';
import getCollectiveApi from '../utils/getCollectiveApi';
import getAmbassadorXcmTx from '../utils/getAmbassadorXcmTx';

interface IRemovalCall {
	className?: string;
}
const RemovalCall = ({ className }: IRemovalCall) => {
	const { api, apiReady } = useApiContext();
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const { removeAmbassadorForm } = useAmbassadorSeedingSelector();
	const [collectivesApi, setCollectivesApi] = useState<ApiPromise | null>(null);
	const [collectivesApiReady, setCollectivesApiReady] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [form] = Form.useForm();

	const handleRemoveAmbassador = async () => {
		if (!collectivesApi || !collectivesApiReady || !removeAmbassadorForm?.applicantAddress || !api || !apiReady) return;
		if (!getEncodedAddress(removeAmbassadorForm?.applicantAddress, network)) return;

		dispatch(ambassadorSeedingActions.updatePromoteCallData({ type: EAmbassadorActions.REMOVE_AMBASSADOR, value: '' }));
		dispatch(ambassadorSeedingActions.updateXcmCallData({ type: EAmbassadorActions.REMOVE_AMBASSADOR, value: '' }));

		setLoading(true);

		const collectivePreimage = collectivesApi.tx.ambassadorCollective.removeMember({ id: removeAmbassadorForm?.applicantAddress }, removeAmbassadorForm?.rank);
		const promoteCallData = collectivePreimage.method.toHex();
		dispatch(ambassadorSeedingActions.updatePromoteCallData({ type: EAmbassadorActions.REMOVE_AMBASSADOR, value: promoteCallData }));

		if (promoteCallData) {
			const xcmCall = getAmbassadorXcmTx(promoteCallData, api);

			const xcmCallData = xcmCall?.method?.toHex() || '';
			dispatch(ambassadorSeedingActions.updateXcmCallData({ type: EAmbassadorActions.REMOVE_AMBASSADOR, value: xcmCallData }));
		}
		setLoading(false);
	};

	const handleInductAddressChange = (address: string) => {
		dispatch(ambassadorSeedingActions.updateApplicantAddress({ type: EAmbassadorActions.REMOVE_AMBASSADOR, value: address }));
	};

	const checkDisabled = () => {
		let check = false;
		check = !removeAmbassadorForm?.applicantAddress || !removeAmbassadorForm?.promoteCallData || !removeAmbassadorForm?.xcmCallData || !collectivesApi || !collectivesApiReady;
		if (removeAmbassadorForm?.applicantAddress) {
			check = !getEncodedAddress(removeAmbassadorForm?.applicantAddress, network);
		}
		return check;
	};

	useEffect(() => {
		(async () => {
			const { collectiveApi, collectiveApiReady } = await getCollectiveApi();
			setCollectivesApi(collectiveApi);
			setCollectivesApiReady(collectiveApiReady);
		})();
	}, []);

	useEffect(() => {
		handleRemoveAmbassador();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [collectivesApi, collectivesApiReady, removeAmbassadorForm?.applicantAddress, removeAmbassadorForm?.rank, api, apiReady]);

	return (
		<Spin spinning={loading}>
			<div className={className}>
				<Form
					form={form}
					initialValues={{ removalApplicantAddress: removeAmbassadorForm?.applicantAddress || '' }}
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
							{(!!removeAmbassadorForm?.proposer || loginAddress) && (
								<Balance
									address={removeAmbassadorForm?.proposer || loginAddress}
									usedInIdentityFlow
								/>
							)}
						</div>
						<div className='flex w-full items-end gap-2 text-sm '>
							<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
								<Address
									address={removeAmbassadorForm?.proposer || loginAddress}
									displayInline
									disableTooltip
									isTruncateUsername={false}
								/>
							</div>
						</div>
					</div>
					<div className='mt-4'>
						<div className='text-sm text-bodyBlue dark:text-blue-dark-medium'>Remove (Who)</div>
						<div className='flex w-full items-end gap-2 text-sm'>
							<AddressInput
								skipFormatCheck
								className='-mt-6 w-full border-section-light-container dark:border-separatorDark'
								defaultAddress={removeAmbassadorForm?.applicantAddress || ''}
								name={'removalApplicantAddress'}
								placeholder='Enter Removal Address'
								iconClassName={'ml-[10px]'}
								identiconSize={26}
								onChange={(address) => handleInductAddressChange(getEncodedAddress(address, network) || address)}
							/>
						</div>
					</div>
					<div className='mt-4 flex gap-1.5 text-sm text-bodyBlue dark:text-blue-dark-medium'>
						Promote Rank <HelperTooltip text={<div className='text-xs'>This indicate at which rank you would like to remove</div>} />
					</div>

					<div>
						<Radio.Group
							onChange={({ target }) => dispatch(ambassadorSeedingActions.updateAmbassadorRank({ type: EAmbassadorActions.REMOVE_AMBASSADOR, value: target?.value }))}
							value={removeAmbassadorForm?.rank}
							className='radio-input-group mt-2 dark:text-white'
						>
							<Radio
								value={EAmbassadorSeedingRanks.HEAD_AMBASSADOR}
								checked={removeAmbassadorForm?.rank === EAmbassadorSeedingRanks.HEAD_AMBASSADOR}
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
								dispatch(ambassadorSeedingActions.updateAmbassadorSteps({ type: EAmbassadorActions.REMOVE_AMBASSADOR, value: EAmbassadorSeedingSteps.CREATE_PREIMAGE }))
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

export default RemovalCall;
