// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { chainProperties } from '~src/global/networkConstants';
import { useAssetsCurrentPriceSelector, useCurrentTokenDataSelector, useNetworkSelector } from '~src/redux/selectors';
import { IBeneficiary } from '~src/types';
import { getUsdValueFromAsset } from './OpenGovTreasuryProposal/utils/getUSDValueFromAsset';
import getAssetDecimalFromAssetId from './OpenGovTreasuryProposal/utils/getAssetDecimalFromAssetId';
import { useEffect, useState } from 'react';
import Popover from '~src/basic-components/Popover';
import { parseBalance } from './Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { Divider, Spin } from 'antd';
import getBeneficiaryAmountAndAsset from './OpenGovTreasuryProposal/utils/getBeneficiaryAmountAndAsset';
import dayjs from 'dayjs';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { InfoCircleOutlined } from '@ant-design/icons';
import { inputToBn } from '~src/util/inputToBn';
import classNames from 'classnames';
import { useTheme } from 'next-themes';
import { dmSans } from 'pages/_app';
import styled from 'styled-components';

interface Props {
	className?: string;
	beneficiaries: IBeneficiary[];
	proposalCreatedAt: Date | null;
	timeline: any[];
	postId: number;
}
const ZERO_BN = new BN(0);

const AmountAccToGenralIndex = ({ beneficiary }: { beneficiary: IBeneficiary }) => {
	const { network } = useNetworkSelector();
	return (
		<div className='text-xs font-medium text-blue-dark-high'>
			{beneficiary?.genralIndex ? (
				<div>{getBeneficiaryAmountAndAsset(beneficiary?.genralIndex, beneficiary.amount.toString(), network)}</div>
			) : (
				<div>{parseBalance(beneficiary?.amount?.toString(), 0, true, network)}</div>
			)}
		</div>
	);
};

