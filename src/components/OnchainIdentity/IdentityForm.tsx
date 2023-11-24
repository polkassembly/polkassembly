// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect, useState } from 'react';
import { ESetIdentitySteps, IName, ISocials, ITxFee, IVerifiedFields } from '.';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { Alert, Button, Divider, Form, FormInstance, Input, Spin } from 'antd';
import { EmailIcon, TwitterIcon } from '~src/ui-components/CustomIcons';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import styled from 'styled-components';
import { ApiContext } from '~src/context/ApiContext';
import BN from 'bn.js';
import { BN_ONE } from '@polkadot/util';
import SuccessState from './SuccessState';
import executeTx from '~src/util/executeTx';
import { ILoading, NotificationStatus } from '~src/types';
import queueNotification from '~src/ui-components/QueueNotification';
import Balance from '../Balance';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Address from '~src/ui-components/Address';
import { VerifiedIcon } from '~src/ui-components/CustomIcons';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { trackEvent } from 'analytics';

const ZERO_BN = new BN(0);

interface Props {
	className?: string;
	address: string;
	txFee: ITxFee;
	name: IName;
	onChangeName: (pre: IName) => void;
	socials: ISocials;
	onChangeSocials: (pre: ISocials) => void;
	setTxFee: (pre: ITxFee) => void;
	setStartLoading: (pre: ILoading) => void;
	onCancel: () => void;
	perSocialBondFee: BN;
	changeStep: (pre: ESetIdentitySteps) => void;
	closeModal: (pre: boolean) => void;
	form: FormInstance;
	setIsIdentityCallDone: (pre: boolean) => void;
	setIdentityHash: (pre: string) => void;
	setAddressChangeModalOpen: () => void;
	alreadyVerifiedfields: IVerifiedFields;
}
interface ValueState {
	info: Record<string, unknown>;
	okAll: boolean;
}

function checkValue(
	hasValue: boolean,
	value: string | null | undefined,
	minLength: number,
	includes: string[],
	excludes: string[],
	starting: string[],
	notStarting: string[] = WHITESPACE,
	notEnding: string[] = WHITESPACE
): boolean {
	return (
		!hasValue ||
		(!!value &&
			value.length >= minLength &&
			includes.reduce((hasIncludes: boolean, check) => hasIncludes && value.includes(check), true) &&
			(!starting.length || starting.some((check) => value.startsWith(check))) &&
			!excludes.some((check) => value.includes(check)) &&
			!notStarting.some((check) => value.startsWith(check)) &&
			!notEnding.some((check) => value.endsWith(check)))
	);
}
const WHITESPACE = [' ', '\t'];

