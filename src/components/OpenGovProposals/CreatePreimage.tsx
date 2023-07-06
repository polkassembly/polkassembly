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
// import { Proposal } from '@polkadot/types/interfaces';
import { ApiPromise } from '@polkadot/api';
import Balance from '../Balance';
// import { Bytes } from '@polkadot/types';

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

const CreatePreimage = ({ className, isPreimage, setIsPreimage, setSteps, preimageLength, setPreimageLength, preimageHash, setPreimageHash, fundingAmount, setFundingAmount, selectedTrack, setSelectedTrack, proposerAddress, beneficiaryAddress, setBeneficiaryAddress, enactment, setEnactment, preimage, setPreimage, form }:Props) => {

	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [clicked, setClicked] = useState<boolean>(false);
	const [addressAlert, setAddressAlert] = useState<boolean>(false);
	const [openAdvanced, setOpenAdvanced] = useState<boolean>(false);
	const [validBeneficiaryAddress, setValidBeneficiaryAddress] = useState<boolean>(false);
	const [inputAmountValue, setInputAmountValue] = useState<string>('0');
	const [txFee, setTxFee] = useState(ZERO_BN);
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [invalidPreimage, setInvalidPreimage] = useState<boolean>(false);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const [currentTokenPrice, setCurrentTokenPrice] = useState({
		isLoading: true,
		value: ''
	});
	const [loading, setLoading] = useState<boolean>(false);
	const currentBlock = useCurrentBlock();
	const [advancedDetails, setAdvancedDetails] = useState<IAdvancedDetails>({ afterNoOfBlocks: BN_HUNDRED, atBlockNo: BN_ONE });

	const trackArr: string[] = [];

	if(network){
		Object.entries(networkTrackInfo?.[network]).forEach(([key, value]) => {
			if(value.group === 'Treasury'){
				trackArr.push(key);
			}
		});
	}

	useEffect(() => {

		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {

		setAdvancedDetails({ ...advancedDetails, atBlockNo: currentBlock?.add(BN_THOUSAND) || BN_ONE });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	},[currentBlock, isPreimage]);

	useEffect(() => {
		beneficiaryAddress && (getEncodedAddress(beneficiaryAddress, network) || Web3.utils.isAddress(beneficiaryAddress)) && beneficiaryAddress !== getEncodedAddress(beneficiaryAddress, network) && setAddressAlert(true);
		setTimeout(() => { setAddressAlert(false);}, 5000);
	}, [network, beneficiaryAddress]);

	useEffect(() => {
		setShowAlert(false);
		form.validateFields();

		if(!proposerAddress || !beneficiaryAddress || !getEncodedAddress(beneficiaryAddress, network) ||
		!api || !apiReady || !fundingAmount || fundingAmount.lte(ZERO_BN) || fundingAmount.eq(ZERO_BN) || fundingAmount.gte(availableBalance)) return;
		if(!selectedTrack) return;

		setLoading(true);
		const tx = api.tx.treasury.spend(fundingAmount.toString(), beneficiaryAddress);

		(async () => {
			const info = await tx.paymentInfo(proposerAddress);
			setTxFee(new BN(info.partialFee.toString() || 0));
			setLoading(false);
			setShowAlert(true);
		})();
	}, [form, proposerAddress, beneficiaryAddress, fundingAmount, api, apiReady, network, selectedTrack, availableBalance]);

	const getState = (api: ApiPromise, proposal?: SubmittableExtrinsic<'promise'>): IPreimage => {
		let preimageHash = EMPTY_HASH;
		let encodedProposal: HexString | null = null;
		let preimageLength = 0;
		let notePreimageTx: SubmittableExtrinsic<'promise'> | null = null;
		let storageFee = ZERO_BN;

		if (proposal) {
			encodedProposal = proposal.method.toHex();
			preimageLength = Math.ceil((encodedProposal.length - 2) / 2);
			preimageHash = blake2AsHex(encodedProposal);
			notePreimageTx = api.tx.preimage.notePreimage(encodedProposal);

			// we currently don't have a constant exposed, however match to Substrate
			storageFee = ((api.consts.preimage?.baseDeposit || ZERO_BN) as unknown as BN).add(
				((api.consts.preimage?.byteDeposit || ZERO_BN) as unknown as BN).muln(preimageLength)
			);
		}

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
console.log(proposerWallet);
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
			setLoading(true);
			proposal.signAndSend(proposerAddress, ({ status, events }: any) => {
				if (status.isFinalized) {
					for (const { event } of events) {
						if (event.method === 'ExtrinsicSuccess') {
							queueNotification({
								header: 'Success!',
								message: `Preimage #${proposal.hash} successful.`,
								status: NotificationStatus.SUCCESS
							});

							const preimage = getState(api, proposal);
							setPreimage(preimage);
							setPreimageHash(preimage.preimageHash);
							setPreimageLength(preimage.preimageLength);
							console.log(`Completed at block hash #${status.asInBlock.toString()}`);
							setLoading(false);

						} else if (event.method === 'ExtrinsicFailed') {
							queueNotification({
								header: 'failed!',
								message: 'Transaction failed!',
								status: NotificationStatus.ERROR
							});
							setLoading(false);

						}
					}
					console.log(`Delegation: completed at block hash #${status.toString()}`);
				} else {
					console.log(`Delegation: Current status: ${status.type}`);
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
		if(fundingAmount.gte(availableBalance)) return;
		await form.validateFields();
		!isPreimage ? await getPreimage() : preimageLength !== 0 && setSteps({ percent: 0, step: 2 }) ;
		setEnactment({ ...enactment, value: enactment.key === EEnactment.At_Block_No ? advancedDetails?.atBlockNo : advancedDetails?.afterNoOfBlocks });
		if(preimage) {
			setLoading(false);
			setSteps({ percent: 0, step: 2 });
		}
	};
	const onBalanceChange = (balance: BN) => setFundingAmount(balance);

	useEffect(() => {

		if(clicked || (isPreimage === null)) return;

		if(isPreimage !== null ){
			setSteps({ percent: 50, step: 1 });
		}
		if(isPreimage && preimageHash && preimageLength !== 0){
			setSteps({ percent: 100, step: 1 });
		}
		if(!isPreimage && beneficiaryAddress && fundingAmount && selectedTrack){
			setSteps({ percent: 100, step: 1 });
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPreimage, preimageHash, preimageLength]);

	async function getPreimageLengthAndAmount() {
		setPreimageLength(0);
		if(!api || !apiReady || !isHex(preimageHash, 256) || preimageHash.length < 0) return;
		setLoading(true);
		const lengthObj =await api.query.preimage.statusFor(preimageHash);
		!JSON.parse(JSON.stringify(lengthObj))?.unrequested?.len  ? setInvalidPreimage(true) : setInvalidPreimage(false) ;
		const length = JSON.parse(JSON.stringify(lengthObj))?.unrequested?.len || 0;
		setPreimageLength(length);

		// const preimageRaw: any = await api.query.preimage.preimageFor([preimageHash, length ]);
		// const preimage = preimageRaw.unwrapOr(null);

		// const constructProposal = function(
		// api: ApiPromise,
		// bytes: Bytes
		// ): Proposal | undefined {
		// let proposal: Proposal | undefined;

		// try {
		// proposal = api.registry.createType('Proposal', bytes.toU8a(true));
		// } catch (error) {
		// console.log(error);
		// }

		// return proposal;
		// };
		// const proposal = constructProposal(api, preimage);
		// const { meta, method, section } = api.registry.findMetaCall(
		// proposal?.callIndex
		// );
		// const params = proposal.meta ? proposal?.meta.args
		// .filter(({ type }): boolean => type.toString() !== 'Origin')
		// .map(({ name }) => name.toString()) : [];

		// const values = proposal?.args;

		// const preImageArguments = proposal?.args &&
		//       params &&
		//       params.map((name, index) => {
		//       return {
		//       name,
		//       value: values[index].toString()
		//       };
		//       });
		setLoading(false);
	}
	useEffect(() => {

		if(isPreimage && preimageHash){
			getPreimageLengthAndAmount();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[preimageHash, isPreimage]);

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
		}catch(error){
			console.log(error);
		}

	};

	const handleOnBalanceChange = (balanceStr: string) => {
		let balance = ZERO_BN;

		try{
			balance = new BN(balanceStr);
		}
		catch(err){
			console.log(err);
		}

		setAvailableBalance(balance);
	};
	return <Spin spinning={loading} indicator={<LoadingOutlined/>}>
		<div className={className}>
			<div className='my-8 flex flex-col'>
				<label className='text-lightBlue text-sm'>Do you have an existing preimage? </label>
				<Radio.Group onChange={(e) => {setIsPreimage(e.target.value);}} size='small' className='mt-1.5' value={isPreimage}>
					<Radio value={true} className='text-bodyBlue text-sm font-normal'>Yes</Radio>
					<Radio value={false} className='text-bodyBlue text-sm font-normal'>No</Radio>
				</Radio.Group>
			</div>
			<Form
				form={form}
				disabled={loading}
				onFinish={handleSubmit}
				initialValues={{ address: beneficiaryAddress, after_blocks: String(advancedDetails.afterNoOfBlocks?.toString()) , preimage_hash: preimageHash }}
				validateMessages= {
					{ required: "Please add the '${name}' " }
				}>
				{isPreimage && <>
					{invalidPreimage && <Alert type='info' className='text-body_blue text-sm font-normal mt-6 rounded-[4px]' showIcon message='Length not found for this preimage.'/>}
					<div className='mt-6'>

						<label className='text-lightBlue text-sm'>Preimage Hash <span><HelperTooltip text='this product is powered by kanishka rajput' className='ml-1'/></span></label>
						<Form.Item name='preimage hash' rules={[{ required: true },
							{ message: 'Invalid preimage hash',
								validator(rule, value, callback) {
									if (callback && !isHex(value, 256) && value.length > 0 ){
										callback(rule?.message?.toString());
									}else {
										callback();
									}
								} }]}>
							<Input name='Preimage hash' className='h-[40px] rounded-[4px] ' value={preimageHash} onChange={(e) =>  setPreimageHash(e.target.value)}/>
						</Form.Item>
					</div>
					<div className='mt-6'>
						<label className='text-lightBlue text-sm'>Preimage Length</label>
						<Input name='preimage length' className='h-[40px] rounded-[4px] ' value={preimageLength} onChange={(e) =>  setPreimageLength(Number(e.target.value))} disabled/>
					</div>
				</>
				}
				{ isPreimage === false && <>
					{ fundingAmount.gte(availableBalance) && <Alert type='info' className='mt-6 rounded-[4px] text-bodyBlue' showIcon message='Insufficient available balance.'/>}
					<div className='mt-6'>
						<div className='flex justify-between items-center mt-6 cursor-pointer text-lightBlue'>
                Proposer Address<span onClick={() => {
								setFundingAmount(availableBalance);
								form.setFieldValue('funding_amount', Number(formatedBalance(availableBalance.toString(), unit)));
							}}>
								<Balance address={proposerAddress} onChange={handleOnBalanceChange}/>
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
						onChange={(address) => setBeneficiaryAddress(address)}
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
						<BalanceInput address={proposerAddress} onBalanceChange={(balance:BN) => setAvailableBalance(balance)} placeholder='Add funding amount' setInputValue={setInputAmountValue} formItemName='funding_amount' balance={fundingAmount} onChange= { onBalanceChange }/>
					</div>
					<div className='mt-6'>
						<label className='text-lightBlue text-sm'>Select Track <span><HelperTooltip text='select a track' className='ml-1'/></span></label>
						<SelectTracks tracksArr={trackArr} onTrackChange={(track) => setSelectedTrack(track)} selectedTrack={selectedTrack}/>
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
					<Button onClick={() => {setClicked(true); setSteps({ percent: 100, step: 0 });} } className='font-medium tracking-[0.05em] text-pink_primary border-pink_primary text-sm w-[155px] h-[38px] rounded-[4px]'>Back</Button>
					<Button htmlType='submit' loading={loading}
						className={`bg-pink_primary text-white font-medium tracking-[0.05em] text-sm w-[155px] h-[40px] rounded-[4px] ${((isPreimage !== null && !isPreimage) ? !((beneficiaryAddress && validBeneficiaryAddress) && fundingAmount && selectedTrack) : !(preimageHash )) && 'opacity-50' }`}
						disabled={isPreimage ? !preimageHash  : !((beneficiaryAddress && validBeneficiaryAddress) && fundingAmount && selectedTrack)}>
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