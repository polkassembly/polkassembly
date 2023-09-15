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

export interface ISocials {
	web: { value: string; verified: boolean };
	email: { value: string; verified: boolean };
	twitter: { value: string; verified: boolean };
	riot: { value: string; verified: boolean };
}
export interface IVerifiedFields {
	email: string;
	twitter: string;
	displayName: string;
	legalName: string;
	alreadyVerified: boolean;
}
interface Propos {
	open: boolean;
	setOpen: (pre: boolean) => void;
	openAddressLinkedModal?: boolean;
	setOpenAddressLinkedModal?: (pre: boolean) => void;
}
const OnChainIdentity = ({ open, setOpen, openAddressLinkedModal: addressModal, setOpenAddressLinkedModal: openAddressModal }: Propos) => {
	const { network } = useContext(NetworkContext);
	const { id: userId } = useContext(UserDetailsContext);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(addressModal || false);
	const { api, apiReady } = useContext(ApiContext);
	const [loading, setLoading] = useState<boolean>(false);
	const [txFee, setTxFee] = useState<ITxFee>({ bondFee: ZERO_BN, gasFee: ZERO_BN, minDeposite: ZERO_BN, registerarFee: ZERO_BN });
	const [address, setAddress] = useState<string>('');
	const [name, setName] = useState<IName>({ displayName: '', legalName: '' });
	const [socials, setSocials] = useState<ISocials>({
		email: { value: '', verified: false },
		riot: { value: '', verified: false },
		twitter: { value: '', verified: false },
		web: { value: '', verified: false }
	});
	const [perSocialBondFee, setPerSocialBondFee] = useState<BN>(ZERO_BN);
	const [isExitModal, setIsExitModal] = useState<boolean>(false);
	const [form] = Form.useForm();
	const [isIdentityCallDone, setIsIdentityCallDone] = useState<boolean>(false);
	const [step, setStep] = useState<ESetIdentitySteps>(isIdentityCallDone ? ESetIdentitySteps.SOCIAL_VERIFICATION : ESetIdentitySteps.AMOUNT_BREAKDOWN);
	const [identityHash, setIdentityHash] = useState<string>('');
	const [isIdentityUnverified, setIsIdentityUnverified] = useState<boolean>(true);
	const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(false);
	const [alreadyVerifiedfields, setAlreadyVerifiedFields] = useState<IVerifiedFields>({
		alreadyVerified: false,
		displayName: '',
		email: '',
		legalName: '',
		twitter: ''
	});

	const getAccounts = async (chosenWallet: Wallet, defaultWalletAddress?: string | null): Promise<void> => {
		if (!api || !apiReady) return;
		setLoading(true);

		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected ? injectedWindow?.injectedWeb3?.[chosenWallet] : null;

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

				if (wallet && wallet.enable) {
					wallet
						.enable(APPNAME)
						.then((value) => {
							clearTimeout(timeoutId);
							resolve(value);
						})
						.catch((error) => {
							reject(error);
						});
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
			if (api && apiReady) {
				api.setSigner(injected.signer);
			}

			if (defaultWalletAddress) {
				const address =
					accounts.filter((account) => account?.address === (getEncodedAddress(defaultWalletAddress, network) || defaultWalletAddress))?.[0]?.address || accounts[0]?.address;
				setAddress(address);
				form.setFieldValue('address', address);
			}
		}

		setLoading(false);
		return;
	};

	const handleInitialStateSet = (identityForm: any) => {
		if (identityForm?.userId !== userId) return;
		setName({ displayName: identityForm?.displayName || '', legalName: identityForm?.legalName || '' });
		setSocials({ ...socials, email: { ...identityForm?.email, verified: false } || '', twitter: { ...identityForm?.twitter, verified: false } });
		form.setFieldValue('displayName', identityForm?.displayName || '');
		form.setFieldValue('legalName', identityForm?.legalName || '');
		form.setFieldValue('email', identityForm?.email?.value || '');
		form.setFieldValue('twitter', identityForm?.twitter?.value || '');
		const identityHash = identityForm?.identityHash;
		setIdentityHash(identityHash);
		if (identityForm?.setIdentity) {
			setIsIdentityCallDone(true);
			setStep(ESetIdentitySteps.SOCIAL_VERIFICATION);
		}
	};

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		if (!api || !apiReady) return;
		setLoading(true);

		(async () => {
			const bondFee = api.consts.identity.fieldDeposit;

			const registerarFee: any = await api.query.identity.registrars().then((e) => JSON.parse(e.toString()));
			const bnRegisterarFee = new BN(registerarFee[registerarFee.length - 1].fee || ZERO_BN);
			const minDeposite = api.consts.identity.basicDeposit;
			setTxFee({ ...txFee, bondFee: ZERO_BN, minDeposite, registerarFee: bnRegisterarFee });
			setPerSocialBondFee(bondFee);
			setLoading(false);
		})();
		const address = localStorage.getItem('identityAddress');
		const wallet = localStorage.getItem('identityWallet');

		getAccounts(wallet as Wallet, address);
		let identityForm: any = localStorage.getItem('identityForm');
		identityForm = JSON.parse(identityForm);

		if (identityForm) {
			handleInitialStateSet(identityForm);
		}

		let unsubscribe: () => void;
		const encoded_addr = address ? getEncodedAddress(address, network) : '';
		if (!encoded_addr) return;

		api.derive.accounts
			.info(encoded_addr, (info: DeriveAccountInfo) => {
				const infoCall = info.identity?.judgements.filter(([, judgement]): boolean => judgement.isFeePaid);
				const judgementProvided = infoCall?.some(([, judgement]): boolean => judgement.isFeePaid);
				const identity = info?.identity;
				setName({ displayName: identity?.display || '', legalName: identity?.legal || '' });
				setSocials({
					...socials,
					email: {
						value: identity?.email || '',
						verified: !!identity?.email
					},
					twitter: {
						value: identity?.twitter || '',
						verified: !!identity?.twitter
					}
				});
				setAlreadyVerifiedFields({
					alreadyVerified: !(judgementProvided || !info?.identity?.judgements?.length),
					displayName: identity?.display || '',
					email: identity?.email || '',
					legalName: identity?.legal || '',
					twitter: identity?.twitter || ''
				});
				form.setFieldValue('displayName', identity?.display || '');
				form?.setFieldValue('legalName', identity?.legal || '');
				form?.setFieldValue('email', identity?.email || '');
				form?.setFieldValue('twitter', identity?.twitter || '');

				setIsIdentityUnverified(judgementProvided || !info?.identity?.judgements?.length);

				if (!identityForm || !identityForm?.setIdentity) return;

				if (!(judgementProvided || !info?.identity?.judgements?.length)) {
					localStorage.removeItem('identityForm');
				}
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network, step, addressModal, openAddressLinkedModal]);

	const handleLocalStorageSetUnverified = () => {
		let data: any = localStorage.getItem('identityForm');
		if (data) {
			data = JSON.parse(data);
		}
	};

	const handleCancel = () => {
		if (step === ESetIdentitySteps.SOCIAL_VERIFICATION) {
			setOpen(false);
			setIsExitModal(true);
		} else {
			setOpen(false);
			setStep(ESetIdentitySteps.AMOUNT_BREAKDOWN);
		}
	};

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

	return (
		<>
			{(addressModal ? addressModal : openAddressLinkedModal) && (
				<AddressConnectModal
					closable
					open={addressModal ? addressModal : openAddressLinkedModal}
					setOpen={openAddressModal ? openAddressModal : setOpenAddressLinkedModal}
					walletAlertTitle='On chain identity.'
					localStorageWalletKeyName='identityWallet'
					localStorageAddressKeyName='identityAddress'
					onConfirm={(address: string) => handleConfirm(address)}
				/>
			)}
			<Modal
				maskClosable={false}
				open={isExitModal}
				onCancel={() => {
					setOpen(true);
					setIsExitModal(false);
				}}
				footer={false}
				className={`${poppins.className} ${poppins.variable} opengov-proposals w-[600px]`}
				closable={false}
				title={
					<div className='-mx-6 items-center gap-2 border-0 border-b-[1px] border-solid border-[#D2D8E0] px-6 pb-4 text-lg font-semibold text-bodyBlue'>Exit Verification</div>
				}
			>
				<div className='mt-6'>
					<span className='text-sm text-bodyBlue'>Your verification is pending. Are you sure you want to exit verification process? </span>
					<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-[#D2D8E0] px-6 pt-4'>
						<Button
							onClick={() => {
								setIsExitModal(false);
								setOpen(false);
								handleLocalStorageSetUnverified();
								setLoading(false);
							}}
							className='h-[38px] w-[145px] rounded-[4px] border-pink_primary text-sm font-medium tracking-[0.05em] text-pink_primary'
						>
							Yes, Exit
						</Button>
						<Button
							onClick={() => {
								setIsExitModal(false);
								setOpen(true);
							}}
							className={'h-[40px] w-[215px] rounded-[4px] border-pink_primary bg-pink_primary text-sm font-medium tracking-[0.05em] text-white'}
						>
							No, continue verification
						</Button>
					</div>
				</div>
			</Modal>

			<Modal
				footer={false}
				open={open}
				onCancel={handleCancel}
				maskClosable={false}
				closeIcon={<CloseIcon />}
				className={`${poppins.className} ${poppins.variable} w-[600px] max-sm:w-full`}
				title={
					<span className='-mx-6 flex items-center gap-2 border-0 border-b-[1px] border-solid border-[#E1E6EB] px-6 pb-3 text-xl font-semibold'>
						{step !== ESetIdentitySteps.SOCIAL_VERIFICATION ? (
							<span className='text-2xl'>
								<SetIdentityIcon />
							</span>
						) : (
							<OnChainIdentityIcon />
						)}
						<span className='text-bodyBlue'>{step !== ESetIdentitySteps.SOCIAL_VERIFICATION ? 'On-chain identity' : 'Socials Verification'}</span>
						{isIdentityUnverified && step === ESetIdentitySteps.SOCIAL_VERIFICATION && !loading && (
							<span className='flex items-center gap-2 rounded-[4px] border-[1px] border-solid border-[#D2D8E0] bg-[#f6f7f9] px-3 py-[6px] text-xs font-semibold text-bodyBlue'>
								<IdentityProgressIcon />
								In Progress
							</span>
						)}
					</span>
				}
			>
				<Spin
					spinning={loading}
					className='-mt-6'
				>
					{step === ESetIdentitySteps.AMOUNT_BREAKDOWN && (
						<TotalAmountBreakdown
							loading={loading}
							txFee={txFee}
							perSocialBondFee={perSocialBondFee}
							changeStep={setStep}
						/>
					)}
					{step === ESetIdentitySteps.SET_IDENTITY_FORM && (
						<IdentityForm
							alreadyVerifiedfields={alreadyVerifiedfields}
							setIsIdentityCallDone={setIsIdentityCallDone}
							className='mt-3'
							txFee={txFee}
							name={name}
							form={form}
							onChangeName={setName}
							socials={socials}
							onChangeSocials={setSocials}
							address={address}
							setTxFee={setTxFee}
							startLoading={setLoading}
							onCancel={handleCancel}
							perSocialBondFee={perSocialBondFee}
							changeStep={(step) => setStep(step)}
							closeModal={(open) => setOpen(!open)}
							setIdentityHash={setIdentityHash}
							setAddressChangeModalOpen={() => (openAddressModal ? openAddressModal(true) : setOpenAddressLinkedModal(true))}
						/>
					)}
					{step === ESetIdentitySteps.SOCIAL_VERIFICATION && (
						<SocialVerification
							identityHash={identityHash}
							socials={socials}
							address={address}
							startLoading={setLoading}
							onCancel={handleCancel}
							perSocialBondFee={perSocialBondFee}
							setLoading={setLoading}
							changeStep={setStep}
							closeModal={(open) => setOpen(!open)}
							setSocials={setSocials}
							setOpenSuccessModal={setOpenSuccessModal}
						/>
					)}
				</Spin>
			</Modal>
			<DelegationSuccessPopup
				open={openSuccessModal}
				redirect={false}
				setOpen={setOpenSuccessModal}
				title='On-chain identity verified successfully'
			/>
		</>
	);
};

export default OnChainIdentity;