const MultipleBeneficiariesAmount = ({ className, beneficiaries, postId, proposalCreatedAt, timeline }: Props) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const { currentTokenPrice } = useCurrentTokenDataSelector();
	const { dedTokenUsdPrice = '0' } = useAssetsCurrentPriceSelector();
	const [totalAmountInChainSymbol, setTotalAmountInChainSymbol] = useState<string>('0');
	const [isGenralIndexExist, setIsGenralIndexExist] = useState<boolean>(false);
	const [isSameAssetUsed, setIsSameAssetUsed] = useState<boolean>(false);

	const [usdValueOnCreation, setUsdValueOnCreation] = useState<string | null>(dayjs(proposalCreatedAt).isSame(dayjs()) ? currentTokenPrice : null);
	const [isProposalClosed, setIsProposalClosed] = useState<boolean>(false);
	const [usdValueOnClosed, setUsdValueOnClosed] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [bnUsdValueOnClosed, setBnUsdValueOnClosed] = useState<BN>(ZERO_BN);
	const requestedAmountFormatted = totalAmountInChainSymbol ? new BN(totalAmountInChainSymbol).div(new BN(10).pow(new BN(chainProperties?.[network]?.tokenDecimals))) : ZERO_BN;

	const checkOnGenralIndexBeneficiaries = async () => {
		if (beneficiaries?.length == 1 || !beneficiaries?.length) return { genralIndex: beneficiaries[0]?.genralIndex, isSame: true };
		const firstGenralIndex = beneficiaries[0]?.genralIndex;
		return {
			genralIndex: beneficiaries?.find((beneficiary) => beneficiary?.genralIndex)?.genralIndex,
			isSame: beneficiaries.every((item) => item.genralIndex === firstGenralIndex)
		};
	};

	const fetchUSDValue = async () => {
		if (!proposalCreatedAt || dayjs(proposalCreatedAt).isSame(dayjs())) return;
		const passedProposalStatuses = ['Executed', 'Confirmed', 'Approved'];
		setLoading(true);
		let proposalClosedStatusDetails: any = null;
		timeline?.[0]?.statuses.map((status: any) => {
			if (passedProposalStatuses.includes(status.status)) {
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
			const [bnClosed] = inputToBn(data.usdValueOnClosed ? String(Number(data.usdValueOnClosed)) : '0', network, false);
			setUsdValueOnCreation(data.usdValueOnCreation ? String(Number(data.usdValueOnCreation)) : null);
			setUsdValueOnClosed(data.usdValueOnClosed ? String(Number(data.usdValueOnClosed)) : null);
			setBnUsdValueOnClosed(bnClosed);
			setLoading(false);
		} else if (error) {
			console.log(error);
			setLoading(false);
		}
		setLoading(false);
	};

	const handleBeneficiaryAmount = async () => {
		if (!beneficiaries?.length || beneficiaries?.length == 1) return;

		const { genralIndex, isSame } = await checkOnGenralIndexBeneficiaries();

		setIsGenralIndexExist(Boolean(genralIndex));
		setIsSameAssetUsed(isSame);

		if (isSame && !genralIndex) {
			const totalAmount = beneficiaries.reduce((acc, item) => acc.add(new BN(item.amount)), new BN(0))?.toString();

			setTotalAmountInChainSymbol(totalAmount || '0');
		} else {
			let totalAmount = new BN(0);
			beneficiaries?.map((beneficiary: IBeneficiary) => {
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

			setTotalAmountInChainSymbol(totalAmount?.toString() || '0');
		}
	};

	useEffect(() => {
		handleBeneficiaryAmount();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, beneficiaries, currentTokenPrice, dedTokenUsdPrice]);

	useEffect(() => {
		fetchUSDValue();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [proposalCreatedAt, timeline, postId]);

	if (!beneficiaries?.length || beneficiaries?.length == 1) return null;
	return (
		<div className={className}>
			<Popover
				overlayClassName={classNames(dmSans?.className, dmSans?.variable, 'track-popover')}
				content={
					<div className='flex flex-col gap-2 rounded-md bg-[#363636] p-2 pr-4'>
						<div className='flex max-w-[300px] flex-wrap'>
							{beneficiaries?.map((beneficiary, index) => {
								return (
									<div
										key={index}
										className='flex items-center gap-1'
									>
										<div>
											<AmountAccToGenralIndex beneficiary={beneficiary} />
										</div>

										{beneficiaries?.length - 1 !== index && (
											<Divider
												type='vertical'
												className='bg-blue-dark-high'
											/>
										)}
									</div>
								);
							})}
						</div>
						<Spin spinning={loading}>
							{isSameAssetUsed && isGenralIndexExist && beneficiaries[0]?.genralIndex ? (
								<div className='flex flex-col gap-1 text-xs'>
									<div className='flex items-center gap-1 text-blue-dark-high'>
										<span className='font-normal'>{isProposalClosed ? 'Value on day of txn:' : 'Current value:'}</span>
										<span className='font-medium text-blue-dark-high'>
											{getUsdValueFromAsset({
												currentTokenPrice: isGenralIndexExist ? usdValueOnClosed || '0' : usdValueOnCreation || '0',
												dedTokenUsdPrice: dedTokenUsdPrice || '0',
												generalIndex: beneficiaries[0]?.genralIndex,
												inputAmountValue:
													new BN(beneficiaries.reduce((acc, item) => acc.add(new BN(item.amount)), new BN(0))?.toString())
														.div(
															new BN('10').pow(
																new BN(getAssetDecimalFromAssetId({ assetId: beneficiaries[0]?.genralIndex ? String(beneficiaries[0]?.genralIndex) : null, network }) || '0')
															)
														)
														.toString() || '0',
												network
											}) || 0}{' '}
											{chainProperties[network]?.tokenSymbol}
										</span>
									</div>
									<div className='flex items-center gap-1 text-blue-dark-high'>
										<span className='flex font-normal'>Value on day of creation:</span>
										<span className='font-medium text-blue-dark-high'>
											{getUsdValueFromAsset({
												currentTokenPrice: usdValueOnCreation || '0',
												dedTokenUsdPrice: dedTokenUsdPrice || '0',
												generalIndex: beneficiaries[0]?.genralIndex,
												inputAmountValue:
													new BN(beneficiaries.reduce((acc, item) => acc.add(new BN(item.amount)), new BN(0))?.toString())
														.div(
															new BN('10').pow(
																new BN(getAssetDecimalFromAssetId({ assetId: beneficiaries[0]?.genralIndex ? String(beneficiaries[0]?.genralIndex) : null, network }) || '0')
															)
														)
														.toString() || '0',
												network
											}) || 0}{' '}
											{chainProperties[network]?.tokenSymbol}
										</span>
									</div>
								</div>
							) : (
								<div className='flex flex-col gap-1 text-xs'>
									<div className='flex items-center gap-1 text-blue-dark-high'>
										<div className='flex font-normal'>{isProposalClosed ? 'Value on day of txn:' : 'Current value:'}</div>
										<span className='font-medium text-blue-dark-high'>
											{parseBalance(
												requestedAmountFormatted
													?.mul(
														!isProposalClosed
															? new BN(Number(currentTokenPrice) * 10 ** chainProperties?.[network]?.tokenDecimals)
															: !bnUsdValueOnClosed || bnUsdValueOnClosed?.eq(ZERO_BN)
															? new BN(Number(currentTokenPrice)).mul(new BN('10').pow(new BN(String(chainProperties?.[network]?.tokenDecimals))))
															: bnUsdValueOnClosed
													)
													?.toString() || '0',
												0,
												false,
												network
											)}{' '}
											USD{' '}
										</span>
									</div>
									<div className='flex items-center gap-1 text-blue-dark-high'>
										<span className='font-normal'>Value on day of creation:</span>
										<span className='font-mediumtext-blue-dark-high'>
											{parseBalance(
												requestedAmountFormatted?.mul(new BN(Number(usdValueOnCreation) * 10 ** chainProperties[network]?.tokenDecimals))?.toString() || '0',
												0,
												false,
												network
											)}{' '}
											USD{' '}
										</span>
									</div>
								</div>
							)}
						</Spin>
					</div>
				}
			>
				<>
					{
						<div className='flex gap-1 font-medium text-lightBlue dark:text-blue-dark-high'>
							{isGenralIndexExist && '$'}
							{parseBalance(
								isGenralIndexExist
									? requestedAmountFormatted?.mul(new BN(Number(currentTokenPrice) * 10 ** chainProperties?.[network]?.tokenDecimals))?.toString() || '0'
									: totalAmountInChainSymbol?.toString(),
								0,
								!isGenralIndexExist,
								network
							)}
							<InfoCircleOutlined className={classNames(theme == 'dark' ? 'text-icon-dark-inactive' : 'text-bodyBlue')} />
						</div>
					}
				</>
			</Popover>
		</div>
	);
};
export default styled(MultipleBeneficiariesAmount)`
	.track-popover .ant-popover-content .ant-popover-inner .ant-collapse {
		padding: 12px !important;
		border-radius: 4px !important;
		border: none !important;
		cursor: pointer !important;
	}
`;
