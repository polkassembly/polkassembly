// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { BN, BN_HUNDRED } from '@polkadot/util';
import { Alert, Button, Form, Input, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useApiContext } from '~src/context';
import { useInitialConnectAddress, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { EKillOrCancel, NotificationStatus, PostOrigin } from '~src/types';
import Markdown from '~src/ui-components/Markdown';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import _ from 'lodash';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { setSigner } from '~src/util/create-referenda/setSigner';
import { createPreImage } from '~src/util/create-referenda/createPreImage';

import HelperTooltip from '~src/ui-components/HelperTooltip';
import { LoadingOutlined } from '@ant-design/icons';
import { ISteps } from '../OpenGovTreasuryProposal';

const ZERO_BN = new BN(0);

export default function CancelOrKillReferendaForm({
	type,
	setSteps,
	setOpenSuccess,
	handleClose,
	afterProposalCreated
}: {
	type: EKillOrCancel;
	setSteps: (pre: ISteps) => void;
	setOpenSuccess: (pre: boolean) => void;
	handleClose: () => void;
	afterProposalCreated: (postId: number) => Promise<void>;
}) {
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const { loginWallet } = useUserDetailsSelector();
	const [loadingStatus, setLoadingStatus] = useState({ isLoading: false, message: '' });
	const { address, availableBalance } = useInitialConnectAddress();
	const [submissionDeposite, setSubmissionDeposite] = useState<BN>(ZERO_BN);
	const [error, setError] = useState<string>('');
	const [postData, setPostData] = useState<{ title: string; content: string; index: string }>({
		content: '',
		index: '',
		title: ''
	});

	const [form] = Form.useForm();
	const formName = 'kill-or-cancel-ref-form';
	const unit = `${chainProperties[network]?.tokenSymbol}`;

	const handleSubmit = async () => {
		if (!api || !apiReady) {
			return;
		}
		if (!loginWallet || !postData.index) {
			return;
		}
		await setSigner(api, loginWallet);

		setLoadingStatus({ isLoading: true, message: 'Waiting for signature' });
		try {
			const proposal = type === EKillOrCancel.CANCEL ? api.tx.referenda.cancel(Number(postData.index)) : api.tx.referenda.kill(Number(postData.index));
			const proposalPreImage = createPreImage(api, proposal);
			const preImageTx = proposalPreImage.notePreimageTx;
			const origin: any = { Origins: PostOrigin.REFERENDUM_CANCELLER };
			const proposalTx = api.tx.referenda.submit(origin, { Lookup: { hash: proposalPreImage.preimageHash, len: proposalPreImage.preimageLength } }, { After: BN_HUNDRED });
			const mainTx = api.tx.utility.batchAll([preImageTx, proposalTx]);
			const post_id = Number(await api.query.referenda.referendumCount());
			const onSuccess = async () => {
				afterProposalCreated(post_id);
				queueNotification({
					header: 'Success!',
					message: `Proposal #${post_id} successful.`,
					status: NotificationStatus.SUCCESS
				});
				setLoadingStatus({ isLoading: false, message: '' });
				handleClose();
				setOpenSuccess(true);
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
				tx: mainTx
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
		<Spin
			spinning={loadingStatus.isLoading}
			indicator={<LoadingOutlined />}
		>
			<div className='w-full'>
				{new BN(availableBalance || '0').lte(submissionDeposite) && (
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
						<div className='flex gap-1'>
							<label className='inner-headings mb-[2px] dark:text-blue-dark-medium'>
								<span className='flex items-center'>Referenda Index</span>
							</label>
							<HelperTooltip
								text={type === EKillOrCancel.CANCEL ? 'Enter referendum number you want to cancel' : 'Enter referendum number you want to kill'}
								className='dark:text-blue-dark-medium'
							/>
						</div>
						<Form.Item
							name='referenda-index'
							rules={[
								{
									message: 'Please enter referenda index',
									required: true
								},
								{
									validator: (_, value) => {
										if (!value || (value && Number(value) > -1)) {
											return Promise.resolve();
										}
										return Promise.reject(new Error('Please enter a positive number'));
									}
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
						{/* <Loader /> */}
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
										className='rounded-md py-2 text-black opacity-70 dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
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
									className='post-content cursor-not-allowed rounded-md border-[1px] border-solid border-[#dddddd] bg-[#f5f5f5] px-3 py-2 opacity-70 dark:border-[#3B444F] dark:bg-section-dark-overlay
								dark:text-blue-dark-high '
									md={postData.content}
								/>
							</div>
						</Form>
						<div className='mt-6 flex items-center justify-end space-x-3'>
							<Button
								onClick={() => setSteps({ percent: 100, step: 0 })}
								className=' h-10 w-[155px] rounded-[4px] border-pink_primary text-sm font-medium font-semibold tracking-[0.05em] text-pink_primary dark:bg-transparent'
							>
								Back
							</Button>
							<CustomButton
								variant='solid'
								htmlType='submit'
								buttonsize='sm'
								onClick={handleSubmit}
								className='w-min'
								disabled={new BN(availableBalance || '0').lte(submissionDeposite)}
							>
								{type === EKillOrCancel.CANCEL ? 'Cancel' : 'Kill'} Referendum
							</CustomButton>
						</div>
					</>
				)}
			</div>
		</Spin>
	);
}
