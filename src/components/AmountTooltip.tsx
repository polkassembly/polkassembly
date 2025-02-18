// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useMemo, useState } from 'react';
import { useAssetsCurrentPriceSelector, useNetworkSelector } from '~src/redux/selectors';
import { fetchTokenPrice } from '~src/util/fetchTokenPrice';
import { IBeneficiary } from '~src/types';
import BN from 'bn.js';
import dayjs from 'dayjs';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { getStatusesFromCustomStatus } from '~src/global/proposalType';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import { inputToBn } from '~src/util/inputToBn';
import { Divider, Spin } from 'antd';
import { parseBalance } from './Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import Popover from '~src/basic-components/Popover';
import { dmSans } from 'pages/_app';
import classNames from 'classnames';
import styled from 'styled-components';
import getBeneficiaryAmountAndAsset from './OpenGovTreasuryProposal/utils/getBeneficiaryAmountAndAsset';
import { getUsdValueFromAsset } from './OpenGovTreasuryProposal/utils/getUSDValueFromAsset';
import getAssetDecimalFromAssetId from './OpenGovTreasuryProposal/utils/getAssetDecimalFromAssetId';
import { chainProperties } from '~src/global/networkConstants';
import { EAssets } from './OpenGovTreasuryProposal/types';
import { getGeneralIndexFromAsset } from './OpenGovTreasuryProposal/utils/getGeneralIndexFromAsset';
import { useTheme } from 'next-themes';
import { InfoCircleOutlined } from '@ant-design/icons';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';

interface AmountTooltipProps {
	beneficiaries: IBeneficiary[];
	proposalCreatedAt: Date;
	timeline: any[];
	postId: number | null;
	className?: string;
}

const ZERO_BN = new BN(0);

const findClosedStatusInTimeline = (timeline: any[]) => {
	const passedProposalStatuses = getStatusesFromCustomStatus(CustomStatus.Closed);
	return timeline?.[0]?.statuses.find((item: any) => passedProposalStatuses.includes(item.status));
};

const calculateCurrentValue = ({
	currentTokenPrice,
	dedTokenUsdPrice,
	beneficiaries,
	network
}: {
	currentTokenPrice: string;
	dedTokenUsdPrice: string;
	beneficiaries: IBeneficiary[];
	network: string;
}) => {
	const usdGeneralIndex = [getGeneralIndexFromAsset({ asset: EAssets.USDT, network }), getGeneralIndexFromAsset({ asset: EAssets.USDC, network })];
	//all assetId are same
	const isSameAsset = beneficiaries?.every((beneficiary) => beneficiary?.genralIndex === beneficiaries[0]?.genralIndex);

	//if all beneficiaries have same assetId and it is not USD
	if (isSameAsset && !usdGeneralIndex.includes(beneficiaries[0]?.genralIndex || '')) {
		const amount = beneficiaries.reduce((acc, item) => acc.add(new BN(item.amount)), new BN(0));
		//if any beneficiary has generalIndex
		if (beneficiaries.some((beneficiary) => beneficiary?.genralIndex)) {
			return getBeneficiaryAmountAndAsset({ amount: amount.toString(), assetId: beneficiaries[0]?.genralIndex || '', network });
		}
		//if all beneficiaries have no generalIndex
		return parseBalance(amount.toString(), 2, true, network);
	} else {
		return calculateAmountValue({ beneficiaries, currentTokenPrice, dedTokenUsdPrice, network });
	}
};

