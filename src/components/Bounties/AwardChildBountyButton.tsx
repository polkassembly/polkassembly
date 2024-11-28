// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal, Spin } from 'antd';
import classNames from 'classnames';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { dmSans } from 'pages/_app';
import { useEffect, useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useApiContext, usePostDataContext } from '~src/context';
import { childBountyStatus } from '~src/global/statuses';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ILoading, NotificationStatus, Wallet } from '~src/types';
import Address from '~src/ui-components/Address';
import AddressInput from '~src/ui-components/AddressInput';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { getMultisigAddressDetails } from '../DelegationDashboard/utils/getMultisigAddressDetails';
import BN from 'bn.js';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import Alert from '~src/basic-components/Alert';
import { parseBalance } from '../Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import Link from 'next/link';

interface Props {
	bountyIndex?: number | null;
}
const ZERO_BN = new BN(0);
const AwardChildBountyModal = ({
	className,
	open,
	setOpen,
	bountyIndex,
	childBountyIndex
}: {
	className?: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
	bountyIndex: number;
	childBountyIndex: number;
}) => {
	const { resolvedTheme: theme } = useTheme();
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const { loginAddress, multisigAssociatedAddress, loginWallet } = useUserDetailsSelector();
	const [gasFee, setGasFee] = useState<BN>(ZERO_BN);
	const [beneficiary, setBeneficiary] = useState<string>('');
	const [loadingStatus, setLoadingStatus] = useState<ILoading>({ isLoading: false, message: '' });
	const [multisigData, setMultisigData] = useState<{ threshold: number; signatories: string[] }>({
		signatories: [],
		threshold: 0
	});

	const getOnChainTx = async () => {
		if (!api || !apiReady || bountyIndex == null || isNaN(bountyIndex)) return null;

		let tx = api?.tx?.childBounties.awardChildBounty(bountyIndex, childBountyIndex, beneficiary);
		if (multisigData?.threshold > 0) {
			tx = api?.tx?.multisig?.asMulti(multisigData?.threshold, multisigData?.signatories || [], null, tx, {
				proofSize: null,
				refTime: null
			});
		}

		return tx || null;
	};

	const getGasFee = async () => {
		if ((!multisigAssociatedAddress && !loginAddress) || !api || !apiReady) return;
		const tx = await getOnChainTx();

		const paymentInfo = await tx?.paymentInfo(multisigAssociatedAddress || loginAddress);

		setGasFee(new BN(paymentInfo?.partialFee?.toString() || '0'));
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

	useEffect(() => {
		getGasFee();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [beneficiary, api, apiReady]);

	const handleAward = async () => {
		if (!api || !apiReady || bountyIndex == null || isNaN(bountyIndex)) return;

		const tx = await getOnChainTx();

		if (!tx) return;
		setLoadingStatus({ isLoading: true, message: 'Awaiting Confirmation!' });

		const onFailed = async (message: string) => {
			setLoadingStatus({ isLoading: false, message: '' });
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
						'Child Bounty Awarded Successfully'
					),
				status: NotificationStatus.SUCCESS
			});
			setLoadingStatus({ isLoading: false, message: '' });
		};

		await executeTx({
			address: multisigAssociatedAddress || loginAddress,
			api,
			apiReady,
			errorMessageFallback: 'Transaction failed.',
			network,
			onFailed,
			onSuccess,
			setStatus: (message: string) => setLoadingStatus({ isLoading: true, message: message }),
			tx: tx
		});
	};

	return (
		<div>
			<Modal
				open={open}
				onCancel={() => setOpen(false)}
				className={`${dmSans.className} ${dmSans.variable} antSteps w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark antSteps`}
				closeIcon={<CloseIcon />}
				title={
					<div className='-mx-6 flex items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						<Image
							src={'/assets/icons/dollar-icon.svg'}
							height={26}
							width={26}
							alt=''
							className={theme == 'dark' ? 'dark-icons' : '-mt-4'}
						/>
						<span>Award Child Bounty</span>
					</div>
				}
				footer={
					<div className='-mx-6 mt-6 flex items-center justify-end gap-2 border-0 border-t-[1px] border-solid border-section-light-container px-6  pt-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						<CustomButton
							text='Cancel'
							variant='default'
							width={140}
							className='tracking-wide'
							height={36}
							onClick={() => setOpen(false)}
						/>
						<CustomButton
							text='Award'
							variant='primary'
							width={140}
							className={classNames('tracking-wide', !getEncodedAddress(beneficiary, network) ? 'opacity-50' : '')}
							disabled={!getEncodedAddress(beneficiary, network)}
							height={36}
							onClick={handleAward}
						/>
					</div>
				}
			>
				<Spin
					spinning={loadingStatus.isLoading}
					tip={loadingStatus.message}
				>
					<div className='mt-6 flex flex-col gap-6 text-bodyBlue dark:text-blue-dark-high'>
						<section>
							<span>Your Account</span>
							<div className='flex h-10 w-full items-center rounded-sm border-[1px] border-solid border-section-light-container px-4 dark:border-separatorDark'>
								<Address
									address={loginAddress}
									displayInline
									disableTooltip
									isTruncateUsername={false}
								/>
							</div>
						</section>
						<section className='mt-0'>
							<label className='mb-0.5'>Beneficiary</label>
							<AddressInput
								skipFormatCheck
								className='-mt-6 w-full'
								defaultAddress={beneficiary}
								name='childbountyCurator'
								placeholder='Enter Curator Address'
								iconClassName={'ml-[10px]'}
								identiconSize={26}
								onChange={(address: string) => {
									setBeneficiary(address);
								}}
							/>
						</section>
						{gasFee.gt(ZERO_BN) && (
							<Alert
								className='mt-0 rounded-[4px] text-bodyBlue'
								showIcon
								type='info'
								message={
									<span className='text-[13px] text-bodyBlue dark:text-blue-dark-high'>
										An amount of <span className='font-semibold'>{parseBalance(String(gasFee.toString()), 3, true, network)}</span> will be required to award Child bounty
									</span>
								}
							/>
						)}{' '}
					</div>
				</Spin>
			</Modal>
		</div>
	);
};
const AwardChildBountyButton = ({ bountyIndex }: Props) => {
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const [openModal, setOpenModal] = useState<boolean>(false);
	const {
		postData: { status, curator, postIndex, proposer }
	} = usePostDataContext();

	if (
		[childBountyStatus.AWARDED, childBountyStatus.CLAIMED, childBountyStatus.CANCELLED].includes(status) ||
		![getEncodedAddress(proposer, network), getEncodedAddress(curator, network)].includes(getEncodedAddress(loginAddress, network) || loginAddress)
	) {
		return null;
	}

	return (
		<div className='pb-6'>
			<CustomButton
				variant='primary'
				height={50}
				className='w-full'
				onClick={() => setOpenModal(true)}
			>
				<div className='text-base tracking-wide'>Award Child Bounty</div>
			</CustomButton>
			<AwardChildBountyModal
				open={openModal}
				setOpen={setOpenModal}
				bountyIndex={bountyIndex as any}
				childBountyIndex={postIndex as any}
			/>
		</div>
	);
};

export default AwardChildBountyButton;
