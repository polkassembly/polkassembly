// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { treasuryAssets, chainProperties } from '~src/global/networkConstants';
import { EAssets } from '~src/components/OpenGovTreasuryProposal/types';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { getGeneralIndexFromAsset } from './getGeneralIndexFromAsset';

const getBeneficiaryAmountAndAsset = (assetId: string, amount: string, network: string, isProposalCreationFlow?: boolean) => {
	const bnAmount = new BN(amount || 0);
	if (isProposalCreationFlow) {
		const divBn = new BN(10).pow(new BN(String(chainProperties[network].tokenDecimals || 0)));
		switch (assetId) {
			case getGeneralIndexFromAsset({ asset: EAssets.USDT, network }):
				return `${bnAmount.div(divBn).toString()} USDT`;
			case getGeneralIndexFromAsset({ asset: EAssets.USDC, network }):
				return `${bnAmount.div(divBn).toString()} USDC`;
			case getGeneralIndexFromAsset({ asset: EAssets.DED, network }):
				return `${bnAmount.div(divBn).toString()} DED`;
		}
	} else {
		switch (assetId) {
			case getGeneralIndexFromAsset({ asset: EAssets.USDT, network }):
				return `${parseBalance(
					bnAmount
						.mul(new BN('10').pow(new BN(String(chainProperties[network]?.tokenDecimals || 0))).div(new BN('10').pow(new BN(String(treasuryAssets.USDT.tokenDecimal || 0)))))
						.toString(),
					0,
					false,
					network
				)} USDT`;
			case getGeneralIndexFromAsset({ asset: EAssets.USDC, network }):
				return `${parseBalance(
					bnAmount
						.mul(new BN('10').pow(new BN(String(chainProperties[network]?.tokenDecimals || 0))).div(new BN('10').pow(new BN(String(treasuryAssets.USDC.tokenDecimal || 0)))))
						.toString(),
					0,
					false,
					network
				)} USDC`;
			case getGeneralIndexFromAsset({ asset: EAssets.DED, network }):
				return `${parseBalance(
					bnAmount
						.mul(new BN('10').pow(new BN(String(chainProperties[network]?.tokenDecimals || 0))).div(new BN('10').pow(new BN(String(treasuryAssets.DED.tokenDecimal || 0)))))
						.toString(),
					0,
					false,
					network
				)} DED`;
		}
	}
};

export default getBeneficiaryAmountAndAsset;
