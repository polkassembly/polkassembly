// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { LoadingOutlined } from '@ant-design/icons';

import { Alert, Button, Form, Modal, Slider, Spin } from 'antd';

import BN from 'bn.js';
import { poppins } from 'pages/_app';
import React, { useContext, useEffect, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import { NotificationStatus } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import AddressInput from 'src/ui-components/AddressInput';
import BalanceInput from 'src/ui-components/BalanceInput';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

import LockIcon from '~assets/icons/lock.svg';
import CloseIcon from '~assets/icons/close.svg';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import UndelegateProfileIcon from '~assets/icons/undelegate-gray-profile.svg';
import { useNetworkContext, useUserDetailsContext } from '~src/context';
import { useRouter } from 'next/router';
import { handleTrack } from '~src/components/DelegationDashboard/DashboardTrack';
import { BN_ZERO } from '@polkadot/util';
import DelegationSuccessPopup from './DelegationSuccessPopup';
import getEncodedAddress from '~src/util/getEncodedAddress';
import formatBnBalance from '~src/util/formatBnBalance';

const ZERO_BN = new BN(0);

interface Props {
  trackNum: number;
  className?: string;
  defaultTarget: string;
  open: boolean;
  setOpen: (pre:boolean) => void;
  conviction: number;
  balance : BN;
  setIsRefresh: (pre: boolean) => void;
}
const UndelegateModal = ({ trackNum, className, defaultTarget, open, setOpen, conviction, balance, setIsRefresh }: Props ) => {

	const { api, apiReady } = useContext(ApiContext);
	const { network } = useNetworkContext();
	const router = useRouter();
	const trackName = handleTrack(String(router.query.track));
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const { delegationDashboardAddress : defaultAddress } = useUserDetailsContext();
	const [address, setAddress] = useState<string>(defaultAddress);
	const [target, setTarget] = useState<string>(defaultTarget);
	const [bnBalance, setBnBalance] = useState<BN>(balance ? balance : BN_ZERO);
	const lock = (Number(2**(conviction-1)));
	const [openSuccessPopup, setOpenSuccessPopup] = useState<boolean>(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [txFee, setTxFee] = useState(ZERO_BN);
	const [showAlert, setShowAlert] = useState(false);

	useEffect(() => {

		if(!defaultAddress || !target || !getEncodedAddress(target, network) || !trackNum || isNaN(conviction) ||
			!api || !apiReady || !bnBalance || bnBalance.lte(ZERO_BN)) return;

		setLoading(true);

		const txArr =  api.tx.convictionVoting.undelegate(trackNum);

		(async () => {
			const info = await txArr.paymentInfo(defaultAddress);
			setTxFee(new BN(info.partialFee.toString() || 0));
			setLoading(false);
			setShowAlert(true);
		})();
	}, [defaultAddress, api, apiReady, bnBalance, trackNum, conviction, network, target]);

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	const handleSubmit = async () => {

		setLoading(true);

		if (!api || !apiReady) {
			return;
		}

		// TODO: check .toNumber()
		const delegateTxn = api.tx.convictionVoting.undelegate(trackNum);

		delegateTxn.signAndSend(address, ({ status, events }: any) => {
			if (status.isFinalized) {
				for (const { event } of events) {
					if (event.method === 'ExtrinsicSuccess') {
						queueNotification({
							header: 'Success!',
							message: 'Undelegate successful.',
							status: NotificationStatus.SUCCESS
						});

						setIsRefresh(true);
						setLoading(false);
						setOpenSuccessPopup(true);
						setOpen(false);

					} else if (event.method === 'ExtrinsicFailed') {
						const errorModule = (event.data as any)?.dispatchError?.asModule;
						let message = 'Undelegate failed.';

						if(errorModule) {
							const { method, section, docs } = api.registry.findMetaError(errorModule);
							message = `${section}.${method} : ${docs.join(' ')}`;
						}

						queueNotification({
							header: 'Undelegate failed!',
							message,
							status: NotificationStatus.ERROR
						});
						// TODO: error state popup
					}
				}

				setLoading(false);

				console.log(`Undelegate: completed at block hash #${status.toString()}`);
			} else {
				console.log(`Undelegate: Current status: ${status.type}`);
			}
		}).catch((error: any) => {
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			queueNotification({
				header: 'Undelegate failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
			setLoading(false);

		});
	};

	const handleOnBalanceChange = () => {
	};
	return (
		<>
			<Modal
				closeIcon={<CloseIcon />}
				className={`${poppins.variable} ${poppins.className} padding w-[600px] ` }
				wrapClassName={className}
				title={
					<div className='flex items-center text-[#243A57] text-[20px] font-semibold mb-6 '>
						<UndelegateProfileIcon className='mr-2'/>Undelegate
					</div>
				}

				open={open}
				onOk={handleSubmit}
				confirmLoading={loading}
				onCancel={() => setOpen(false)}
				footer={
					<div className='flex items-center justify-end mt-6'>
						{
							[
								<Button key="back" disabled={loading} className='h-[40px] w-[134px]' onClick={() => setOpen(false)}>
										Cancel
								</Button>,
								<Button htmlType='submit' key="submit" className='w-[134px] bg-pink_primary text-white hover:bg-pink_secondary h-[40px] '  disabled={loading} onClick={ handleSubmit }>
										Undelegate
								</Button>
							]
						}
					</div>
				}
			>

				<Spin spinning={loading} indicator={<LoadingOutlined />} >
					<div className='flex flex-col border-0'>
						{showAlert && <Alert showIcon type='info' className='mb-6 text-[14px] bg-[#4E75FF] ' message={`Fees of ${formatBnBalance(txFee,{ numberAfterComma: 2,withUnit:true },network)} will be applied to the transaction`}/>}
						<Form
							form={form}
							disabled={true}
						>
							<AccountSelectionForm
								isDisabled={true}
								title='Your Address'
								accounts={accounts}
								address={address}
								withBalance={false}
								className='text-[#788698] text-sm'
								onAccountChange={setAddress}
								inputClassName='text-[#ccd1d9] border-[1px] border-[#D2D8E0] border-solid px-3 rounded-[6px] bg-[#F6F7F9] py-[6px]'
							/>

							<AddressInput
								defaultAddress={target}
								label={'Delegate to'}
								placeholder='Delegate Account Address'
								className='text-[#788698] text-sm '
								onChange={(address) => setTarget(address)}
								size='large'
								inputClassName='text-[#ccd1d9]  bg-[#F6F7F9]'
							/>
							<BalanceInput
								label={'Balance'}
								placeholder={'Enter balance'}
								className='mt-6 text-[#788698]'
								address={address}
								withBalance={false}
								onAccountBalanceChange={handleOnBalanceChange}
								onChange={(balance) => setBnBalance(balance)}
								size='large'
								balance={bnBalance}
								inputClassName='text-[#ccd1d9] bg-[#F6F7F9] rounded-[4px]'
							/>

							<div className='mb-2 border-solid border-white'>
								<label  className='text-[#788698] flex items-center text-sm'>Conviction</label>

								<div className='px-[2px]'>
									<Slider
										disabled={true}
										className='text-[12px] mt-[9px]'
										trackStyle={{ backgroundColor:'#FF49AA' }}
										step={7}
										marks={{
											1:{ label:<div>0.1x</div>, style: { color: '#adacb5', fontSize:'12px', marginTop:'16px' } },
											2:{ label:<div>1x</div>, style: { color: '#adacb5', fontSize:'12px', marginTop:'16px' } },
											3:{ label:<div>2x</div> , style: { color: '#adacb5', fontSize:'12px', marginTop:'16px' } },
											4:{ label:<div>3x</div>, style: { color: '#adacb5', fontSize:'12px', marginTop:'16px' } },
											5:{ label:<div>4x</div>, style: { color: '#adacb5', fontSize:'12px', marginTop:'16px' } },
											6:{ label:<div>5x</div>, style: { color: '#adacb5', fontSize:'12px', marginTop:'16px' } },
											7:{ label:<div>6x</div>, style: { color: '#adacb5', fontSize:'12px',marginTop:'16px' } }  }}
										min={1}
										max={7}
										defaultValue={conviction+1}
									/></div>
							</div>
							<div className='bg-[#F6F7F9] py-[13px] px-[17px] rounded-md flex items-center justify-between track-[0.0025em] mt-4'>
								<div className='flex gap-[10px] items-center justify-center text-[#b8c2ce] text-sm'> <LockIcon/><span>Locking period</span></div>
								<div className='text-[#8894a4] font-medium text-sm flex justify-center items-center' >
									{conviction === 0 ? '0.1x voting balance, no lockup period' :`${conviction}x voting balance, locked for ${lock} enachment period`}
								</div>
							</div>
							<div className='mt-6 flex justify-start items-center gap-2 mb-6'>
								<label className='text-[#485F7D] text-sm tracking-[0.0025em] mb-[2px]'>Track:</label>
								<span className='text-[#243A57] text-sm tracking-medium'>{trackName} #{trackNum}</span>
							</div>
						</Form>

					</div>
				</Spin>
			</Modal>
			<DelegationSuccessPopup open={openSuccessPopup} setOpen={setOpenSuccessPopup} balance={bnBalance} setIsRefresh={setIsRefresh}/>
		</>
	);
};

export default styled(UndelegateModal)`
.padding  .ant-modal-close{
  margin-top: 4px;
}
.padding .ant-alert-message{
color:white;
font-size:14px;
  font-weight: 400;
}
.padding .ant-alert-info .ant-alert-icon{
  color:white;
    font-weight: 400;
}
.padding  .ant-modal-close:hover{
  margin-top: 4px;
}
.padding .ant-slider-dot{
  margin-top:-1px;
  height:12px;
  width:2px;
  border-radius:0px !important;
  border-color:#EDEFF3;
}
.padding .ant-slider-dot-active{
  border-color:#b97b9c !important;
  width:2px;
  height:12px;  
  border-radius:0px !important;
  margin-top:-1px;
}

.padding .ant-tooltip-open{
 border-color:#485F7D !important;
}
.padding .ant-slider-handle{
  border:1px solid  ;
}
.padding .ant-slider .ant-slider-rail{
  background-color: #EDEFF3;
  height: 5px;
}
.padding .ant-slider .ant-slider-track{
height: 5px;
 background-color: #b97b9c !important;

}
 .padding .ant-slider .ant-slider-handle::after{
height:25px;
margin-top:-7px;
background:#F285BF;
width:18px;
border-radius:8px !important;
border:none !important;
margin-left:-4px;
  box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
 }
  .padding .ant-slider .ant-slider-handle::before{

border-radius:8px !important;
border:none !important;
  box-shadow: 0px 4px 6px rgba(157, 12, 89, 0.4) !important;
 }
 `;