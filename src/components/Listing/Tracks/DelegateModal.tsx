// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { LoadingOutlined } from '@ant-design/icons';

import { Button, Checkbox, Form, Modal, Popover, Slider, Spin } from 'antd';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import BN from 'bn.js';
import { poppins } from 'pages/_app';
import React, { useContext, useEffect, useState } from 'react';
import ExtensionNotDetected from 'src/components/ExtensionNotDetected';
import { ApiContext } from 'src/context/ApiContext';
import { NotificationStatus, Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import AddressInput from 'src/ui-components/AddressInput';
import BalanceInput from 'src/ui-components/BalanceInput';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import queueNotification from 'src/ui-components/QueueNotification';
import { inputToBn } from 'src/util/inputToBn';
import styled from 'styled-components';

import { NetworkContext } from '~src/context/NetworkContext';
import LockIcon from '~assets/icons/lock.svg';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import DelegateProfileIcon from '~assets/icons/delegate-popup-profile.svg';
import CloseIcon from '~assets/icons/close.svg';
import SuccessPopup from './SuccessPopup';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { APPNAME } from '~src/global/appName';
import getEncodedAddress from '~src/util/getEncodedAddress';
import WalletButton from '~src/components/WalletButton';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import { useUserDetailsContext } from '~src/context';
import FilteredError from '~src/ui-components/FilteredError';

const ZERO_BN = new BN(0);

interface Props {
  trackNum: number;
  className?: string;
  defaultTarget: string;
  open: boolean;
  setOpen: (pre:boolean) => void;
}

const DelegateModal = ({ trackNum, className, defaultTarget, open, setOpen }: Props ) => {
	const { api, apiReady } = useContext(ApiContext);
	const { loginWallet } = useUserDetailsContext();
	const { network } = useContext(NetworkContext);
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [target, setTarget] = useState<string>('');
	const [bnBalance, setBnBalance] = useState<BN>(ZERO_BN);
	const [conviction, setConviction] = useState<number>(0);
	const [lock ,setLockValue] = useState<number>(0);
	const [errorArr, setErrorArr] = useState<string[]>([]);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);
	const trackArr: string[] = [];
	const [checkedList, setCheckedList] = useState<CheckboxValueType[]>([]);
	const [indeterminate, setIndeterminate] = useState(true);
	const [checkAll, setCheckAll] = useState(false);
	const [openSuccessPopup, setOpenSuccessPopup] = useState<boolean>(false);
	const [wallet,setWallet]=useState<Wallet>();

	if(network){ Object.entries(networkTrackInfo?.[network]).map(([key, value]) => {
		if (!value?.fellowshipOrigin) {
			trackArr.push(String(key));
		}
	});}

	const onChange = (list: CheckboxValueType[]) => {
		setCheckedList(list);
		setIndeterminate(!!list.length && list.length < trackArr.length);
		setCheckAll(list.length === trackArr.length);
	};
	const onCheckAllChange = (e: CheckboxChangeEvent) => {
		setCheckedList(e.target.checked ? trackArr : []);
		setIndeterminate(false);
		setCheckAll(e.target.checked);
	};

	const content = (<div className='flex flex-col'>
		<Checkbox.Group className='flex flex-col h-[200px] overflow-y-scroll' onChange={onChange} value={checkedList} >
			{trackArr?.map((track, index) => (
				<div
					className={`${poppins.variable} ${poppins.className} text-sm tracking-[0.01em] text-[#243A57] flex gap-[13px] p-[8px]`}
					key={index}
				>
					<Checkbox className='text-pink_primary' value={track}/>
					{track === 'root' ? 'Root': track?.split(/(?=[A-Z])/).join(' ')}
				</div>
			))}
		</Checkbox.Group>
	</div>);
	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	const validateForm = ():boolean => {
		const errors = [];

		if(!address) {
			errors.push('Please select an address.');
		}

		if(!target) {
			errors.push('Please provide a valid target address.');
		}

		if(address == target) {
			errors.push('Please provide a different target address.');
		}

		if(bnBalance.lte(ZERO_BN)) {
			errors.push('Please provide a valid balance.');
		}

		if(availableBalance.lt(bnBalance)) {
			errors.push('Insufficient balance.');
		}

		setErrorArr(errors);

		return errors.length === 0;
	};

	const handleSubmit = async () => {

		setLoading(true);

		if(!validateForm()){
			setLoading(false);
			return;
		}

		if (!api || !apiReady) {
			return;
		}

		// TODO: check .toNumber()
		const delegateTxn = api.tx.convictionVoting.delegate(trackNum, target, conviction, bnBalance.toNumber());

		delegateTxn.signAndSend(address, ({ status }: any) => {
			if (status.isInBlock) {
				queueNotification({
					header: 'Success!',
					message: 'Delegation successful.',
					status: NotificationStatus.SUCCESS
				});
				setLoading(false);
				console.log(`Delegation: completed at block hash #${status.asInBlock.toString()}`);
			} else {
				console.log(`Delegation: Current status: ${status.type}`);
			}
			setOpen(false);
			setOpenSuccessPopup(true);
		}).catch((error: any) => {
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			queueNotification({
				header: 'Delegation failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		});
	};

	const handleOnBalanceChange = (balanceStr: string) => {
		const [balance, isValid] = inputToBn(balanceStr, network, false);
		isValid ? setAvailableBalance(balance) : setAvailableBalance(ZERO_BN);
	};
	return (
		<>
			<Modal
				closeIcon={<CloseIcon className='mt-[10px]'/>}
				className={`${poppins.variable} ${poppins.className} padding ` }
				wrapClassName={className}
				title={
					<div className='flex items-center text-[#243A57] text-[20px] font-semibold mb-6'>
						<DelegateProfileIcon className='mr-2'/>Delegate
					</div>
				}

				open={open}
				onOk={handleSubmit}
				confirmLoading={loading}
				onCancel={() => setOpen(false)}
				footer={
					<div className='flex items-center justify-end'>
						{
							[
								<Button key="back" disabled={loading} className='h-[40px] w-[134px]' onClick={() => setOpen(false)}>
										Cancel
								</Button>,
								<Button htmlType='submit' key="submit" className='w-[134px] bg-pink_primary text-white hover:bg-pink_secondary h-[40px] '  disabled={loading} onClick={ handleSubmit }>
										Delegate
								</Button>
							]
						}
					</div>
				}
			>

				<Spin spinning={loading} indicator={<LoadingOutlined />}>
					<div className='flex flex-col'>

						<Form
							form={form}
							disabled={loading}
						>
							{accounts.length> 0
								?<AccountSelectionForm
									title='Your Address'
									accounts={accounts}
									address={address}
									withBalance={false}
									onAccountChange={(address) => setAddress(address)}
									onBalanceChange={handleOnBalanceChange}
									className='text-[#485F7D] text-sm'
								/>: !wallet? <FilteredError text='Please select a wallet.' />: null}
							<AddressInput
								defaultAddress={defaultTarget}
								label={'Delegate to'}
								placeholder='Delegate Account Address'
								className='text-[#485F7D] text-sm '
								onChange={(address) => setTarget(address)}
								size='large'
							/>
							<BalanceInput
								label={'Balance'}
								placeholder={'Enter balance'}
								className='mt-6'
								address={address}
								withBalance={true}
								onAccountBalanceChange={handleOnBalanceChange}
								onChange={(balance) => setBnBalance(balance)}
								size='large'
							/>

							<div className='mb-2 border-solid border-white'>
								<label  className='text-[#485F7D] flex items-center text-sm'>Conviction</label>

								<div className='px-[2px]'>
									<Slider
										className='text-[12px] mt-[9px]'
										trackStyle={{ backgroundColor:'#FF49AA' }}
										onChange={(value:number) => {
											if(value === 1){
												setConviction(0);
											}
											else if(value === 2){
												setConviction(1);
												setLockValue(1);
											}else{
												setConviction(Number(value-1));
												setLockValue(Number(2**(value - 2)));
											}} }
										step={7}
										marks={{
											1:{ label:<div>0.1x</div>, style: { color: '#243A57', fontSize:'14px', marginTop:'16px' } },
											2:{ label:<div>1x</div>, style: { color: '#243A57', fontSize:'14px', marginTop:'16px' } },
											3:{ label:<div>2x</div> , style: { color: '#243A57', fontSize:'14px', marginTop:'16px' } },
											4:{ label:<div>3x</div>, style: { color: '#243A57', fontSize:'14px', marginTop:'16px' } },
											5:{ label:<div>4x</div>, style: { color: '#243A57', fontSize:'14px', marginTop:'16px' } },
											6:{ label:<div>5x</div>, style: { color: '#243A57', fontSize:'14px', marginTop:'16px' } },
											7:{ label:<div>6x</div>, style: { color: '#243A57', fontSize:'14px',marginTop:'16px' } }  }}
										min={1}
										max={7}
										defaultValue={1}
									/></div>
							</div>
							<div className='bg-[#F6F7F9] py-[13px] px-[17px] rounded-md flex items-center justify-between track-[0.0025em] mt-4'>
								<div className='flex gap-[10px] items-center justify-center text-[#485F7D] text-sm'> <LockIcon/><span>Locking period</span></div>
								<div className='text-[#243A57] font-medium text-sm flex justify-center items-center' >
									{conviction === 0 ? '0.1x voting balance, no lockup period' :`${conviction}x enactment period ${lock} days`}
								</div>
							</div>
							<Popover
								content={content}
								placement='topLeft'
								className='mt-6 mb-6  border-solid border-[1px] border-[#D2D8E0] py-[11px] px-4 rounded-[20px]'>
								<Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>Delegate for all tracks</Checkbox>
							</Popover>
						</Form>

					</div>
				</Spin>

				<SuccessPopup open={openSuccessPopup} setOpen={setOpenSuccessPopup} tracks={checkedList} address={target} isDelegate={true} balance={bnBalance} />
			</Modal>
		</>
	);
};

export default styled(DelegateModal)`

.padding .ant-slider-dot{
 border-color:#243A5799 !important;
  height:12px;
  width:12px;
}
.padding .ant-slider-dot-active{
  border-color:#E5007A !important;
  width:12px;
  height:12px;
  
}
.padding .ant-tooltip-open{
 border-color:#485F7D !important;
}
.padding .ant-slider-handle{
  border:1px solid  ;
}
.padding .ant-slider .ant-slider-rail{
  background-color: #D2D8E0;
  height: 7px;
}
.padding .ant-slider .ant-slider-track{
height: 7px;
 background-color: #E5007A !important;
}
.padding .ant-slider .ant-slider-handle:focus::after {
 }
 .padding .ant-slider .ant-slider-handle::after{
height:25px;
margin-top:-7px;
background:#E5007A;
width:18px;
border-radius:8px !important;
border:none !important;
margin-left:-2px;
  box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
 }
  .padding .ant-slider .ant-slider-handle::before{

border-radius:8px !important;
border:none !important;
  box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
 }
 `;