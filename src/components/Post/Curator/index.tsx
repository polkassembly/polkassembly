// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Alert } from 'antd';
import { useApiContext } from '~src/context';
// import { useDispatch } from 'react-redux';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import executeTx from '~src/util/executeTx';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import CuratorProposalActionButton from '~src/components/Bounties/curatorProposal';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import { ProposalType } from '~src/global/proposalType';
import { bountyStatus } from '~src/global/statuses';

interface Props {
	curator?: string;
	proposer?: string;
	method?: string;
	status?: string;
	postId: number;
	bountyId?: string | number;
}

const Curator = ({ proposer, postId, method, status, bountyId }: Props) => {
	const { network } = useNetworkSelector();
	const [loading, setLoading] = useState(false);
	const [hasCurator, setHasCurator] = useState(false);
	const { api, apiReady } = useApiContext();
	const { defaultAddress, id } = useUserDetailsSelector();

	useEffect(() => {
		const fetchCuratorFromId = async () => {
			if (bountyId) {
				const { data, error } = await nextApiClientFetch<IPostResponse>(`/api/v1/posts/on-chain-post?postId=${bountyId}&proposalType=${ProposalType.REFERENDUM_V2}`);
				if (data) {
					setHasCurator(!!data.curator);
				} else if (error) {
					console.error(error);
				}
			}
		};
		fetchCuratorFromId();
	}, [bountyId]);

	const handleAcceptCurator = async () => {
		if (!api || !apiReady || !proposer) return;
		const bountyId = postId;
		setLoading(true);
		const tx = api.tx.bounties.acceptCurator(bountyId);

		const onSuccess = () => {
			setLoading(false);
		};

		const onFailed = () => {
			queueNotification({
				header: 'failed!',
				message: 'Transaction failed!',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		};

		await executeTx({
			address: proposer,
			api,
			apiReady,
			errorMessageFallback: 'failed!',
			network,
			onFailed,
			onSuccess: onSuccess,
			tx: tx
		});
	};

	if (!id) return null;

	return (
		<>
			{method === 'propose_curator' && status === 'Executed' && (
				<Alert
					className={`mb-2 rounded-[4px] dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark ${loading ? 'cursor-not-allowed' : ''}`}
					type='info'
					showIcon
					message={
						<span className='text-bodyBlue dark:text-blue-dark-high'>
							<span
								className='cursor-pointer font-semibold text-pink_primary dark:text-blue-dark-helper'
								onClick={handleAcceptCurator}
							>
								Accept
							</span>{' '}
							as Curator
						</span>
					}
				/>
			)}
			{proposer === defaultAddress && method === 'approve_bounty' && status === bountyStatus.ACTIVE && !hasCurator && (
				<Alert
					className='mb-2 rounded-[4px] dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark'
					showIcon
					message={
						<span className='flex gap-x-2 dark:text-blue-dark-high'>
							<CuratorProposalActionButton
								className='cursor-pointer font-semibold text-pink_primary dark:text-blue-dark-helper'
								postId={postId}
							/>
							to your referendum to proceed with bounty creation
						</span>
					}
					type='info'
				/>
			)}
		</>
	);
};

export default Curator;
