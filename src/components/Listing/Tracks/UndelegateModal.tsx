// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { LoadingOutlined } from '@ant-design/icons';

import { Button, Form, Modal, Slider, Spin } from 'antd';

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
import SuccessPopup from './SuccessPopup';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import UndelegateProfileIcon from '~assets/icons/undelegate-gray-profile.svg';

const ZERO_BN = new BN(0);

interface Props {
  trackNum: number;
  className?: string;
  defaultTarget: string;
  open: boolean;
  setOpen: (pre:boolean) => void;
  tracks: string[];
  conviction: number;
  account: InjectedAccount;
  defaultAddress: string;
}
const UndelegateModal = ({ trackNum, className, defaultTarget, open, tracks, setOpen, conviction,account, defaultAddress }: Props ) => {
	const { api, apiReady } = useContext(ApiContext);
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const [address, setAddress] = useState<string>(defaultAddress);
	const [target, setTarget] = useState<string>(defaultTarget);
	const [bnBalance, setBnBalance] = useState<BN>(ZERO_BN);
	const lock = (Number(2**(conviction - 2)));
	const [openSuccessPopup, setOpenSuccessPopup] = useState<boolean>(false);
	const accounts:InjectedAccount[] = [account];

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

	const handleOnBalanceChange = () => {
	};
	return (
		<>
			<Modal
				closeIcon={<CloseIcon className='mt-[10px]'/>}
				className={`${poppins.variable} ${poppins.className} padding ` }
				wrapClassName={className}
				title={
					<div className='flex items-center text-[#243A57] text-[20px] font-semibold mb-6'>
						<UndelegateProfileIcon className='mr-2'/>Undelegate
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
										Undelegate
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
							disabled={true}
						>
							<AccountSelectionForm
								isDisabled={true}
								title='Your Address'
								accounts={accounts}
								address={address}
								withBalance={false}
								className='text-[#485F7D] text-sm '
								onAccountChange={setAddress}
							/>

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
										disabled={true}
										className='text-[12px] mt-[9px]'
										trackStyle={{ backgroundColor:'#FF49AA' }}
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
							<div className='mt-6'>
								<label className='text-[#485F7D] text-sm tracking-[0.0025em] mb-[2px]'>Selected tracks</label>
							</div>
						</Form>

					</div>
				</Spin>

				<SuccessPopup open={openSuccessPopup} setOpen={setOpenSuccessPopup} tracks={tracks} address={target} isDelegate={true} balance={bnBalance} />
			</Modal>
		</>
	);
};

export default styled(UndelegateModal)`

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