const calculateAmountValue = ({
	currentTokenPrice,
	dedTokenUsdPrice,
	beneficiaries,
	network
}: {
	currentTokenPrice: string;
	dedTokenUsdPrice: string;
	beneficiaries: IBeneficiary[];
	network: string;
}) => {
	const [bnTokenPrice] = inputToBn(currentTokenPrice, network, false);

	//if all beneficiaries have no generalIndex
	if (!beneficiaries.some((beneficiary) => beneficiary?.genralIndex)) {
		const amount = beneficiaries.reduce((acc, item) => acc.add(new BN(item.amount)), new BN(0));
		return `${parseBalance(
			amount
				.mul(bnTokenPrice)
				.div(new BN(10).pow(new BN(chainProperties[network].tokenDecimals)))
				.toString(),
			2,
			false,
			network
		)} USD`;
	} else {
		//beneficiaries with non usd assets:
		const nonUsdGeneralIndex = [getGeneralIndexFromAsset({ asset: EAssets.DED, network }), getGeneralIndexFromAsset({ asset: EAssets.MYTH, network }), null];
		if (!beneficiaries.some((beneficiary) => nonUsdGeneralIndex.includes(beneficiary?.genralIndex || null))) {
			const amount = beneficiaries.reduce((acc, item) => acc.add(new BN(item.amount)), new BN(0));
			return `${beneficiaries?.length > 1 ? '$' : ''}${getBeneficiaryAmountAndAsset({
				amount: amount.toString(),
				assetId: getGeneralIndexFromAsset({ asset: EAssets.USDT, network }) || '',
				isProposalCreationFlow: false,
				network,
				withoutSymbol: beneficiaries?.length > 1
			})}`;
		} else {
			let totalAmount = ZERO_BN;
			//beneficiaries with multiple assets:
			beneficiaries?.map((beneficiary: IBeneficiary) => {
				//converting all amount to network token
				if (beneficiary?.genralIndex) {
					const amount = getUsdValueFromAsset({
						currentTokenPrice: currentTokenPrice || '0',
						dedTokenUsdPrice: dedTokenUsdPrice || '0',
						generalIndex: beneficiary?.genralIndex,
						inputAmountValue:
							new BN(beneficiary?.amount)
								.div(new BN('10').pow(new BN(getAssetDecimalFromAssetId({ assetId: beneficiary?.genralIndex ? String(beneficiary?.genralIndex) : null, network }) || '0')))
								.toString() || '0',
						network
					});

					totalAmount = totalAmount.add(
						Number(amount) > 0
							? new BN(amount || '0').mul(new BN('10').pow(new BN(chainProperties?.[network]?.tokenDecimals || '0')))
							: new BN(Number(amount) * 10 ** (chainProperties?.[network]?.tokenDecimals || 0))
					);
				} else {
					totalAmount = totalAmount.add(new BN(beneficiary?.amount || '0'));
				}
			});

			return `${parseBalance(
				totalAmount
					.mul(bnTokenPrice)
					.div(new BN(10).pow(new BN(chainProperties[network].tokenDecimals)))
					.toString(),
				2,
				false,
				network
			)} USD`;
		}
	}
};

