// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Alert, Button, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { IEnactment, IPreimage, ISteps } from '.';
import BN from 'bn.js';
import Address from '~src/ui-components/Address';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useApiContext, useNetworkContext } from '~src/context';
import { BN_HUNDRED, formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
// import dynamic from 'next/dynamic';
import { formatedBalance } from '../DelegationDashboard/ProfileBalance';
import copyToClipboard from '~src/util/copyToClipboard';
import CopyIcon from '~assets/icons/content-copy.svg';
import { PostOrigin } from '~src/types';

const ZERO_BN = new BN(0);

interface Props{
  className?: string;
  setSteps: (pre: ISteps)=> void;
  isPreimage: boolean;
  proposerAddress: string;
  fundingAmount: BN;
  selectedTrack: string;
  preimage: IPreimage | undefined;
  preimageHash: string;
  preimageLength: number;
  enactment: IEnactment;
  beneficiaryAddress: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CreateProposal = ({ className, setSteps, isPreimage, fundingAmount, proposerAddress, selectedTrack, preimage, preimageHash, preimageLength, enactment, beneficiaryAddress }: Props) => {
	const { network } = useNetworkContext();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [messageApi, contextHolder] = message.useMessage();
	const { api, apiReady } = useApiContext();
	const [txFee, setTxFee] = useState(ZERO_BN);
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const success = (message: string) => {
		messageApi.open({
			content: message,
			duration: 10,
			type: 'success'
		});
	};
	const copyLink = (address:string) => {
		copyToClipboard(address);
	};

	useEffect(() => {

		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit
		});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

  console.log(txFee.toString())
	useEffect(() => {
		setShowAlert(false);
    console.log('here')
		const obj = localStorage.getItem('treasuryProposalData');
		obj && localStorage.setItem('treasuryProposalData', JSON.stringify({ ...JSON.parse(obj), step: 2 }));

		if(!proposerAddress || !api || !apiReady || !fundingAmount || fundingAmount.lte(ZERO_BN) || fundingAmount.eq(ZERO_BN)) return;
		// if(!selectedTrack) return;

		setLoading(true);
		const tx = api.tx.referenda.submit( 'SmallSpender',{ Lookup: { hash: preimageHash, length: preimageLength } }, { After: BN_HUNDRED });

		(async () => {
			const info = await tx.paymentInfo(proposerAddress);
			setTxFee(new BN(info.partialFee.toString() || 0));
			setLoading(false);
			setShowAlert(true);
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [proposerAddress, beneficiaryAddress, fundingAmount, api, apiReady, network, selectedTrack, preimageHash, preimageLength, enactment.value, enactment.key]);

	// const handleCreateProposal = async() => {
	// if(!api || !apiReady) return;
	// const proposal = await api.tx.referenda.submit(selectedTrack ,{ Lookup: { hash: preimageHash, length:preimageLength } }, enactment.value ? (enactment.key === EEnactment.At_Block_No ? { At: enactment.value }: { After: enactment.value }): { After: BN_HUNDRED });
	// };

	return <div className={`create-proposal ${className}`}>
		<Alert message={`Preimage ${isPreimage ? 'linked' : 'created'} successfully`} className='text-bodyBlue text-sm rounded-[4px] mt-8' type='success' showIcon/>
		<div className='mt-4 text-sm font-normal text-lightBlue'>
			<label className='font-medium'>Preimage Details:</label>
			<div className='mt-[10px] flex flex-col gap-2'>
				<span className='flex gap-1'><span className='w-[150px]'>Proposer Address:</span><Address address={proposerAddress} identiconSize={24}/></span>
				<span className='flex gap-1'><span className='w-[150px]'>Track:</span><span className='text-bodyBlue'>{selectedTrack} #{networkTrackInfo[network][selectedTrack]?.trackId || 0}</span></span>
				<span className='flex gap-1'><span className='w-[150px]'>Funding Amount:</span><span className='text-bodyBlue'>{formatedBalance(fundingAmount.toString(), unit)} {unit}</span></span>
				<span className='flex gap-1 items-center'><span className='w-[150px]'>Preimage Hash:</span>
					<span className='text-bodyBlue'>{preimageHash.slice(0,10)+'...'+ preimageHash.slice(55)}</span>
					<span className='flex items-center cursor-pointer' onClick={(e) => {e.preventDefault(); copyLink(preimageHash) ;success('Preimage hash copied to clipboard');}}>
						{contextHolder}
						<CopyIcon/>
					</span>
				</span>
				<span className='flex gap-1'><span className='w-[150px]'>Preimage Length:</span><span className='text-bodyBlue'>{preimageLength}</span></span>
				<span className='flex gap-1 items-center'><span className='w-[150px]'>Preimage Link:</span>
					<a target='_blank' rel='noreferrer' href={`https://${network}.polkassembly.io/preimages/${preimageHash}`} className='text-bodyBlue'>{`https://${network}.polkassembly.io/preimages/${preimageHash.slice(0,5)}...`}</a>
					<span className='flex items-center cursor-pointer' onClick={(e) => {e.preventDefault(); copyLink(`https://${network}.polkassembly.io/preimages/${preimageHash}`) ;success('Preimage link copied to clipboard');}}>
						{contextHolder}
						<CopyIcon/>
					</span>
				</span>
			</div>
		</div>
		<Alert className='mt-6 text-bodyBlue text-sm rounded-[4px]' showIcon type='info' message='An amount of 2.48 KSM will be required to submit proposal.'
			description={<div className='mt-[10px] flex flex-col gap-0.5'>
				<span className='flex gap-1 text-lightBlue'><span className='w-[150px]'>Deposit amount</span><span className='text-bodyBlue'>900</span></span>
				<span className='flex gap-1 text-lightBlue'><span className='w-[150px]'>Gas fees</span><span className='text-bodyBlue'>{formatedBalance(String(txFee.toString()), unit)} {unit}</span></span>
				<span className='flex gap-1 text-lightBlue font-semibold'><span className='w-[150px]'>Total</span><span className='text-bodyBlue'>90</span></span>
			</div>}/>
		<div className='flex justify-end mt-6 -mx-6 border-0 border-solid border-t-[1px] border-[#D2D8E0] px-6 pt-4 gap-4'>
			<Button onClick={() => setSteps({ percent: 0, step: 2 }) } className='bg-pink_primary text-white font-medium tracking-[0.05em] text-sm w-[155px] h-[40px] rounded-[4px]'>
         Create Proposal
			</Button>
		</div>
	</div>;
};
export default CreateProposal;