// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect, useState } from 'react';
import { Button, Form, Modal, Spin } from 'antd';
import { poppins } from 'pages/_app';
import { NetworkContext } from '~src/context/NetworkContext';
import { ApiContext } from '~src/context/ApiContext';
import BN from 'bn.js';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import TotalAmountBreakdown from './TotalAmountBreakdown';
import CloseIcon from '~assets/icons/close-icon.svg';
import OnChainIdentityIcon from '~assets/icons/onchain-identity.svg';
import IdentityForm from './IdentityForm';
import SocialVerification from './SocialVerification';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import { UserDetailsContext } from '~src/context/UserDetailsContext';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import IdentityProgressIcon from '~assets/icons/identity-progress.svg';
import DelegationSuccessPopup from '../Listing/Tracks/DelegationSuccessPopup';
import { SetIdentityIcon } from '~src/ui-components/CustomIcons';
import { Wallet } from '~src/types';
import { Injected, InjectedWindow } from '@polkadot/extension-inject/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { APPNAME } from '~src/global/appName';

const ZERO_BN = new BN(0);

export enum ESetIdentitySteps {
	AMOUNT_BREAKDOWN = 1,
	SET_IDENTITY_FORM = 2,
	SOCIAL_VERIFICATION = 3
}

export interface ITxFee {
  bondFee: BN;
  gasFee: BN;
  registerarFee: BN;
	minDeposite: BN;
}

export interface IName {
  legalName: string;
  displayName: string;
}

export interface ISocials{
  web: {value: string, verified: boolean};
  email: {value: string, verified: boolean};
  twitter: {value: string, verified: boolean};
  riot: {value: string, verified: boolean};
}

