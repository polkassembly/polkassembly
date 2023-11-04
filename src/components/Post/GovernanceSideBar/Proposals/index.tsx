// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useEffect, useState } from 'react';
import { LoadingStatusType } from 'src/types';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import { useApiContext } from '~src/context';
import useHandleMetaMask from '~src/hooks/useHandleMetaMask';

import ProposalVoteInfo from './ProposalVoteInfo';
import SecondProposal, { SecondProposalProps } from './SecondProposal';
import SecondProposalEth from './SecondProposalEth';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';

type IProposalDisplayProps = SecondProposalProps & {
	canVote: boolean;
	status?: string;
	seconds?: any;
};

const ProposalDisplay: FC<IProposalDisplayProps> = (props) => {
	const { proposalId, accounts, address, canVote, getAccounts, onAccountChange, seconds } = props;
	const { api, apiReady } = useApiContext();
	const [deposit, setDeposit] = useState('');
	const { network } = useNetworkSelector();
	const { walletConnectProvider } = useUserDetailsSelector();
	const metaMaskError = useHandleMetaMask();
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: false, message: 'Loading proposal info' });

	useEffect(() => {
		setLoadingStatus((prev) => ({
			...prev,
			isLoading: true
		}));
		if (!api || !apiReady) return;
		setDeposit(api.consts.democracy?.minimumDeposit?.toString() || '0');
		setLoadingStatus((prev) => ({
			...prev,
			isLoading: false
		}));
	}, [api, apiReady]);

	return (
		<GovSidebarCard>
			<h6 className='dashboard-heading mb-6 dark:text-white'>Second this Proposal!</h6>
			{canVote && (
				<>
					{['moonbase', 'moonbeam', 'moonriver'].includes(network) ? (
						<>
							{metaMaskError && !walletConnectProvider?.wc.connected && <>{metaMaskError}</>}
							{(!metaMaskError || walletConnectProvider?.wc.connected) && (
								<SecondProposalEth
									proposalId={proposalId}
									seconds={seconds}
								/>
							)}
						</>
					) : (
						<SecondProposal
							accounts={accounts}
							address={address}
							getAccounts={getAccounts}
							onAccountChange={onAccountChange}
							proposalId={proposalId}
						/>
					)}
				</>
			)}
			{(proposalId || proposalId === 0) && (
				<ProposalVoteInfo
					deposit={deposit}
					loadingStatus={loadingStatus}
					seconds={seconds}
				/>
			)}
		</GovSidebarCard>
	);
};

export default ProposalDisplay;
