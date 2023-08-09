// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Button, Divider, Form, Modal, Spin } from 'antd';
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
import { canUsePolkasafe } from '~src/util/canUsePolkasafe';
import MultisigAccountSelectionForm from '~src/ui-components/MultisigAccountSelectionForm';
import ArrowLeft from '~assets/icons/arrow-left.svg';
import formatBnBalance from '~src/util/formatBnBalance';

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
	const [showMultisig, setShowMultisig] = useState<boolean>(false);
	const [multisig, setMultisig] = useState<string>('');
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [totalDeposit, setTotalDeposit] = useState<BN>(ZERO_BN);
	const [initiatorBalance, setInitiatorBalance] = useState<BN>(ZERO_BN);

	const handleSubmit = () => {
		setLoading(true);
		localStorage.setItem('delegationWallet',  String(wallet));
		localStorage.setItem('delegationDashboardAddress', (multisig || address) );
		localStorage.setItem('multisigDelegationAssociatedAddress', address );
		setUserDetailsContextState((prev) => {
			return { ...prev,
				delegationDashboardAddress: multisig || address,
				loginWallet: wallet || null
			};
		});
		setShowMultisig(false);
		setMultisig('');
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
		localStorage.setItem('selectedWallet', wallet);
		setAccounts([]);
		setAddress('');
		event.preventDefault();
		setWallet(wallet);
		await getAccounts(wallet);
	};

	const handleOnBalanceChange = async (balanceStr: string) => {
		if(!api || !apiReady){
			return;
		}
		if(multisig){
			balanceStr = (await api.query.system.account(multisig)).data.free.toString();
		}
		const [balance, isValid] = inputToBn(balanceStr, network, false);
		isValid ? setAvailableBalance(balance) : setAvailableBalance(ZERO_BN);
	};

	useEffect(() => {
		getWallet();
		if(loginWallet !==null){
			getAccounts(loginWallet);
			setWallet(loginWallet);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	const handleInitiatorBalance = useCallback(
		async () => {
			if (!api || !apiReady) {
				return;
			}
			try{
				//deposit balance
				const depositBase = api.consts.multisig.depositBase?.toString() || '0';
				const depositFactor = api.consts.multisig.depositFactor?.toString() || '0';
				setTotalDeposit(new BN(depositBase).add(new BN(depositFactor)));
			}catch(e){
				setTotalDeposit(ZERO_BN);
			}finally{
				//initiator balance
				const initiatorBalance = await api.query.system.account(address);
				setInitiatorBalance(new BN(initiatorBalance.data.free.toString()));
			}
		},
		[address, api, apiReady]
	);

	useEffect(() => {
		if(canUsePolkasafe(network)){
			handleInitiatorBalance();
		}
	}, [address, handleInitiatorBalance, network]);

	return <Modal
		wrapClassName={className}
		className = {`${poppins.className} ${poppins.variable} w-[453px] radius`}
		open = {open}
		title = {
			<div className='text-center text-[20px] font-semibold text-[#243A57]'>
				{showMultisig && <ArrowLeft
					className='cursor-pointer absolute left-[24px] mt-1'
					onClick={() => {
						setShowMultisig(false);
						setMultisig('');
					}} /> }
				Connect your wallet
			</div>
		}
		footer = {[<Button onClick={handleSubmit} disabled={accounts.length === 0 || (showMultisig && !multisig) || (showMultisig && initiatorBalance.lte(totalDeposit))} key={1} className='text-sm font-medium text-white bg-pink_primary h-[40px] w-[134px] mt-6 rounded-[4px]'>Continue</Button>]}
		closable = {closable? true : false}
		onCancel={() => closable ? setOpen(false) : setOpen(true)}
	>
		<Spin spinning={loading} indicator={<LoadingOutlined />}>
			<div className='flex flex-col'>
				<h3 className='text-sm font-normal text-[#485F7D] text-center'>Select a wallet</h3>
				<div className={`flex items-center justify-center gap-x-4 ${showMultisig ? 'mb-6':''}`}>
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
				{ canUsePolkasafe(network) && !showMultisig &&
							<div className='w-[50%] flex flex-col m-auto mt-3 gap-3 mb-6'>
								<Divider className='m-0'>OR</Divider>
								<div className='w-full flex justify-center'>
									<WalletButton
										className='text-sm text-bodyBlue font-semibold border-[#D2D8E0]'
										onClick={() => {
											setShowMultisig(!showMultisig);
										}}
										name="Polkasafe"
										icon={<WalletIcon which={Wallet.POLKASAFE} className='w-6 h-6'/> }
										text={'Use a multisig'} />
								</div>
							</div>
				}

				{showMultisig && initiatorBalance.lte(totalDeposit) && multisig &&
					<Alert
						message={`The Free Balance in your selected account is less than the Minimum Deposit ${formatBnBalance(totalDeposit, { numberAfterComma: 3, withUnit: true }, network)} required to create a Transaction.`}
						showIcon
						className='mb-6'
					/>
				}
				{Object.keys(defaultWallets || {}).length !== 0 && accounts.length === 0 && wallet && wallet?.length !== 0  && !loading && <Alert message='For using delegation dashboard:' description={<ul className='mt-[-5px] text-sm'><li>Give access to Polkassembly on your selected wallet.</li><li>Add an address to the selected wallet.</li></ul>} showIcon className='mb-4' type='info' />}
				{Object.keys(defaultWallets || {}).length === 0 && !loading && <Alert message='Wallet extension not detected.' description='No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.' type='info' showIcon className='text-[#243A57] changeColor'/>}
				{
					!extensionOpen &&
								<Form
									form={form}
									disabled={loading}
								>
									{accounts.length > 0 ?
										showMultisig ?
											<MultisigAccountSelectionForm
												title='Select Address'
												accounts={accounts}
												address={address}
												withBalance
												onAccountChange={(address) => {
													setAddress(address);
													setMultisig('');
												}}
												onBalanceChange={handleOnBalanceChange}
												className='text-[#485F7D] text-sm'
												walletAddress={multisig}
												setWalletAddress={setMultisig}
												containerClassName='gap-[20px]'
												showMultisigBalance={true}
												canMakeTransaction={!initiatorBalance.lte(totalDeposit)}
											/> :
											<AccountSelectionForm
												title='Select an address'
												accounts={accounts}
												address={address}
												withBalance={true}
												onAccountChange={(address) => setAddress(address)}
												onBalanceChange={handleOnBalanceChange}
												className='text-[#485F7D] text-sm'
											/>
										: !wallet && Object.keys(defaultWallets || {}).length !== 0 ?  <Alert type='info' showIcon message='Please select a wallet.' />: null}
								</Form>}
			</div>
		</Spin>
	</Modal>;
};

export default styled(WalletConnectModal)`
.radius .ant-modal-content {
border-radius: 4px !important;
}`;