interface Propos{
	open: boolean;
	setOpen: (pre:boolean)=> void;
	openAddressLinkedModal?: boolean;
	setOpenAddressLinkedModal?: (pre:boolean)=> void;
}
const OnChainIdentity = ({ open, setOpen, openAddressLinkedModal:addressModal, setOpenAddressLinkedModal:openAddressModal }: Propos) => {

	const { network } = useContext(NetworkContext);
	const { setUserDetailsContextState, id: userId } = useContext(UserDetailsContext);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(addressModal || false);
	const { api, apiReady } = useContext(ApiContext);
	const [loading, setLoading]= useState<boolean>(false);
	const [txFee, setTxFee] = useState<ITxFee>({ bondFee: ZERO_BN, gasFee: ZERO_BN, minDeposite: ZERO_BN, registerarFee: ZERO_BN });
	const [address, setAddress] = useState<string>('');
	const [name, setName] = useState<IName>({ displayName: '', legalName: '' });
	const [socials, setSocials] = useState<ISocials>({ email: { value: '', verified: false }, riot:{ value: '', verified: false }, twitter: { value: '', verified: false }, web: { value: '', verified: false } });
	const [perSocialBondFee, setPerSocialBondFee] = useState<BN>(ZERO_BN);
	const [isExitModal, setIsExitModal] = useState<boolean>(false);
	const [form] = Form.useForm();
	const [isIdentityCallDone, setIsIdentityCallDone] = useState<boolean>(false);
	const [step, setStep] = useState<ESetIdentitySteps>(isIdentityCallDone ? ESetIdentitySteps.SOCIAL_VERIFICATION  : ESetIdentitySteps.AMOUNT_BREAKDOWN);
	const [identityHash, setIdentityHash] = useState<string>('');
	const [isIdentityUnverified, setIsIdentityUnverified] = useState<boolean>(false);
	const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(false);

	const getAccounts = async (chosenWallet: Wallet, defaultWalletAddress?:string | null): Promise<void> => {

		if(!api || !apiReady) return;
		setLoading(true);

		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected
			? injectedWindow?.injectedWeb3?.[chosenWallet]
			: null;

		if (!wallet) {
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
			setLoading(false);
		}
		if (!injected) {
			setLoading(false);
			return;
		}

		const accounts = await injected.accounts.get();
		if (accounts.length === 0) {
			setLoading(false);
			return;
		}

		accounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
		});

		if (accounts.length > 0) {
			if(api && apiReady) {
				api.setSigner(injected.signer);
			}

			if(defaultWalletAddress) {
				const address = accounts.filter((account) => (account?.address) === (getEncodedAddress(defaultWalletAddress, network) || defaultWalletAddress))?.[0]?.address || accounts[0]?.address;
				setAddress(address);
				form.setFieldValue('address', address);

			}
		}

		setLoading(false);
		return;
	};

	const handleInitialStateSet = (identityForm: any) => {
		if(identityForm?.userId !== userId) return;
		setName({ displayName: identityForm?.displayName || '', legalName: identityForm?.legalName || '' });
		setSocials({ ...socials, email:  { ...identityForm?.email, verified: false }|| '', twitter: { ...identityForm?.twitter, verified: false } });
		form.setFieldValue('displayName', identityForm?.displayName || '');
		form.setFieldValue('legalName', identityForm?.legalName || '');
		form.setFieldValue('email', identityForm?.email?.value || '');
		form.setFieldValue('twitter', identityForm?.twitter?.value || '');
		const identityHash = identityForm?.identityHash;
		setIdentityHash(identityHash);
		if(identityForm?.setIdentity){
			setIsIdentityCallDone(true);
			setStep(ESetIdentitySteps.SOCIAL_VERIFICATION);
		}

	};

	useEffect(() => {
		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		if(!api || !apiReady) return;
		setLoading(true);

		(async() => {

			const bondFee = api.consts.identity.fieldDeposit;

			const registerarFee:any = await api.query.identity.registrars().then((e) => JSON.parse(e.toString()));
			const bnRegisterarFee = new BN((registerarFee[registerarFee.length -1].fee) || ZERO_BN);
			const minDeposite =  api.consts.identity.basicDeposit;
			setTxFee({ ... txFee, bondFee: ZERO_BN, minDeposite, registerarFee: bnRegisterarFee });
			setPerSocialBondFee(bondFee);
			setLoading(false);

		})();
		const address = localStorage.getItem('identityAddress');
		const wallet = localStorage.getItem('identityWallet');

		getAccounts(wallet as Wallet, address);
		let identityForm: any = localStorage.getItem('identityForm');
		identityForm = JSON.parse(identityForm);

		if(identityForm){
			handleInitialStateSet(identityForm);
		}

		let unsubscribe: () => void;
		const encoded_addr = address ? getEncodedAddress(address, network) : '';
		if(!identityForm || !identityForm?.setIdentity) return;

		api.derive.accounts.info(encoded_addr, (info: DeriveAccountInfo) => {
			const infoCall = info.identity?.judgements.filter(([, judgement]): boolean => judgement.isFeePaid);
			const judgementProvided = infoCall?.some(([, judgement]): boolean => judgement.isFeePaid);

			setIsIdentityUnverified(judgementProvided || !info?.identity?.judgements?.length);
			if(!(judgementProvided || !info?.identity?.judgements?.length)) {
				localStorage.removeItem('identityForm');
			}
		})
			.then(unsub => { unsubscribe = unsub; })
			.catch(e => console.error(e));

		return () => unsubscribe && unsubscribe();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[api, apiReady, network, step]);

	const handleLocalStorageSetUnverified = () => {
		let data: any = localStorage.getItem('identityForm');
		if(data){
			data = JSON.parse(data);
		}
		setUserDetailsContextState((prev) => {
			return {
				...prev,
				isIdentityUnverified: true
			};
		});

	};

	const handleCancel = () => {
		if(step === ESetIdentitySteps.SOCIAL_VERIFICATION){
			setOpen(false);
			setIsExitModal(true);
		}else{
			setOpen(false);
			setStep(ESetIdentitySteps.AMOUNT_BREAKDOWN);
		}};

	useEffect(() => {
		const address = localStorage.getItem('identityAddress') || '';
		setAddress(address);
		form.setFieldValue('address', address);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [txFee, step]);

	const handleConfirm = (address: string) => {
		setOpen(true);
		openAddressModal ? openAddressModal?.(false) : setOpenAddressLinkedModal(false);
		setAddress(address);
		form.setFieldValue('address', address);
	};

	return <>

		{(addressModal ? addressModal : openAddressLinkedModal) &&  <AddressConnectModal
			closable
			open={addressModal ? addressModal : openAddressLinkedModal}
			setOpen={openAddressModal ? openAddressModal : setOpenAddressLinkedModal}
			walletAlertTitle='On chain identity.'
			localStorageWalletKeyName='identityWallet'
			localStorageAddressKeyName ='identityAddress'
			onConfirm={(address:string) => handleConfirm(address)}
		/>}
		<Modal
			maskClosable={false}
			open={isExitModal}
			onCancel={() => {
				setOpen(true);
				setIsExitModal(false);
			}
			}
			footer={false}
			className={`${poppins.className} ${poppins.variable} w-[600px] opengov-proposals`}
			closable={false}
			title={<div className='text-lg font-semibold -mx-6 text-bodyBlue items-center gap-2 border-0 border-b-[1px] px-6 pb-4 border-solid border-[#D2D8E0]'>
    Exit Verification
			</div>}>
			<div className='mt-6'>
				<span className='text-bodyBlue text-sm'>Your verification is pending. Are you sure you want to exit verification process? </span>
				<div className='flex justify-end mt-6 -mx-6 border-0 border-solid border-t-[1px] border-[#D2D8E0] px-6 pt-4 gap-4'>
					<Button onClick={() => {
						setIsExitModal(false);
						setOpen(false);
						handleLocalStorageSetUnverified();
						setLoading(false);
					}}
					className='font-medium tracking-[0.05em] text-pink_primary border-pink_primary text-sm w-[145px] h-[38px] rounded-[4px]'>Yes, Exit</Button>
					<Button onClick={() => { setIsExitModal(false); setOpen(true);}} className={'bg-pink_primary text-white font-medium tracking-[0.05em] text-sm h-[40px] rounded-[4px] w-[215px] border-pink_primary'}>No, continue verification</Button>
				</div>
			</div>
		</Modal>

		<Modal
			footer={false}
			open={open}
			onCancel={handleCancel}
			maskClosable={false}
			closeIcon={<CloseIcon/>}
			className={`${poppins.className} ${poppins.variable} w-[600px] max-sm:w-full`}
			title={<span className='-mx-6 px-6 border-0 border-solid border-b-[1px] border-[#E1E6EB] pb-3 flex items-center gap-2 text-xl font-semibold'>
				{step !== ESetIdentitySteps.SOCIAL_VERIFICATION ? <span className='text-2xl'><SetIdentityIcon/></span> : <OnChainIdentityIcon/>}
				<span className='text-bodyBlue'>{step !== ESetIdentitySteps.SOCIAL_VERIFICATION ? 'On-chain identity' : 'Socials Verification'}</span>
				{isIdentityUnverified && step === ESetIdentitySteps.SOCIAL_VERIFICATION && <span className='text-xs font-semibold px-3 rounded-[4px] py-[6px] border-solid border-[1px] flex items-center bg-[#f6f7f9] border-[#D2D8E0] gap-2 text-bodyBlue'> <IdentityProgressIcon/>In Progress</span>}
			</span>
			}
		>
			<Spin spinning={loading} className='-mt-6'>
				{step === ESetIdentitySteps.AMOUNT_BREAKDOWN && <TotalAmountBreakdown loading={loading} txFee={txFee} perSocialBondFee={perSocialBondFee} changeStep={setStep}/>}
				{
					step === ESetIdentitySteps.SET_IDENTITY_FORM && <IdentityForm
						setIsIdentityCallDone = {setIsIdentityCallDone}
						className= 'mt-3'
						txFee= {txFee}
						name= {name}
						form = {form}
						onChangeName= {setName}
						socials= {socials}
						onChangeSocials= {setSocials}
						address= {address}
						setTxFee= {setTxFee}
						startLoading= {setLoading}
						onCancel= {handleCancel}
						perSocialBondFee= {perSocialBondFee}
						changeStep= {(step) => setStep(step)}
						closeModal= {(open) => setOpen(!open)}
						setIdentityHash={setIdentityHash}
						setAddressChangeModalOpen= {() => openAddressModal ? openAddressModal(true) : setOpenAddressLinkedModal(true)}
					/>
				}
				{
					step === ESetIdentitySteps.SOCIAL_VERIFICATION && <SocialVerification
						identityHash={identityHash}
						socials= {socials}
						address= {address}
						startLoading= {setLoading}
						onCancel= {handleCancel}
						perSocialBondFee= {perSocialBondFee}
						setLoading={setLoading}
						changeStep= {setStep}
						closeModal= {(open) => setOpen(!open)}
						setSocials={setSocials}
						setOpenSuccessModal={setOpenSuccessModal}
					/>
				}
			</Spin>
		</Modal>
		<DelegationSuccessPopup open={openSuccessModal} setOpen={setOpenSuccessModal} title='On-chain identity verified successfully '/>
	</>
	;
};

export default OnChainIdentity;