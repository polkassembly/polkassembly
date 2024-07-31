// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { EAmbassadorActions, EAmbassadorSeedingRanks, IPromoteCall } from '../types';
import { useAmbassadorSeedingSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import AddressInput from '~src/ui-components/AddressInput';
import { Button, Form, Radio, Spin } from 'antd';
import { useDispatch } from 'react-redux';
import { ambassadorSeedingActions } from '~src/redux/ambassadorSeeding';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { EAmbassadorSeedingSteps } from '~src/redux/ambassadorSeeding/@types';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import Address from '~src/ui-components/Address';
import { useApiContext } from '~src/context';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { chainProperties } from '~src/global/networkConstants';
import { network as AllNetworks } from '~src/global/networkConstants';
import classNames from 'classnames';
import Balance from '~src/components/Balance';
import getRankNameByRank from '../utils/getRankNameByRank';

const PromoteCall = ({ className }: IPromoteCall) => {
	const { api, apiReady } = useApiContext();
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const { addAmbassadorForm } = useAmbassadorSeedingSelector();
	const [form] = Form.useForm();
	const [collectivesApi, setCollectivesApi] = useState<ApiPromise | null>(null);
	const [collectivesApiReady, setCollectivesApiReady] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const handleInductAddressChange = (address: string) => {
		dispatch(ambassadorSeedingActions.updateApplicantAddress({ type: EAmbassadorActions.ADD_AMBASSADOR, value: address }));
	};
	const checkDisabled = () => {
		let check = false;
		check = !addAmbassadorForm?.applicantAddress || !addAmbassadorForm?.promoteCallData || !addAmbassadorForm?.xcmCallData || !collectivesApi || !collectivesApiReady;
		if (addAmbassadorForm?.applicantAddress) {
			check = !getEncodedAddress(addAmbassadorForm?.applicantAddress, network);
		}
		return check;
	};

	const handlePromotesCall = async () => {
		if (!collectivesApi || !collectivesApiReady || !addAmbassadorForm?.applicantAddress || !api || !apiReady) return;
		if (!getEncodedAddress(addAmbassadorForm?.applicantAddress, network)) return;

		dispatch(ambassadorSeedingActions.updatePromoteCallData({ type: EAmbassadorActions.ADD_AMBASSADOR, value: '' }));
		dispatch(ambassadorSeedingActions.updateXcmCallData({ type: EAmbassadorActions.ADD_AMBASSADOR, value: '' }));

		setLoading(true);

		const inductCall = collectivesApi.tx.ambassadorCore.induct(addAmbassadorForm?.applicantAddress);
		const payload: any = [];
		for (let i = 1; i <= addAmbassadorForm?.rank; i++) {
			const promoteCall = collectivesApi.tx.ambassadorCore.promote(addAmbassadorForm?.applicantAddress, i);
			payload.push(promoteCall);
		}
		const collectivePreimage = collectivesApi.tx.utility.forceBatch([inductCall, ...payload]);
		const promoteCallData = collectivePreimage.method.toHex();
		dispatch(ambassadorSeedingActions.updatePromoteCallData({ type: EAmbassadorActions.ADD_AMBASSADOR, value: promoteCallData }));

		if (promoteCallData) {
			const xcmCall = api?.tx.xcmPallet.send(
				{
					V4: {
						interior: {
							X1: [{ Parachain: '1001' }]
						},
						parenets: 0
					}
				},
				{
					V4: [
						{
							UnpaidExecution: {
								checkOrigin: null,
								weightLimit: 'Unlimited'
							}
						},
						{
							Transact: {
								call: {
									encoded: promoteCallData
								},
								originKind: 'Xcm',
								requireWeightAtMost: {
									proofSize: '250000',
									refTime: '4000000000'
								}
							}
						}
					]
				}
			);
			const xcmCallData = xcmCall?.method?.toHex() || '';
			dispatch(ambassadorSeedingActions.updateXcmCallData({ type: EAmbassadorActions.ADD_AMBASSADOR, value: xcmCallData }));
		}
		setLoading(false);
	};

	useEffect(() => {
		handlePromotesCall();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [collectivesApi, collectivesApiReady, addAmbassadorForm?.applicantAddress, addAmbassadorForm?.rank, api, apiReady]);

	useEffect(() => {
		(async () => {
			const wsProvider = new WsProvider(chainProperties?.[AllNetworks.COLLECTIVES]?.rpcEndpoint);
			const apiPromise = await ApiPromise.create({ provider: wsProvider });
			setCollectivesApi(apiPromise);
			const timer = setTimeout(async () => {
				await apiPromise.disconnect();
			}, 60000);

			apiPromise?.isReady
				.then(() => {
					clearTimeout(timer);

					setCollectivesApiReady(true);
					console.log('Collective API ready');
				})
				.catch(async (error) => {
					clearTimeout(timer);
					await apiPromise.disconnect();
					console.error(error);
				});
		})();
	}, []);

	return (
		<Spin spinning={loading}>
			<div className={className}>
				<Form
					form={form}
					initialValues={{ applicantAddress: addAmbassadorForm?.applicantAddress || '' }}
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
							{(!!addAmbassadorForm?.proposer || loginAddress) && (
								<Balance
									address={addAmbassadorForm?.proposer || loginAddress}
									usedInIdentityFlow
								/>
							)}
						</div>
						<div className='flex w-full items-end gap-2 text-sm '>
							<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
								<Address
									address={addAmbassadorForm?.proposer || loginAddress}
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
								defaultAddress={addAmbassadorForm?.applicantAddress || ''}
								name={'applicantAddress'}
								placeholder='Enter Applicant Address'
								iconClassName={'ml-[10px]'}
								identiconSize={26}
								onChange={(address) => handleInductAddressChange(getEncodedAddress(address, network) || address)}
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
							value={addAmbassadorForm?.rank}
							className='radio-input-group mt-2 dark:text-white'
						>
							<Radio
								value={EAmbassadorSeedingRanks.HEAD_AMBASSADOR}
								checked={addAmbassadorForm?.rank === EAmbassadorSeedingRanks.HEAD_AMBASSADOR}
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
							onClick={() => dispatch(ambassadorSeedingActions.updateAmbassadorSteps({ type: EAmbassadorActions.ADD_AMBASSADOR, value: EAmbassadorSeedingSteps.CREATE_PREIMAGE }))}
						>
							Next
						</Button>
					</div>
				</Form>
			</div>
		</Spin>
	);
};
export default PromoteCall;
