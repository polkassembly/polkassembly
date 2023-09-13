// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect } from 'react';
import { ESetIdentitySteps, IName, ISocials, ITxFee } from '.';
import { poppins } from 'pages/_app';
import { Button, Modal } from 'antd';
import Address from '~src/ui-components/Address';
import CloseIcon from '~assets/icons/close-icon.svg';
import SuccessIcon from '~assets/icons/identity-success.svg';
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
 changeStep: (step: ESetIdentitySteps) => void;
 close: (pre: boolean) => void;
 openPreModal: (pre: boolean) => void;
}

const SuccessState = ({ className, open, close, changeStep , openPreModal, name, socials, address }: Props) => {

	const { network } = useContext(NetworkContext);
	const { displayName } = name;
	const { email, web, twitter, riot } = socials;

	useEffect(() => {
		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[network]);

	return <Modal
		centered
		open={open}
		className={`${poppins.variable} ${poppins.className} w-[600px] max-sm:w-full`}
		wrapClassName={className}
		closeIcon={<CloseIcon/>}
		onCancel={() => {
			close(true);
			changeStep(ESetIdentitySteps.SOCIAL_VERIFICATION);
			openPreModal(false);
		}
		}
		footer={false}
		maskClosable={false}
	><>
			<div className='flex justify-center items-center flex-col -mt-[132px]'>
				<SuccessIcon/>
				<label className='text-xl font-semibold text-bodyBlue tracking-[0.0015em] mt-4'>On-chain identity registration initiated</label>
				<div className='text-2xl text-pink_primary font-semibold mt-4'>{displayName}</div>
				<div className='flex flex-col gap-2 mt-4'>
					<span className='flex gap-1 items-center'><span className='text-sm text-lightBlue w-[80px] tracking-[0.015em]'>Address:</span><span><Address address={address} displayInline truncateUsername={false} textClassName='text-bodyBlue font-medium'/></span></span>
					{email?.value?.length > 0 && <span className='flex gap-1 items-center'><span className='text-sm text-lightBlue w-[80px] tracking-[0.015em]'>Email:</span><span className='text-sm text-bodyBlue font-medium'>{email?.value}</span></span>}
					{web?.value?.length > 0 && <span className='flex gap-1 items-center'><span className='text-sm text-lightBlue w-[80px] tracking-[0.015em]'>Web: </span><span className='text-sm text-bodyBlue font-medium'>{web?.value?.slice(0,15)}...</span></span>}
					{twitter?.value?.length > 0 && <span className='flex gap-1 items-center'><span className='text-sm text-lightBlue w-[80px] tracking-[0.015em]'>Twitter:</span ><span className='text-sm text-bodyBlue font-medium'>{twitter?.value}</span></span>}
					{riot?.value?.length > 0 && <span className='flex gap-1 items-center'><span className='text-sm text-lightBlue w-[80px] tracking-[0.015em]'>Riot: </span><span className='text-sm text-bodyBlue font-medium'>{riot?.value}</span></span>}
				</div>
			</div>

			<Button onClick={() => {close(true); changeStep(ESetIdentitySteps.SOCIAL_VERIFICATION); openPreModal(true);}} className='bg-pink_primary text-sm mt-6 w-full rounded-[4px] border-none h-[40px] text-white tracking-wide'>
                  Let’s start your verification process
			</Button>
		</>
	</Modal>;
};

export default SuccessState;