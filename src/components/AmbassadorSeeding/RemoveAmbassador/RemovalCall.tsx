// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Button, Form, Radio, Spin } from 'antd';
import { network as AllNetworks, chainProperties } from '~src/global/networkConstants';
import Balance from '~src/components/Balance';
import Address from '~src/ui-components/Address';
import { useAmbassadorRemovalSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import AddressInput from '~src/ui-components/AddressInput';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { ambassadorRemovalActions } from '~src/redux/ambassadorRemoval';
import { EAmbassadorRemovalSteps } from '~src/redux/ambassadorRemoval/@types';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import getRankNameByRank from '../utils/getRankNameByRank';
import { EAmbassadorSeedingRanks } from '../types';
import { useApiContext } from '~src/context';

interface IRemovalCall {
	className?: string;
}
const RemovalCall = ({ className }: IRemovalCall) => {
	const { api, apiReady } = useApiContext();
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const { removalAmbassadorAddress, removalAmbassadorProposer, removalAmbassadorCallData, removalAmbassadorXcmCallData, removalAmbassadorRank } = useAmbassadorRemovalSelector();
	const [collectivesApi, setCollectivesApi] = useState<ApiPromise | null>(null);
	const [collectivesApiReady, setCollectivesApiReady] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [form] = Form.useForm();

	const handleRemoveAmbassador = async () => {
		if (!collectivesApi || !collectivesApiReady || !removalAmbassadorAddress || !api || !apiReady) return;
		if (!getEncodedAddress(removalAmbassadorAddress, network)) return;

		dispatch(ambassadorRemovalActions.updateRemovalPromoteCallData(''));
		dispatch(ambassadorRemovalActions.updateRemovalXcmCallData(''));

		setLoading(true);

		const collectivePreimage = collectivesApi.tx.ambassadorCollective.removeMember({ id: removalAmbassadorAddress }, removalAmbassadorRank);
		const removalAmbassadorCallData = collectivePreimage.method.toHex();
		dispatch(ambassadorRemovalActions.updateRemovalPromoteCallData(removalAmbassadorCallData));

		if (removalAmbassadorCallData) {
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
									encoded: removalAmbassadorCallData
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
			const removalAmbassadorXcmCallData = xcmCall?.method?.toHex() || '';
			dispatch(ambassadorRemovalActions.updateRemovalXcmCallData(removalAmbassadorXcmCallData));
		}
		setLoading(false);
	};

	const handleInductAddressChange = (address: string) => {
		dispatch(ambassadorRemovalActions.updateRemovalAddress(address));
	};

	const checkDisabled = () => {
		let check = false;
		check = !removalAmbassadorAddress || !removalAmbassadorCallData || !removalAmbassadorXcmCallData || !collectivesApi || !collectivesApiReady;
		if (removalAmbassadorAddress) {
			check = !getEncodedAddress(removalAmbassadorAddress, network);
		}
		return check;
	};

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

	useEffect(() => {
		handleRemoveAmbassador();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [collectivesApi, collectivesApiReady, removalAmbassadorAddress, removalAmbassadorRank, api, apiReady]);

	return (
		<Spin spinning={loading}>
			<div className={className}>
				<Form
					form={form}
					initialValues={{ removalAmbassadorAddress: removalAmbassadorAddress || '' }}
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
							{(!!removalAmbassadorProposer || loginAddress) && (
								<Balance
									address={removalAmbassadorProposer || loginAddress}
									usedInIdentityFlow
								/>
							)}
						</div>
						<div className='flex w-full items-end gap-2 text-sm '>
							<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
								<Address
									address={removalAmbassadorProposer || loginAddress}
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
								defaultAddress={removalAmbassadorAddress || ''}
								name={'removalAmbassadorAddress'}
								placeholder='Enter Removal Address'
								iconClassName={'ml-[10px]'}
								identiconSize={26}
								onChange={(address) => handleInductAddressChange(getEncodedAddress(address, network) || address)}
							/>
						</div>
					</div>
					<div className='mt-4 flex gap-1.5 text-sm text-bodyBlue dark:text-blue-dark-medium'>
						Promote Rank <HelperTooltip text={<div className='text-xs'>This indicate at which removalAmbassadorRank you would like to remove</div>} />
					</div>

					<div>
						<Radio.Group
							onChange={({ target }) => dispatch(ambassadorRemovalActions.updateRemovalAmbassadorRank(target?.value))}
							value={removalAmbassadorRank}
							className='radio-input-group mt-2 dark:text-white'
						>
							<Radio
								value={EAmbassadorSeedingRanks.HEAD_AMBASSADOR}
								checked={removalAmbassadorRank === EAmbassadorSeedingRanks.HEAD_AMBASSADOR}
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
							onClick={() => dispatch(ambassadorRemovalActions.updateRemovalAmbassadorSteps(EAmbassadorRemovalSteps.CREATE_PREIMAGE))}
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
