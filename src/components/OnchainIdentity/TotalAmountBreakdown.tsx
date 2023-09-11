// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect, useState } from 'react';
import BN from 'bn.js';
import { useUserDetailsContext } from '~src/context';
import { network as AllNetworks } from '~src/global/networkConstants';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { NetworkContext } from '~src/context/NetworkContext';
import { ESetIdentitySteps, ITxFee } from '.';
import { Button } from 'antd';
import UpArrowIcon from '~assets/icons/up-arrow.svg';
import DownArrowIcon from '~assets/icons/down-arrow.svg';
import IdentityIllustration from '~assets/icons/identity.svg';
import HelperTooltip from '~src/ui-components/HelperTooltip';

interface Props{
  className?: string;
  txFee: ITxFee;
  changeStep: (step: number) => void;
  perSocialBondFee: BN;
	loading: boolean;
}
const getLearnMoreRedirection = (network: string) => {
	switch (network){
	case AllNetworks.POLKADOT:
		return 'https://wiki.polkadot.network/docs/learn-identity';
	case AllNetworks.KUSAMA:
		return 'https://guide.kusama.network/docs/learn-identity';
	}

};

const TotalAmountBreakdown = ({ className, txFee, changeStep, perSocialBondFee, loading }: Props) => {
	const { registerarFee, minDeposite } = txFee;
	const { network } = useContext(NetworkContext);
	const unit =`${chainProperties[network]?.tokenSymbol}`;
	const [amountBreakup, setAmountBreakup] = useState<boolean>(false);
	const { id: userId } = useUserDetailsContext();

	useEffect(() => {
		let identityForm: any = localStorage.getItem('identityForm');
		identityForm = JSON.parse(identityForm);

		localStorage.setItem('identityForm', JSON.stringify({
			...identityForm,
			userId
		}));
	},[network, userId]);

	return <div className={className}>
		<span className='flex justify-center items-center mt-6'><IdentityIllustration/></span>
		<ul className='text-sm text-bodyBlue mt-6 pl-4 flex flex-col gap-2 tracking-[0.001em]'>
			<li>Polkadot offers on-chain identities that verify users&apos;s credentials through appointed registrars, instilling greater trust and support. </li>
			<li>
            Once successfully verified, users receive a green checkmark, symbolising their trusted status. This verified status symbol enhances trustworthiness when requesting funds from the treasury or participating in discussions and proposals.
				<u className='text-pink_primary'>
					<a className='text-pink_primary text-sm ml-1' href={getLearnMoreRedirection(network)}>Learn more</a>
				</u>
			</li>
		</ul>
		<div className='min-h-[60px] bg-[#F6F7F9] rounded-lg px-3 py-[14px]'>
			<div className={`flex justify-between ${amountBreakup && 'border-0 border-solid border-b-[1px] pb-3 border-[#E1E6EB]'}`}>
				<span className='text-sm text-lightBlue'>Total Amount Required</span>
				<div className='text-base text-bodyBlue font-semibold flex flex-col cursor-pointer'>
					<span className='flex' onClick={() => setAmountBreakup(!amountBreakup)}>
						{formatedBalance(perSocialBondFee.add((registerarFee).add(minDeposite)).toString(), unit)} {unit}
						{ amountBreakup ? <DownArrowIcon className='ml-3'/> : <UpArrowIcon className='ml-3'/> }
					</span>
					<span className='text-xs text-lightBlue font-normal -mt-1'>{amountBreakup ? 'Hide' : 'View'} Amount Breakup</span>
				</div>
			</div>
			{amountBreakup && <div className='flex gap-2 flex-col mt-3'>
				<span className='flex justify-between text-sm'>
					<span className='text-lightBlue'>Bond</span>
					<span className='text-bodyBlue font-medium'>{formatedBalance(perSocialBondFee.toString(), unit)} {unit} per social field</span>
				</span>
				<span className='flex justify-between text-sm'>
					<span className='text-lightBlue'>Min Deposit <HelperTooltip className='ml-1' text='Amount that needs held in an address for a verified account.'/></span>
					<span className='text-bodyBlue font-medium'>{formatedBalance(minDeposite.toString(), unit)} {unit}</span>
				</span>
				<span className='flex justify-between text-sm'>
					<span className='text-lightBlue'>Registrar fees <HelperTooltip text='Costs of development & maintenance are funded by the treasury.' className='ml-1'/></span>
					<span className='text-bodyBlue font-medium'>{formatedBalance(registerarFee.toString(), unit)} {unit}</span>
				</span>
			</div>
			}
		</div>
		<div className='-mx-6 mt-6 border-0 border-solid border-t-[1px] px-6 pt-5 border-[#E1E6EB] rounded-[4px]'>
			<Button loading={loading} onClick={() => changeStep(ESetIdentitySteps.SET_IDENTITY_FORM)} className='bg-pink_primary text-sm w-full rounded-[4px] h-[40px] text-white tracking-wide border-pink_primary'>
        Let&apos;s Begin
			</Button>
		</div>
	</div>;
};

export default TotalAmountBreakdown;