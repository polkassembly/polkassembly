// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect, useState } from 'react';
import { IName, ISocials, ITxFee } from '.';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { Alert, Button, Divider, Form, FormInstance, Input, Spin } from 'antd';
import { EmailIcon, TwitterIcon } from '~src/ui-components/CustomIcons';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { NetworkContext } from '~src/context/NetworkContext';
import styled from 'styled-components';
import { ApiContext } from '~src/context/ApiContext';
import BN from 'bn.js';
import { BN_ONE } from '@polkadot/util';
import SuccessState from './SuccessState';
import executeTx from '~src/util/executeTx';
import { NotificationStatus } from '~src/types';
import queueNotification from '~src/ui-components/QueueNotification';
import Balance from '../Balance';
import AddressInput from '~src/ui-components/AddressInput';
import { blake2AsHex } from '@polkadot/util-crypto';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const ZERO_BN = new BN(0);

interface Props {
  className?: string;
  address: string;
  txFee: ITxFee;
  name: IName;
  onChangeName :(pre: IName) => void ;
  socials: ISocials;
  onChangeSocials:(pre: ISocials) => void;
  setTxFee: (pre: ITxFee) => void;
  startLoading: (pre: boolean) => void;
  onCancel:()=> void;
  perSocialBondFee: BN;
  changeStep: (pre: number) => void;
  closeModal: (pre: boolean) => void;
	form: FormInstance;
	setIsIdentityCallDone: (pre: boolean) => void;
	setIdentityHash: (pre: string) => void;
}
interface ValueState {
  info: Record<string, unknown>;
  okAll: boolean;
}

function checkValue (hasValue: boolean, value: string | null | undefined, minLength: number, includes: string[], excludes: string[], starting: string[], notStarting: string[] = WHITESPACE, notEnding: string[] = WHITESPACE): boolean {
	return !hasValue || (
		!!value &&
    (value.length >= minLength) &&
    includes.reduce((hasIncludes: boolean, check) => hasIncludes && value.includes(check), true) &&
    (!starting.length || starting.some((check) => value.startsWith(check))) &&
    !excludes.some((check) => value.includes(check)) &&
    !notStarting.some((check) => value.startsWith(check)) &&
    !notEnding.some((check) => value.endsWith(check))
	);
}
const WHITESPACE = [' ', '\t'];

