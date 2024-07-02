// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Alert, Form, Input, Modal } from 'antd';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import AddressInput from '~src/ui-components/AddressInput';
import { useTheme } from 'next-themes';
import { useApiContext } from '~src/context';
// import { useDispatch } from 'react-redux';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { BN } from 'bn.js';
import executeTx from '~src/util/executeTx';
import { formatedBalance } from '~src/util/formatedBalance';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { chainProperties } from '~src/global/networkConstants';

interface Props {
	curator?: string;
	proposer?: string;
	postId: number;
}

const ZERO_BN = new BN(0);

const Curator = ({ curator, proposer, postId }: Props) => {
	const [showModal, setShowModal] = useState(false);
	const { network } = useNetworkSelector();
	const [loading, setLoading] = useState(false);
	const { api, apiReady } = useApiContext();
	const { defaultAddress } = useUserDetailsSelector();
	const [gasFee, setGasFee] = useState(ZERO_BN);
	const [target, setTarget] = useState<string>('');
	const [fee, setFee] = useState<string>('');
	const [form] = Form.useForm();
	const { resolvedTheme: theme } = useTheme();
	const unit = network ? chainProperties[network]?.tokenSymbol : null;

	const getGasFee = async () => {
		if (!api || !apiReady || !target || !fee || !proposer) return;
		const bountyId = postId;
		const tx = api.tx.bounties.proposeCurator(bountyId, target, fee);
		const gasFee = await tx.paymentInfo(proposer);
		setGasFee(new BN(gasFee.partialFee || '0'));
	};

	useEffect(() => {
		if (!api || !apiReady || !target || !fee) return;
		getGasFee();
	}, [api, apiReady, target, fee]);

	const handleAcceptCurator = async () => {
		if (!api || !apiReady || !proposer) return;
		const bountyId = postId;
		setLoading(true);
		const tx = api.tx.bounties.acceptCurator(bountyId);

		const onSuccess = () => {
			setLoading(false);
		};

		const onFailed = () => {
			queueNotification({
				header: 'failed!',
				message: 'Transaction failed!',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		};

		await executeTx({
			address: proposer,
			api,
			apiReady,
			errorMessageFallback: 'failed!',
			network,
			onFailed,
			onSuccess: onSuccess,
			tx: tx
		});
	};

	const handleProposeCurator = async () => {
		if (!api || !apiReady || !proposer) return;
		const bountyId = postId;
		setLoading(true);
		const tx = api.tx.bounties.proposeCurator(bountyId, target, fee);

		const onSuccess = () => {
			setShowModal(false);
			setLoading(false);
		};

		const onFailed = () => {
			queueNotification({
				header: 'failed!',
				message: 'Transaction failed!',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		};

		await executeTx({
			address: proposer,
			api,
			apiReady,
			errorMessageFallback: 'failed!',
			network,
			onFailed,
			onSuccess: onSuccess,
			tx: tx
		});
	};

	return (
		<>
			{curator === defaultAddress && (
				<Alert
					className={`mb-2 rounded-[4px] ${loading && 'opacity-50'}`}
					showIcon
					message={
						<span className='dark:text-blue-dark-high'>
							<span
								className='cursor-pointer font-semibold text-pink_primary dark:text-blue-dark-helper'
								onClick={handleAcceptCurator}
							>
								Accept
							</span>{' '}
							as Curator
						</span>
					}
					type='info'
				/>
			)}
			{proposer === defaultAddress && (
				<Alert
					className='mb-2 rounded-[4px]'
					showIcon
					message={
						<span className='dark:text-blue-dark-high'>
							<span
								className='cursor-pointer font-semibold text-pink_primary dark:text-blue-dark-helper'
								onClick={() => setShowModal(true)}
							>
								Assign Curator
							</span>{' '}
							to your referendum to proceed with bounty creation
						</span>
					}
					type='info'
				/>
			)}
			<Modal
				className='dark:[&>.ant-modal-content>.ant-modal-header>.ant-modal-title]:bg-section-dark-overlay dark:[&>.ant-modal-content]:bg-section-dark-overlay'
				wrapClassName='dark:bg-modalOverlayDark'
				title={
					<div className='-mx-6 mb-6 flex items-center border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						Add Curator
					</div>
				}
				open={showModal}
				confirmLoading={loading}
				onCancel={() => setShowModal(false)}
				destroyOnClose={true}
				zIndex={1067}
				footer={[
					<div
						key='buttons'
						className='mt-4 flex justify-end gap-x-1'
					>
						<CustomButton
							key='back'
							disabled={loading}
							onClick={() => setShowModal(false)}
							text='Back'
							variant='default'
							buttonsize='xs'
						/>
						<CustomButton
							htmlType='submit'
							key='submit'
							disabled={loading}
							onClick={() => {
								handleProposeCurator();
							}}
							variant='primary'
							buttonsize='xs'
						>
							Assign Curator
						</CustomButton>
					</div>
				]}
			>
				<div className='text-sm text-blue-light-high dark:text-blue-dark-high'>
					The curator must formally accept the curator role by signing a request. Only after the curators claim their candidacy the bounty will show as &quot;active&quot; on the
					main Bounty page.
				</div>
				<Form
					form={form}
					disabled={loading}
				>
					<div className='relative flex flex-col'>
						<AddressInput
							name='targetAddress'
							defaultAddress={target}
							label={'Curator Address'}
							placeholder='Curator Address'
							className='text-sm font-normal text-lightBlue dark:text-blue-dark-medium'
							onChange={(address) => {
								setTarget(address);
							}}
							helpText='Address'
							size='large'
							identiconSize={30}
							inputClassName={'font-normal text-sm h-[40px]'}
							skipFormatCheck={true}
							theme={theme}
						/>
					</div>

					<div className='mt-6 flex w-full flex-col items-start justify-between text-lightBlue dark:text-blue-dark-medium'>
						Fee
						<span className='w-full'>
							<Input
								value={fee}
								onChange={(e) => setFee(e.target.value)}
								type='number'
							/>
						</span>
					</div>
				</Form>
				<Alert
					className={`mb mt-2 rounded-[4px] ${loading && 'opacity-50'}`}
					showIcon
					message={
						<span className='dark:text-blue-dark-high'>
							Gas Fees of {formatedBalance(gasFee.toString(), unit as string, 2)} {unit} will be applied to create referendum.
						</span>
					}
					type='info'
				/>
			</Modal>
		</>
	);
};

export default Curator;
