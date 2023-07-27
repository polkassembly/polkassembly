// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Alert, Button, Form, Modal, Spin } from 'antd';
import BN from 'bn.js';
import { useRouter } from 'next/router';
import { poppins } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import CautionIcon from '~assets/icons/grey-caution.svg';
import { useApiContext, useNetworkContext, useUserDetailsContext } from '~src/context';
import { APPNAME } from '~src/global/appName';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { NotificationStatus, Wallet } from '~src/types';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { LoadingOutlined } from '@ant-design/icons';
import queueNotification from '~src/ui-components/QueueNotification';
import WalletButton from '../WalletButton';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { WalletIcon } from '../Login/MetamaskLogin';
import { chainProperties } from '~src/global/networkConstants';
import { formatedBalance } from '../DelegationDashboard/ProfileBalance';
import { formatBalance } from '@polkadot/util';
import CloseIcon from '~assets/icons/close.svg';
import executeTx from '~src/util/executeTx';
import GovSidebarCard from '~src/ui-components/GovSidebarCard';

const ZERO_BN = new BN(0);

interface Props{
  className?: string;
  trackName: string;
}
const DecisionDepositCard = ({ className, trackName }: Props) => {
	const [openModal, setOpenModal] = useState<boolean>(false);
	const { network } = useNetworkContext();
	const { api, apiReady } = useApiContext();
	const router = useRouter();
	const { loginWallet, loginAddress } = useUserDetailsContext();
	const [address, setAddress] = useState<string>('');
	const [form] = Form.useForm();
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [defaultWallets, setDefaultWallets] = useState<any>({});
	const [wallet,setWallet] = useState<Wallet>();
	const [extensionOpen, setExtentionOpen] = useState<boolean>(false);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const balance = networkTrackInfo?.[network]?.[trackName]?.decisionDeposit || ZERO_BN;
	const unit = chainProperties[network]?.tokenSymbol;
	const [amount, setAmount] = useState<BN>(ZERO_BN);
	const [isMetamaskWallet, setIsMetamaskWallet] = useState<boolean>(false);

	const handleOnBalanceChange = (balanceStr: string) => {
		setAvailableBalance(new BN(balanceStr.toString() || ZERO_BN));
	};

	const getWallet=() => {
		const injectedWindow = window as Window & InjectedWindow;
		setDefaultWallets(injectedWindow.injectedWeb3);
		setIsMetamaskWallet((injectedWindow as any)?.ethereum?.isMetaMask);

	};

	const getMetamaskAccounts = async (): Promise<InjectedAccount[]> => {
		const ethereum = (window as any).ethereum;
		if (!ethereum) return [];

		let addresses = await ethereum.request({ method: 'eth_requestAccounts' });
		addresses = addresses.map((address: string) => address);

		if (addresses.length > 0) {
			addresses = addresses.map((address: string): InjectedAccount => {
				return {
					address: address.toLowerCase(),
					genesisHash: null,
					name: 'metamask',
					type: 'ethereum'
				};
			});
		}

		return addresses as InjectedAccount[];
	};
	const getAccounts = async (chosenWallet: Wallet, defaultWalletAddress?:string | null): Promise<undefined> => {

		if(!api || !apiReady) return;
		setLoading(true);

		setExtentionOpen(false);

		if(chosenWallet === Wallet.METAMASK){
			const accounts = await getMetamaskAccounts();
			setAccounts(accounts);
			setAddress(accounts[0].address);
			if(defaultWalletAddress) {
				setAddress(accounts.filter((account) => account.address === defaultWalletAddress)[0].address);
			}
		}else{
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
				if(defaultWalletAddress) {
					setAddress(accounts.filter((account) => (account.address) === (getEncodedAddress(defaultWalletAddress, network) || defaultWalletAddress))[0].address);
				}
			}
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

	useEffect(() => {

		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		getWallet();

		const wallet = localStorage.getItem('loginWallet') || '';
		const address = localStorage.getItem('loginAddress');
		setWallet((loginWallet || wallet) as Wallet);
		getAccounts((loginWallet || wallet) as Wallet, loginAddress || address);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[loginWallet]);

	const handleSubmit = async() => {
		const bnValue:BN = new BN(balance.toString() || ZERO_BN);
		setAmount(bnValue);
		if(!api || !apiReady || !router?.query?.id || availableBalance.lte(bnValue)) return;

		const tx = api.tx.referenda.placeDecisionDeposit(Number(router?.query?.id));

		const onSuccess = () => {
			queueNotification({
				header: 'Success!',
				message: 'Decision Deposit successful.',
				status: NotificationStatus.SUCCESS
			});
			setLoading(false);
			setOpenModal(false);
			router.reload();
		};

		const onFailed = () => {
			queueNotification({
				header: 'Failed!',
				message: 'Transaction failed!',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		};

		setLoading(true);
		await executeTx({ address, api, errorMessageFallback: 'failed.', network, onFailed, onSuccess, tx });
		setLoading(false);

	};
	return <GovSidebarCard className='overflow-y-hidden'>
		<h2 className='font-medium tracking-[0.015em] text-xl'>Decision Deposit</h2>
		<div className='flex mt-6 gap-2'>
			<span><CautionIcon/></span>
			<span className='text-sm tracking-wide'>Decision deposit should be paid before completion of the decision period for a proposal to pass. It can be paid by anyone.</span>
		</div>
		<Button onClick={() => setOpenModal(true)} className='bg-pink_primary text-sm font-medium text-white mt-4 rounded-[4px] h-[40px] w-full tracking-wide'>Pay Decision Deposit</Button>
		<Modal
			wrapClassName={className}
			className = {`${poppins.className} ${poppins.variable} pay-decision-deposite `}
			open = {openModal}
			closeIcon={<CloseIcon/>}
			onCancel={() => setOpenModal(false)}
			title = {<div className='text-lg font-semibold text-bodyBlue items-center gap-2 border-0 border-b-[1px] px-6 pb-4 border-solid border-[#D2D8E0]'>Pay Decision Deposit</div>}
			footer = {<div className='px-6 border-0 border-solid border-t-[1px] border-[#D2D8E0] pt-4'>
				<Button onClick={() => setOpenModal(false)} disabled={accounts.length === 0} key={1} className='text-sm font-medium text-pink_primary border-pink_primary h-[40px] w-[134px] rounded-[4px] tracking-wider'>Back</Button>
				<Button onClick={handleSubmit} disabled={accounts.length === 0} key={1} className='text-sm font-medium text-white bg-pink_primary h-[40px] w-[134px] rounded-[4px] tracking-wider'>Continue</Button>
			</div>}
		>
			<Spin spinning={loading} indicator={<LoadingOutlined />}>
				<div className='flex flex-col px-6'>
					<h3 className='text-sm font-normal text-[#485F7D] text-center'>Select a wallet</h3>
					<div className='flex items-center justify-center gap-x-4 mb-6'>
						{['moonbase', 'moonbeam', 'moonriver'].includes(network) ? <>

							{defaultWallets[Wallet.TALISMAN] && <WalletButton className={`${wallet === Wallet.TALISMAN? 'border border-solid border-pink_primary h-[44px] w-[56px]': 'h-[44px] w-[56px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.TALISMAN)} name="Talisman" icon={<WalletIcon which={Wallet.TALISMAN} className='h-6 w-6'  />} />}
							{
								['moonbase', 'moonbeam', 'moonriver'].includes(network) && isMetamaskWallet ?
									<WalletButton disabled={!apiReady} className={`${wallet === Wallet.METAMASK? 'border border-solid border-pink_primary h-[44px] w-[56px]': 'h-[44px] w-[56px]'}`} onClick={(event) => handleWalletClick((event as any), Wallet.METAMASK)} name="MetaMask" icon={<WalletIcon which={Wallet.METAMASK} className='h-6 w-6' />} />
									: null
							}
							{
								(window as any).walletExtension?.isNovaWallet && defaultWallets[Wallet.NOVAWALLET] &&
                    <WalletButton disabled={!apiReady} className={`${wallet === Wallet.NOVAWALLET? 'border border-solid border-pink_primary h-[44px] w-[56px]': 'h-[44px] w-[56px]'}`} onClick={(event) => handleWalletClick((event as any), Wallet.NOVAWALLET)} name="Nova Wallet" icon={<WalletIcon which={Wallet.NOVAWALLET} className='h-6 w-6' />} />
							}
						</> :  <>
							{defaultWallets[Wallet.POLKADOT] && <WalletButton className={`${wallet === Wallet.POLKADOT? 'border border-solid border-pink_primary h-[44px] w-[56px]': 'h-[44px] w-[56px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.POLKADOT)} name="Polkadot" icon={<WalletIcon which={Wallet.POLKADOT} className='h-6 w-6'  />} />}
							{defaultWallets[Wallet.TALISMAN] && <WalletButton className={`${wallet === Wallet.TALISMAN? 'border border-solid border-pink_primary h-[44px] w-[56px]': 'h-[44px] w-[56px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.TALISMAN)} name="Talisman" icon={<WalletIcon which={Wallet.TALISMAN} className='h-6 w-6'  />} />}
							{defaultWallets[Wallet.SUBWALLET] && <WalletButton className={`${wallet === Wallet.SUBWALLET? 'border border-solid border-pink_primary h-[44px] w-[56px]': 'h-[44px] w-[56px]'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.SUBWALLET)} name="Subwallet" icon={<WalletIcon which={Wallet.SUBWALLET} className='h-6 w-6' />} />}
							{
								['polymesh'].includes(network)?
									<WalletButton disabled={!apiReady} className={`${wallet === Wallet.POLYWALLET? 'border border-solid border-pink_primary h-[44px] w-[56px]': 'h-[44px] w-[56px]'}`} onClick={(event) => handleWalletClick((event as any), Wallet.POLYWALLET)} name="PolyWallet" icon={<WalletIcon which={Wallet.POLYWALLET} className='h-6 w-6'  />} />
									: null
							}
							{
								(window as any).walletExtension?.isNovaWallet && defaultWallets[Wallet.NOVAWALLET] &&
                    <WalletButton disabled={!apiReady} className={`${wallet === Wallet.NOVAWALLET? 'border border-solid border-pink_primary h-[44px] w-[56px]': 'h-[44px] w-[56px]'}`} onClick={(event) => handleWalletClick((event as any), Wallet.NOVAWALLET)} name="Nova Wallet" icon={<WalletIcon which={Wallet.NOVAWALLET} className='h-6 w-6' />} />
							}
						</>}
					</div>
					{ availableBalance.lte(amount) && <Alert showIcon type='info' className='text-sm text-bodyBlue rounded-[4px] mb-4' message='Insufficient available balance.'/>}

					{Object.keys(defaultWallets || {}).length !== 0 && accounts.length === 0 && wallet && wallet?.length !== 0  && !loading && <Alert message='For using delegation dashboard:' description={<ul className='mt-[-5px] text-sm'><li>Give access to Polkassembly on your selected wallet.</li><li>Add an address to the selected wallet.</li></ul>} showIcon className='mb-4' type='info' />}
					{Object.keys(defaultWallets || {}).length === 0 && !loading && <Alert message='Wallet extension not detected.' description='No web 3 account integration could be found. To be able to use this feature, visit this page on a computer with polkadot-js extension.' type='info' showIcon className='text-[#243A57] changeColor'/>}

					{
						!extensionOpen &&
								<Form
									form={form}
									disabled={loading}
								><>
										{accounts.length > 0
											?<AccountSelectionForm
												title='Beneficiary Address'
												accounts={accounts}
												address={address}
												withBalance={true}
												onAccountChange={(address) => setAddress(address)}
												onBalanceChange={handleOnBalanceChange}
												className='text-[#485F7D] text-sm'
											/>: !wallet && Object.keys(defaultWallets || {}).length !== 0 ?  <Alert type='info' showIcon message='Please select a wallet.' />: null}

										<div className='mt-6 flex gap-4 items-center mb-4'>
											<span className='text-sm text-lightBlue tracking-wide flex gap-1.5'>
                                 Decision Deposit
												<HelperTooltip text='Decision deposit should be paid before completion of the decision period for a proposal to pass. It can be paid by anyone.'/>
											</span>
											<span className='px-3 py-0.5 bg-[#EDEFF3] tracking-wide text-sm text-bodyBlue font-semibold rounded-[16px]'>
												{formatedBalance(balance.toString(), unit)} {unit}
											</span>
										</div>
									</>
								</Form>}
				</div>
			</Spin>
		</Modal>
	</GovSidebarCard>;
};

export default styled(DecisionDepositCard)`
.pay-decision-deposite .ant-modal-content{
  padding: 16px 0px !important;

}`;