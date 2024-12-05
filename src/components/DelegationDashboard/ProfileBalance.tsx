// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useApiContext } from '~src/context';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Divider } from 'antd';
import BN from 'bn.js';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { userDetailsActions } from '~src/redux/userDetails';
import userProfileBalances from '~src/util/userProfileBalances';
import { chainProperties } from '~src/global/networkConstants';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { formatBalance } from '@polkadot/util';
import { formatedBalance } from '~src/util/formatedBalance';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import chainLogo from '~assets/parachain-logos/chain-logo.jpg';
import { dmSans } from 'pages/_app';
import ProfileBalanceModal from './utils/ProfileBalanceModal';
import { useTranslation } from 'next-i18next';

const AddressConnectModal = dynamic(() => import('~src/ui-components/AddressConnectModal'), {
	ssr: false
});
interface Props {
	className?: string;
}

const ZERO_BN = new BN(0);

const ProfileBalances = ({ className }: Props) => {
	const { t } = useTranslation('common');
	const { api, apiReady } = useApiContext();
	const currentUser = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const [balances, setBalances] = useState<{ freeBalance: BN; transferableBalance: BN; lockedBalance: BN; total: BN }>({
		freeBalance: ZERO_BN,
		lockedBalance: ZERO_BN,
		total: ZERO_BN,
		transferableBalance: ZERO_BN
	});
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const { loginWallet, delegationDashboardAddress, loginAddress } = currentUser;
	const dispatch = useDispatch();
	const [defaultAddress, setAddress] = useState<string>(delegationDashboardAddress);
	const [openBalanceDetailsModal, setOpenBalanceDetailsModal] = useState<boolean>(false);

	const balancesArr = [
		{ icon: chainProperties[network]?.logo ? chainProperties[network].logo : chainLogo, label: t('balance'), value: balances.total.toString() },
		{ icon: '/assets/icons/verified-tick.svg', key: 'transferableBalance', label: t('transferable'), value: balances.lockedBalance.toString() },
		{ icon: '/assets/icons/lock-balance.svg', key: 'lockedBalance', label: t('total_locked'), value: balances.transferableBalance.toString() }
	];

	const getAllAccounts = async () => {
		if (!api || !apiReady || !loginWallet) return;

		const addressData = await getAccountsFromWallet({ api, apiReady, chosenWallet: loginWallet, loginAddress, network });
		setAccounts(addressData?.accounts || []);
		setAddress(addressData?.account || '');
	};

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (!api || !apiReady) return;
		(async () => {
			const allBalances = await userProfileBalances({ address: defaultAddress || delegationDashboardAddress, api, apiReady, network });
			setBalances({
				freeBalance: allBalances?.freeBalance || ZERO_BN,
				lockedBalance: allBalances?.transferableBalance || ZERO_BN,
				total: allBalances?.totalBalance || ZERO_BN,
				transferableBalance: allBalances?.lockedBalance || ZERO_BN
			});
		})();

		getAllAccounts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [delegationDashboardAddress, api, apiReady]);

	return (
		<div className={'flex w-full items-center justify-between pl-[26px] max-md:pl-4 '}>
			{/* for small screen */}
			<div className='flex w-full items-center justify-between sm:hidden'>
				<div className='flex items-center space-x-2 pt-1 '>
					{balancesArr.slice(0, 1).map((balance) => (
						<div
							key={balance?.label}
							className='ml-[2px] flex h-full gap-1'
						>
							<div className='flex flex-col justify-start gap-1'>
								<div
									className={`${balance.key === 'lockedBalance' ? 'ml-[2px]' : ''} ${dmSans.variable} ${
										dmSans.className
									} gap-1 text-sm font-semibold tracking-[0.0015em] text-white`}
								>
									{formatedBalance(balance.value, unit, 2)}
									<span className='ml-1 text-xs font-medium tracking-[0.015em] text-white'>{unit}</span>
									<span onClick={() => setOpenBalanceDetailsModal(true)}>
										<Image
											src={'/assets/delegation-tracks/info-white.svg'}
											height={20}
											width={20}
											alt=''
											className={'-mt-[3px] ml-[3px] cursor-pointer sm:hidden'}
										/>
									</span>
								</div>
								<div className='flex items-center justify-start gap-2'>
									<Image
										src={'/assets/icons/polkadot-logo.svg'}
										height={18}
										width={18}
										alt=''
										className={'sm:hidden'}
									/>
									<span className='text-xs font-medium tracking-[0.01em] text-white'>{balance.label}</span>
								</div>
							</div>
							<Divider
								type='vertical'
								className=' mt-1 h-[38px] bg-section-light-container '
							/>
						</div>
					))}
					{balancesArr.slice(1, 2).map((balance) => (
						<div
							key={balance?.label}
							className='flex h-full gap-1'
						>
							<div className='flex flex-col justify-start gap-1'>
								<div
									className={`${balance.key === 'lockedBalance' ? 'ml-[2px]' : ''} ${dmSans.variable} ${
										dmSans.className
									} gap-1 text-sm font-semibold tracking-[0.0015em] text-white`}
								>
									{formatedBalance(balance.value, unit, 2)}
									<span className='ml-1 text-xs font-medium tracking-[0.015em] text-white'>{unit}</span>
								</div>
								<div className=' flex items-center justify-start gap-2'>
									<Image
										src={balance.icon}
										height={18}
										width={18}
										alt=''
										className={'sm:hidden'}
									/>
									<span className='text-xs font-medium tracking-[0.01em] text-white'>{balance.label}</span>
								</div>
							</div>
						</div>
					))}
				</div>
				<span
					className='mr-3 cursor-pointer'
					onClick={() => setOpenBalanceDetailsModal(true)}
				>
					<Image
						className=' h-5 w-5 rounded-full object-contain'
						src={'/assets/icons/three-dots-vertical.svg'}
						alt='Logo'
						width={20}
						height={20}
					/>
				</span>
			</div>

			{/* for large screen */}
			<div className={`${className} hidden h-full items-center gap-2 py-4 max-md:px-2.5 sm:flex lg:mt-[6px]`}>
				{balancesArr.map((balance) => (
					<div
						key={balance?.label}
						className='flex h-full gap-1'
					>
						<div className='flex h-[71px] flex-col justify-start gap-1'>
							<div className={`${balance.key === 'lockedBalance' ? 'ml-[2px]' : ''} gap-1 text-2xl font-semibold tracking-[0.0015em] text-white`}>
								{formatedBalance(balance.value, unit, 2)}
								<span className='ml-1 text-sm font-medium tracking-[0.015em] text-white'>{unit}</span>
							</div>
							<div className='ml-[1px] flex items-center justify-start gap-2'>
								<Image
									className='h-5 w-5 rounded-full object-contain'
									src={balance.icon}
									alt='Logo'
									width={20}
									height={20}
								/>
								<span className='text-sm font-normal tracking-[0.01em] text-white'>{balance.label}</span>
							</div>
						</div>
						{balance.label === t('balance') && (
							<Divider
								type='vertical'
								style={{ borderLeft: '1px solid #D2D8E0', height: '100%' }}
							/>
						)}
					</div>
				))}
			</div>
			<div className='-mt-7 mr-4 hidden w-48 sm:mr-6 sm:flex sm:w-52'>
				{!!accounts && accounts?.length > 0 && (
					<AccountSelectionForm
						linkAddressTextDisabled
						addressTextClassName='text-white'
						accounts={accounts}
						address={delegationDashboardAddress || defaultAddress}
						withBalance={false}
						className='cursor-pointer text-sm text-[#788698]'
						onAccountChange={(address) => {
							setAddress(address);
							dispatch(userDetailsActions.updateDelegationDashboardAddress(address));
						}}
						inputClassName='text-white border-[1.5px] border-section-light-container dark:border-separatorDark bg-[#850c4d] text-sm border-solid px-3 rounded-[8px] py-[6px]'
						isSwitchButton={true}
						setSwitchModalOpen={setOpenModal}
						withoutInfo={true}
						isTruncateUsername
					/>
				)}
			</div>
			<AddressConnectModal
				localStorageWalletKeyName='delegationWallet'
				localStorageAddressKeyName='delegationDashboardAddress'
				open={openModal}
				setOpen={setOpenModal}
				walletAlertTitle={t('delegation')}
				closable={true}
				onConfirm={(address: string) => dispatch(userDetailsActions.updateDelegationDashboardAddress(address))}
				usedInIdentityFlow={false}
			/>
			<ProfileBalanceModal
				className=''
				open={openBalanceDetailsModal}
				setOpen={setOpenBalanceDetailsModal}
				balancesArr={balancesArr}
				setOpenModal={setOpenModal}
				accounts={accounts}
				delegationDashboardAddress={delegationDashboardAddress}
				defaultAddress={defaultAddress}
				setAddress={setAddress}
			/>
		</div>
	);
};
export default ProfileBalances;
