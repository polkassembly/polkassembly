// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal } from 'antd';
import { poppins } from 'pages/_app';
import BN from 'bn.js';
import { useNetworkContext } from '~src/context';
import Address from '~src/ui-components/Address';
import { formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { formatedBalance } from '~src/util/formatedBalance';
import styled from 'styled-components';
import { blocksToRelevantTime, getTrackData } from '../Listing/Tracks/AboutTrackCard';
import CloseIcon from '~assets/icons/close.svg';
import SuccessIcon from '~assets/delegation-tracks/success-delegate.svg';
import Link from 'next/link';

interface Props {
	className?: string;
	open: boolean;
	onCancel: () => void;
	proposerAddress: string;
	fundingAmount: BN;
	selectedTrack: string;
	preimageHash: string;
	preimageLength: number | null;
	beneficiaryAddress: string;
	postId: number;
}

const getDefaultTrackMetaData = () => {
	return {
		confirmPeriod: '',
		decisionDeposit: '',
		decisionPeriod: '',
		description: '',
		group: '',
		maxDeciding: '',
		minEnactmentPeriod: '',
		preparePeriod: '',
		trackId: 0
	};
};

const TreasuryProposalSuccessPopup = ({
	className,
	open,
	onCancel,
	fundingAmount,
	preimageHash,
	proposerAddress,
	beneficiaryAddress,
	preimageLength,
	selectedTrack,
	postId
}: Props) => {
	const { network } = useNetworkContext();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [trackMetaData, setTrackMetaData] = useState(getDefaultTrackMetaData());

	useEffect(() => {
		setTrackMetaData(getTrackData(network, selectedTrack));
	}, [network, selectedTrack]);

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Modal
			open={open}
			className={`${poppins.variable} ${poppins.className} w-[550px] max-md:w-full`}
			wrapClassName={className}
			closeIcon={<CloseIcon />}
			onCancel={onCancel}
			footer={
				<Link
					href={`https://${network}.polkassembly.io/referenda/${postId}`}
					className='flex items-center'
				>
					<Button className='h-[40px] w-full rounded-[4px] bg-pink_primary text-sm font-medium text-white'>View Proposal</Button>
				</Link>
			}
			maskClosable={false}
		>
			<div className='-mt-[132px] flex flex-col items-center justify-center'>
				<SuccessIcon />
				<label className='text-xl font-semibold text-bodyBlue'>Proposal created successfully for</label>
				{fundingAmount && (
					<span className='mt-2 text-2xl font-semibold text-pink_primary'>
						{formatedBalance(fundingAmount.toString(), unit)} {unit}
					</span>
				)}
				{proposerAddress && beneficiaryAddress && selectedTrack && preimageHash && preimageLength && (
					<div className='my-2 flex'>
						<div className='mt-[10px] flex flex-col gap-1.5 text-sm text-lightBlue'>
							<span className='flex'>
								<span className='w-[172px]'>Proposer Address:</span>
								<Address
									disableAddressClick
									addressClassName='text-bodyBlue font-semibold text-sm'
									address={proposerAddress}
									truncateUsername={false}
									identiconSize={18}
								/>
							</span>
							<span className='flex'>
								<span className='w-[172px]'>Beneficiary Address:</span>
								<Address
									disableAddressClick
									textClassName='text-bodyBlue font-medium text-sm'
									displayInline
									address={beneficiaryAddress}
									truncateUsername={false}
									identiconSize={18}
								/>
							</span>

							<span className='flex'>
								<span className='w-[172px]'>Track:</span>
								<span className='font-medium text-bodyBlue'>
									{selectedTrack}
									<span className='ml-1 text-pink_primary'>#{networkTrackInfo[network][selectedTrack]?.trackId || 0}</span>
								</span>
							</span>
							<span className='flex'>
								<span className='w-[172px]'>Funding Amount:</span>
								<span className='font-medium text-bodyBlue'>
									{formatedBalance(fundingAmount.toString(), unit)} {unit}
								</span>
							</span>
							<span className='flex items-center'>
								<span className='w-[172px]'>Preimage Hash:</span>
								<span className='font-medium  text-bodyBlue'>{preimageHash.slice(0, 10) + '...' + preimageHash.slice(55)}</span>
							</span>
							<span className='flex'>
								<span className='w-[172px]'>Preimage Length:</span>
								<span className='font-medium text-bodyBlue'>{preimageLength}</span>
							</span>
						</div>
					</div>
				)}
				<Alert
					showIcon
					type='warning'
					className='m-2 w-full rounded-[4px] text-sm'
					message={
						<span className='text-sm font-medium text-bodyBlue'>
							Place a decision deposit in {blocksToRelevantTime(network, Number(trackMetaData.decisionPeriod + trackMetaData.preparePeriod))} to prevent your proposal from being
							timed out.
						</span>
					}
					description={
						<Link
							href={`https://${network}.polkassembly.io/referenda/${postId}`}
							className='cursor-pointer text-xs font-medium text-pink_primary'
						>
							Pay Decision Deposit
						</Link>
					}
				/>
			</div>
		</Modal>
	);
};

export default styled(TreasuryProposalSuccessPopup)`
	.ant-alert-with-description {
		padding-block: 12px !important;
	}
	.ant-alert-with-description .ant-alert-description {
		margin-top: -10px;
	}
	.ant-alert-with-description .ant-alert-icon {
		font-size: 18px !important;
		margin-top: 4px;
	}
`;
