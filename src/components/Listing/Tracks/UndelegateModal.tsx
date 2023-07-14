// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { LoadingOutlined } from '@ant-design/icons';

import { Alert, Button, Form, Modal, Spin } from 'antd';

import BN from 'bn.js';
import { poppins } from 'pages/_app';
import React, { useContext, useEffect, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

import CloseIcon from '~assets/icons/close.svg';
import UndelegateProfileIcon from '~assets/icons/undelegate-gray-profile.svg';
import { useNetworkContext, useUserDetailsContext } from '~src/context';
import { useRouter } from 'next/router';
import { handleTrack } from '~src/components/DelegationDashboard/DashboardTrack';
import { formatBalance } from '@polkadot/util';
import DelegationSuccessPopup from './DelegationSuccessPopup';
import { chainProperties } from '~src/global/networkConstants';
import Address from '~src/ui-components/Address';
import { formatedBalance } from '~src/components/DelegationDashboard/ProfileBalance';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { APPNAME } from '~src/global/appName';
import { Injected, InjectedWindow } from '@polkadot/extension-inject/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import executeTx from '~src/util/executeTx';

const ZERO_BN = new BN(0);

interface Props {
  trackNum: number;
  className?: string;
  defaultTarget: string;
  open: boolean;
  setOpen: (pre:boolean) => void;
  conviction: number;
  balance : BN;
}
const UndelegateModal = ({ trackNum, className, defaultTarget, open, setOpen, conviction, balance }: Props ) => {

	const { api, apiReady } = useContext(ApiContext);
	const { network } = useNetworkContext();
	const router = useRouter();
	const trackName = handleTrack(String(router.query.track));
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const { delegationDashboardAddress : defaultAddress } = useUserDetailsContext();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [target, setTarget] = useState<string>(defaultTarget);
	const lock = (Number(2**(conviction-1)));
	const [openSuccessPopup, setOpenSuccessPopup] = useState<boolean>(false);
	const [txFee, setTxFee] = useState(ZERO_BN);
	const unit =`${chainProperties[network]?.tokenSymbol}`;

	useEffect(() => {

		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {

		if(!api || !apiReady ) return;

		setLoading(true);

		const txArr =  api.tx.convictionVoting.undelegate(trackNum);

		(async () => {
			const info = await txArr.paymentInfo(defaultAddress);
			setTxFee(new BN(info.partialFee.toString() || 0));
			setLoading(false);
		})();
	}, [defaultAddress, api, apiReady, balance, trackNum, conviction, network, target]);

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultAddress]);

	const onSucess = () => {
		queueNotification({
			header: 'Success!',
			message: 'Undelegate successful.',
			status: NotificationStatus.SUCCESS
		});
		setLoading(false);
		setOpenSuccessPopup(true);
		setOpen(false);
	};
	const onFailed = (message: string) => {
		queueNotification({
			header: 'Undelegate failed!',
			message,
			status: NotificationStatus.ERROR
		});
		setLoading(false);
	};

	const handleSubmit = async () => {

		if (!api || !apiReady) return;

		setLoading(true);
		const chosenWallet = localStorage.getItem('delegationWallet');

		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected
			? injectedWindow.injectedWeb3[String(chosenWallet)]
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
		}
		if (!injected) {
			setLoading(false);
			return;
		}

		// TODO: check .toNumber()
		const delegateTxn = api.tx.convictionVoting.undelegate(trackNum);
		await executeTx({ address: defaultAddress, api, message: 'Undelegate successful.', network, onFailed, onSucess, tx: delegateTxn });
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
						{ <Alert showIcon type='info' className='text-[14px]' message={`An approximate fees of ${formatBalance(txFee.toNumber(), { forceUnit: unit })} will be applied to the transaction`}/>}
						<Form
							form={form}
							disabled={true}
						>

							<div className='mt-4'>
								<label className='text-sm text-[#485F7D] mb-1'>Your Address</label>
								<div className='text-[#7c899b] px-0 rounded-[6px] py-[px] h-[40px] cursor-not-allowed'>
									<Address address={defaultAddress} identiconSize={36} disableAddressClick addressClassName='text-[#7c899b] text-sm' displayInline />
								</div>
							</div>

							<div className='mt-6'>
								<label className='text-sm text-[#485F7D] mb-1'>Delegated to</label>
								<div className='text-[#243A57] px-0 rounded-[6px] py-[px] h-[40px] cursor-not-allowed'>
									<Address address={defaultTarget} identiconSize={36} disableAddressClick addressClassName='text-[#7c899b] text-sm' displayInline />
								</div>
							</div>

							<div className='mt-6'>
								<label className='text-sm text-[#485F7D] mb-2'>Balance</label>
								<div className='text-[#7c899b] px-0 rounded-[6px] py-[px] h-[40px] cursor-not-allowed'>
									{`${formatedBalance(balance.toString(), unit)} ${unit}`}
								</div>
							</div>

							<div className='mb-[2px] mt-2 border-solid border-white'>
								<label  className='text-[#485F7D] flex items-center text-sm'>Conviction<span>
									<HelperTooltip className='ml-2' text='You can multiply your votes by locking your tokens for longer periods of time.'/>
								</span></label>

							</div>
							<div className='rounded-md flex items-center justify-between track-[0.0025em]'>
								<div className='text-[#7c899b] text-sm flex justify-center items-center' >
									{conviction === 0 ? '0.1x voting balance, no lockup period' :`${conviction}x voting balance, locked for ${lock} enactment period`}
								</div>
							</div>
							<div className='mt-6 flex justify-start items-center gap-2 mb-6'>
								<label className='text-[#485F7D] text-sm tracking-[0.0025em] mb-[2px]'>Track:</label>
								<span className='text-[#7c899b] text-sm tracking-medium'>{trackName} #{trackNum}</span>
							</div>
						</Form>

					</div>
				</Spin>
			</Modal>
			<DelegationSuccessPopup open={openSuccessPopup} setOpen={setOpenSuccessPopup} balance={balance}/>
		</>
	);
};

export default styled(UndelegateModal)`
.padding  .ant-modal-close{
  margin-top: 4px;
}
.padding .ant-alert-message{
color:#243A57;
font-size:14px;
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