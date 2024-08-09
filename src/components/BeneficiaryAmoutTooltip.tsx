// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import BN from 'bn.js';
import { chainProperties, treasuryAssets } from '~src/global/networkConstants';
import { useAssetsCurrentPriceSelectior, useCurrentTokenDataSelector, useNetworkSelector } from '~src/redux/selectors';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import getBeneficiaryAmountAndAsset from '~src/components/OpenGovTreasuryProposal/utils/getBeneficiaryAmountAndAsset';
import dayjs from 'dayjs';
import { CustomStatus } from './Listing/Tracks/TrackListingCard';
import { getStatusesFromCustomStatus } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { Spin } from 'antd';
import { inputToBn } from '~src/util/inputToBn';
import { parseBalance } from './Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { formatedBalance } from '~src/util/formatedBalance';

interface Args {
	className?: string;
	requestedAmt: string;
	assetId: string | null;
	proposalCreatedAt: Date | null;
	timeline: any[];
	postId: number;
	usedInPostPage?: boolean;
}
const ZERO_BN = new BN(0);

const getBalanceFromGeneralIndex = (
	generalIndex: string,
	currentTokenPrice: string,
	usdValueOnClosed: string | null = '0',
	isProposalClosed: Boolean,
	dedTokenUsdPrice: string
) => {
	switch (generalIndex) {
		case '30':
			return String(((Number(currentTokenPrice) || 1) / (Number(dedTokenUsdPrice) || 1)) * 10 ** treasuryAssets.DED.tokenDecimal) || '0';
		case '1337':
			return String(10 ** treasuryAssets.USDC.tokenDecimal * Number((isProposalClosed ? usdValueOnClosed : currentTokenPrice || 1) || 1));
		case '1984':
			return String(10 ** treasuryAssets.USDT.tokenDecimal * Number((isProposalClosed ? usdValueOnClosed : currentTokenPrice || 1) || 1));
		default:
			return 0;
	}
};

const BeneficiaryAmoutTooltip = ({ className, requestedAmt, assetId, proposalCreatedAt, timeline, postId, usedInPostPage }: Args) => {
	const { network } = useNetworkSelector();
	const { currentTokenPrice } = useCurrentTokenDataSelector();
	const unit = chainProperties?.[network]?.tokenSymbol;
	const requestedAmountFormatted = requestedAmt ? new BN(requestedAmt).div(new BN(10).pow(new BN(chainProperties?.[network]?.tokenDecimals))) : ZERO_BN;
	const [isProposalClosed, setIsProposalClosed] = useState<boolean>(false);
	const [usdValueOnCreation, setUsdValueOnCreation] = useState<string | null>(dayjs(proposalCreatedAt).isSame(dayjs()) ? currentTokenPrice : null);
	const [usdValueOnClosed, setUsdValueOnClosed] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [bnUsdValueOnCreation, setBnUsdValueOnCreation] = useState<BN>(ZERO_BN);
	const [bnUsdValueOnClosed, setBnUsdValueOnClosed] = useState<BN>(ZERO_BN);
	const { dedTokenUsdPrice = '0' } = useAssetsCurrentPriceSelectior();

	const fetchUSDValue = async () => {
		if (!proposalCreatedAt || dayjs(proposalCreatedAt).isSame(dayjs())) return;
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
			const [bnCreation] = inputToBn(data.usdValueOnCreation ? String(Number(data.usdValueOnCreation)) : currentTokenPrice, network, false);
			const [bnClosed] = inputToBn(data.usdValueOnClosed ? String(Number(data.usdValueOnClosed)) : '0', network, false);

			setUsdValueOnCreation(data.usdValueOnCreation ? String(Number(data.usdValueOnCreation)) : null);
			setUsdValueOnClosed(data.usdValueOnClosed ? String(Number(data.usdValueOnClosed)) : null);
			setBnUsdValueOnClosed(bnClosed);
			setBnUsdValueOnCreation(bnCreation);
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
						{getBeneficiaryAmountAndAsset(assetId, requestedAmt.toString(), network)}
					</span>
					<HelperTooltip
						usedInPostPage={usedInPostPage}
						overlayClassName='w-96 mb-5'
						text={
							<Spin spinning={loading}>
								<div className='flex flex-col gap-1 text-xs'>
									<div className='flex items-center gap-1 dark:text-blue-dark-high'>
										<span>{isProposalClosed ? 'Value on day of txn:' : 'Current value:'}</span>
										<span>
											{parseBalance(
												new BN(requestedAmt)
													.div(new BN(getBalanceFromGeneralIndex(assetId, currentTokenPrice, usdValueOnClosed, isProposalClosed, dedTokenUsdPrice)))
													.mul(new BN(String(10 ** (chainProperties?.[network]?.tokenDecimals || 0))))
													.toString(),
												0,
												false,
												network
											)}{' '}
											{chainProperties[network]?.tokenSymbol}
										</span>
									</div>
									<div className='flex items-center gap-1 dark:text-blue-dark-high'>
										<span className='flex'>Value on day of creation:</span>
										<span>
											{parseBalance(
												new BN(requestedAmt)
													.div(new BN(String(getBalanceFromGeneralIndex(assetId, currentTokenPrice, usdValueOnCreation, isProposalClosed, dedTokenUsdPrice))))
													.mul(new BN(String(10 ** (chainProperties[network]?.tokenDecimals || 0))))
													.toString(),
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
						usedInPostPage={usedInPostPage}
						overlayClassName='mb-10'
						text={
							<Spin spinning={loading}>
								<div className='flex flex-col gap-1 text-xs'>
									<div className='flex items-center gap-1 dark:text-blue-dark-high'>
										<div className='flex'>{isProposalClosed ? 'Value on day of txn:' : 'Current value:'}</div>
										<span>
											{parseBalance(
												requestedAmountFormatted
													.mul(!isProposalClosed ? new BN(Number(currentTokenPrice) * 10 ** chainProperties?.[network]?.tokenDecimals) : bnUsdValueOnClosed)
													.toString(),
												0,
												false,
												network
											)}{' '}
											USD{' '}
										</span>
									</div>
									<div className='flex items-center gap-1 dark:text-blue-dark-high'>
										<span>Value on day of creation:</span>
										<span>{parseBalance(requestedAmountFormatted.mul(bnUsdValueOnCreation).toString(), 0, false, network)} USD </span>
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
