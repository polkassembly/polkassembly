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
import { setUserDetailsState } from '~src/redux/userDetails';
import userProfileBalances from '~src/util/userProfieBalances';
import { chainProperties } from '~src/global/networkConstants';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { formatBalance } from '@polkadot/util';
import { formatedBalance } from '~src/util/formatedBalance';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import chainLogo from '~assets/parachain-logos/chain-logo.jpg';

const AddressConnectModal = dynamic(() => import('~src/ui-components/AddressConnectModal'), {
	ssr: false
});
interface Props {
	className?: string;
}

const ZERO_BN = new BN(0);

const ProfileBalances = ({ className }: Props) => {
	const { api, apiReady } = useApiContext();
	const currentUser = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const [balances, setBalances] = useState<{ freeBalance: BN; transferableBalance: BN; lockedBalance: BN }>({
		freeBalance: ZERO_BN,
		lockedBalance: ZERO_BN,
		transferableBalance: ZERO_BN
	});
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const { loginWallet, delegationDashboardAddress, loginAddress } = currentUser;
	const dispatch = useDispatch();
	const [defaultAddress, setAddress] = useState<string>(delegationDashboardAddress);

	const balancesArr = [
		{ icon: chainProperties[network]?.logo ? chainProperties[network].logo : chainLogo, label: 'Balance', value: balances.freeBalance.toString() },
		{ icon: '/assets/icons/verified-tick.svg', key: 'transferableBalance', label: 'Transferable', value: balances.lockedBalance.toString() },
		{ icon: '/assets/icons/lock-balance.svg', key: 'lockedBalance', label: 'Total Locked', value: balances.transferableBalance.toString() }
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
			const balances = await userProfileBalances({ address: defaultAddress, api, apiReady, network });
			setBalances({
				freeBalance: balances?.freeBalance || ZERO_BN,
				lockedBalance: balances?.transferableBalance || ZERO_BN,
				transferableBalance: balances?.lockedBalance || ZERO_BN
			});
		})();

		getAllAccounts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [delegationDashboardAddress, api, apiReady]);

	return (
		<div className={'flex w-full items-center justify-between pl-[70px] max-md:pl-4 '}>
			<div className={`${className} flex h-full items-center gap-2 py-4 max-md:px-2.5`}>
				{balancesArr.map((balance) => (
					<div
						key={balance?.label}
						className='flex h-full gap-1'
					>
						<div className='flex h-[71px] flex-col justify-start gap-1'>
							<div className='gap-1 text-2xl font-semibold tracking-[0.0015em] text-white'>
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
						{balance.label === 'Balance' && (
							<Divider
								type='vertical'
								style={{ borderLeft: '1px solid #D2D8E0', height: '100%' }}
							/>
						)}
					</div>
				))}
			</div>
			<div className='-mt-6 mr-6 w-52'>
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
							dispatch(setUserDetailsState({ ...currentUser, delegationDashboardAddress: address }));
						}}
						inputClassName='text-white border-[1.5px] border-[#D2D8E0] dark:border-[#3B444F] bg-[#850c4d] text-sm border-solid px-3 rounded-[8px] py-[6px]'
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
				walletAlertTitle={'Delegation'}
				closable={true}
				onConfirm={(address: string) => dispatch(setUserDetailsState({ ...currentUser, delegationDashboardAddress: address }))}
			/>
		</div>
	);
};
export default ProfileBalances;
