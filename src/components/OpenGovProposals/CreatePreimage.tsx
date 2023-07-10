// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, FormInstance, Input, Radio, Spin } from 'antd';
import { EEnactment, IEnactment, IPreimage, ISteps } from '.';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import Address from '~src/ui-components/Address';
import BN from 'bn.js';
import dynamic from 'next/dynamic';
import SelectTracks from './SelectTracks';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useApiContext, useNetworkContext } from '~src/context';
import AddressInput from '~src/ui-components/AddressInput';
import Web3 from 'web3';
import getEncodedAddress from '~src/util/getEncodedAddress';
import styled from 'styled-components';
import DownArrow from '~assets/icons/down-icon.svg';
import { GetCurrentTokenPrice } from '../Home/TreasuryOverview';
import { BN_HUNDRED, BN_ONE, BN_THOUSAND, formatBalance, isHex } from '@polkadot/util';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedWindow } from '@polkadot/extension-inject/types';
import { APPNAME } from '~src/global/appName';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { blake2AsHex } from '@polkadot/util-crypto';
import { HexString } from '@polkadot/util/types';
import { LoadingOutlined } from '@ant-design/icons';
import { chainProperties } from '~src/global/networkConstants';
import { formatedBalance } from '../DelegationDashboard/ProfileBalance';
import { useCurrentBlock } from '~src/hooks';
import { Proposal } from '@polkadot/types/interfaces';
import { ApiPromise } from '@polkadot/api';
import Balance from '../Balance';
import { inputToBn } from '~src/util/inputToBn';
import { Bytes } from '@polkadot/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPreimageData } from 'pages/api/v1/preimages/latest';

const BalanceInput = dynamic(() => import('~src/ui-components/BalanceInput'), {
	ssr: false
});

const ZERO_BN = new BN(0);
const EMPTY_HASH = blake2AsHex('');

interface Props{
  className?: string;
  isPreimage: boolean | null;
  setIsPreimage: (pre: boolean) => void;
  preimageHash: string;
  setPreimageHash: (pre: string) => void;
  setSteps: (pre: ISteps)=> void;
  proposerAddress: string;
  beneficiaryAddress: string;
  setBeneficiaryAddress: (pre: string) => void;
  fundingAmount:BN;
  setFundingAmount:(pre: BN) => void;
  selectedTrack: string;
  setSelectedTrack: (pre: string) => void;
  enactment: IEnactment;
  setEnactment: (pre: IEnactment) => void;
  setPreimage: (pre: IPreimage) => void;
  preimage: IPreimage | undefined;
  form: FormInstance;
  preimageLength: number;
  setPreimageLength: (pre:number) => void;
}

interface IAdvancedDetails{
  afterNoOfBlocks: BN | null;
  atBlockNo: BN | null
}

