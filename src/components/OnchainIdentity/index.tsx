// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { useNetworkSelector, useOnchainIdentitySelector, useUserDetailsSelector } from '~src/redux/selectors';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { useDispatch } from 'react-redux';
import { onchainIdentityActions } from '~src/redux/onchainIdentity';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import { ESetIdentitySteps, IOnChainIdentity, ITxFee } from './types';
import { useRouter } from 'next/router';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { dmSans } from 'pages/_app';
import { Form, Modal, Spin } from 'antd';
import { CloseIcon, OnChainIdentityIcon, SetIdentityIcon, VerifiedIcon } from '~src/ui-components/CustomIcons';
import { ILoading } from '~src/types';
import BN from 'bn.js';
import TotalAmountBreakdown from './TotalAmountBreakdown';
import IdentityForm from './IdentityForm';
import SocialVerification from './SocialVerification';
import DelegationSuccessPopup from '../Listing/Tracks/DelegationSuccessPopup';
import IdentitySuccessState from './IdentitySuccessState';
import { network as AllNetworks } from 'src/global/networkConstants';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import getIdentityRegistrarIndex from '~src/util/getIdentityRegistrarIndex';
import Alert from '~src/basic-components/Alert';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { useTranslation } from 'next-i18next';

const ZERO_BN = new BN(0);

