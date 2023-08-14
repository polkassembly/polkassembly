// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect, useState } from 'react';
import { IName, ISocials, ITxFee } from '.';
import { poppins } from 'pages/_app';
import { Button, Modal } from 'antd';
import Address from '~src/ui-components/Address';

import CloseIcon from '~assets/icons/close-icon.svg';
import SuccessIcon from '~assets/icons/identity-success.svg';
import UpArrowIcon from '~assets/icons/up-arrow.svg';
import DownArrowIcon from '~assets/icons/down-arrow.svg';
import { formatedBalance } from '~src/util/formatedBalance';
import { NetworkContext } from '~src/context/NetworkContext';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';

interface Props{
  className?: string;
 socials: ISocials;
 name: IName;
 txFee: ITxFee;
 open?: boolean;
 address: string;
 changeStep: (step: number) => void;
 close: (pre: boolean) => void;
 openPreModal: (pre: boolean) => void;
}

const SuccessState = ({ className, open, close, changeStep , openPreModal, name, socials, address, txFee }: Props) => {

	const { network } = useContext(NetworkContext);
	const unit =`${chainProperties[network]?.tokenSymbol}`;
	const { displayName } = name;
	const { email, web, twitter, riot } = socials;
	const { bondFee, registerarFee, gasFee } = txFee;
	const [amountBreakup, setAmountBreakup] = useState<boolean>(false);

	useEffect(() => {
		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[network]);

	return <Modal
		zIndex={100000}
		open={open}
		className={`${poppins.variable} ${poppins.className} w-[600px] max-sm:w-full`}
		wrapClassName={className}
		closeIcon={<CloseIcon/>}
		onCancel={() => {close(true); changeStep(4); openPreModal(false);}}
		footer={false}
		maskClosable={false}
	><>
			<div className='flex justify-center items-center flex-col -mt-[132px]'>
				<SuccessIcon/>
				<label className='text-xl font-semibold text-bodyBlue tracking-[0.0015em] mt-4'>On-chain identity registration initiated</label>
				<div className='text-2xl text-pink_primary font-semibold mt-4'>{displayName}</div>
				<div className='flex flex-col gap-2 mt-4'>
					<span className='flex gap-1 items-center'><span className='text-sm text-lightBlue w-[80px] tracking-[0.015em]'>Address:</span><span><Address address={address} textClassName='text-bodyBlue font-medium'/></span></span>
					{email.length > 0 && <span className='flex gap-1 items-center'><span className='text-sm text-lightBlue w-[80px] tracking-[0.015em]'>Email:</span><span className='text-sm text-bodyBlue font-medium'>{email.slice(0,15)}...</span></span>}
					{web.length > 0 && <span className='flex gap-1 items-center'><span className='text-sm text-lightBlue w-[80px] tracking-[0.015em]'>Web: </span><span className='text-sm text-bodyBlue font-medium'>{web.slice(0,15)}...</span></span>}
					{twitter.length > 0 && <span className='flex gap-1 items-center'><span className='text-sm text-lightBlue w-[80px] tracking-[0.015em]'>Twitter:</span ><span className='text-sm text-bodyBlue font-medium'>{twitter}</span></span>}
					{riot.length > 0 && <span className='flex gap-1 items-center'><span className='text-sm text-lightBlue w-[80px] tracking-[0.015em]'>Riot: </span><span className='text-sm text-bodyBlue font-medium'>{riot}</span></span>}
				</div>
			</div>
			<div className='min-h-[60px] bg-[#F6F7F9] rounded-lg px-3 py-[14px] mt-6'>
				<div className={`flex justify-between ${amountBreakup && 'border-0 border-solid border-b-[1px] pb-3 border-[#E1E6EB]'}`}>
					<span className='text-sm text-lightBlue'>Total Amount Required</span>
					<div className='text-base text-bodyBlue font-semibold flex flex-col cursor-pointer'>
						<span className='flex' onClick={() => setAmountBreakup(!amountBreakup)}>
							{formatedBalance(bondFee.add(registerarFee).add(gasFee).toString(), unit)} {unit}
							{ amountBreakup ? <DownArrowIcon className='ml-3'/> : <UpArrowIcon className='ml-3'/> }
						</span>
					</div>
				</div>
				{amountBreakup && <div className='flex gap-2 flex-col mt-3'>
					<span className='flex justify-between text-sm'>
						<span className='text-lightBlue'>Bond</span>
						<span className='text-bodyBlue font-medium'>{formatedBalance(bondFee.toString(), unit)} {unit}</span>
					</span>
					<span className='flex justify-between text-sm'>
						<span className='text-lightBlue'>Gas fees</span>
						<span className='text-bodyBlue font-medium'>{formatedBalance(gasFee.toString(), unit)} {unit}</span>
					</span>
					<span className='flex justify-between text-sm'>
						<span className='text-lightBlue'>Registrar fees</span>
						<span className='text-bodyBlue font-medium'>{formatedBalance(registerarFee.toString(), unit)} {unit}</span>
					</span>
				</div>
				}
			</div>
			<Button onClick={() => {close(true); changeStep(3); openPreModal(true);}} className='bg-pink_primary text-sm mt-4 w-full rounded-[4px h-[40px] text-white tracking-wide'>
                  Let’s start your verification process
			</Button>
		</>
	</Modal>;
};

export default SuccessState;