const IdentityForm = ({ className, form, address, txFee, name, socials, onChangeName, onChangeSocials, setTxFee, startLoading, onCancel, perSocialBondFee, changeStep, closeModal, setIsIdentityCallDone, setIdentityHash }: Props) => {

	const { network } = useContext(NetworkContext);
	const { bondFee, gasFee, registerarFee } = txFee;
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [hideDetails, setHideDetails] = useState<boolean>(false);
	const { api, apiReady } = useContext(ApiContext);
	const [{ info, okAll }, setInfo] = useState<ValueState>({ info: {}, okAll: false });
	const { displayName, legalName } = name;
	const { email, twitter } = socials;
	const [open, setOpen] = useState<boolean>(false);
	const [availableBalance, setAvailableBalance] = useState<BN | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const handleLocalStorageSave = (field: any) => {

		let data: any = localStorage.getItem('identityForm');
		if(data){
			data = JSON.parse(data);
		}
		localStorage.setItem('identityForm', JSON.stringify({
			...data,
			...field
		}));

	};
	const handleOnAvailableBalanceChange = (balanceStr: string) => {
		let balance = ZERO_BN;

		try{
			balance = new BN(balanceStr);
		}
		catch(err){
			console.log(err);
		}
		setAvailableBalance(balance);

	};

	const getGasFee = async(fieldValue?: string, initialLoading?: boolean, txFeeVal?: ITxFee) => {
		if(!txFeeVal){
			txFeeVal = txFee;
		}
		if(!api || !apiReady ||(!okAll && !initialLoading) || (!fieldValue && !initialLoading) || !form.getFieldValue('displayName')) return;

		setLoading(true);

		const tx = api.tx.identity.setIdentity(info);
		const paymentInfo = await tx.paymentInfo(address);
		setTxFee({ ...txFeeVal, gasFee: paymentInfo.partialFee  });
		setLoading(false);
	};

	const handleInfo = (initialLoading?: boolean) => {
		const displayNameVal = form.getFieldValue('displayName');
		const legalNameVal = form.getFieldValue('legalName');
		const emailVal = form.getFieldValue('email');
		const twitterVal = form.getFieldValue('twitter');

		const okDisplay = checkValue(displayNameVal.length > 0, displayNameVal , 1, [], [], []);
		const okLegal = checkValue(legalNameVal.length > 0, legalNameVal, 1, [], [], []);
		const okEmail = checkValue(emailVal.length > 0, emailVal, 3, ['@'], WHITESPACE, []);
		// const okRiot = checkValue((riotVal).length > 0, (riotVal), 6, [':'], WHITESPACE, ['@', '~']);
		const okTwitter = checkValue(twitterVal.length > 0, twitterVal, 3, [], WHITESPACE, ['@']);
		// const okWeb = checkValue((webVal).length > 0, (webVal), 8, ['.'], WHITESPACE, ['https://', 'http://']);

		let okSocials = 1;
		if(okEmail && emailVal.length > 0){okSocials  +=1 ;}
		// if(okRiot && riotVal.length > 0){okSocials+=1;}
		if(okTwitter && twitterVal.length > 0){okSocials+=1;}
		// if(okWeb && webVal.length > 0){okSocials+=1;}

		setInfo({
			info: {
				display: { [okDisplay ? 'raw' : 'none']: displayNameVal || null },
				email: { [(okEmail && emailVal.length > 0) ? 'raw' : 'none']: (okEmail && emailVal.length > 0) ? emailVal : null },
				legal: { [(okLegal && legalNameVal.length > 0) ? 'raw' : 'none']: (okLegal && legalNameVal.length > 0) ? legalNameVal : null },
				// riot: { [(okRiot && (riotVal).length > 0) ? 'raw' : 'none']: (okRiot && (riotVal).length > 0) ? (riotVal) : null },
				twitter: { [(okTwitter && twitterVal.length > 0 )? 'raw' : 'none']: (okTwitter && twitterVal.length > 0) ? twitterVal : null }
				// web: { [(okWeb && (webVal).length > 0) ? 'raw' : 'none']: (okWeb && (webVal).length > 0) ? (webVal) : null }
			},
			okAll: okDisplay && okEmail && okLegal && okTwitter && (displayNameVal?.length > 1) && (emailVal || twitterVal)
		});
		const okSocialsBN = new BN((okSocials - 1) || BN_ONE);
		const fee = { ...txFee, bondFee: okSocials === 1 ? ZERO_BN : perSocialBondFee?.mul(okSocialsBN) };
		setTxFee(fee);
		if(initialLoading){
			getGasFee('', true, fee);
		}
	};

	useEffect(() => {
		handleInfo(true);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	const handleIdentityHashSave = async(hash: string) => {
		if(!hash) return;
		const { data, error } = await nextApiClientFetch(`api/v1/verification/save-identity-hash?identityHash=${hash}`);
		if(data){
			console.log('Identity hash successfully save');
		}
		else{
			console.log(error);
		}
	};

	const handleSetIdentity = async() => {
		if(!api || !apiReady || !okAll)return;
		const identityTx = api.tx?.identity?.setIdentity(info);
		const requestedJudgementTx = api.tx?.identity?.requestJudgement(3, txFee.registerarFee.toString());
		const tx = api.tx.utility.batchAll([identityTx, requestedJudgementTx]);
		const encodedTxHash = identityTx?.method.toHex();

		startLoading(true);

		const onSuccess = async() => {
			queueNotification({
				header: 'Success!',
				message: 'Transaction Successfull',
				status: NotificationStatus.SUCCESS
			});
			setIdentityHash(blake2AsHex(encodedTxHash));
			startLoading(false);
			closeModal(true);
			setOpen(true);
			handleLocalStorageSave({ setIdentity: true });
			setIsIdentityCallDone(true);
			await handleIdentityHashSave(encodedTxHash);
		};
		const onFailed = () => {
			queueNotification({
				header: 'failed!',
				message: 'Transaction failed!',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		};

		await executeTx({ address, api, errorMessageFallback: 'failed.', network, onFailed, onSuccess, tx });
	};

	return <div className={className}>
		<Form
			form={form}
			initialValues={{ displayName, email: email?.value, legalName, twitter: twitter?.value }}
		>
			{availableBalance?.gte(ZERO_BN) && availableBalance.lte(registerarFee.add(gasFee)) &&  <Alert showIcon type='info' className='text-sm text-bodyBlue rounded-[4px]' message='Insufficient Balance.'/>}
			<div className='flex justify-between items-center mt-6 text-lightBlue'>
				<label className='text-sm text-lightBlue'>Your Address <HelperTooltip className='ml-1' text='Please note the verification cannot be transferred to another address.'/></label>
				<Balance address={address || ''} onChange={handleOnAvailableBalanceChange}/>
			</div>
			<AddressInput
				name='address'
				defaultAddress={address}
				onChange={() => startLoading(false)}
				inputClassName={'font-normal text-sm h-[40px] text-bodyBlue'}
				className='text-bodyBlue text-sm font-normal -mt-6'
				disabled
				size='large'
				identiconSize={30}
			/>
			<div className='mt-6'>
				<label className='text-sm text-lightBlue'>Display Name <span className='text-[#FF3C5F]'>*</span></label>
				<Form.Item name='displayName' rules={[{
					message: 'Invalid ',
					validator(rule, value, callback) {
						if (callback && value.length && !checkValue(displayName.length > 0, displayName , 1, [], [], []) ){
							callback(rule?.message?.toString());
						}else {
							callback();
						}
					} }]}>
					<Input
						onBlur={(e) => getGasFee(e.target.value)}
						name='displayName'
						className='h-[40px] rounded-[4px] text-bodyBlue mt-0.5'
						placeholder='Enter a name for your identity '
						value={displayName}
						onChange={(e) => {
							onChangeName({ ...name, displayName: e.target.value });
							handleInfo();
							handleLocalStorageSave({ displayName:e.target.value });
						}
						} />
				</Form.Item>
			</div>
			<div className='mt-6'>
				<label className='text-sm text-lightBlue'>Legal Name</label>
				<Form.Item name='legalName' rules={[{
					message: 'Invalid ',
					validator(rule, value, callback) {
						if (callback && value.length && !checkValue(legalName.length > 0, legalName, 1, [], [], [])){
							callback(rule?.message?.toString());
						}else {
							callback();
						}
					} }]}>
					<Input
						onBlur={(e) => getGasFee(e.target.value)}
						name='legalName'
						className='h-[40px] rounded-[4px] text-bodyBlue'
						placeholder='Enter your full name'
						value={legalName}
						onChange={(e) => {
							onChangeName({ ...name, legalName: e.target.value });
							handleInfo();
							handleLocalStorageSave({ legalName :e.target.value });
						}
						} />
				</Form.Item>
			</div>
			<Divider/>
			<div>
				<label className='text-sm font-medium text-lightBlue'>Socials <HelperTooltip className='ml-1' text='Please add your social handles that require verification.'/></label>

				{/* <div className='flex items-center mt-4'>
					<span className='flex gap-2 w-[150px] items-center mb-6'>
						<WebIcon className='bg-[#edeff3] rounded-full text-2xl p-2.5'/>
						<span className='text-sm text-lightBlue'>Web</span>
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
						<Input name='web' value={web} placeholder='Enter your website address' className='h-[40px] rounded-[4px] text-bodyBlue' onChange={(e) => {onChangeSocials({ ...socials, web: e.target.value }); handleInfo({ webVal: e.target.value });}}/>
					</Form.Item>
				</div> */}

				<div className='flex items-center mt-1  '>
					<span className='flex gap-2 items-center w-[150px] mb-6' >
						<EmailIcon className='bg-[#edeff3] rounded-full text-xl p-2.5 text-[#576D8B]'/>
						<span className='text-sm text-lightBlue'>Email</span>
					</span>
					<Form.Item name='email' className='w-full'  rules={[{
						message: 'Invalid email',
						validator(rule, value, callback) {
							if (callback && value.length > 0 && !checkValue(email?.value?.length > 0, email?.value, 3, ['@'], WHITESPACE, []) ){
								callback(rule?.message?.toString());
							}else {
								callback();
							}
						} }]}>
						<Input
							onBlur={(e) => getGasFee(e.target.value)}
							name='email'
							value={email?.value}
							placeholder='Enter your email address'
							className='h-[40px] rounded-[4px] text-bodyBlue'
							onChange={(e) => {
								onChangeSocials({ ...socials, email: { ...email, value: e.target.value } });
								handleInfo();
								handleLocalStorageSave({ email: { ...email, value: e.target.value } });
							}
							}/>
					</Form.Item>
				</div>

				<div className='flex items-center mt-1'>
					<span className='flex gap-2 items-center w-[150px] mb-6'>
						<TwitterIcon className='bg-[#edeff3] rounded-full text-xl p-2.5 text-[#576D8B]'/>
						<span className='text-sm text-lightBlue'>Twitter</span></span>
					<Form.Item name='twitter' className='w-full' rules={[{
						message: 'Invalid twitter',
						validator(rule, value, callback) {
							if (callback && value.length && !checkValue(twitter?.value.length > 0, twitter?.value, 3, [], WHITESPACE, ['@']) ){
								callback(rule?.message?.toString());
							}else {
								callback();
							}
						} }]}>

						<Input
							onBlur={(e) => getGasFee(e.target.value)}
							name='twitter'
							value={twitter?.value}
							placeholder='@YourTwitterName'
							className='h-[40px] rounded-[4px] text-bodyBlue'
							onChange={(e) => {
								onChangeSocials({ ...socials, twitter:{ ...twitter, value: e.target.value } });
								handleInfo();
								handleLocalStorageSave({ twitter: { ...twitter, value: e.target.value } });
							}
							}/>
					</Form.Item>
				</div>

				{/* <div className='flex items-center mt-1'>
					<span className='flex gap-2 items-center w-[150px] mb-6'>
						<RiotIcon className='bg-[#edeff3] rounded-full text-xl p-2.5 text-[#576D8B]'/>
						<span className='text-sm text-lightBlue'>Riot</span>
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
						<Input name='riot' value={riot} placeholder='@Yourname.matrix.org' className='h-[40px] rounded-[4px] text-bodyBlue' onChange={(e) => {onChangeSocials({ ...socials, riot: e.target.value }); handleInfo({ riotVal: e.target.value });}}/>
					</Form.Item>
				</div> */}
			</div>
		</Form>
		<div className='flex gap-4 text-sm mt-6 items-center'>
			<span className='text-lightBlue font-medium'>Bond <HelperTooltip className='ml-1' text='Amount that needs held in an address for a verified account.'/></span>
			<span className='text-bodyBlue font-medium bg-[#EDEFF3] py-1 px-3 rounded-2xl'>{formatedBalance(bondFee.toString(), unit)} {unit}</span>
		</div>

		{((!gasFee.eq(ZERO_BN)) || loading) && <Spin spinning={loading} tip='calculating gas fee'>

			<Alert
				className='mt-6 rounded-[4px]'
				type='info'
				showIcon
				message={<span className='text-bodyBlue text-sm font-medium '>Total Fees of {formatedBalance((bondFee.add(gasFee).add(registerarFee)).toString(), unit)} {unit} will be applied to the transaction.<span className='text-pink_primary text-xs cursor-pointer ml-1' onClick={() => setHideDetails(!hideDetails)}>{hideDetails ? 'Show Details' : 'Hide Details'}</span></span>}
				description={hideDetails ? '' : <div className='flex gap-1 flex-col text-sm mr-[18px]'>
					<span className='flex justify-between text-xs'>
						<span className='text-lightBlue'>Gas Fee</span>
						<span className='text-bodyBlue font-medium'>{formatedBalance(gasFee.toString(), unit)} {unit}</span>
					</span>
					<span className='flex justify-between text-xs'>
						<span className='text-lightBlue'>Registrar fees</span>
						<span className='text-bodyBlue font-medium'>{formatedBalance(registerarFee.toString(), unit)} {unit}</span>
					</span>
					<span className='flex justify-between text-xs'>
						<span className='text-lightBlue'>Total</span>
						<span className='text-bodyBlue font-medium'>{formatedBalance(registerarFee.add(gasFee).toString(), unit)} {unit}</span>
					</span>
				</div>
				}
			/></Spin>}
		<div className='-mx-6 mt-6 border-0 border-solid flex justify-end border-t-[1px] gap-4 px-6 pt-5 border-[#E1E6EB] rounded-[4px]'>
			<Button onClick={onCancel} className='border-pink_primary text-sm border-[1px]  h-[40px] rounded-[4px] w-[134px] text-pink_primary tracking-wide'>
               Cancel
			</Button>
			<Button
				disabled={!okAll || loading || (availableBalance && availableBalance.lte(registerarFee.add(gasFee))) || gasFee.lte(ZERO_BN)}
				className={`bg-pink_primary text-sm rounded-[4px] h-[40px] border-none w-[134px] text-white tracking-wide ${(!okAll || loading || gasFee.lte(ZERO_BN) || (availableBalance && availableBalance.lte(registerarFee.add(gasFee)) )) && 'opacity-50'}`}
				onClick={handleSetIdentity}
				loading={loading}>
                  Set Identity
			</Button>
		</div>
		<SuccessState open={open} close={(close) => setOpen(!close)} openPreModal={(pre) => closeModal(!pre)} changeStep={changeStep} txFee={txFee} name={name} address={address} socials={socials} />

	</div>;
};

export default styled(IdentityForm)`
.ant-alert-with-description .ant-alert-icon{
  font-size: 14px !important;
  margin-top: 6px;
}
.ant-alert{
  padding: 12px;
}
input::placeholder {
	font-weight: 400 !important;
	font-size: 14px !important;
	line-height: 21px !important;
	letter-spacing: 0.0025em !important;
  color: #798aa2 !important;
}
`;