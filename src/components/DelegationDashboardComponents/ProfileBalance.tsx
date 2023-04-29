// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { useApiContext, useNetworkContext, useUserDetailsContext } from '~src/context';
import BalanceIcon from '~assets/icons/total-balance.svg';
import LockBalanceIcon from '~assets/icons/lock-balance.svg';
import RightTickIcon from '~assets/icons/right-tick.svg';
import { Divider, Skeleton } from 'antd';
import userProfileBalances from '~src/util/userProfieBalances';
import formatBnBalance from '~src/util/formatBnBalance';
import { chainProperties } from '~src/global/networkConstants';
import dynamic from 'next/dynamic';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import { Wallet } from '~src/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { APPNAME } from '~src/global/appName';
import getEncodedAddress from '~src/util/getEncodedAddress';

interface Props{
  className?: string;
  address: string;
}

const DelegationWalletConnectModal = dynamic(() => import('./DelegationWalletConnectModal'), {
	loading: () => <Skeleton  /> ,
	ssr: false
});

const ProfileBalances = ({ className, address }: Props ) => {

	const [balance, setBalance] = useState<string>('0');
	const [lockBalance, setLockBalance] = useState<string>('0');
	const [transferableBalance, setTransferableBalance] = useState<string>('0');
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();
	const unit =`${chainProperties[network]?.tokenSymbol}`;
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [loading, setLoading] =useState<boolean>(false);
	const { loginWallet, setUserDetailsContextState, loginAddress, delegationDashboardAddress } = useUserDetailsContext();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [defaultAddress, setAddress] = useState<string>(delegationDashboardAddress);

	useEffect(() => {

		userProfileBalances({ address, api, apiReady, network, setBalance, setLockBalance, setTransferableBalance });

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady]);

	const getAccounts = async (chosenWallet: Wallet): Promise<undefined> => {
		if(!api || !apiReady) return;

		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected
			? injectedWindow.injectedWeb3[chosenWallet]
			: null;

		if (!wallet) {
			return;
		}

		let injected: Injected | undefined;
		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec

				if(wallet && wallet.enable) {
					wallet.enable(APPNAME)
						.then((value) => { clearTimeout(timeoutId); resolve(value); })
						.catch((error) => { reject(error); });
				}
			});
		} catch (err) {
			console.log(err?.message);
		}
		if (!injected) {
			return;
		}

		const accounts = await injected.accounts.get();
		if (accounts.length === 0) {
			return;
		}

		accounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
		});

		setAccounts(accounts);
		if (accounts.length > 0) {
			if(api && apiReady) {
				api.setSigner(injected.signer);
			}

			if(loginWallet){
				setLoading(true);
				setUserDetailsContextState((prev) => {
					return { ...prev,
						delegationDashboardAddress: loginAddress.length === 0 ? delegationDashboardAddress : loginAddress
					};
				});
				setLoading(false);
			}
			setAddress(loginAddress);
		}
		return;
	};

	useEffect(() => {
		loginWallet && getAccounts(loginWallet);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[loginWallet]);

	return <div className={'flex justify-between items-center w-full pl-[70px] max-md:pl-4 '}>
		<div className={`${className} flex py-[17px] items-center  h-full gap-1 max-md:px-[10px]`}>
			<div className='h-[71px] flex flex-col justify-start py-2 gap-1 '>
				<div className='text-[24px] font-semibold text-white tracking-[0.0015em] gap-1'>
					{formatBnBalance(balance, { numberAfterComma: 2, withUnit: false }, network)}
					<span className='text-sm font-medium text-white tracking-[0.015em] ml-1'>{unit}</span></div>
				<div className='flex items-center justify-center gap-2'>
					<BalanceIcon/>
					<span className='text-white text-sm font-normal tracking-[0.01em]'>
          Balance
					</span>
				</div>
			</div>
			<Divider  type= 'vertical' style={{ borderLeft: '1px solid #D2D8E0',height:'100%' }} />
			<div className='flex gap-6 py-2 justify-start max-md:gap-2'>
				<div className='h-[71px] flex flex-col py-2 gap-1'>
					<div className='text-[24px] font-semibold text-white tracking-[0.0015em] gap-1'>
						{formatBnBalance(transferableBalance, { numberAfterComma: 2, withUnit: false }, network)}
						<span className='text-sm font-medium text-white tracking-[0.015em] ml-1'>{unit}</span></div>
					<div className='flex items-center justify-center gap-2'>
						<RightTickIcon/>
						<span className='text-white text-sm font-normal tracking-[0.01em]'>
          Transferable
						</span>
					</div>
				</div>
				<div className='h-[71px] flex flex-col justify-start py-2 gap-1'>
					<div className='text-[24px] font-semibold text-white tracking-[0.0015em] gap-1'>
						{formatBnBalance(lockBalance, { numberAfterComma: 2, withUnit: false }, network)}
						<span className='text-sm font-medium text-white tracking-[0.015em] ml-1'>{unit}</span></div>
					<div className='flex items-center justify-center gap-2'>
						<LockBalanceIcon/>
						<span className='text-white text-sm font-normal tracking-[0.01em]'>
             Total Locked
						</span>
					</div>
				</div>
			</div>
		</div>
		{ accounts.length > 0 && <AccountSelectionForm
			accounts={accounts}
			address={delegationDashboardAddress}
			withBalance={false}
			className='text-[#788698] text-sm w-[195px] mr-6 cursor-pointer'
			onAccountChange={setAddress}
			inputClassName='text-[#ccd1d9] border-[1.5px] border-[#D2D8E0] bg-[#850c4d] border-solid px-3 rounded-[8px] py-[6px]'
			isSwitchButton={true}
			setSwitchModalOpen={setOpenModal}
		/>}
		<DelegationWalletConnectModal open={openModal} setOpen={setOpenModal} closable={true}/>
	</div>;
};
export default ProfileBalances;
