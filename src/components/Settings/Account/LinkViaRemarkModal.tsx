// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */

import { Divider, Modal, Spin } from 'antd';
import { dmSans } from 'pages/_app';
import React, { useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { LoadingOutlined } from '@ant-design/icons';
import { useUserDetailsSelector } from '~src/redux/selectors';
import Input from '~src/basic-components/Input';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ChangeResponseType } from '~src/auth/types';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { handleTokenChange } from '~src/services/auth.service';
import { useDispatch } from 'react-redux';
import ErrorAlert from '~src/ui-components/ErrorAlert';

interface Props {
	open?: boolean;
	dismissModal?: () => void;
}

const LinkViaRemarkModal = ({ dismissModal, open }: Props) => {
	const currentUser = useUserDetailsSelector();
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
	const [txHash, setTxHash] = useState('');
	const [error, setError] = useState('');

	const handleLinkAddress = async (hash?: string) => {
		if (loading) return;

		setError('');
		setLoading(true);

		const { data: confirmData, error: confirmError } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/linkAddressWithRemark', {
			hash: hash || txHash
		});

		if (confirmError || !confirmData?.token) {
			const errString = `Error in linking address with remark: ${confirmError}`;
			console.error(errString);

			setError(errString);

			queueNotification({
				header: 'Linking Failed!',
				message: confirmError,
				status: NotificationStatus.ERROR
			});
			setLoading(false);
			return;
		}

		handleTokenChange(confirmData.token, currentUser, dispatch);
		queueNotification({
			header: 'Success!',
			message: confirmData.message || '',
			status: NotificationStatus.SUCCESS
		});
		setLoading(false);
		dismissModal?.();

		setLoading(false);
	};

	const handleCopyRemarkText = async () => {
		navigator.clipboard.writeText(`PolkassemblyUser:${currentUser.id}`);
		queueNotification({
			header: 'Success!',
			message: 'Text Copied',
			status: NotificationStatus.INFO
		});
	};

	// TODO: Enable with ledger support
	// const handleAddRemark = async () => {
	// 	if (loading || !api || !apiReady) return;

	// 	setError('');
	// 	setLoading(true);

	// 	const remarkTx = api.tx.system.remark(`PolkassemblyUser:${currentUser.id}`);

	// 	const onSuccess = async (txHash: string) => {
	// 		queueNotification({
	// 			header: 'Linking address (1/2)',
	// 			message: 'Remark added successfully.',
	// 			status: NotificationStatus.INFO
	// 		});

	// 		await handleLinkAddress(txHash);

	// 		setLoading(false);
	// 	};

	// 	const onFailed = (message: string) => {
	// 		setLoading(false);
	// 		queueNotification({
	// 			header: 'Failed!',
	// 			message,
	// 			status: NotificationStatus.ERROR
	// 		});
	// 	};

	// 	await executeTx({
	// 		address: 'GET_FROM_LEDGER',
	// 		api,
	// 		apiReady,
	// 		errorMessageFallback: 'Remark transaction failed.',
	// 		network,
	// 		onFailed,
	// 		onSuccess,
	// 		params: network == 'equilibrium' ? { nonce: -1 } : {},
	// 		tx: remarkTx
	// 	});
	// };

	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			closable={false}
			title={
				<div className='ml-[-24px] mr-[-24px] text-blue-light-high dark:bg-section-dark-overlay dark:text-blue-dark-high'>
					<span className='mb-0 ml-[24px] text-lg font-medium tracking-wide text-sidebarBlue dark:text-white'>Link Address via Remark</span>
					<Divider className='border-b-1 dark:border-separatorDark' />
				</div>
			}
			open={open}
			className={`mb-8 md:min-w-[600px] ${dmSans.variable} ${dmSans.className} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			footer={
				<div className='flex items-center justify-end'>
					{[
						<CustomButton
							onClick={dismissModal}
							text='Cancel'
							type='text'
							key='cancel'
							buttonsize='sm'
							disabled={loading}
						/>,
						<CustomButton
							key='link'
							onClick={() => handleLinkAddress()}
							disabled={loading}
						>
							Link Address
						</CustomButton>
					]}
				</div>
			}
		>
			{currentUser.id && (
				<Spin
					spinning={loading}
					indicator={<LoadingOutlined />}
				>
					<section className='mb-6 flex flex-col gap-y-2 text-bodyBlue dark:text-blue-dark-high'>
						{error && (
							<div className='mb-6 flex'>
								<ErrorAlert errorMsg={error} />
							</div>
						)}

						<p className='leading-7'>
							Please add a remark with the text:{' '}
							<code
								className='mx-1 cursor-copy rounded-md px-2 leading-5'
								onClick={handleCopyRemarkText}
							>
								PolkassemblyUser:{currentUser.id}
							</code>{' '}
							from the address to link and input the transaction hash below.
						</p>

						<div className='flex gap-x-6'>
							<Input
								className='py-3 text-sm text-sidebarBlue dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								name={'title'}
								onChange={(e) => setTxHash(e.currentTarget.value)}
								placeholder='Transaction hash'
								value={txHash}
								disabled={loading}
							/>
						</div>
					</section>

					<div className='ml-[-24px] mr-[-24px]'>
						<Divider className='border-b-1 my-4 mt-0 dark:border-separatorDark' />
					</div>
				</Spin>
			)}
		</Modal>
	);
};

export default LinkViaRemarkModal;
