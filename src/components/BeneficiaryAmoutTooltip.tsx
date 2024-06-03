// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import BN from 'bn.js';
import { chainProperties } from '~src/global/networkConstants';
import { useCurrentTokenDataSelector, useNetworkSelector } from '~src/redux/selectors';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import getBeneficiaryAmoutAndAsset from '~src/util/getBeneficiaryAmoutAndAsset';
import { formatedBalance } from '~src/util/formatedBalance';
import dayjs from 'dayjs';
import { CustomStatus } from './Listing/Tracks/TrackListingCard';
import { getStatusesFromCustomStatus } from '~src/global/proposalType';
import { parseBalance } from './Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { Spin } from 'antd';

interface Args {
	className?: string;
	requestedAmt: string;
	assetId: string | null;
	proposalCreatedAt: Date | null;
	timeline: any[];
	postId: number;
}

const BeneficiaryAmoutTooltip = ({ className, requestedAmt, assetId, proposalCreatedAt, timeline, postId }: Args) => {
	const { network } = useNetworkSelector();
	const { currentTokenPrice } = useCurrentTokenDataSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const requestedAmountFormatted = requestedAmt ? new BN(requestedAmt).div(new BN(10).pow(new BN(chainProperties?.[network]?.tokenDecimals))).toString() : 0;
	const [isProposalClosed, setIsProposalClosed] = useState<boolean>(false);
	const [usdValueOnCreation, setUsdValueOnCreation] = useState<string | null>(dayjs(proposalCreatedAt).isSame(dayjs()) ? currentTokenPrice : null);
	const [usdValueOnClosed, setUsdValueOnClosed] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const fetchUSDValue = async () => {
		if (!proposalCreatedAt || assetId || dayjs(proposalCreatedAt).isSame(dayjs())) return;
		const closedStatuses = getStatusesFromCustomStatus(CustomStatus.Closed);
		setLoading(true);
		let proposalClosedStatusDetails: any = null;
		timeline?.[0]?.statuses.map((status: any) => {
			if (closedStatuses.includes(status.status)) {
				proposalClosedStatusDetails = status;
			}
			setIsProposalClosed(!!proposalClosedStatusDetails);
		});

		const { data, error } = await nextApiClientFetch<{ usdValueOnClosed: string | null; usdValueOnCreation: string | null }>('/api/v1/treasuryProposalUSDValues', {
			closedStatus: proposalClosedStatusDetails || null,
			postId: postId,
			proposalCreatedAt: proposalCreatedAt || null
		});

		if (data) {
			setUsdValueOnCreation(data.usdValueOnCreation ? String(Number(data.usdValueOnCreation).toFixed(2)) : null);
			setUsdValueOnClosed(data.usdValueOnClosed ? String(Number(data.usdValueOnClosed).toFixed(2)) : null);
			setLoading(false);
		} else if (error) {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUSDValue();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className={className}>
			{assetId ? (
				<div className={'flex items-center gap-1'}>
					<span className='text-lightBlue hover:text-lightBlue dark:text-blue-dark-high hover:dark:text-blue-dark-high'>
						{getBeneficiaryAmoutAndAsset(assetId, requestedAmt.toString(), network)}
					</span>
					<HelperTooltip
						overlayClassName='w-96'
						text={
							<Spin spinning={loading}>
								<div className='flex flex-col gap-1 text-xs'>
									<div className='flex items-center gap-1 dark:text-blue-dark-high'>
										<span>{isProposalClosed ? 'Value on day of txn:' : 'Current value:'}</span>
										<span>
											{parseBalance(
												String(
													Math.floor(
														(Number(new BN(requestedAmt).div(new BN('1000000')).toString()) /
															Number(isProposalClosed ? usdValueOnClosed || currentTokenPrice : currentTokenPrice) || 0) *
															10 ** chainProperties[network]?.tokenDecimals || 0
													)
												),
												0,
												false,
												network
											)}{' '}
											{chainProperties[network]?.tokenSymbol}
										</span>
									</div>
									<div className='flex items-center gap-1 dark:text-blue-dark-high'>
										<span>Value on day of creation:</span>
										<span>
											{parseBalance(
												String(
													Math.floor(
														(Number(new BN(requestedAmt).div(new BN('1000000')).toString()) / Number(usdValueOnCreation || currentTokenPrice) || 0) *
															(10 ** chainProperties[network]?.tokenDecimals || 0)
													)
												),
												0,
												false,
												network
											)}{' '}
											{chainProperties[network]?.tokenSymbol}
										</span>
									</div>
								</div>
							</Spin>
						}
					/>
				</div>
			) : (
				<div className={'flex items-center gap-1'}>
					<span className='whitespace-pre text-sm font-medium text-lightBlue dark:text-blue-dark-high'>
						{formatedBalance(requestedAmt, unit, 0)} {chainProperties?.[network]?.tokenSymbol}
					</span>

					<HelperTooltip
						overlayClassName='w-96'
						text={
							<Spin spinning={loading}>
								<div className='flex flex-col gap-1 text-xs'>
									<div className='flex items-center gap-1 dark:text-blue-dark-high'>
										<span>{isProposalClosed ? 'Value on day of txn:' : 'Current value:'}</span>
										<span>
											{parseBalance(
												String(
													Math.floor(Number(requestedAmountFormatted) * Number(isProposalClosed ? usdValueOnClosed || currentTokenPrice : currentTokenPrice) || 0) *
														10 ** chainProperties[network]?.tokenDecimals || 0
												),
												0,
												false,
												network
											)}{' '}
											USD{' '}
										</span>
									</div>
									<div className='flex items-center gap-1 dark:text-blue-dark-high'>
										<span>Value on day of creation:</span>
										<span>
											{parseBalance(
												String(
													Math.floor(Number(requestedAmountFormatted) * Number(usdValueOnCreation || currentTokenPrice) * (10 ** chainProperties[network]?.tokenDecimals || 0) || 0)
												),
												0,
												false,
												network
											)}{' '}
											USD{' '}
										</span>
									</div>
								</div>
							</Spin>
						}
					/>
				</div>
			)}
		</div>
	);
};
export default BeneficiaryAmoutTooltip;
