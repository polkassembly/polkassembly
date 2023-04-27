// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import { LoadingOutlined } from '@ant-design/icons';
import { PlusOutlined } from '@ant-design/icons';
import { Signer } from '@polkadot/api/types';
import { Button, Form, Modal, Select, Spin } from 'antd';
import BN from 'bn.js';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import ExtensionNotDetected from 'src/components/ExtensionNotDetected';
import { ApiContext } from 'src/context/ApiContext';
import { NotificationStatus } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import AddressInput from 'src/ui-components/AddressInput';
import BalanceInput from 'src/ui-components/BalanceInput';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import queueNotification from 'src/ui-components/QueueNotification';
import { inputToBn } from 'src/util/inputToBn';

import { NetworkContext } from '~src/context/NetworkContext';
import getAllAccounts, { initResponse } from '~src/util/getAllAccounts';

const ZERO_BN = new BN(0);

const DelegateModal = ({ trackNum } : { trackNum:number }) => {
	const { api, apiReady } = useContext(ApiContext);
	const { network } = useContext(NetworkContext);
	const [fetchAccountsInfo, setFetchAccountsInfo] = useState(true);

	const [accountsInfo, setAccountsInfo] = useState(initResponse);
	const { accounts, accountsMap, noExtension, signersMap, noAccounts } = accountsInfo;
	const [form] = Form.useForm();

	const [showModal, setShowModal] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [target, setTarget] = useState<string>('');
	const [bnBalance, setBnBalance] = useState<BN>(ZERO_BN);
	const [conviction, setConviction] = useState<number>(0);
	const [errorArr, setErrorArr] = useState<string[]>([]);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);

	const CONVICTIONS: [number, number][] = [1, 2, 4, 8, 16, 32].map((lock, index) => [index + 1, lock]);
	const convictionOpts = useMemo(() => [
		<Select.Option key={0} value={0}>{'0.1x voting balance, no lockup period'}</Select.Option>,
		...CONVICTIONS.map(([value, lock]) =>
			<Select.Option key={value} value={value}>{`${value}x voting balance, locked for ${lock} enactment period(s)`}</Select.Option>
		)
	],[CONVICTIONS]);

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		const signer: Signer = signersMap[accountsMap[address]];
		api?.setSigner(signer);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	const validateForm = ():boolean => {
		const errors = [];

		if(!address) {
			errors.push('Please select an address.');
		}

		if(!target) {
			errors.push('Please provide a valid target address.');
		}

		if(address == target) {
			errors.push('Please provide a different target address.');
		}

		if(bnBalance.lte(ZERO_BN)) {
			errors.push('Please provide a valid balance.');
		}

		if(availableBalance.lt(bnBalance)) {
			errors.push('Insufficient balance.');
		}

		setErrorArr(errors);

		return errors.length === 0;
	};

	const handleSubmit = async () => {
		setLoading(true);

		if(!validateForm()){
			setLoading(false);
			return;
		}

		if (!api || !apiReady) {
			return;
		}

		// TODO: check .toNumber()
		const delegateTxn = api.tx.convictionVoting.delegate(trackNum, target, conviction, bnBalance.toNumber());

		delegateTxn.signAndSend(address, ({ status }: any) => {
			if (status.isInBlock) {
				queueNotification({
					header: 'Success!',
					message: 'Delegation successful.',
					status: NotificationStatus.SUCCESS
				});
				setLoading(false);
				console.log(`Delegation: completed at block hash #${status.asInBlock.toString()}`);
			} else {
				console.log(`Delegation: Current status: ${status.type}`);
			}
		}).catch((error: any) => {
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			queueNotification({
				header: 'Delegation failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		});
	};

	const handleOnBalanceChange = (balanceStr: string) => {
		const [balance, isValid] = inputToBn(balanceStr, network, false);
		isValid ? setAvailableBalance(balance) : setAvailableBalance(ZERO_BN);
	};

	return (
		<>
			<button
				type="button"
				className="flex items-center ml-auto px-[36px] py-[10px] border border-pink_primary text-white bg-[#E5007A] hover:text-white font-medium text-xs leading-tight uppercase rounded-[5px]  hover:cursor-pointer focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
				onClick={() => setShowModal(true)}
			>
				<PlusOutlined />

				<span className='ml-1'> Delegate </span>
			</button>

			<Modal
				title={
					<div className='flex items-center'>
						Delegate
						<span className='rounded-md border border-pink_secondary px-2 py-0.5 text-xs ml-2 text-pink_secondary'>
							Delegation dashboard coming soon 🚀
						</span>
					</div>
				}
				open={showModal}
				onOk={handleSubmit}
				confirmLoading={loading}
				onCancel={() => setShowModal(false)}
				footer={

					<div className='flex items-center justify-end'>
						{
							fetchAccountsInfo?
								[
									<Button
										key='got-it'
										icon={<CheckOutlined />}
										className='bg-pink_primary text-white outline-none border border-pink_primary border-solid rounded-md py-3 px-7 font-medium text-lg leading-none flex items-center justify-center'
										onClick={() => {
											getAllAccounts({
												api,
												apiReady,
												get_erc20: ['moonbase', 'moonriver', 'moonbeam'].includes(network),
												network
											})
												.then((res) => {
													setAccountsInfo(res);
													if(!res.accounts || res.accounts.length === 0 ) return;
													setAddress(res.accounts[0].address);
													setFetchAccountsInfo(false);
												})
												.catch((err) => {
													console.error(err);
												});
										}}
									>
										Got it!
									</Button>,
									<Button
										key="cancel"
										onClick={() => {
											setShowModal(false);
										}}
										className='bg-white text-pink_primary outline-none border border-pink_primary border-solid rounded-md py-3 px-7 font-medium text-lg leading-none flex items-center justify-center'
									>
							Cancel
									</Button>
								]
								: [
									<Button key="back" disabled={loading} onClick={() => setShowModal(false)}>
										Cancel
									</Button>,
									<Button htmlType='submit' key="submit" className='bg-pink_primary text-white hover:bg-pink_secondary' disabled={loading || noAccounts || noExtension} onClick={handleSubmit}>
										Confirm
									</Button>
								]
						}
					</div>
				}
			>
				{
					fetchAccountsInfo?
						<div className='max-w-[600px] my-5'>
							<p>
							For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.
							</p>
						</div>
						:
						<Spin spinning={loading} indicator={<LoadingOutlined />}>
							<div className="flex flex-col gap-y-3">

								{noAccounts && <ErrorAlert errorMsg='You need at least one account in your wallet extenstion to use this feature.' />}
								{noExtension && <ExtensionNotDetected />}

								{
									errorArr.length > 0 && errorArr.map(errorMsg => <ErrorAlert key={errorMsg} errorMsg={errorMsg} />)
								}

								{
									!noAccounts && !noExtension &&
								<Form
									form={form}
									disabled={loading}
								>
									<AccountSelectionForm
										title='Address'
										accounts={accounts}
										address={address}
										withBalance
										onAccountChange={(address) => setAddress(address)}
										onBalanceChange={handleOnBalanceChange}
									/>

									<AddressInput
										label={'Target Address'}
										placeholder='Target Account Address'
										className='mt-4 mb-7'
										onChange={(address) => setTarget(address)}
										size='large'
									/>

									<BalanceInput
										label={'Balance'}
										placeholder={'0'}
										className='mt-4'
										onChange={(balance) => setBnBalance(balance)}
										size='large'
									/>

									<div className='-mt-2'>
										<label  className='ml-1 mb-2 flex items-center text-sm text-sidebarBlue'>Conviction</label>

										<Select onChange={(value:any) => setConviction(Number(value))} size='large' className='rounded-md text-sm text-sidebarBlue p-1 w-full' defaultValue={conviction}>
											{convictionOpts}
										</Select>
									</div>
								</Form>
								}

							</div>
						</Spin>
				}
			</Modal>
		</>
	);
};

export default DelegateModal;