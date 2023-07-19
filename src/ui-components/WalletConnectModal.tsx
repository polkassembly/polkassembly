// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useContext, useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spin } from 'antd';
import { poppins } from 'pages/_app';
import { NotificationStatus, Wallet } from '~src/types';
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
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { InjectedTypeWithCouncilBoolean } from './AddressDropdown';
import { EAddressOtherTextType } from './Address';
import ConnectAddressIcon from '~assets/icons/connect-address.svg';
import CloseIcon from '~assets/icons/close.svg';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from './QueueNotification';
import cleanError from '~src/util/cleanError';
import { ChallengeMessage, ChangeResponseType } from '~src/auth/types';
import { handleTokenChange } from '~src/services/auth.service';
import { stringToHex } from '@polkadot/util';

interface Props{
  className?: string;
  open: boolean;
  setOpen: (pre: boolean) => void;
  closable?: boolean;
  walletKey: string;
  addressKey: string;
  onConfirm?: () => void;
  connectedAddress?: boolean;
}

const ZERO_BN = new BN(0);

const WalletConnectModal = ({ className, open, setOpen, closable, walletKey, addressKey, onConfirm, connectedAddress }: Props) => {

	const { network } = useContext(NetworkContext);
	const { api, apiReady } = useContext(ApiContext);
	const currentUser = useUserDetailsContext();
	const { loginWallet, setUserDetailsContextState, loginAddress, addresses } = currentUser;
	const [address, setAddress] = useState<string>('');
	const [form] = Form.useForm();
	const [accounts, setAccounts] = useState<InjectedTypeWithCouncilBoolean[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [defaultWallets, setDefaultWallets] = useState<any>({});
	const [wallet, setWallet] = useState<Wallet>(loginWallet as Wallet);
	const [extensionOpen, setExtentionOpen] = useState<boolean>(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const substrate_address = getSubstrateAddress(loginAddress);
	const substrate_addresses = (addresses || []).map((address) => getSubstrateAddress(address));

	const getOtherTextType = (account?: InjectedTypeWithCouncilBoolean) => {
		const account_substrate_address = getSubstrateAddress(account?.address || '');
		const isConnected = account_substrate_address?.toLowerCase() === (substrate_address || '').toLowerCase();
		if (account?.isCouncil || false) {
			if (isConnected) {
				return EAddressOtherTextType.COUNCIL_CONNECTED;
			}
			return EAddressOtherTextType.COUNCIL;
		} else if (isConnected) {
			return EAddressOtherTextType.CONNECTED;
		} else if (substrate_addresses.includes(account_substrate_address)) {
			return EAddressOtherTextType.LINKED_ADDRESS;
		}else{
			return EAddressOtherTextType.UNLINKED_ADDRESS;
		}
	};

	const handleLink = async (address: InjectedAccount['address'], chosenWallet: Wallet) => {
		setLoading(true);
		try{
			const injectedWindow = window as Window & InjectedWindow;
			const wallet = isWeb3Injected
				? injectedWindow.injectedWeb3[chosenWallet]
				: null;

			if (!wallet) return;

			const injected = wallet && wallet.enable && await wallet.enable(APPNAME);

			const signRaw = injected && injected.signer && injected.signer.signRaw;
			if (!signRaw) return console.error('Signer not available');

			let substrate_address: string | null;
			if(!address.startsWith('0x')) {
				substrate_address = getSubstrateAddress(address);
				if(!substrate_address){
					console.error('Invalid address');
					setLoading(false);
					return;
				}
			}else {
				substrate_address = address;
			}

			const { data , error } = await nextApiClientFetch<ChallengeMessage>( 'api/v1/auth/actions/addressLinkStart', { address: substrate_address });
			if(error || !data?.signMessage){
				queueNotification({
					header: 'Failed!',
					message: cleanError(error || 'Something went wrong'),
					status: NotificationStatus.ERROR
				});
				setLoading(false);
				return;
			}

			let signature = '';

			if(substrate_address.startsWith('0x')) {
				const msg = stringToHex(data?.signMessage || '');
				const from = address;

				const params = [msg, from];
				const method = 'personal_sign';

				(window as any).web3.currentProvider.sendAsync({
					from,
					method,
					params
				}, async (err: any, result: any) => {
					if(result) {
						signature = result.result;
					}

					const { data: confirmData , error: confirmError } = await nextApiClientFetch<ChangeResponseType>( 'api/v1/auth/actions/addressLinkConfirm', {
						address: substrate_address,
						signature,
						wallet
					});

					if(confirmError) {
						console.error(confirmError);
						queueNotification({
							header: 'Failed!',
							message: cleanError(confirmError),
							status: NotificationStatus.ERROR
						});
						setLoading(false);
					}

					if (confirmData?.token) {
						handleTokenChange(confirmData.token, currentUser);
						queueNotification({
							header: 'Success!',
							message: confirmData.message || '',
							status: NotificationStatus.SUCCESS
						});
						setLoading(false);
					}
				});
			}else {
				if(signRaw) {
					const { signature: substrate_signature } = await signRaw({
						address: substrate_address,
						data: stringToHex(data?.signMessage || ''),
						type: 'bytes'
					});
					signature = substrate_signature;

					const { data: confirmData , error: confirmError } = await nextApiClientFetch<ChangeResponseType>( 'api/v1/auth/actions/addressLinkConfirm', {
						address: substrate_address,
						signature,
						wallet
					});

					if(confirmError) {
						console.error(confirmError);
						queueNotification({
							header: 'Failed!',
							message: cleanError(confirmError),
							status: NotificationStatus.ERROR
						});
						setLoading(false);
					}

					if (confirmData?.token) {
						handleTokenChange(confirmData.token, currentUser);
						queueNotification({
							header: 'Success!',
							message: confirmData.message || '',
							status: NotificationStatus.SUCCESS
						});
						setLoading(false);
					}
				}
			}}catch(error){
			queueNotification({
				header: 'Failed!',
				message: error,
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	};

	const handleSubmit = () => {
		if(!address || !wallet || !accounts) return;
		if (connectedAddress && getOtherTextType(accounts.filter((account) => account.address === address)[0]) === EAddressOtherTextType.UNLINKED_ADDRESS){
			handleLink(address, wallet as Wallet);
		}else{
			setLoading(true);
			localStorage.setItem(walletKey,  String(wallet));
			localStorage.setItem(addressKey, (address) );
			setUserDetailsContextState((prev) => {

				return { ...prev,
					delegationDashboardAddress: address,
					loginWallet: wallet || null
				};
			});
			onConfirm && onConfirm();
			setOpen(false);
			setLoading(false);
		}
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

		if(loginWallet !== null ){
			setWallet(loginWallet);
			getAccounts(loginWallet);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	return <Modal
		wrapClassName={className}
		className = {`${poppins.className} ${poppins.variable} radius`}
		open = {open}
		title = {<div className={`${connectedAddress ? 'text-start' : 'text-center'} text-[20px] font-semibold text-[#243A57]`}>{ connectedAddress ? 'Link Address' : 'Connect your wallet'}</div>}
		footer = {<div className='flex gap-2 justify-end mt-6'>
			<Button onClick={() => setOpen(false)} className='text-sm font-medium text-pink_primary border-pink_primary h-[40px] w-[134px] rounded-[4px] tracking-wide'>Back</Button>
			<Button onClick={handleSubmit} disabled={accounts.length === 0} className='text-sm font-medium text-white bg-pink_primary h-[40px] w-[134px] rounded-[4px] tracking-wide'>
				{(getOtherTextType(accounts.filter((account) => account.address === address)[0]) === EAddressOtherTextType.UNLINKED_ADDRESS) ? 'Link Address' : connectedAddress ? 'Next' : 'Confirm'}</Button>
		</div>}
		closable = {closable? true : false}
		onCancel={() => closable ? setOpen(false) : setOpen(true)}
		closeIcon={<CloseIcon/>}
	>
		<Spin spinning={loading} indicator={<LoadingOutlined />}>
			<div className='flex flex-col'>
				{connectedAddress && accounts.length > 0 && !loading && (getOtherTextType(accounts.filter((account) => account.address === address)[0]) === EAddressOtherTextType.UNLINKED_ADDRESS) && <div className='flex flex-col mt-6 mb-2 items-center justify-center px-4'>
					<ConnectAddressIcon/>
					<span className='mt-6 text-bodyBlue text-sm text-center'>
						Linking an address allows you to create proposals, edit their descriptions, add tags as well as submit updates regarding the proposal to the rest of the community
					</span>
				</div>
				}
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

				{Object.keys(defaultWallets || {}).length !== 0 && accounts.length === 0 && wallet && wallet?.length !== 0  && !loading && <Alert message={`For using ${connectedAddress ? 'Treasury proposal creation' : 'Delegation dashboard'}:`} description={<ul className='mt-[-5px] text-sm'><li>Give access to Polkassembly on your selected wallet.</li><li>Add an address to the selected wallet.</li></ul>} showIcon className='mb-4' type='info' />}
				{Object.keys(defaultWallets || {}).length === 0 && !loading && <Alert message={connectedAddress ? 'Please install a wallet and create an address to start creating a proposal.' : 'Wallet extension not detected.'} description='No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.' type='info' showIcon className='text-[#243A57] changeColor'/>}

				{
					!extensionOpen &&
								<Form
									form={form}
									disabled={loading}
								>
									{accounts.length > 0
										?<AccountSelectionForm
											title={connectedAddress ? 'Select Proposer Address' :'Select an address'}
											accounts={accounts}
											address={address}
											withBalance={true}
											onAccountChange={(address) => setAddress(address)}
											onBalanceChange={handleOnBalanceChange}
											className='text-[#485F7D] text-sm'
										/> : !wallet && Object.keys(defaultWallets || {}).length !== 0 ?  <Alert type='info' showIcon message='Please select a wallet.' />: null}
								</Form>}
				{connectedAddress && !loading && accounts.length > 0 && <>
					<Alert showIcon type='info' message={<span className='text-bodyBlue'>
          Link Address to your Polkassembly account to proceed with proposal creation
					</span>}
					className='mt-4 text-sm text-bodyBlue rounded-md'/>
				</>}
			</div>
		</Spin>
	</Modal>;
};

export default styled(WalletConnectModal)`
.radius .ant-modal-content {
border-radius: 4px !important;
}`;