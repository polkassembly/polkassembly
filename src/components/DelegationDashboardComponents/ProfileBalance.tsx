// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { useApiContext, useNetworkContext } from '~src/context';
import BalanceIcon from '~assets/icons/total-balance.svg';
import LockBalanceIcon from '~assets/icons/lock-balance.svg';
import RightTickIcon from '~assets/icons/right-tick.svg';
import { Divider, Skeleton } from 'antd';
import userProfileBalances from '~src/util/userProfieBalances';
import formatBnBalance from '~src/util/formatBnBalance';
import { chainProperties } from '~src/global/networkConstants';
import Address from '~src/ui-components/Address';
import { DownOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';

interface Props{
  className?: string;
  address: string;
}

const DelegationWalletConnectModal = dynamic(() => import('./DelegationWalletConnectModal'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

const ProfileBalances = ({ className, address }: Props ) => {

	const [balance, setBalance] = useState<string>('0');
	const [lockBalance, setLockBalance] = useState<string>('0');
	const [transferableBalance, setTransferableBalance] = useState<string>('0');
	// const [nextUnlock, setNextUnlock] = useState<string>('0');
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();
	const unit =`${chainProperties[network]?.tokenSymbol}`;
	const [openModal, setOpenModal] = useState<boolean>(false);

	useEffect(() => {

		userProfileBalances({ address, api, apiReady, network, setBalance, setLockBalance, setTransferableBalance });

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady]);

	return <div className={'flex justify-between items-center w-full px-[70px] max-md:px-4 '}>
		<div className={`${className} flex py-[17px] items-center  h-full gap-1 max-md:px-[10px]`}>
			<div className='h-[71px] flex flex-col justify-start py-2 gap-1 '>
				<div className='text-[24px] font-semibold text-white tracking-[0.0015em] gap-1'>
					{formatBnBalance(balance, { numberAfterComma: 2, withUnit: false }, network)}
					<span className='text-sm font-medium text-white tracking-[0.015em] ml-1'>{unit}</span></div>
				<div className='flex items-center justify-center gap-2'>
					<BalanceIcon/>
					<span className='text-white text-sm font-normal tracking-[0.01em]'>
          Balance
					</span>
				</div>
			</div>
			<Divider  type= 'vertical' style={{ borderLeft: '1px solid #D2D8E0',height:'100%' }} />
			<div className='flex gap-6 py-2 justify-start max-md:gap-2'>
				<div className='h-[71px] flex flex-col py-2 gap-1'>
					<div className='text-[24px] font-semibold text-white tracking-[0.0015em] gap-1'>
						{formatBnBalance(transferableBalance, { numberAfterComma: 2, withUnit: false }, network)}
						<span className='text-sm font-medium text-white tracking-[0.015em] ml-1'>{unit}</span></div>
					<div className='flex items-center justify-center gap-2'>
						<RightTickIcon/>
						<span className='text-white text-sm font-normal tracking-[0.01em]'>
          Transferable
						</span>
					</div>
				</div>
				<div className='h-[71px] flex flex-col justify-start py-2 gap-1'>
					<div className='text-[24px] font-semibold text-white tracking-[0.0015em] gap-1'>
						{formatBnBalance(lockBalance, { numberAfterComma: 2, withUnit: false }, network)}
						<span className='text-sm font-medium text-white tracking-[0.015em] ml-1'>{unit}</span></div>
					<div className='flex items-center justify-center gap-2'>
						<LockBalanceIcon/>
						<span className='text-white text-sm font-normal tracking-[0.01em]'>
             Total Locked
						</span>
					</div>
				</div>
			</div>
		</div>
		{ address.length > 0 && <div onClick={() => setOpenModal(true)} className='border-solid  h-[40px] flex justify-end gap-2 px-[12px] bg-[#981059] rounded-[8px] border-[1px] border-[#D2D8E0]'>
			<Address displayInline address={address} disableAddressClick/>
			<DownOutlined className='text-white'/>
		</div>}
		<DelegationWalletConnectModal open={openModal} setOpen={setOpenModal} closable={true}/>
	</div>;
};
export default ProfileBalances;
