// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useApiContext, usePostDataContext } from '~src/context';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { NotificationStatus, Wallet } from '~src/types';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { getMultisigAddressDetails } from '../DelegationDashboard/utils/getMultisigAddressDetails';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import classNames from 'classnames';
import { childBountyStatus } from '~src/global/statuses';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Props {
	bountyIndex?: number | null;
}

const ClaimChildBountyButton = ({ bountyIndex }: Props) => {
	const router = useRouter();
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { loginAddress, loginWallet, multisigAssociatedAddress } = useUserDetailsSelector();
	const {
		postData: { status, curator, postIndex }
	} = usePostDataContext();
	const [loading, setLoading] = useState<boolean>(false);
	const [multisigData, setMultisigData] = useState<{ threshold: number; signatories: string[] }>({
		signatories: [],
		threshold: 0
	});

	const getOnChainTx = async () => {
		if (!api || !apiReady || bountyIndex == null || isNaN(bountyIndex)) return null;
		let tx = api?.tx?.childBounties.claimChildBounty(bountyIndex, postIndex);
		if (multisigData?.threshold > 0) {
			tx = api?.tx?.multisig?.asMulti(multisigData?.threshold, multisigData?.signatories || [], null, tx, {
				proofSize: null,
				refTime: null
			});
		}

		return tx || null;
	};

	const handleMultisigAddress = async () => {
		if (!api || !apiReady || !loginAddress?.length || !network) return;
		let defaultWallet: Wallet | null = loginWallet;
		if (!defaultWallet) {
			defaultWallet = (window.localStorage.getItem('loginWallet') as Wallet) || null;
		}

		if (!defaultWallet) return;
		//for setting signer
		await getAccountsFromWallet({ api, apiReady, chosenWallet: defaultWallet || loginWallet, loginAddress: '', network });

		const data = await getMultisigAddressDetails(loginAddress);
		if (data?.threshold) {
			const filteredSignaories: string[] = [];

			data?.multi_account_member?.map((addr: { address: string }) => {
				if (getEncodedAddress(addr?.address || '', network) !== getEncodedAddress(multisigAssociatedAddress || '', network)) {
					filteredSignaories?.push(addr?.address);
				}
			});

			setMultisigData({
				signatories: filteredSignaories,
				threshold: data?.threshold || 0
			});
		}
	};

	useEffect(() => {
		handleMultisigAddress();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network, multisigAssociatedAddress, loginAddress]);

	const handleClaim = async () => {
		if (!api || !apiReady || bountyIndex == null || isNaN(bountyIndex)) return;

		const tx = await getOnChainTx();

		if (!tx) return;
		setLoading(true);

		const onFailed = async (message: string) => {
			setLoading(false);
			queueNotification({
				header: 'Failed!',
				message,
				status: NotificationStatus.ERROR
			});
		};

		const onSuccess = async () => {
			queueNotification({
				header: 'Success!',
				message:
					multisigData?.threshold > 0 ? (
						<div className='text-xs'>
							An approval request has been sent to signatories to confirm transaction.{' '}
							<Link
								href={'https://app.polkasafe.xyz'}
								className='text-xs text-pink_primary'
							>
								View Details
							</Link>
						</div>
					) : (
						'Child Bounty Claimed Successfully'
					),
				status: NotificationStatus.SUCCESS
			});
			setLoading(false);
			router.reload();
		};

		await executeTx({
			address: multisigAssociatedAddress || loginAddress,
			api,
			apiReady,
			errorMessageFallback: 'Transaction failed.',
			network,
			onFailed,
			onSuccess,
			tx: tx
		});
	};

	if (![childBountyStatus.AWARDED].includes(status) || !getEncodedAddress(curator, network)) {
		return null;
	}

	return (
		<div className='pb-6'>
			<CustomButton
				variant='primary'
				height={50}
				className={classNames('w-full', !getEncodedAddress(loginAddress, network) ? 'opacity-50' : '')}
				onClick={() => handleClaim()}
				loading={loading}
				disabled={!getEncodedAddress(loginAddress, network)}
			>
				<div className='text-base tracking-wide'>Claim Child Bounty</div>
			</CustomButton>
		</div>
	);
};

export default ClaimChildBountyButton;