const IdentityForm = ({
	className,
	form,
	address,
	txFee,
	name,
	socials,
	onChangeName,
	onChangeSocials,
	setTxFee,
	setStartLoading,
	onCancel,
	perSocialBondFee,
	alreadyVerifiedfields,
	changeStep,
	closeModal,
	setIsIdentityCallDone,
	setIdentityHash,
	setAddressChangeModalOpen
}: Props) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const { bondFee, gasFee, registerarFee, minDeposite } = txFee;
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [hideDetails, setHideDetails] = useState<boolean>(false);
	const { api, apiReady } = useContext(ApiContext);
	const [{ info, okAll }, setInfo] = useState<ValueState>({ info: {}, okAll: false });
	const { displayName, legalName } = name;
	const { email, twitter } = socials;
	const [open, setOpen] = useState<boolean>(false);
	const [availableBalance, setAvailableBalance] = useState<BN | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const currentUser = useUserDetailsSelector();
	const totalFee = gasFee.add(bondFee?.add(registerarFee?.add(!!alreadyVerifiedfields?.alreadyVerified || !!alreadyVerifiedfields.isIdentitySet ? ZERO_BN : minDeposite)));

	const handleLocalStorageSave = (field: any) => {
		let data: any = localStorage.getItem('identityForm');
		if (data) {
			data = JSON.parse(data);
		}
		localStorage.setItem(
			'identityForm',
			JSON.stringify({
				...data,
				...field
			})
		);
	};
	const handleOnAvailableBalanceChange = (balanceStr: string) => {
		let balance = ZERO_BN;

		try {
			balance = new BN(balanceStr);
		} catch (err) {
			console.log(err);
		}
		setAvailableBalance(balance);
	};

	const getGasFee = async (initialLoading?: boolean, txFeeVal?: ITxFee) => {
		if (!txFeeVal) {
			txFeeVal = txFee;
		}
		if (!api || !apiReady || (!okAll && !initialLoading) || !form.getFieldValue('displayName') || !form.getFieldValue('email') || !form.getFieldValue('twitter')) {
			setTxFee({ ...txFeeVal, gasFee: ZERO_BN });
			return;
		}

		setLoading(true);

		const tx = api.tx.identity.setIdentity(info);
		const paymentInfo = await tx.paymentInfo(address);
		setTxFee({ ...txFeeVal, gasFee: paymentInfo.partialFee });
		setLoading(false);
	};

	const handleInfo = (initialLoading?: boolean) => {
		const displayNameVal = form.getFieldValue('displayName')?.trim();
		const legalNameVal = form.getFieldValue('legalName')?.trim();
		const emailVal = form.getFieldValue('email')?.trim();
		const twitterVal = form.getFieldValue('twitter').trim();

		const okDisplay = checkValue(displayNameVal.length > 0, displayNameVal, 1, [], [], []);
		const okLegal = checkValue(legalNameVal.length > 0, legalNameVal, 1, [], [], []);
		const okEmail = checkValue(emailVal.length > 0, emailVal, 3, ['@'], WHITESPACE, []);
		// const okRiot = checkValue((riotVal).length > 0, (riotVal), 6, [':'], WHITESPACE, ['@', '~']);
		const okTwitter = checkValue(twitterVal.length > 0, twitterVal, 3, [], [...WHITESPACE, '/'], []);
		// const okWeb = checkValue((webVal).length > 0, (webVal), 8, ['.'], WHITESPACE, ['https://', 'http://']);

		let okSocials = 1;
		if (okEmail && emailVal.length > 0 && alreadyVerifiedfields?.email !== emailVal) {
			okSocials += 1;
		}
		// if(okRiot && riotVal.length > 0){okSocials+=1;}
		if (okTwitter && twitterVal.length > 0 && alreadyVerifiedfields?.twitter !== twitterVal) {
			okSocials += 1;
		}
		// if(okWeb && webVal.length > 0){okSocials+=1;}

		setInfo({
			info: {
				display: { [okDisplay ? 'raw' : 'none']: displayNameVal || null },
				email: { [okEmail && emailVal.length > 0 ? 'raw' : 'none']: okEmail && emailVal.length > 0 ? emailVal : null },
				legal: { [okLegal && legalNameVal.length > 0 ? 'raw' : 'none']: okLegal && legalNameVal.length > 0 ? legalNameVal : null },
				// riot: { [(okRiot && (riotVal).length > 0) ? 'raw' : 'none']: (okRiot && (riotVal).length > 0) ? (riotVal) : null },
				twitter: { [okTwitter && twitterVal.length > 0 ? 'raw' : 'none']: okTwitter && twitterVal.length > 0 ? twitterVal : null }
				// web: { [(okWeb && (webVal).length > 0) ? 'raw' : 'none']: (okWeb && (webVal).length > 0) ? (webVal) : null }
			},
			okAll: okDisplay && okEmail && okLegal && okTwitter && displayNameVal?.length > 1 && emailVal && twitterVal
		});
		const okSocialsBN = new BN(okSocials - 1 || BN_ONE);
		const fee = { ...txFee, bondFee: okSocials === 1 ? ZERO_BN : perSocialBondFee?.mul(okSocialsBN) };
		setTxFee(fee);
		if (initialLoading) {
			getGasFee(true, fee);
		}
	};

	useEffect(() => {
		handleInfo(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleAllowSetIdentity = () => {
		const displayNameVal = form.getFieldValue('displayName')?.trim();
		const legalNameVal = form.getFieldValue('legalName')?.trim();
		const emailVal = form.getFieldValue('email')?.trim();
		const twitterVal = form.getFieldValue('twitter').trim();

		return (
			displayNameVal === alreadyVerifiedfields?.displayName &&
			twitterVal === alreadyVerifiedfields?.twitter &&
			emailVal === alreadyVerifiedfields?.email &&
			legalNameVal === alreadyVerifiedfields?.legalName
		);
	};

	const handleIdentityHashSave = async (hash: string) => {
		if (!hash) return;
		const { data, error } = await nextApiClientFetch(`api/v1/verification/save-identity-hash?identityHash=${hash}`);
		if (data) {
			console.log('Identity hash successfully save');
		} else {
			console.log(error);
		}
	};

	const handleSetIdentity = async () => {
		// GAEvent for set identity button clicked
		trackEvent('set_identity_cta_clicked', 'clicked_set_identity_cta', {
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});
		if (!api || !apiReady || !okAll) return;
		const identityTx = api.tx?.identity?.setIdentity(info);
		const requestedJudgementTx = api.tx?.identity?.requestJudgement(3, txFee.registerarFee.toString());
		const tx = api.tx.utility.batchAll([identityTx, requestedJudgementTx]);
		setStartLoading({ isLoading: true, message: 'Awaiting confirmation' });

		const onSuccess = async () => {
			const identityHash = await api?.query?.identity?.identityOf(address).then((res) => res.unwrapOr(null)?.info.hash.toHex());
			if (!identityHash) {
				console.log('Error in unwraping identityHash');
				return;
			}

			setIdentityHash(identityHash);
			setStartLoading({ isLoading: false, message: '' });
			closeModal(true);
			setOpen(true);
			handleLocalStorageSave({ setIdentity: true });
			handleLocalStorageSave({ identityHash: identityHash });
			setIsIdentityCallDone(true);
			await handleIdentityHashSave(identityHash);
		};
		const onFailed = () => {
			queueNotification({
				header: 'failed!',
				message: 'Transaction failed!',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
			setStartLoading({ isLoading: false, message: '' });
		};

		await executeTx({
			address,
			api,
			apiReady,
			errorMessageFallback: 'failed.',
			network,
			onFailed,
			onSuccess,
			setStatus: (message: string) => setStartLoading({ isLoading: true, message }),
			tx
		});
	};

	return (
		<div className={className}>
			<Form
				form={form}
				initialValues={{ displayName, email: email?.value, legalName, twitter: twitter?.value }}
			>
				{availableBalance?.gte(ZERO_BN) && availableBalance.lte(totalFee) && !alreadyVerifiedfields?.alreadyVerified && (
					<Alert
						showIcon
						type='error'
						className='h-10 rounded-[4px] text-sm text-bodyBlue dark:border-[#FF3C5F] dark:bg-[#3d161d]'
						message={
							<span className='dark:text-blue-dark-high'>
								Minimum Balance of {formatedBalance(totalFee.toString(), unit, 2)} {unit} is required to proceed
							</span>
						}
					/>
				)}
				{alreadyVerifiedfields?.alreadyVerified && (
					<Alert
						showIcon
						type='info'
						className='h-10 rounded-[4px] text-sm text-bodyBlue dark:border-[#91CAFF] dark:bg-[#37414b]'
						message={<span className='dark:text-blue-dark-high'>Your identity has already been set. Please edit a field to proceed.</span>}
					/>
				)}
				<div className='mt-6 flex items-center justify-between text-lightBlue dark:text-blue-dark-medium'>
					<label className='text-sm text-lightBlue dark:text-blue-dark-high'>
						Your Address{' '}
						<HelperTooltip
							className='ml-1'
							text='Please note the verification cannot be transferred to another address.'
						/>
					</label>
					{address && (
						<Balance
							address={address}
							onChange={handleOnAvailableBalanceChange}
						/>
					)}
				</div>
				<div className='flex w-full items-end gap-2 text-sm '>
					<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-[#D2D8E0] bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
						<Address
							address={address}
							isTruncateUsername={false}
							displayInline
						/>
						<Button
							onClick={() => {
								setAddressChangeModalOpen();
								closeModal(true);
							}}
							className='flex h-[26px] w-[70px] items-center justify-center rounded-[4px] border-none bg-pink_primary text-xs text-white'
						>
							Change
						</Button>
					</div>
				</div>
				<div className='mt-6'>
					<label className='text-sm text-lightBlue dark:text-blue-dark-high'>
						Display Name <span className='text-[#FF3C5F]'>*</span>
					</label>
					<Form.Item
						name='displayName'
						rules={[
							{
								message: 'Invalid display name',
								validator(rule, value, callback) {
									if (callback && value.length && !checkValue(form?.getFieldValue('displayName')?.trim()?.length > 0, form?.getFieldValue('displayName')?.trim(), 1, [], [], [])) {
										callback(rule?.message?.toString());
									} else {
										callback();
									}
								}
							}
						]}
					>
						<Input
							onBlur={() => getGasFee()}
							name='displayName'
							className='mt-0.5 h-10 rounded-[4px] text-bodyBlue dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:placeholder-[#909090] dark:focus:border-[#91054F]'
							placeholder='Enter a name for your identity '
							value={displayName}
							onChange={(e) => {
								onChangeName({ ...name, displayName: e.target.value.trim() });
								handleInfo();
								handleLocalStorageSave({ displayName: e.target.value.trim() });
							}}
						/>
					</Form.Item>
				</div>
				<div className='mt-6'>
					<label className='text-sm text-lightBlue dark:text-blue-dark-high'>Legal Name</label>
					<Form.Item
						name='legalName'
						rules={[
							{
								message: 'Invalid legal name',
								validator(rule, value, callback) {
									if (callback && value.length && !checkValue(form?.getFieldValue('legalName')?.trim()?.length > 0, form?.getFieldValue('legalName')?.trim(), 1, [], [], [])) {
										callback(rule?.message?.toString());
									} else {
										callback();
									}
								}
							}
						]}
					>
						<Input
							onBlur={() => getGasFee()}
							name='legalName'
							className='h-10 rounded-[4px] text-bodyBlue dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
							placeholder='Enter your full name'
							value={legalName}
							onChange={(e) => {
								onChangeName({ ...name, legalName: e.target.value.trim() });
								handleInfo();
								handleLocalStorageSave({ legalName: e.target.value.trim() });
							}}
						/>
					</Form.Item>
				</div>
				<Divider />
				<div>
					<label className='text-sm font-medium text-lightBlue dark:text-blue-dark-high'>
						Socials{' '}
						<HelperTooltip
							className='ml-1'
							text='Please add your social handles that require verification.'
						/>
					</label>

					{/* <div className='flex items-center mt-4'>
					<span className='flex gap-2 w-[150px] items-center mb-6'>
						<WebIcon className='bg-[#edeff3] rounded-full text-2xl p-2.5'/>
						<span className='text-sm text-lightBlue dark:text-blue-dark-high'>Web</span>
					</span>
					<Form.Item className='w-full' name='web' rules={[{
						message: 'Invalid web',
						validator(rule, value, callback) {
							if (callback && value.length && !checkValue(web.length > 0, web, 8, ['.'], WHITESPACE, ['https://', 'http://']) ){
								callback(rule?.message?.toString());
							}else {
								callback();
							}
						} }]}>
						<Input name='web' value={web} placeholder='Enter your website address' className='h-10 rounded-[4px] text-bodyBlue dark:text-blue-dark-high' onChange={(e) => {onChangeSocials({ ...socials, web: e.target.value }); handleInfo({ webVal: e.target.value });}}/>
					</Form.Item>
				</div> */}

					<div className='mt-1 flex items-center  '>
						<span className='mb-6 flex w-[150px] items-center gap-2'>
							<EmailIcon className='rounded-full bg-[#edeff3] p-2.5 text-xl text-[#576D8B] dark:bg-inactiveIconDark dark:text-blue-dark-medium' />
							<span className='text-sm text-lightBlue dark:text-blue-dark-high'>
								Email<span className='ml-1 text-[#FF3C5F]'>*</span>
							</span>
						</span>
						<Form.Item
							name='email'
							className='w-full'
							rules={[
								{
									message: 'Invalid email address',
									validator(rule, value, callback) {
										if (
											callback &&
											value.length > 0 &&
											!checkValue(form.getFieldValue('email')?.trim()?.length > 0, form.getFieldValue('email')?.trim(), 3, ['@'], WHITESPACE, [])
										) {
											callback(rule?.message?.toString());
										} else {
											callback();
										}
									}
								}
							]}
						>
							<Input
								onBlur={() => getGasFee()}
								addonAfter={email?.verified && alreadyVerifiedfields?.email === form?.getFieldValue('email') && <VerifiedIcon className='text-xl' />}
								name='email'
								value={email?.value}
								placeholder='Enter your email address'
								className={`h-10 rounded-[4px] text-bodyBlue dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] ${theme}`}
								onChange={(e) => {
									onChangeSocials({ ...socials, email: { ...email, value: e.target.value?.trim() } });
									handleInfo();
									handleLocalStorageSave({ email: { ...email, value: e.target.value?.trim() } });
								}}
							/>
						</Form.Item>
					</div>

					<div className='mt-1 flex items-center'>
						<span className='mb-6 flex w-[150px] items-center gap-2'>
							<TwitterIcon className='rounded-full bg-[#edeff3] p-2.5 text-xl text-[#576D8B] dark:bg-inactiveIconDark dark:text-blue-dark-medium' />
							<span className='text-sm text-lightBlue dark:text-blue-dark-high'>
								Twitter<span className='ml-1 text-[#FF3C5F]'>*</span>
							</span>
						</span>
						<Form.Item
							name='twitter'
							className='w-full'
							rules={[
								{
									message: 'Invalid twitter username',
									validator(rule, value, callback) {
										if (
											callback &&
											value.length &&
											!checkValue(form.getFieldValue('twitter')?.trim()?.length > 0, form.getFieldValue('twitter')?.trim(), 3, [], [...WHITESPACE, '/'], [])
										) {
											callback(rule?.message?.toString());
										} else {
											callback();
										}
									}
								}
							]}
						>
							<Input
								onBlur={() => getGasFee()}
								name='twitter'
								addonAfter={twitter?.verified && alreadyVerifiedfields?.twitter === form?.getFieldValue('twitter') && <VerifiedIcon className='text-xl' />}
								value={twitter?.value}
								placeholder='Enter your twitter name'
								className={`h-10 rounded-[4px] text-bodyBlue dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F] ${theme}`}
								onChange={(e) => {
									onChangeSocials({ ...socials, twitter: { ...twitter, value: e.target.value?.trim() } });
									handleInfo();
									handleLocalStorageSave({ twitter: { ...twitter, value: e.target.value?.trim() } });
								}}
							/>
						</Form.Item>
					</div>

					{/* <div className='flex items-center mt-1'>
					<span className='flex gap-2 items-center w-[150px] mb-6'>
						<RiotIcon className='bg-[#edeff3] rounded-full text-xl p-2.5 text-[#576D8B]'/>
						<span className='text-sm text-lightBlue dark:text-blue-dark-high'>Riot</span>
					</span>
					<Form.Item name='riot' className='w-full' rules={[{
						message: 'Invalid riot',
						validator(rule, value, callback) {
							if (callback && value.length && !checkValue(riot.length > 0, riot, 6, [':'], WHITESPACE, ['@', '~']) ){
								callback(rule?.message?.toString());
							}else {
								callback();
							}
						} }]}>
						<Input name='riot' value={riot} placeholder='@Yourname.matrix.org' className='h-10 rounded-[4px] text-bodyBlue dark:text-blue-dark-high' onChange={(e) => {onChangeSocials({ ...socials, riot: e.target.value }); handleInfo({ riotVal: e.target.value });}}/>
					</Form.Item>
				</div> */}
				</div>
			</Form>
			{!alreadyVerifiedfields?.alreadyVerified && !alreadyVerifiedfields.isIdentitySet && (
				<div className='mt-6 flex items-center gap-4 text-sm'>
					<span className='font-medium text-lightBlue dark:text-blue-dark-high'>
						Min Deposit{' '}
						<HelperTooltip
							className='ml-1'
							text='Amount that needs held in an address for a verified account.'
						/>
					</span>
					<span className='rounded-2xl bg-[#EDEFF3] px-3 py-1 font-medium text-bodyBlue dark:border-separatorDark dark:bg-[#1D1D1D] dark:text-blue-dark-high'>
						{formatedBalance(minDeposite.toString(), unit, 2)} {unit}
					</span>
				</div>
			)}
			{(!gasFee.eq(ZERO_BN) || loading) && (
				<Spin spinning={loading}>
					<Alert
						className='mt-6 rounded-[4px] dark:border-[#91CAFF] dark:bg-[#37414b]'
						type='info'
						showIcon
						message={
							<span className='text-[13px] font-medium text-bodyBlue dark:text-blue-dark-high'>
								{formatedBalance(totalFee.toString(), unit, 2)} {unit} will be required for this transaction.
								<span
									className='ml-1 cursor-pointer text-xs text-pink_primary'
									onClick={() => setHideDetails(!hideDetails)}
								>
									{hideDetails ? 'Show Details' : 'Hide Details'}
								</span>
							</span>
						}
						description={
							hideDetails ? (
								''
							) : (
								<div className='mr-[18px] flex flex-col gap-1 text-sm'>
									<span className='flex justify-between text-xs'>
										<span className='text-lightBlue dark:text-blue-dark-medium'>Gas Fee</span>
										<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
											{formatedBalance(gasFee.toString(), unit)} {unit}
										</span>
									</span>
									<span className='flex justify-between text-xs'>
										<span className='text-lightBlue dark:text-blue-dark-medium '>
											Bond{' '}
											<HelperTooltip
												className='ml-1'
												text={`${formatedBalance(perSocialBondFee.toString(), unit)} ${unit} per social field`}
											/>
										</span>
										<span className='dark:text-blue-dark-hi font-medium text-bodyBlue dark:text-blue-dark-high'>
											{formatedBalance(bondFee.toString(), unit)} {unit}
										</span>
									</span>
									<span className='flex justify-between text-xs'>
										<span className='text-lightBlue dark:text-blue-dark-medium'>
											Registrar fees{' '}
											<HelperTooltip
												text='Costs of development & maintenance are funded by the treasury.'
												className='ml-1'
											/>
										</span>
										<span className='dark:text-blue-dark-hi font-medium text-bodyBlue dark:text-blue-dark-high'>
											{formatedBalance(registerarFee.toString(), unit)} {unit}
										</span>
									</span>
									<span className='flex justify-between text-xs'>
										<span className='text-lightBlue dark:text-blue-dark-medium'>Total</span>
										<span className='dark:text-blue-dark-hi font-medium text-bodyBlue dark:text-blue-dark-high'>
											{formatedBalance(totalFee.toString(), unit, 2)} {unit}
										</span>
									</span>
								</div>
							)
						}
					/>
				</Spin>
			)}
			<div className='-mx-6 mt-6 flex justify-end gap-4 rounded-[4px] border-0 border-t-[1px] border-solid border-[#E1E6EB] px-6 pt-5 dark:border-separatorDark'>
				<Button
					onClick={onCancel}
					className='h-10 w-[134px] rounded-[4px]  border-[1px] border-pink_primary text-sm tracking-wide text-pink_primary dark:bg-transparent'
				>
					Cancel
				</Button>
				<Button
					disabled={!okAll || loading || (availableBalance && availableBalance.lte(totalFee)) || gasFee.lte(ZERO_BN) || handleAllowSetIdentity()}
					className={`h-10 w-[134px] rounded-[4px] border-none bg-pink_primary text-sm tracking-wide text-white ${
						(!okAll || loading || gasFee.lte(ZERO_BN) || (availableBalance && availableBalance.lte(totalFee)) || handleAllowSetIdentity()) && 'opacity-50'
					}`}
					onClick={handleSetIdentity}
					loading={loading}
				>
					Set Identity
				</Button>
			</div>
			<SuccessState
				open={open}
				close={(close) => setOpen(!close)}
				openPreModal={(pre) => closeModal(!pre)}
				changeStep={changeStep}
				txFee={txFee}
				name={name}
				address={address}
				socials={socials}
			/>
		</div>
	);
};

export default styled(IdentityForm)`
	.ant-alert-with-description .ant-alert-icon {
		font-size: 14px !important;
		margin-top: 6px;
	}
	.ant-alert {
		padding: 12px;
	}
	input::placeholder {
		font-weight: 400 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
	}
	input {
		height: 40px !important;
		border-radius: 4px 0px 0px 4px;
		background: transparent !important;
	}
	.ant-input-group .ant-input-group-addon {
		border-radius: 0px 4px 4px 0px !important;
		background: transparent !important;
	}
	.dark input {
		color: white !important;
	}
`;
