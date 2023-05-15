// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useContext, useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spin } from 'antd';
import { poppins } from 'pages/_app';
import { Wallet } from '~src/types';
import { ApiContext } from '~src/context/ApiContext';
import { useUserDetailsContext } from '~src/context';
import { NetworkContext } from '~src/context/NetworkContext';
import WalletButton from '~src/components/WalletButton';
import { LoadingOutlined } from '@ant-design/icons';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { inputToBn } from '~src/util/inputToBn';
import BN from 'bn.js';
import { APPNAME } from '~src/global/appName';
import styled from 'styled-components';

interface Props{
  className?: string;
  open: boolean;
  setOpen: (pre: boolean) => void;
  closable?: boolean;
}

const ZERO_BN = new BN(0);

const WalletConnectModal = ({ className, open, setOpen, closable }: Props) => {

	const { network } = useContext(NetworkContext);
	const { api, apiReady } = useContext(ApiContext);
	const { loginWallet, setUserDetailsContextState } = useUserDetailsContext();
	const [address, setAddress] = useState<string>('');
	const [form] = Form.useForm();
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [defaultWallets, setDefaultWallets] = useState<any>({});
	const [wallet,setWallet] = useState<Wallet>();
	const [extensionOpen, setExtentionOpen] = useState<boolean>(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);

	const handleSubmit = () => {
		setLoading(true);
		localStorage.setItem('delegationWallet',  String(wallet));
		localStorage.setItem('delegationDashboardAddress', (address) );
		setUserDetailsContextState((prev) => {

			return { ...prev,
				delegationDashboardAddress: address,
				loginWallet: wallet || null
			};
		});
		setOpen(false);
		setLoading(false);
	};

	const getWallet=() => {
		const injectedWindow = window as Window & InjectedWindow;
		setDefaultWallets(injectedWindow.injectedWeb3);
	};

	const getAccounts = async (chosenWallet: Wallet): Promise<undefined> => {
		if(!api || !apiReady) return;
		setLoading(true);

		setExtentionOpen(false);
		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected
			? injectedWindow.injectedWeb3[chosenWallet]
			: null;

		if (!wallet) {
			setExtentionOpen(true);
			setLoading(false);
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
			setLoading(false);
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

			setAddress(accounts[0].address);
		}
		setLoading(false);
		return;
	};

	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		setAccounts([]);
		setAddress('');
		event.preventDefault();
		setWallet(wallet);
		await getAccounts(wallet);
	};

	const handleOnBalanceChange = (balanceStr: string) => {
		const [balance, isValid] = inputToBn(balanceStr, network, false);
		isValid ? setAvailableBalance(balance) : setAvailableBalance(ZERO_BN);
	};

	useEffect(() => {
		getWallet();
		loginWallet!==null && getAccounts(loginWallet);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	return <Modal
		wrapClassName={className}
		className = {`${poppins.className} ${poppins.variable} w-[453px] radius`}
		open = {open}
		title = {<div className='text-center text-[20px] font-semibold text-[#243A57]'>Connect your wallet</div>}
		footer = {[<Button onClick={handleSubmit} disabled={accounts.length === 0} key={1} className='text-sm font-medium text-white bg-pink_primary h-[40px] w-[134px] mt-6 rounded-[4px]'>Continue</Button>]}
		closable = {closable? true : false}
		onCancel={() => closable ? setOpen(false) : setOpen(true)}
	>
		<Spin spinning={loading} indicator={<LoadingOutlined />}>
			<div className='flex flex-col'>
				<h3 className='text-sm font-normal text-[#485F7D] text-center'>Select a wallet</h3>
				<div className='flex items-center justify-center gap-x-4 mb-6'>
					{defaultWallets[Wallet.POLKADOT] && <WalletButton className={`${wallet === Wallet.POLKADOT? 'border border-solid border-pink_primary h-[44px] w-[56px]': 'h-[44px] w-[56px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.POLKADOT)} name="Polkadot" icon={<WalletIcon which={Wallet.POLKADOT} className='h-6 w-6'  />} />}
					{defaultWallets[Wallet.TALISMAN] && <WalletButton className={`${wallet === Wallet.TALISMAN? 'border border-solid border-pink_primary h-[44px] w-[56px]': 'h-[44px] w-[56px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.TALISMAN)} name="Talisman" icon={<WalletIcon which={Wallet.TALISMAN} className='h-6 w-6'  />} />}
					{defaultWallets[Wallet.SUBWALLET] && <WalletButton className={`${wallet === Wallet.SUBWALLET? 'border border-solid border-pink_primary h-[44px] w-[56px]': 'h-[44px] w-[56px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.SUBWALLET)} name="Subwallet" icon={<WalletIcon which={Wallet.SUBWALLET} className='h-6 w-6' />} />}
					{
						(window as any).walletExtension?.isNovaWallet && defaultWallets[Wallet.NOVAWALLET] &&
                    <WalletButton disabled={!apiReady} className={`${wallet === Wallet.POLYWALLET? 'border border-solid border-pink_primary h-[44px] w-[56px]': 'h-[44px] w-[56px]'}`} onClick={(event) => handleWalletClick((event as any), Wallet.NOVAWALLET)} name="Nova Wallet" icon={<WalletIcon which={Wallet.NOVAWALLET} className='h-6 w-6' />} />
					}
					{
						['polymesh'].includes(network) && defaultWallets[Wallet.POLYWALLET]?
							<WalletButton disabled={!apiReady} className={`${wallet === Wallet.POLYWALLET? 'border border-solid border-pink_primary h-[44px] w-[56px]': 'h-[44px] w-[56px]'}`} onClick={(event) => handleWalletClick((event as any), Wallet.POLYWALLET)} name="PolyWallet" icon={<WalletIcon which={Wallet.POLYWALLET} className='h-6 w-6'  />} />
							: null
					}
				</div>

				{Object.keys(defaultWallets || {}).length !== 0 && accounts.length === 0 && wallet && wallet?.length !== 0  && !loading && <Alert message='For using delegation dashboard:' description={<ul className='mt-[-5px] text-sm'><li>Give access to Polkassembly on your selected wallet.</li><li>Add an address to the selected wallet.</li></ul>} showIcon className='mb-4' type='info' />}
				{Object.keys(defaultWallets || {}).length === 0 && !loading && <Alert message='Wallet extension not detected.' description='No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.' type='info' showIcon className='text-[#243A57] changeColor'/>}

				{
					!extensionOpen &&
								<Form
									form={form}
									disabled={loading}
								>
									{accounts.length > 0
										?<AccountSelectionForm
											title='Select an address'
											accounts={accounts}
											address={address}
											withBalance={true}
											onAccountChange={(address) => setAddress(address)}
											onBalanceChange={handleOnBalanceChange}
											className='text-[#485F7D] text-sm'
										/>: !wallet && Object.keys(defaultWallets || {}).length !== 0 ?  <Alert type='info' showIcon message='Please select a wallet.' />: null}
								</Form>}
			</div>
		</Spin>
	</Modal>;
};

export default styled(WalletConnectModal)`
.radius .ant-modal-content {
border-radius: 4px !important;
}`;