const AmountTooltip = ({ beneficiaries, proposalCreatedAt, timeline, postId, className }: AmountTooltipProps) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const [tokenPrice, setTokenPrice] = useState<string>('0');
	const [loading, setLoading] = useState<boolean>(false);
	const [isProposalClosed, setIsProposalClosed] = useState<boolean>(false);
	const [usdValueOnClosed, setUsdValueOnClosed] = useState<string | null>(null);
	const [usdValueOnCreation, setUsdValueOnCreation] = useState<string | null>(null);
	const { dedTokenUsdPrice = '0' } = useAssetsCurrentPriceSelector();

	const currentValue = useMemo(() => {
		return calculateCurrentValue({ beneficiaries, currentTokenPrice: tokenPrice, dedTokenUsdPrice, network });
	}, [tokenPrice, dedTokenUsdPrice, beneficiaries, network]);

	const currentOrValueOnDayOfTxn = useMemo(() => {
		if (isProposalClosed && usdValueOnClosed) {
			return calculateAmountValue({ beneficiaries, currentTokenPrice: usdValueOnClosed, dedTokenUsdPrice, network });
		} else {
			return calculateAmountValue({ beneficiaries, currentTokenPrice: tokenPrice, dedTokenUsdPrice, network });
		}
	}, [isProposalClosed, usdValueOnClosed, tokenPrice, dedTokenUsdPrice, network, beneficiaries]);

	const valueOnDayOfCreation = useMemo(() => {
		return calculateAmountValue({ beneficiaries, currentTokenPrice: usdValueOnCreation || tokenPrice, dedTokenUsdPrice, network });
	}, [usdValueOnCreation, dedTokenUsdPrice, tokenPrice, network, beneficiaries]);

	const getTokenPrice = async () => {
		setLoading(true);
		try {
			const priceData = await fetchTokenPrice(network);
			if (priceData?.price) {
				setTokenPrice(priceData?.price);
			}
		} catch (error) {
			console.error('Error fetching token price:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchUSDValue = async () => {
		if (!proposalCreatedAt || dayjs(proposalCreatedAt).isSame(dayjs()) || (postId && isNaN(postId))) return;

		setLoading(true);

		const proposalClosedStatusDetails = findClosedStatusInTimeline(timeline);
		setIsProposalClosed(!!proposalClosedStatusDetails);

		const { data, error } = await nextApiClientFetch<{ usdValueOnClosed: string | null; usdValueOnCreation: string | null }>('api/v1/treasuryProposalUSDValues', {
			closedStatus: proposalClosedStatusDetails || null,
			postId: postId,
			proposalCreatedAt: proposalCreatedAt || null
		});

		if (error || !data) {
			console.log(error);
			setLoading(false);
			return;
		}
		setUsdValueOnClosed(data?.usdValueOnClosed ? Math.round(Number(data?.usdValueOnClosed))?.toString() : null);
		setUsdValueOnCreation(data?.usdValueOnCreation || null);
		setLoading(false);
	};

	useEffect(() => {
		if (!network) return;
		getTokenPrice();
		fetchUSDValue();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const popoverContent = () => {
		return (
			<Spin spinning={loading}>
				<div className='flex flex-col gap-2 px-4 py-3 font-medium dark:text-blue-dark-high'>
					{beneficiaries?.length > 1 && (
						<div className='flex gap-1'>
							{beneficiaries?.map((beneficiary, index) => (
								<div
									key={index}
									className='text-xs font-medium text-lightBlue dark:text-blue-dark-high'
								>
									{beneficiary?.genralIndex
										? getBeneficiaryAmountAndAsset({ amount: beneficiary.amount.toString(), assetId: beneficiary?.genralIndex || '', network })
										: parseBalance(beneficiary?.amount, 1, true, network)}
									{beneficiaries?.length - 1 !== index && (
										<Divider
											className='bg-section-light-container dark:bg-blue-dark-medium'
											orientation='right'
											type='vertical'
										/>
									)}
								</div>
							))}
						</div>
					)}

					<div className='flex items-center gap-1 text-xs'>
						<span className='font-normal text-bodyBlue dark:text-blue-dark-medium'>{isProposalClosed ? 'Value on day of txn:' : 'Current Value:'}</span>
						<span>{currentOrValueOnDayOfTxn}</span>
					</div>
					<div className='flex items-center gap-1 text-xs'>
						<span className='font-normal text-bodyBlue dark:text-blue-dark-medium'>Value on day of creation:</span>
						<span>{valueOnDayOfCreation}</span>
					</div>
				</div>
			</Spin>
		);
	};

	return (
		<div className={className}>
			{loading ? (
				<SkeletonButton active />
			) : (
				<Popover
					content={popoverContent}
					overlayClassName={classNames(dmSans?.className, dmSans?.variable, 'track-popover')}
					className=''
				>
					<div className='flex items-center gap-1'>
						<span>{currentValue}</span>
						<InfoCircleOutlined className={classNames(className, theme == 'dark' ? 'text-icon-dark-inactive' : 'text-bodyBlue')} />
					</div>
				</Popover>
			)}
		</div>
	);
};

export default styled(AmountTooltip)`
	.track-popover .ant-popover-content .ant-popover-inner .ant-collapse {
		padding: 12px !important;
		border-radius: 4px !important;
		border: none !important;
		cursor: pointer !important;
	}
`;