const Identity = ({ open, setOpen, openAddressModal, setOpenAddressModal }: IOnChainIdentity) => {
	const { t } = useTranslation('common');
	const dispatch = useDispatch();
	const router = useRouter();
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const { loginAddress, id: userId } = useUserDetailsSelector();
	const identityDetails = useOnchainIdentitySelector();
	const [form] = Form.useForm();
	const { identityAddress, identityInfo, socials } = identityDetails;
	const [isExitModal, setIsExitModal] = useState<boolean>(false);
	const [openAddressSelectModal, setOpenAddressSelectModal] = useState<boolean>(false);
	const [openJudgementSuccessModal, setOpenJudgementSuccessModal] = useState<boolean>(false);
	const [openIdentitySuccessModal, setOpenIdentitySuccessModal] = useState<boolean>(false);
	const [step, setStep] = useState<ESetIdentitySteps>(ESetIdentitySteps.AMOUNT_BREAKDOWN);
	const [loading, setLoading] = useState<ILoading>({ isLoading: false, message: '' });
	const [isRequestedJudgmentFromPolkassembly, setIsRequestedJudgmentFromPolkassembly] = useState<boolean>(false);
	const [txFee, setTxFee] = useState<ITxFee>({ gasFee: ZERO_BN, minDeposite: ZERO_BN, registerarFee: ZERO_BN });

	useEffect(() => {
		if (loginAddress && !identityAddress) {
			dispatch(onchainIdentityActions.setOnchainIdentityAddress(loginAddress));
		}
		setStep(isRequestedJudgmentFromPolkassembly ? ESetIdentitySteps.SOCIAL_VERIFICATION : ESetIdentitySteps.AMOUNT_BREAKDOWN);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isRequestedJudgmentFromPolkassembly, identityAddress]);

	const getTxFee = async () => {
		if (!api || !apiReady || !network) return;

		const registerars: any = await (peopleChainApi ?? api)?.query?.identity?.registrars?.().then((e) => JSON.parse(e.toString()));
		const registerarIndex = getIdentityRegistrarIndex({ network });
		const bnRegisterarFee = registerarIndex ? new BN(registerars?.[registerarIndex]?.fee || ZERO_BN) : ZERO_BN;
		const minDeposite = (peopleChainApi ?? api)?.consts?.identity?.basicDeposit || ZERO_BN;
		setTxFee({ ...txFee, minDeposite, registerarFee: bnRegisterarFee });
		setLoading({ ...loading, isLoading: false });
	};

	const getIdentityHash = async () => {
		if (!identityAddress && !loginAddress) return;
		try {
			const encoded_addr = getEncodedAddress(identityAddress || loginAddress, network);

			const identityHash = await (peopleChainApi ?? api)?.query?.identity
				?.identityOf(encoded_addr)
				.then((res: any) => ([AllNetworks.KUSAMA, AllNetworks.POLKADOT].includes(network) ? res?.unwrap?.()?.[0] : (res.unwrapOr(null) as any))?.info.hash.toHex());
			if (!identityHash) {
				console.log('Error in unwrapping identity hash');
			}
			dispatch(onchainIdentityActions.setOnchainIdentityHash(identityHash));
			if (!identityAddress) {
				dispatch(onchainIdentityActions.setOnchainIdentityAddress(loginAddress));
			}
		} catch (err) {
			console.log(err);
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
		if (router.query?.setidentity) {
			router.replace('?setidentity=true', isOpenGovSupported(network) ? '/opengov' : '/');
		}
	};

	const getIdentityInfo = async () => {
		if (!api || !apiReady) return;

		try {
			const { discord, display, email, isVerified, isIdentitySet, matrix, github, legal, twitter, web, judgements, verifiedByPolkassembly } = await getIdentityInformation({
				address: identityAddress || loginAddress,
				api: peopleChainApi ?? api,
				network: network
			});

			if (display) {
				getIdentityHash();
			}

			form.setFieldValue('displayName', display || '');
			form.setFieldValue('legalName', legal || '');
			form.setFieldValue('email', email || '');
			form.setFieldValue('twitter', twitter || '');
			form.setFieldValue('matrix', matrix || '');

			const infoCall = judgements?.filter(([, judgement]: any[]): boolean => {
				return !!judgement?.FeePaid;
			});

			if (infoCall?.length) {
				const isRegistrarIndex = infoCall.some(([index]) => {
					return Number(index) == getIdentityRegistrarIndex({ network });
				});
				setIsRequestedJudgmentFromPolkassembly(!!isRegistrarIndex || false);
			}

			dispatch(
				onchainIdentityActions.updateOnchainIdentityStore({
					...identityDetails,
					displayName: display || '',
					identityInfo: {
						alreadyVerified: isVerified,
						discord: discord || '',
						displayName: display || '',
						email: email || '',
						github: github || '',
						isIdentitySet: isIdentitySet,
						legalName: legal || '',
						matrix: matrix || '',
						twitter: twitter || '',
						verifiedByPolkassembly: verifiedByPolkassembly || false,
						web: web || ''
					},
					legalName: legal || '',
					socials: {
						...socials,
						email: { ...socials.email, value: email || '' },
						matrix: { ...socials.matrix, value: matrix || '' },
						twitter: { ...socials.twitter, value: twitter || '' }
					},
					userId: userId || null
				})
			);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		if (!(api && peopleChainApi) || !apiReady) return;

		form.setFieldValue('address', identityAddress || loginAddress);
		getTxFee();
		getIdentityInfo();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, peopleChainApi, peopleChainApiReady, loginAddress, identityAddress, network]);

	return (
		<div>
			{/* address connect modal */}
			<AddressConnectModal
				open={openAddressModal ? openAddressModal : openAddressSelectModal}
				setOpen={setOpenAddressModal ? setOpenAddressModal : setOpenAddressSelectModal}
				walletAlertTitle={t('on_chain_identity')}
				onConfirm={(address: string) => {
					form.setFieldValue('address', address);
					dispatch(onchainIdentityActions.setOnchainIdentityAddress(address));
					setOpen(true);
				}}
				localStorageWalletKeyName='identityWallet'
				usedInIdentityFlow
			/>

			{/* exit modal */}
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				maskClosable={false}
				open={isExitModal}
				onCancel={() => {
					setOpen(true);
					setIsExitModal(false);
				}}
				footer={false}
				className={`${dmSans.className} ${dmSans.variable} opengov-proposals w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				closable={false}
				title={
					<div className='-mx-6 items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						{t('exit_verification')}
					</div>
				}
			>
				<div className='mt-6'>
					<span className='text-sm text-bodyBlue dark:text-blue-dark-high'>{t('pending_verification_exit')}</span>
					<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F]'>
						<CustomButton
							onClick={() => {
								setIsExitModal(false);
								setOpen(false);
								setLoading({ ...loading, isLoading: false });
								router.replace('?setidentity=true', isOpenGovSupported(network) ? '/opengov' : '/');
							}}
							text={t('yes_exit')}
							height={38}
							width={145}
							variant='default'
						/>
						<CustomButton
							onClick={() => {
								setIsExitModal(false);
								setOpen(true);
							}}
							text={t('no_continue_verification')}
							height={38}
							width={215}
							variant='primary'
						/>
					</div>
				</div>
			</Modal>

			{/* identity modal */}
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				footer={false}
				open={open}
				onCancel={handleCancel}
				maskClosable={false}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				className={`${dmSans.className} ${dmSans.variable} w-[600px] max-sm:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				title={
					<div className='-mx-6 flex items-center gap-2 border-0 border-b-[1px] border-solid border-[#E1E6EB] px-6 pb-3 text-xl font-semibold dark:border-separatorDark dark:bg-section-dark-overlay dark:text-white'>
						{step !== ESetIdentitySteps.SOCIAL_VERIFICATION ? (
							<SetIdentityIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />
						) : (
							<OnChainIdentityIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />
						)}
						<span className='text-bodyBlue dark:text-blue-dark-high'>{step !== ESetIdentitySteps.SOCIAL_VERIFICATION ? t('on_chain_identity') : t('social_verification')}</span>
						{step === ESetIdentitySteps.SET_IDENTITY_FORM && identityInfo.verifiedByPolkassembly ? (
							<div>
								<Alert
									className='h-7 rounded-[4px]'
									type='success'
									showIcon
									icon={<VerifiedIcon className='text-base' />}
									message={<p className='m-0 p-0 text-xs text-[#51D36E]'>{t('verified')}</p>}
								/>
							</div>
						) : null}
					</div>
				}
			>
				<Spin
					spinning={loading?.isLoading}
					className='-mt-5'
					tip={loading?.message || ''}
				>
					{step === ESetIdentitySteps.AMOUNT_BREAKDOWN && (
						<TotalAmountBreakdown
							loading={loading?.isLoading}
							txFee={txFee}
							setStartLoading={setLoading}
							changeStep={(step: ESetIdentitySteps) => setStep(step)}
						/>
					)}
					{step === ESetIdentitySteps.SET_IDENTITY_FORM && (
						<IdentityForm
							className='mt-3'
							txFee={txFee}
							form={form}
							setTxFee={setTxFee}
							setStartLoading={setLoading}
							onCancel={handleCancel}
							closeModal={(open) => setOpen(!open)}
							setOpenIdentitySuccessModal={setOpenIdentitySuccessModal}
							setAddressChangeModalOpen={() => (setOpenAddressModal ? setOpenAddressModal(true) : setOpenAddressSelectModal(true))}
							changeStep={(step: ESetIdentitySteps) => setStep(step)}
						/>
					)}
					{step === ESetIdentitySteps.SOCIAL_VERIFICATION && (
						<SocialVerification
							startLoading={setLoading}
							onCancel={handleCancel}
							closeModal={(open) => setOpen(!open)}
							changeStep={(step: ESetIdentitySteps) => setStep(step)}
							setOpenSuccessModal={setOpenJudgementSuccessModal}
						/>
					)}
				</Spin>
			</Modal>
			<DelegationSuccessPopup
				open={openJudgementSuccessModal}
				setOpen={setOpenJudgementSuccessModal}
				title={t('verification_successful')}
			/>
			<IdentitySuccessState
				open={openIdentitySuccessModal}
				close={(close) => setOpenIdentitySuccessModal(!close)}
				openPreModal={(pre) => setOpen(pre)}
				changeStep={(step: ESetIdentitySteps) => setStep(step)}
			/>
		</div>
	);
};

export default Identity;
