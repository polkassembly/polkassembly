// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { Alert, Button, Modal, Spin } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import { APPNAME } from 'src/global/appName';
import { NotificationStatus } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import queueNotification from 'src/ui-components/QueueNotification';
import { useNetworkSelector } from '~src/redux/selectors';
import executeTx from '~src/util/executeTx';

interface Props {
	className?: string;
	parentBountyId: number | undefined;
	childBountyId: number | undefined;
}

const ClaimPayoutModal = ({ className, parentBountyId, childBountyId }: Props) => {
	const { api, apiReady } = useContext(ApiContext);

	const [showModal, setShowModal] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [availableAccounts, setAvailableAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [extensionNotAvailable, setExtensionNotAvailable] = useState<boolean>(false);
	const [selectedAddress, setSelectedAddress] = useState<string>('');
	const { network } = useNetworkSelector();

	const getAccounts = async () => {
		setIsLoading(true);
		const extensions = await web3Enable(APPNAME);

		if (extensions.length === 0) {
			setExtensionNotAvailable(true);
			setIsLoading(false);
			return;
		} else {
			setExtensionNotAvailable(false);
		}

		const allAccounts = await web3Accounts();
		setAvailableAccounts(allAccounts);
		setIsLoading(false);
	};

	useEffect(() => {
		getAccounts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onAccountChange = (address: string) => {
		setSelectedAddress(address);
	};

	const onSuccess = () => {
		queueNotification({
			header: 'Success!',
			message: 'Claim Payout successful.',
			status: NotificationStatus.SUCCESS
		});
		setIsLoading(false);
		setShowModal(false);
	};

	const onFailed = (message: string) => {
		setIsLoading(false);
		setShowModal(false);
		queueNotification({
			header: 'Payout Claim Failed!',
			message,
			status: NotificationStatus.ERROR
		});
	};

	const handleSignAndSubmit = async () => {
		if (!selectedAddress || !parentBountyId || !childBountyId || isLoading) return;

		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		const injected = await web3FromSource(availableAccounts[0].meta.source);

		api.setSigner(injected.signer);

		setIsLoading(true);

		try {
			const claim = api.tx.childBounties.claimChildBounty(parentBountyId, childBountyId);
			await executeTx({
				address: selectedAddress,
				api,
				apiReady,
				errorMessageFallback: 'Transaction failed.',
				network,
				onFailed,
				onSuccess,
				tx: claim
			});
		} catch (error) {
			setIsLoading(false);
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			setShowModal(false);
			queueNotification({
				header: 'Payout Claim Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		}
	};

	return (
		<div className={className}>
			<Button
				className='inline rounded-md border-pink_primary bg-pink_primary text-base text-white hover:border-pink_primary hover:bg-pink_secondary'
				onClick={() => setShowModal(true)}
			>
				Claim Payout
			</Button>
			<Modal
				title='Confirm Payout Claim'
				open={showModal}
				onCancel={() => setShowModal(false)}
				footer={[
					<Button
						className='border-pink_primary bg-pink_primary text-white hover:bg-pink_secondary'
						key='second'
						onClick={handleSignAndSubmit}
						loading={isLoading}
						disabled={extensionNotAvailable || !apiReady}
					>
						Sign &amp; Submit
					</Button>
				]}
			>
				<Spin
					spinning={isLoading}
					indicator={<LoadingOutlined />}
				>
					<Alert
						className='mb-6'
						type='success'
						message='Thank you for your work to support the community. Please submit the transaction to claim the transaction.'
					/>

					{extensionNotAvailable && (
						<Alert
							className='mb-6'
							type='warning'
							message='Please install polkadot.js extension to claim.'
						/>
					)}

					{!extensionNotAvailable && (
						<>
							<AccountSelectionForm
								title='Please select your account'
								accounts={availableAccounts}
								address={selectedAddress}
								withBalance
								onAccountChange={onAccountChange}
							/>
						</>
					)}
				</Spin>
			</Modal>
		</div>
	);
};

export default ClaimPayoutModal;
