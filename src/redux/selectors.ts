// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useSelector } from 'react-redux';
import { TAppState } from './store';
import { INetworkStore } from './network/@types';
import { IUserDetailsStore } from './userDetails/@types';
import { IUnlockTokenskDataStore } from './tokenUnlocksData/@types';
import { ICurrentTokenPriceStore } from './currentTokenPrice/@types';
import { ICurvesInformationStore } from './curvesInformation/@types';
import { ITippingStore } from './tipping/@types';
import { ITreasuryProposalStore } from './treasuryProposal/@types';
import { IVoteDataStore } from './voteData/@types';
import { IinitialConnectAddress } from './initialConnectAddress/@types';
import { IGov1TreasuryProposalStore } from './gov1TreasuryProposal/@types';
import { IRemoveIdentityStore } from './removeIdentity/@types';
import { ITrackLevelAnalyticsStore } from './trackLevelAnalytics/@types';
import { IOnChainIdentityStore } from './onchainIdentity/@types';
import { IInAppNotificationsStore } from './inAppNotifications/@types';
import { IBatchVoteStore } from './batchVoting/@types';
import { IAmbassadorStore } from './addAmbassadorSeeding/@types';
import { IAmbassadorReplaceStore } from './replaceAmbassador/@types';
import { IClaimPayoutStore } from './claimProposalPayout/@types';
import { IAssetsCurrentPriceStore } from './assetsCurrentPrices/@types';
import { IProgressReportStore } from './progressReport/@types';
import { IGlobalStore } from './global/@types';
import { IChildBountyCreationStore } from './childBountyCreation/@types';

const useNetworkSelector = () => {
	return useSelector<TAppState, INetworkStore>((state) => state?.network);
};

const useUserDetailsSelector = () => {
	return useSelector<TAppState, IUserDetailsStore>((state) => state.userDetails);
};

const useUserUnlockTokensDataSelector = () => {
	return useSelector<TAppState, IUnlockTokenskDataStore>((state) => state.userUnlockTokensData);
};

const useCurrentTokenDataSelector = () => {
	return useSelector<TAppState, ICurrentTokenPriceStore>((state) => state.currentTokenPrice);
};

const useCurvesInformationSelector = () => {
	return useSelector<TAppState, ICurvesInformationStore>((state) => state.curvesInformation);
};

const useTippingDataSelector = () => {
	return useSelector<TAppState, ITippingStore>((state) => state.tipping);
};

const useTreasuryProposalSelector = () => {
	return useSelector<TAppState, ITreasuryProposalStore>((state) => state.treasuryProposal);
};

const useVoteDataSelector = () => {
	return useSelector<TAppState, IVoteDataStore>((state) => state.voteData);
};

const useInitialConnectAddress = () => {
	return useSelector<TAppState, IinitialConnectAddress>((state) => state.initialConnectAddress);
};

const useGov1treasuryProposal = () => {
	return useSelector<TAppState, IGov1TreasuryProposalStore>((state) => state.gov1TreasuryProposal);
};

const useRemoveIdentity = () => {
	return useSelector<TAppState, IRemoveIdentityStore>((state) => state.removeIdentity);
};

const useTrackLevelAnalytics = () => {
	return useSelector<TAppState, ITrackLevelAnalyticsStore>((state) => state.trackLevelAnalytics);
};
const useOnchainIdentitySelector = () => {
	return useSelector<TAppState, IOnChainIdentityStore>((state) => state.onchainIdentity);
};

const useInAppNotificationsSelector = () => {
	return useSelector<TAppState, IInAppNotificationsStore>((state) => state.inAppNotifications);
};

const useAmbassadorSeedingSelector = () => {
	return useSelector<TAppState, IAmbassadorStore>((state) => state.addAmbassador);
};
const useAmbassadorRemovalSelector = () => {
	return useSelector<TAppState, IAmbassadorStore>((state) => state.ambassadorRemoval);
};
const useAmbassadorReplacementSelector = () => {
	return useSelector<TAppState, IAmbassadorReplaceStore>((state) => state.ambassadorReplacement);
};

const useBatchVotesSelector = () => {
	return useSelector<TAppState, IBatchVoteStore>((state) => state.batchVote);
};

const useProgressReportSelector = () => {
	return useSelector<TAppState, IProgressReportStore>((state) => state.progressReport);
};
const useGlobalSelector = () => {
	return useSelector<TAppState, IGlobalStore>((state) => state.global);
};

const useClaimPayoutSelector = () => {
	return useSelector<TAppState, IClaimPayoutStore>((state) => state.claimPayout);
};

const useAssetsCurrentPriceSelector = () => {
	return useSelector<TAppState, IAssetsCurrentPriceStore>((state) => state.assetsCurrentPrice);
};

const useChildBountyCreationSelector = () => {
	return useSelector<TAppState, IChildBountyCreationStore>((state) => state.childBountyCreation);
};

export {
	useNetworkSelector,
	useUserDetailsSelector,
	useUserUnlockTokensDataSelector,
	useCurrentTokenDataSelector,
	useCurvesInformationSelector,
	useTippingDataSelector,
	useTreasuryProposalSelector,
	useVoteDataSelector,
	useInitialConnectAddress,
	useGov1treasuryProposal,
	useRemoveIdentity,
	useTrackLevelAnalytics,
	useOnchainIdentitySelector,
	useInAppNotificationsSelector,
	useAmbassadorSeedingSelector,
	useBatchVotesSelector,
	useAmbassadorRemovalSelector,
	useAmbassadorReplacementSelector,
	useClaimPayoutSelector,
	useAssetsCurrentPriceSelector,
	useProgressReportSelector,
	useGlobalSelector,
	useChildBountyCreationSelector
};