const CreatePreimage = ({ className, isPreimage, setIsPreimage, setSteps, preimageLength, setPreimageLength, preimageHash, setPreimageHash, fundingAmount, setFundingAmount, selectedTrack, setSelectedTrack, proposerAddress, beneficiaryAddress, setBeneficiaryAddress, enactment, setEnactment, setPreimage, form }:Props) => {

	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();
	const [preimageCreated, setPreimageCreated] = useState<boolean>(false);
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [addressAlert, setAddressAlert] = useState<boolean>(false);
	const [openAdvanced, setOpenAdvanced] = useState<boolean>(false);
	const [validBeneficiaryAddress, setValidBeneficiaryAddress] = useState<boolean>(false);
	const [inputAmountValue, setInputAmountValue] = useState<string>('0');
	const [txFee, setTxFee] = useState(ZERO_BN);
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [invalidPreimage, setInvalidPreimage] = useState<boolean>(false);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [isAutoSelectTrack, setIsAutoSelectTrack] = useState<boolean>(true);
	const [currentTokenPrice, setCurrentTokenPrice] = useState({
		isLoading: true,
		value: ''
	});
	const [loading, setLoading] = useState<boolean>(false);
	const currentBlock = useCurrentBlock();
	const [advancedDetails, setAdvancedDetails] = useState<IAdvancedDetails>({ afterNoOfBlocks: BN_HUNDRED, atBlockNo: BN_ONE });

	const trackArr: string[] = [];
	const maxSpendArr: {track: string, maxSpend: number}[] = [];

	if(network){
		Object.entries(networkTrackInfo?.[network]).forEach(([key, value]) => {
			if(value.group === 'Treasury'){
				trackArr.push(key);
				maxSpendArr.push({ maxSpend: value?.maxSpend, track: key });
			}
		});
	}

	maxSpendArr.sort((a,b) => a.maxSpend - b.maxSpend );

	const handleStateChange = (createPreimageForm: any) => {
		const balance = new BN(createPreimageForm?.fundingAmount) ;
		setInputAmountValue(createPreimageForm?.fundingAmount);
		setPreimageHash(createPreimageForm?.preimageHash || '') ;
		setPreimageLength(createPreimageForm?.preimageLength || 0);
		setBeneficiaryAddress(createPreimageForm?.beneficiaryAddress || '');
		setEnactment(createPreimageForm?.enactment || enactment);
		setBeneficiaryAddress( createPreimageForm.beneficiaryAddress || '');
		setFundingAmount(balance);
		setSelectedTrack(createPreimageForm?.selectedTrack || '');
		createPreimageForm?.selectedTrack && setIsAutoSelectTrack(false);
		form.setFieldValue('preimage_hash', createPreimageForm?.preimageHash || '');
		form.setFieldValue('preimage_length', createPreimageForm?.preimageLength || 0);
		form.setFieldValue('funding_amount', balance || ZERO_BN);
		form.setFieldValue('address', createPreimageForm.beneficiaryAddress || '');
		createPreimageForm?.enactment &&  form.setFieldValue(createPreimageForm?.enactment?.key === EEnactment.At_Block_No ? 'at_block' : 'after_blocks', createPreimageForm?.enactment?.value || null );
	};

	useEffect(() => {
		let data: any = localStorage.getItem('treasuryProposalData');
		data = JSON.parse(data);
		if(data && data?.createPreimageForm){
			const isPreimage = data?.isPreimage;
			setIsPreimage(isPreimage);
			setSteps({ percent: 20, step: 1 });
			const createPreimageForm = data?.createPreimageForm?.[!isPreimage ? 'withoutPreimageForm' : 'withPreimageForm'] ;
			handleStateChange(createPreimageForm);
		}
		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
		data.preimageCreated && setPreimageCreated(true);
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	const onChangeLocalStorageSet = (obj: any, isPreimage: boolean, isPreimageStateChange?: boolean, createdPreimage?: boolean) => {
		let data: any = localStorage.getItem('treasuryProposalData');
		if(data){data = JSON.parse(data);}

		const createPreimageFormKey = !isPreimage ? 'withoutPreimageForm' : 'withPreimageForm';
		const createPreimageFormData = data?.createPreimageForm || {};
		const createPreimageKeysData = data?.createPreimageForm?.[createPreimageFormKey] || {};
		localStorage.setItem('treasuryProposalData', JSON.stringify({
			...data,
			createPreimageForm: {
				...createPreimageFormData,
				[createPreimageFormKey]: { ...createPreimageKeysData, ...obj }
			},
			createdPreimage: Boolean(createdPreimage),
			isPreimage: isPreimage,
			step: 0
		}));

		if(isPreimageStateChange) {
			handleStateChange(createPreimageKeysData || {});
			setAdvancedDetails({ ...advancedDetails, atBlockNo: currentBlock?.add(BN_THOUSAND) || BN_ONE });
		}

	};

	useEffect(() => {
		setShowAlert(false);
		form.validateFields();

		if(!proposerAddress || !beneficiaryAddress || !getEncodedAddress(beneficiaryAddress, network) ||
		!api || !apiReady || !fundingAmount || fundingAmount.lte(ZERO_BN) || fundingAmount.eq(ZERO_BN) || txFee.gte(availableBalance)) return;
		if(!selectedTrack) return;

		setLoading(true);
		const tx = api.tx.treasury.spend(fundingAmount.toString(), beneficiaryAddress);

		(async () => {
			const info = await tx.paymentInfo(proposerAddress);
			setTxFee(new BN(info.partialFee.toString() || 0));
			setLoading(false);
			setShowAlert(true);
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form, proposerAddress, beneficiaryAddress, fundingAmount, api, apiReady, network, selectedTrack, availableBalance]);

	const getState = (api: ApiPromise, proposal: SubmittableExtrinsic<'promise'>): IPreimage => {
		let preimageHash = EMPTY_HASH;
		let encodedProposal: HexString | null = null;
		let preimageLength = 0;
		let notePreimageTx: SubmittableExtrinsic<'promise'> | null = null;
		let storageFee = ZERO_BN;

		encodedProposal = proposal?.method.toHex();
		preimageLength = Math.ceil((encodedProposal.length - 2) / 2);
		preimageHash = blake2AsHex(encodedProposal);
		notePreimageTx = api.tx.preimage.notePreimage(encodedProposal);

		// we currently don't have a constant exposed, however match to Substrate
		storageFee = ((api.consts.preimage?.baseDeposit || ZERO_BN) as unknown as BN).add(
			((api.consts.preimage?.byteDeposit || ZERO_BN) as unknown as BN).muln(preimageLength)
		);

		return {
			encodedProposal,
			notePreimageTx,
			preimageHash,
			preimageLength,
			storageFee
		};
	};

	const getPreimage = async() => {
		if(!api || !apiReady) return;

		const proposerWallet = localStorage.getItem('treasuryProposalProposerWallet') || '';

		const injectedWindow = window as Window & InjectedWindow;
		const wallet = isWeb3Injected
			? injectedWindow.injectedWeb3[String(proposerWallet)]
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
		api.setSigner(injected.signer);

		setLoading(true);
		try {
			const proposal = api.tx.treasury.spend(fundingAmount.toString(), beneficiaryAddress);
			const preimage = getState(api, proposal);
			setLoading(true);
			preimage?.notePreimageTx?.signAndSend(proposerAddress, ({ status, events }: any) => {
				if (status.isFinalized) {
					for (const { event } of events) {
						if (event.method === 'ExtrinsicSuccess') {
							setLoading(false);
							queueNotification({
								header: 'Success!',
								message: `Preimage #${proposal.hash} successful.`,
								status: NotificationStatus.SUCCESS
							});

							setPreimage(preimage);
							setPreimageHash(preimageHash);
							setPreimageLength(preimageLength);
							setPreimageCreated(true);
							onChangeLocalStorageSet({ createdPreimage: true }, Boolean(isPreimage), false, true);
							onChangeLocalStorageSet({ preimageHash: preimage.preimageHash }, Boolean(isPreimage));
							onChangeLocalStorageSet({ preimageLength: preimage.preimageLength }, Boolean(isPreimage));
							console.log(`Completed at block hash #${status.asInBlock.toString()}`);
							if(preimage) {
								setLoading(false);
								setSteps({ percent: 100, step: 2 });
							}

						} else if (event.method === 'ExtrinsicFailed') {
							queueNotification({
								header: 'failed!',
								message: 'Transaction failed!',
								status: NotificationStatus.ERROR
							});
							setLoading(false);

						}
					}
					console.log(`Preimage: completed at block hash #${status.toString()}`);
				} else {
					console.log(`Preimage: Current status: ${status.type}`);
				}
			})
				.catch((error) => {
					setLoading(false);
					console.log(':( transaction failed');
					console.error('ERROR:', error);
					queueNotification({
						header: 'Failed!',
						message: error.message,
						status: NotificationStatus.ERROR
					});
				});
		}
		catch(error){
			setLoading(false);
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		}
	};

	const handleSubmit = async() => {

		if(!isPreimage){if(txFee.gte(availableBalance)) return;}
		await form.validateFields();
		if(preimageCreated) {
			setSteps({ percent: 100, step: 2 });
		}
		else{
			!isPreimage ? await getPreimage() : (preimageLength !== 0 && beneficiaryAddress.length > 0 && fundingAmount.gt(ZERO_BN)) && setSteps({ percent: 100, step: 2 }) ;
			setEnactment({ ...enactment, value: enactment.key === EEnactment.At_Block_No ? advancedDetails?.atBlockNo : advancedDetails?.afterNoOfBlocks });
		}
	};

	const getExistPreimageDataFromPolkadot = async() => {
		if(!api || !apiReady) return;

		const lengthObj = await api.query.preimage.statusFor(preimageHash);
		!JSON.parse(JSON.stringify(lengthObj))?.unrequested?.len  ? setInvalidPreimage(true) : setInvalidPreimage(false) ;
		const length = JSON.parse(JSON.stringify(lengthObj))?.unrequested?.len || 0;
		setPreimageLength(length);
		form.setFieldValue('preimage_length', length);
		onChangeLocalStorageSet({ preimageLength: length || '' }, Boolean(isPreimage));

		const preimageRaw: any = await api.query.preimage.preimageFor([preimageHash, length ]);
		const preimage = preimageRaw.unwrapOr(null);

		const constructProposal = function(
			api: ApiPromise,
			bytes: Bytes
		): Proposal | undefined {
			let proposal: Proposal | undefined;

			try {
				proposal = api.registry.createType('Proposal', bytes.toU8a(true));
			} catch (error) {
				console.log(error);
			}

			return proposal;
		};

		try{
			const proposal = constructProposal(api, preimage);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { meta, method, section } = api.registry.findMetaCall(
				proposal?.callIndex as any
			);
			const params = proposal?.meta ? proposal?.meta.args
				.filter(({ type }): boolean => type.toString() !== 'Origin')
				.map(({ name }) => name.toString()) : [];

			const values = proposal?.args;

			const preImageArguments = proposal?.args && params && params.map((name, index) => {
				return {
					name,
					value: values?.[index]?.toString()
				};
			});
			if(preImageArguments){
				const balance = new BN(preImageArguments[0].value || '0') || ZERO_BN;
				setInvalidPreimage(false);
				setBeneficiaryAddress(preImageArguments[1].value || '');
				setFundingAmount(balance);
				onChangeLocalStorageSet({ fundingAmount: balance.toString() }, Boolean(isPreimage));
				onChangeLocalStorageSet({ beneficiaryAddress: preImageArguments[1].value || '' }, Boolean(isPreimage));
				setSteps({ percent: 100 ,step: 1 });
				for(const i in maxSpendArr){
					const [maxSpend] = inputToBn(String(maxSpendArr[i].maxSpend), network, false);
					if(maxSpend.gte(balance)){
						setSelectedTrack(maxSpendArr[i].track);
						onChangeLocalStorageSet({ selectedTrack: maxSpendArr[i].track }, Boolean(isPreimage));
						break;
					}
				}

			}else{
				setInvalidPreimage(true);
			}
		}catch(error){
			setInvalidPreimage(true);
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		}
	};

	const existPreimageData = async(preimageHash: string) => {
		setPreimageLength(0);
		if(!api || !apiReady || !isHex(preimageHash, 256) || preimageHash.length < 0) return;
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IPreimageData>(`api/v1/preimages/latest?hash=${preimageHash}`);
		if(data){
			if(data.hash === preimageHash){
				if(!data.proposedCall.args || !data?.proposedCall?.args?.beneficiary || !data?.proposedCall?.args?.amount){
					setInvalidPreimage(true);
				}else{
					form.setFieldValue('preimage_length', data.length);
					setBeneficiaryAddress(data?.proposedCall?.args?.beneficiary || '');
					const balance = new BN(data?.proposedCall?.args?.amount || '0') || ZERO_BN;
					setFundingAmount(balance);
					setInvalidPreimage(false);
					setPreimageLength(data.length);
					onChangeLocalStorageSet({ fundingAmount: balance.toString() }, Boolean(isPreimage));
					onChangeLocalStorageSet({ preimageLength: data.length || '' }, Boolean(isPreimage));
					onChangeLocalStorageSet({ beneficiaryAddress: data?.proposedCall?.args?.beneficiary || '' }, Boolean(isPreimage));
					setSteps({ percent: 100 ,step: 1 });
					for(const i in maxSpendArr){
						const [maxSpend] = inputToBn(String(maxSpendArr[i].maxSpend), network, false);
						if(maxSpend.gte(balance)){
							setSelectedTrack(maxSpendArr[i].track);
							onChangeLocalStorageSet({ selectedTrack: maxSpendArr[i].track }, Boolean(isPreimage));
							break;
						}
					}
				}}else{
				getExistPreimageDataFromPolkadot();
			}
		}
		else if(error){
			getExistPreimageDataFromPolkadot();
		}

		setLoading(false);
	};

	const handlePreimageHash = (preimageHash: string) => {
		setSteps({ percent: 60, step: 1 });
		existPreimageData(preimageHash);
		setPreimageHash(preimageHash);
		onChangeLocalStorageSet({ preimageHash: preimageHash }, Boolean(isPreimage));
	};

	const handleAdvanceDetailsChange = (key: EEnactment, value: string) => {
		if(!value || value.includes('-')) return;
		try{
			const bnValue = new BN(value || '0');
			if(!bnValue) return;
			switch (key){
			case EEnactment.At_Block_No:
				setAdvancedDetails({ afterNoOfBlocks: null, atBlockNo: bnValue });
				break;
			case EEnactment.After_No_Of_Blocks:
				setAdvancedDetails({ afterNoOfBlocks: bnValue, atBlockNo: null });
				break;
			}
			setEnactment({ ...enactment, value: bnValue });
			onChangeLocalStorageSet({ enactment: { ...enactment, value: bnValue } }, Boolean(isPreimage));
		}catch(error){
			console.log(error);
		}

	};

	const handleBeneficiaryAddresschange = (address: string) => {
		setBeneficiaryAddress(address);
		!isPreimage && onChangeLocalStorageSet({ beneficiaryAddress: beneficiaryAddress }, Boolean(isPreimage));
		(fundingAmount.gt(ZERO_BN) && address.length > 0 )? setSteps({ percent: 100, step: 1 }) : setSteps({ percent: 60, step: 1 });
		address && (getEncodedAddress(address, network) || Web3.utils.isAddress(address)) && address !== getEncodedAddress(address, network) && setAddressAlert(true);
		setTimeout(() => { setAddressAlert(false);}, 5000);
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

	const handleFundingAmountChange = (fundingAmount : BN) => {

		setFundingAmount(fundingAmount);
		(beneficiaryAddress.length > 0 && fundingAmount.gt(ZERO_BN)) ? setSteps({ percent: 100, step: 1 }) : setSteps({ percent: 60, step: 1 }) ;

		if(!isAutoSelectTrack || !fundingAmount || fundingAmount.eq(ZERO_BN)) return;
		for(const i in maxSpendArr){
			const [maxSpend] = inputToBn(String(maxSpendArr[i].maxSpend), network, false);
			if(maxSpend.gte(fundingAmount)){
				setSelectedTrack(maxSpendArr[i].track);
				onChangeLocalStorageSet({ selectedTrack: maxSpendArr[i].track }, Boolean(isPreimage));
				break;
			}
		}
	};

	return <Spin spinning={loading} indicator={<LoadingOutlined/>}>
		<div className={className}>
			<div className='my-8 flex flex-col'>
				<label className='text-lightBlue text-sm'>Do you have an existing preimage? </label>
				<Radio.Group onChange={(e) => {setIsPreimage(e.target.value); onChangeLocalStorageSet({ isPreimage: e.target.value }, e.target.value, true);setSteps({ percent: 20, step: 1 });}} size='small' className='mt-1.5' value={isPreimage}>
					<Radio value={true} className='text-bodyBlue text-sm font-normal'>Yes</Radio>
					<Radio value={false} className='text-bodyBlue text-sm font-normal'>No</Radio>
				</Radio.Group>
			</div>
			<Form
				form={form}
				disabled={loading}
				onFinish={handleSubmit}
				initialValues={{ address: beneficiaryAddress, after_blocks: String(advancedDetails.afterNoOfBlocks?.toString()), preimage_hash: preimageHash, preimage_length: preimageLength }}
				validateMessages= {
					{ required: "Please add the '${name}' " }
				}>
				{isPreimage && <>
					{invalidPreimage && <Alert type='info' className='text-body_blue text-sm font-normal mt-6 rounded-[4px]' showIcon message='Invalid preimage hash.'/>}
					<div className='mt-6'>

						<label className='text-lightBlue text-sm'>Preimage Hash <span><HelperTooltip text='this product is powered by kanishka rajput' className='ml-1'/></span></label>
						<Form.Item name='preimage_hash' rules={[{ required: true },
							{ message: 'Invalid preimage hash',
								validator(rule, value, callback) {
									if (callback && (!isHex(value, 256) || invalidPreimage) && value.length > 0 ){
										callback(rule?.message?.toString());
									}else {
										callback();
									}
								} }]}>
							<Input name='preimage_hash' className='h-[40px] rounded-[4px] ' value={preimageHash} onChange={(e) => handlePreimageHash(e.target.value)}/>
						</Form.Item>
					</div>
					<div className='mt-6'>
						<label className='text-lightBlue text-sm'>Preimage Length</label>
						<Form.Item name='preimage_length'>
							<Input name='preimage_length' className='h-[40px] rounded-[4px]' onChange={(e) => {setPreimageLength(Number(e.target.value)); onChangeLocalStorageSet({ preimageLength: e.target.value }, isPreimage);}} disabled/>
						</Form.Item>
					</div>
				</>
				}
				{ isPreimage === false && <>
					{ (txFee.gte(availableBalance) && !txFee.eq(ZERO_BN)) && <Alert type='info' className='mt-6 rounded-[4px] text-bodyBlue' showIcon message='Insufficient available balance.'/>}
					<div className='mt-6'>
						<div className='flex justify-between items-center mt-6 text-lightBlue'>
                Proposer Address<span>
								<Balance address={proposerAddress} onChange={handleOnAvailableBalanceChange}/>
							</span>
						</div>
						<div className=' px-2 rounded-[4px] h-[40px] cursor-not-allowed border-solid border-[1px] bg-[#F6F7F9] border-[#D2D8E0] flex items-center'>
							<Address address={proposerAddress} identiconSize={30} disableAddressClick addressClassName=' text-sm' displayInline textClassName='text-[#D2D8E0]' />
						</div>
					</div>
					<AddressInput
						defaultAddress={beneficiaryAddress}
						label={'Beneficiary Address'}
						placeholder='Add beneficiary address'
						className='text-lightBlue text-sm font-normal'
						onChange={(address) => handleBeneficiaryAddresschange(address)}
						helpText='Beneficiary Address'
						size='large'
						identiconSize={30}
						inputClassName={' font-normal text-sm h-[40px]'}
						skipFormatCheck={true}
						checkValidAddress= {setValidBeneficiaryAddress}
					/>
					{addressAlert && <Alert className='mb mt-2' showIcon message='The substrate address has been changed to Kusama address.'/> }
					<div  className='mt-6 -mb-6'>
						<div className='flex justify-between items-center text-lightBlue text-sm mb-[2px]'>
							<label>Funding Amount <span><HelperTooltip text='Funding Amount' className='ml-1'/></span></label>
							<span className='text-xs text-bodyBlue'>Current Value: {Number(inputAmountValue)*Number(currentTokenPrice.value)} USD</span>
						</div>
						<BalanceInput address={proposerAddress} placeholder='Add funding amount' setInputValue={(input: string) => {setInputAmountValue(input); onChangeLocalStorageSet({ fundingAmount: input }, Boolean(isPreimage)); }} formItemName='funding_amount' onChange= { handleFundingAmountChange }/>
					</div>
					<div className='mt-6'>
						<label className='text-lightBlue text-sm'>Select Track <span><HelperTooltip text='select a track' className='ml-1'/></span></label>
						<SelectTracks tracksArr={trackArr} onTrackChange={(track) => {setSelectedTrack(track); setIsAutoSelectTrack(false); onChangeLocalStorageSet({ selectedTrack: track }, isPreimage); setSteps({ percent: 100, step: 1 });}} selectedTrack={selectedTrack}/>
					</div>
				</>}
				{ isPreimage !== null  && <div className='mt-6 flex gap-2 items-center cursor-pointer' onClick={() => setOpenAdvanced(!openAdvanced)}>
					<span className='text-pink_primary text-sm font-medium'>Advanced Details</span>
					<DownArrow className='down-icon'/>
				</div>}
				{openAdvanced && <div className='mt-3 flex flex-col'>
					<label className='text-lightBlue text-sm'>Enactment <span><HelperTooltip text='select a track' className='ml-1'/></span></label>
					<Radio.Group className='mt-1 flex flex-col gap-2' value={enactment.key} onChange={(e) => setEnactment({ key: e.target.value, value: null })}>
						<Radio value={EEnactment.At_Block_No} className='text-bodyBlue text-sm font-normal'>
							<div className='flex items-center gap-2 h-[40px]'><span className='w-[150px]'>At Block Number<HelperTooltip className='ml-1' text='select a track'/></span>
								<span>
									{enactment.key === EEnactment.At_Block_No && <Form.Item name='at_block'
										rules={[
											{
												message:'Block number should be greater than current block',
												validator(rule, value, callback){
													const bnValue = new BN(Number(value) >= 0 ? value : '0') || ZERO_BN;

													if(callback && value.length > 0 && ((currentBlock && bnValue?.lt(currentBlock)) || (value.length && Number(value) <= 0) )){
														callback(rule.message?.toString());
													}else{
														callback();
													}
												} }
										]}>
										<Input  name='at_block' className='w-[100px] mt-5' onChange={(e) => handleAdvanceDetailsChange(EEnactment.At_Block_No, e.target.value)}/>
									</Form.Item>}
								</span>
							</div>
						</Radio>
						<Radio value={EEnactment.After_No_Of_Blocks} className='text-bodyBlue text-sm font-normal'>
							<div className='flex items-center gap-2 h-[30px]'><span className='w-[150px]'>After no. of Blocks<HelperTooltip text='select a track' className='ml-1'/></span>
								<span>{enactment.key === EEnactment.After_No_Of_Blocks && <Form.Item name='after_blocks'
									rules={[
										{
											message:'Invalid Blocks',
											validator(rule, value, callback){
												const bnValue =  new BN(Number(value) >= 0 ? value : '0') || ZERO_BN;
												if(callback &&  value.length > 0 && (bnValue?.lt(BN_ONE) ||  (value.length && Number(value) <= 0) )){
													callback(rule.message?.toString());
												}else{
													callback();
												}
											} }
									]}>
									<Input name='after_blocks' className='w-[100px] mt-5' onChange={(e) => handleAdvanceDetailsChange(EEnactment.At_Block_No, e.target.value)}/>
								</Form.Item>}
								</span>
							</div>
						</Radio>
					</Radio.Group>
				</div>}
				{(showAlert && !isPreimage) && <Alert type='info' className='mt-6 rounded-[4px] text-bodyBlue' showIcon message={`Gas Fees of this ${formatedBalance(String(txFee.toString()), unit)} ${chainProperties[network]?.tokenSymbol} will be applied to create preimage.`}/>}
				<div className='flex justify-end mt-6 -mx-6 border-0 border-solid border-t-[1px] border-[#D2D8E0] px-6 pt-4 gap-4'>
					<Button onClick={() => setSteps({ percent: 100, step: 0 }) } className='font-medium tracking-[0.05em] text-pink_primary border-pink_primary text-sm w-[155px] h-[38px] rounded-[4px]'>Back</Button>
					<Button htmlType='submit'
						className={`bg-pink_primary text-white font-medium tracking-[0.05em] text-sm w-[155px] h-[40px] rounded-[4px] ${((isPreimage !== null && !isPreimage) ? !((beneficiaryAddress && validBeneficiaryAddress) && fundingAmount && selectedTrack) : !(preimageHash )) && 'opacity-50' }`}
						disabled={isPreimage ? (!preimageHash && !beneficiaryAddress && fundingAmount.gt(ZERO_BN) && selectedTrack.length === 0 && preimageLength <= 0)  : !((beneficiaryAddress && validBeneficiaryAddress) && fundingAmount && selectedTrack)}>
						{isPreimage ? 'Link Preimage' : 'Create Preimage'}
					</Button>
				</div>
			</Form>
		</div>
	</Spin>;
};
export default styled(CreatePreimage)`
.down-icon{
	filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
}
`;