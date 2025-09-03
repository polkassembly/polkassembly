// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { dmSans } from 'pages/_app';
import BN from 'bn.js';
import Address from '~src/ui-components/Address';
import { formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { formatedBalance } from '~src/util/formatedBalance';
import styled from 'styled-components';
import { blocksToRelevantTime, getTrackData } from '../Listing/Tracks/AboutTrackCard';
import Link from 'next/link';
import { useAssetsCurrentPriceSelector, useCurrentTokenDataSelector, useNetworkSelector } from '~src/redux/selectors';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { IBeneficiary } from '~src/types';
import Beneficiary from '~src/ui-components/BeneficiariesListing/Beneficiary';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import ImageIcon from '~src/ui-components/ImageIcon';
import Alert from '~src/basic-components/Alert';
import getBeneficiaryAmountAndAsset from '~src/components/OpenGovTreasuryProposal/utils/getBeneficiaryAmountAndAsset';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { getUsdValueFromAsset } from './utils/getUSDValueFromAsset';

interface Props {
	className?: string;
	open: boolean;
	onCancel: () => void;
	proposerAddress?: string;
	fundingAmount?: BN;
	selectedTrack?: string;
	preimageHash?: string;
	preimageLength?: number | null;
	beneficiaryAddresses?: IBeneficiary[];
	postId?: number;
	isCancelReferendaForm?: boolean;
	isKillReferendumForm?: boolean;
	isCreateReferendumForm?: boolean;
	generalIndex?: string | null;
	inputAmountValue?: string;
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
	beneficiaryAddresses,
	preimageLength,
	selectedTrack,
	postId,
	isCreateReferendumForm,
	isKillReferendumForm,
	isCancelReferendaForm,
	generalIndex,
	inputAmountValue
}: Props) => {
	const { network } = useNetworkSelector();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [trackMetaData, setTrackMetaData] = useState(getDefaultTrackMetaData());
	const { currentTokenPrice } = useCurrentTokenDataSelector();
	const { dedTokenUsdPrice } = useAssetsCurrentPriceSelector();

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
	}, [network]);

	return (
		<Modal
			open={open}
			className={`${dmSans.variable} ${dmSans.className} w-[550px] max-md:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			onCancel={onCancel}
			footer={
				<Link
					href={`https://${network}.polkassembly.io/referenda/${postId}`}
					className='flex items-center'
					target='_blank'
					rel='noopener noreferrer'
				>
					<CustomButton
						height={40}
						className='w-full'
						type='primary'
						text='View Proposal'
					/>
				</Link>
			}
			maskClosable={false}
		>
			<div className='-mt-[132px] flex flex-col items-center justify-center'>
				{/* <SuccessIcon /> */}
				<ImageIcon
					src='/assets/delegation-tracks/success-delegate.svg'
					alt='success delegate icon'
				/>
				<label className='text-xl font-semibold text-bodyBlue dark:text-blue-dark-high'>
					{isCancelReferendaForm
						? 'Referendum Canceled Successfully '
						: isKillReferendumForm
							? 'Referendum Killed successfully'
							: isCreateReferendumForm
								? 'Referendum created successfully'
								: 'Proposal created successfully for'}
				</label>
				{fundingAmount && (
					<span className='mt-2 text-2xl font-semibold text-pink_primary'>
						<div className='font-medium text-bodyBlue dark:text-blue-dark-high'>
							{generalIndex ? (
								<div className='flex items-center gap-1'>
									{getBeneficiaryAmountAndAsset({ amount: fundingAmount.toString(), assetId: generalIndex, isProposalCreationFlow: true, network })}
								</div>
							) : (
								<div className='flex items-center gap-1'>
									<span className='flex items-center gap-1'>
										{formatedBalance(fundingAmount.toString(), unit)}
										{unit}
									</span>
								</div>
							)}
						</div>
					</span>
				)}
				{proposerAddress && beneficiaryAddresses && beneficiaryAddresses?.[0]?.address?.length > 0 && selectedTrack && preimageHash && preimageLength && (
					<div className='my-2 flex'>
						<div className='mt-[10px] flex flex-col gap-1.5 text-sm text-lightBlue dark:text-blue-dark-medium'>
							<span className='flex'>
								<span className='w-[172px]'>Proposer Address:</span>
								<Address
									addressClassName='text-bodyBlue dark:text-blue-dark-high font-semibold text-sm'
									address={proposerAddress}
									isTruncateUsername={false}
									iconSize={18}
								/>
							</span>
							<span className='flex'>
								<span className='w-[172px]'>Beneficiary Address:</span>
								<div className='flex flex-col gap-2'>
									{beneficiaryAddresses?.map((beneficiary, index) => (
										<Beneficiary
											beneficiary={beneficiary}
											key={index}
											disableBalanceFormatting
											assetId={generalIndex}
											isProposalCreationFlow
										/>
									))}
								</div>
							</span>

							<span className='flex'>
								<span className='w-[172px]'>Track:</span>
								<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
									{selectedTrack}
									<span className='ml-1 text-pink_primary'>#{networkTrackInfo[network][selectedTrack]?.trackId || 0}</span>
								</span>
							</span>
							<span className='flex'>
								<span className='w-[172px]'>Funding Amount:</span>
								<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>
									{fundingAmount ? (
										generalIndex ? (
											<div className='flex items-center gap-1'>
												{getBeneficiaryAmountAndAsset({ amount: fundingAmount.toString(), assetId: generalIndex, isProposalCreationFlow: true, network })}
												<HelperTooltip
													text={
														<div className='flex items-center gap-1 dark:text-blue-dark-high'>
															<span>Current value:</span>
															<span>
																{getUsdValueFromAsset({
																	currentTokenPrice: currentTokenPrice || '0',
																	dedTokenUsdPrice: dedTokenUsdPrice || '0',
																	generalIndex,
																	inputAmountValue: inputAmountValue || '0',
																	network
																}) || 0}{' '}
																{chainProperties[network].tokenSymbol}
															</span>
														</div>
													}
												/>
											</div>
										) : (
											<div className='flex items-center gap-1'>
												<span className='flex items-center gap-1'>
													{formatedBalance(fundingAmount.toString(), unit)}
													{unit}
												</span>
												<HelperTooltip
													text={
														<div className='flex items-center gap-1 dark:text-blue-dark-high'>
															<span>Current value:</span>
															<span>{Math.floor(Number(inputAmountValue) * Number(currentTokenPrice) || 0)} USD </span>
														</div>
													}
												/>
											</div>
										)
									) : null}
									{!generalIndex && unit}
								</span>
							</span>
							<span className='flex items-center'>
								<span className='w-[172px]'>Preimage Hash:</span>
								<span className='font-medium  text-bodyBlue dark:text-blue-dark-high'>{preimageHash.slice(0, 10) + '...' + preimageHash.slice(55)}</span>
							</span>
							<span className='flex'>
								<span className='w-[172px]'>Preimage Length:</span>
								<span className='font-medium text-bodyBlue dark:text-blue-dark-high'>{preimageLength}</span>
							</span>
						</div>
					</div>
				)}
				<Alert
					className='mt-6 rounded-[4px] text-bodyBlue'
					showIcon
					type='info'
					message={
						<span className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
							Place a decision deposit in {blocksToRelevantTime(network, Number(trackMetaData.decisionPeriod + trackMetaData.preparePeriod))} to prevent your proposal from being
							timed out.
						</span>
					}
					description={
						<Link
							href={`https://${network}.polkassembly.io/referenda/${postId}`}
							className='cursor-pointer text-xs font-medium text-pink_primary'
							target='_blank'
							rel='noopener noreferrer'
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
