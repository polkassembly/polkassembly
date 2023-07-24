// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { IName, ISocials, ITxFee } from '.';
import Address from '~src/ui-components/Address';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { Alert, Button, Divider, Input } from 'antd';
import { EmailIcon, RiotIcon, TwitterIcon, WebIcon } from '~src/ui-components/CustomIcons';
import { formatedBalance } from '../DelegationDashboard/ProfileBalance';
import { chainProperties } from '~src/global/networkConstants';
import { NetworkContext } from '~src/context/NetworkContext';
import styled from 'styled-components';
import { ApiContext } from '~src/context/ApiContext';
import _ from 'lodash';
import BN from 'bn.js';

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
}

const IdentityForm = ({ className, address, txFee, name, socials, onChangeName, onChangeSocials, setTxFee, startLoading, onCancel }: Props) => {

	const { network } = useContext(NetworkContext);
	const { bondFee, gasFee, registerarFee } = txFee;
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [hideDetails, setHideDetails] = useState<boolean>(false);
	const { api, apiReady } = useContext(ApiContext);

	const getGasFee = async() => {
		if(!api || !apiReady || name.displayName.length === 0) return;

		startLoading(true);
		// eslint-disable-next-line sort-keys
		const detailInfo =  { display: { Raw: name.displayName }, legal:{ Raw: name.legalName }, email: socials.email, riot: socials.riot, twitter: socials.twitter, web: socials.web };

		const tx = api.tx.identity.setIdentity( detailInfo );
		const info = await tx.paymentInfo(address);
		setTxFee({ ...txFee, gasFee: info.partialFee  });
		startLoading(false);
	};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const getGasFeeFn = useCallback(_.debounce(getGasFee, 2000), [name, socials]);

	useEffect(() => {
		getGasFeeFn();
	},[getGasFeeFn]);

	return <div className={className}>
		<label className='text-sm text-lightBlue'>Your Address <HelperTooltip className='ml-1' text='your address.'/></label>
		<div className='px-[6px] py-[6px] mt-0.5 border-solid rounded-[4px] border-[1px] cursor-not-allowed h-[40px]  bg-[#f6f7f9] border-[#D2D8E0] text-[#7c899b] text-sm font-normal'>
			<Address address={address} identiconSize={26} disableAddressClick textClassName='text-bodyBlue' addressClassName='text-bodyBlue text-sm' displayInline />
		</div>
		<div className='mt-6'>
			<label className='text-sm text-lightBlue'>Display Name</label>
			<Input className='h-[40px] rounded-[4px] mt-0.5' placeholder='Enter a name for your identity ' value={name.displayName} onChange={(e) => onChangeName({ ...name, displayName: e.target.value })} />
		</div>
		<div className='mt-6'>
			<label className='text-sm text-lightBlue'>Legal Name</label>
			<Input className='h-[40px] mt-0.5 rounded-[4px]' placeholder='Enter your full name' value={name.legalName} onChange={(e) => onChangeName({ ...name, legalName: e.target.value })} />
		</div>
		<Divider/>
		<div>
			<label className='text-sm font-medium text-lightBlue'>Socials <HelperTooltip className='ml-1' text='your address.'/></label>
			<div className='flex items-center mt-4'>
				<span className='flex gap-2 items-center w-[150px]'>
					<WebIcon className='bg-[#edeff3] rounded-full text-2xl p-2.5'/>
					<span className='text-sm text-lightBlue'>Web</span>
				</span>
				<Input value={socials.web} placeholder='Enter your website address' className='h-[40px] rounded-[4px]' onChange={(e) => onChangeSocials({ ...socials, web: e.target.value })}/>
			</div>
			<div className='flex items-center mt-4'>
				<span className='flex gap-2 items-center w-[150px]' >
					<EmailIcon className='bg-[#edeff3] rounded-full text-xl p-2.5 text-[#576D8B]'/>
					<span className='text-sm text-lightBlue'>Email</span>
				</span>
				<Input value={socials.email} placeholder='Enter your email address' className='h-[40px] rounded-[4px]' onChange={(e) => onChangeSocials({ ...socials, email: e.target.value })}/>
			</div>
			<div className='flex items-center mt-4'>
				<span className='flex gap-2 items-center w-[150px]'>
					<TwitterIcon className='bg-[#edeff3] rounded-full text-xl p-2.5 text-[#576D8B]'/>
					<span className='text-sm text-lightBlue'>Twitter</span></span>
				<Input value={socials.twitter} placeholder='@YourTwitterName' className='h-[40px] rounded-[4px]' onChange={(e) => onChangeSocials({ ...socials, twitter: e.target.value })}/>
			</div>
			<div className='flex items-center mt-4'>
				<span className='flex gap-2 items-center w-[150px]'>
					<RiotIcon className='bg-[#edeff3] rounded-full text-xl p-2.5 text-[#576D8B]'/>
					<span className='text-sm text-lightBlue'>Riot</span>
				</span>
				<Input value={socials.riot} placeholder='@Yourname.matrix.org' className='h-[40px] rounded-[4px]' onChange={(e) => onChangeSocials({ ...socials, riot: e.target.value })}/>
			</div>
		</div>
		<div className='flex gap-10 text-sm mt-6 items-center'>
			<span className='text-lightBlue font-medium'>Bond  <HelperTooltip className='ml-1' text='your address.'/></span>
			<span className='text-bodyBlue font-medium bg-[#EDEFF3] py-1 px-3 rounded-2xl'>{formatedBalance(bondFee.toString(), unit)} {unit}</span>
		</div>
		{!gasFee.eq(ZERO_BN) && <Alert
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
			</div>}
		/>}
		<div className='-mx-6 mt-6 border-0 border-solid flex justify-end border-t-[1px] gap-4 px-6 pt-5 border-[#E1E6EB] rounded-[4px]'>
			<Button onClick={onCancel} className='border-pink_primary text-sm border-[1px]  h-[40px] rounded-[4px] w-[134px] text-pink_primary tracking-wide'>
               Cancel
			</Button>
			<Button
				disabled={name.displayName.length === 0}
				className={`bg-pink_primary text-sm rounded-[4px] h-[40px] w-[134px] text-white tracking-wide ${name.displayName.length === 0 && 'opacity-50'}`}>
                  Set Identity
			</Button>
		</div>
	</div>;
};

export default styled(IdentityForm)`
.ant-alert-with-description .ant-alert-icon{
  font-size: 14px !important;
  margin-top: 5px;
}
.ant-alert{
  padding: 12px;
}
`;