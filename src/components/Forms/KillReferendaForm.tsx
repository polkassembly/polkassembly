// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Injected, InjectedWindow } from '@polkadot/extension-inject/types';
import React, { useCallback, useEffect, useState } from 'react';
import { useApiContext } from '~src/context';
import { useInitialConnectAddress, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { NotificationStatus } from '~src/types';
import { Alert, Form, Input } from 'antd';
import _ from 'lodash';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Markdown from '~src/ui-components/Markdown';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { APPNAME } from '~src/global/appName';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import { BN } from '@polkadot/util';
import Loader from '~src/ui-components/Loader';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
const ZERO_BN = new BN(0);

export default function KillReferendaForm() {
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const { loginWallet } = useUserDetailsSelector();
	const { address, availableBalance } = useInitialConnectAddress();
	const [loadingStatus, setLoadingStatus] = useState({ isLoading: false, message: '' });
	const [submissionDeposite, setSubmissionDeposite] = useState<BN>(ZERO_BN);
	const [error, setError] = useState<string>('');
	const [postData, setPostData] = useState<{ title: string; content: string; index: string }>({
		content: '',
		index: '',
		title: ''
	});

	const [form] = Form.useForm();
	const formName = 'kill-ref-form';
	const unit = `${chainProperties[network]?.tokenSymbol}`;

	const handleSubmit = async () => {
		if (!api || !apiReady) {
			return;
		}
		if (!loginWallet) {
			return;
		}
		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[loginWallet] : null;

		if (!wallet || !api || !apiReady) {
			console.log('wallet not found');
			return;
		}

		let injected: Injected | undefined;
		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec

				if (wallet && wallet.enable) {
					wallet
						.enable(APPNAME)
						.then((value: any) => {
							clearTimeout(timeoutId);
							resolve(value);
						})
						.catch((error: any) => {
							reject(error);
						});
				}
			});
		} catch (err) {
			console.log(err?.message);
		}

		if (!injected) {
			console.log('injected not found');
			return;
		}

		api.setSigner(injected.signer);

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });
		try {
			const proposal = api.tx.referenda.kill(+postData?.index);

			const onSuccess = async () => {
				queueNotification({
					header: 'Success!',
					message: `Propsal #${proposal.hash} successful.`,
					status: NotificationStatus.SUCCESS
				});
				setLoadingStatus({ isLoading: false, message: '' });
			};

			const onFailed = (message: string) => {
				setLoadingStatus({ isLoading: false, message: '' });
				queueNotification({
					header: 'Failed!',
					message,
					status: NotificationStatus.ERROR
				});
			};

			await executeTx({
				address,
				api,
				apiReady,
				errorMessageFallback: 'Transaction failed.',
				network,
				onBroadcast: () => setLoadingStatus({ isLoading: true, message: 'Broadcasting the vote' }),
				onFailed,
				onSuccess,
				tx: proposal
			});
		} catch (error) {
			setLoadingStatus({ isLoading: false, message: '' });
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		}
	};

	const getReferendaData = async (index: string) => {
		if (!index) {
			setError('');
			console.log('invalid index');
			return;
		}
		setLoadingStatus({ isLoading: true, message: 'fetching proposal details' });
		try {
			const { data }: any = await nextApiClientFetch('api/v1/getTitleAndContent', { index });
			if (data.message) {
				setError(data.message);
				setPostData({
					content: '',
					index,
					title: ''
				});
				return;
			}
			setPostData({ ...data, index });
			setError('');
		} catch (e) {
			setError(e.message);
		} finally {
			setLoadingStatus({ isLoading: false, message: '' });
		}
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleDebounceData = useCallback(_.debounce(getReferendaData, 500), []);

	useEffect(() => {
		if (!api || !apiReady) return;
		const submissionDeposite = api?.consts?.referenda?.submissionDeposit || ZERO_BN;
		setSubmissionDeposite(submissionDeposite);
	}, [api, apiReady]);

	return (
		<div className='w-full'>
			{availableBalance.lte(submissionDeposite) && (
				<Alert
					className='my-2 mt-6 rounded-[4px] dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark'
					type='info'
					showIcon
					message={
						<span className='text-[13px] font-medium text-bodyBlue dark:text-blue-dark-high'>
							Please maintain minimum {formatedBalance(String(submissionDeposite.toString()), unit)} {unit} balance for these transactions:
						</span>
					}
					description={
						<div className='-mt-1 mr-[18px] flex flex-col gap-1 text-xs dark:text-blue-dark-high'>
							<li className='mt-0 flex w-full justify-between'>
								<div className='mr-1 text-lightBlue dark:text-blue-dark-medium'>Proposal Submission</div>
								<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
									{formatedBalance(String(submissionDeposite.toString()), unit)} {unit}
								</span>
							</li>
						</div>
					}
				/>
			)}
			<Form
				form={form}
				name={formName}
				onFinish={handleSubmit}
			>
				<div className='mt-3 flex flex-col gap-1'>
					<label className='inner-headings mb-[2px] dark:text-blue-dark-medium'>
						<span className='flex items-center'>Referenda Index</span>
					</label>
					<Form.Item
						name='referenda-index'
						rules={[
							{
								message: 'Please enter referenda index',
								required: true
							}
						]}
					>
						<Input
							type='number'
							className='rounded-md px-4 py-3 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							placeholder='Enter Referenda Index'
							onChange={(e) => handleDebounceData(e.target.value)}
						/>
					</Form.Item>
				</div>
			</Form>

			{loadingStatus.isLoading && (
				<div className='flex flex-col items-center justify-center'>
					<Loader />
					{loadingStatus.isLoading && <span className='text-pink_primary dark:text-pink-dark-primary'>{loadingStatus.message}</span>}
				</div>
			)}
			{error && postData.index && <span className='text-[#FF4D4F]'>{error}</span>}
			{!error && !loadingStatus.isLoading && postData && (postData?.title || postData?.content) && (
				<>
					<Form
						name='post-content-form'
						layout='vertical'
						initialValues={postData}
					>
						<div className='flex flex-col gap-1'>
							<label className='inner-headings mb-[2px] dark:text-blue-dark-medium'>
								<span className='flex items-center'>Title</span>
							</label>
							<Form.Item name='title'>
								<Input
									defaultValue={postData?.title}
									value={postData?.title}
									className='text-black dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
									disabled
								/>
							</Form.Item>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='inner-headings mb-[2px] dark:text-blue-dark-medium'>
								<span className='flex items-center'>Content</span>
							</label>
							<Markdown
								imgHidden
								className='post-content rounded-[4px] border-[1px] border-solid border-[#dddddd] bg-[#f5f5f5] px-3 py-2 dark:border-[#3B444F] dark:bg-section-dark-overlay
								dark:text-blue-dark-high '
								md={postData.content}
							/>
						</div>
					</Form>
					<div className=' mt-4 flex items-center justify-between'>
						<div className='flex items-center justify-end'>
							<CustomButton
								variant='primary'
								htmlType='submit'
								buttonsize='xs'
								onClick={handleSubmit}
								disabled={availableBalance.lte(submissionDeposite)}
							>
								Kill a Referenda
							</CustomButton>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
