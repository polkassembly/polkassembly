// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect } from 'react';
import { Alert, Button, Modal, message } from 'antd';
import CloseIcon from '~assets/icons/close.svg';
import SuccessIcon from '~assets/delegation-tracks/success-delegate.svg';
import { poppins } from 'pages/_app';
import BN from 'bn.js';
import { useNetworkContext } from '~src/context';
import Address from '~src/ui-components/Address';
import { formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { formatedBalance } from '~src/components/DelegationDashboard/ProfileBalance';
import copyToClipboard from '~src/util/copyToClipboard';
import RedirectIcon from '~assets/icons/redirect.svg';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Props{
  className?: string;
   open: boolean;
  setOpen: (pre:boolean) => void;
  proposerAddress: string;
  fundingAmount: BN;
  selectedTrack: string;
  preimageHash: string;
  preimageLength: number | null;
  beneficiaryAddress: string;
  postId: number;
}

const TreasuryProposalSuccessPopup= ({ className, open, setOpen, fundingAmount, preimageHash, proposerAddress, beneficiaryAddress, preimageLength, selectedTrack, postId }: Props) => {
	const { network } = useNetworkContext();
	const unit =`${chainProperties[network]?.tokenSymbol}`;
	const [messageApi, contextHolder] = message.useMessage();
	const router = useRouter();

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
			unit: chainProperties[network].tokenSymbol
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <Modal
		zIndex={100000}
		open={open}
		className={`${poppins.variable} ${poppins.className} w-[550px] max-md:w-full`}
		wrapClassName={className}
		closeIcon={<CloseIcon/>}
		onCancel={() => setOpen(false)}
		footer={<div className='flex items-center'><Button onClick={() => {router.push(`https://${network}.polkassembly.io/referenda/${postId}`);}} className='w-full bg-pink_primary text-white text-sm font-medium h-[40px] rounded-[4px]'>View Proposal</Button></div>}
		maskClosable={false}
	>
		<div className='flex justify-center items-center flex-col -mt-[132px]'>
			<SuccessIcon/>
			<label className='text-xl text-bodyBlue font-semibold'>Proposal created successfully for</label>
			<span className='text-2xl font-semibold text-pink_primary mt-2'>{formatedBalance(fundingAmount.toString(), unit)} {unit}</span>

			<div className='flex my-2'>
				<div className='mt-[10px] flex flex-col text-sm text-lightBlue gap-1.5'>
					<span className='flex'><span className='w-[172px]'>Proposer Address:</span><Address addressClassName='text-bodyBlue font-semibold text-sm'  address={proposerAddress} identiconSize={24}/></span>
					<span className='flex'><span className='w-[172px]'>Beneficiary Address:</span><Address textClassName='text-bodyBlue font-medium text-sm' displayInline address={beneficiaryAddress} identiconSize={24}/></span>

					<span className='flex'><span className='w-[172px]'>Track:</span><span className='text-bodyBlue font-medium'>{selectedTrack} <span className='text-pink_primary'>#{networkTrackInfo[network][selectedTrack]?.trackId || 0}</span></span></span>
					<span className='flex'><span className='w-[172px]'>Funding Amount:</span><span className='text-bodyBlue font-medium'>{formatedBalance(fundingAmount.toString(), unit)} {unit}</span></span>
					<span className='flex items-center'><span className='w-[172px]'>Preimage Hash:</span>
						<span className='text-bodyBlue  font-medium'>{preimageHash.slice(0,10)+'...'+ preimageHash.slice(55)}</span>
					</span>
					<span className='flex'><span className='w-[172px]'>Preimage Length:</span><span className='text-bodyBlue font-medium'>{preimageLength}</span></span>
					<span className='flex items-center'><span className='w-[172px]'>Link to proposal:</span>
						<Link href={`https://${network}.polkassembly.io/referenda/${postId}`} className='text-pink_primary font-medium'><u>{`https://${network}.../${postId}`}</u></Link>
						<span className='flex items-center cursor-pointer ml-1' onClick={(e) => {e.preventDefault(); copyLink(`https://${network}.polkassembly.io/referenda/${postId}`) ;success('Preimage link copied to clipboard.');}}>
							{contextHolder}
							<RedirectIcon/>
						</span>
					</span>
				</div>
			</div>
			<Alert showIcon type='warning' className='rounded-[4px] m-2 text-sm w-full' message={<span className='text-sm font-medium text-bodyBlue'>Place a decision deposit in X days to prevent your proposal from being timed out.</span>} description={<span className='text-xs text-pink_primary font-medium cursor-pointer' onClick={() => router.push(`https://${network}.polkassembly.io/referenda/${postId}`)}>Pay Decision Deposit</span>} />
		</div>

	</Modal>;
};

export default styled(TreasuryProposalSuccessPopup)`
.ant-alert-with-description{
padding-block: 12px !important;
}
.ant-alert-with-description .ant-alert-description{
  margin-top:-10px ;
}
.ant-alert-with-description .ant-alert-icon{
  font-size: 18px !important;
  margin-top: 4px;
}`;
