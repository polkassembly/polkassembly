// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useEffect, useState, useMemo } from 'react';
import { IAllVotesType } from 'pages/api/v1/votes/total';
import { LoadingStatusType } from '~src/types';
import { useTheme } from 'next-themes';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { getVotingTypeFromProposalType } from '~src/global/proposalType';
import { ProposalType } from '~src/global/proposalType';
import NoVotesIcon from '~assets/icons/analytics/no-votes.svg';
import Skeleton from '~src/basic-components/Skeleton';
import { BN } from '@polkadot/util';
import formatBnBalance from '~src/util/formatBnBalance';
import { useNetworkSelector } from '~src/redux/selectors';
import CirclePacking from './CirclePacking';

interface IVoteBubbleProps {
	postId: string;
	postType: ProposalType;
}

const createBnToIntBalance =
	(network: string) =>
	(bn: BN): number => {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

const VoteBubble: FC<IVoteBubbleProps> = ({ postId, postType }) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: true, message: 'Loading votes' });

	const voteType = getVotingTypeFromProposalType(postType);
	const [formattedVotesData, setFormattedVotesData] = useState<any[]>([]);
	const [noVotes, setNoVotes] = useState<boolean>(false);

	const colors = useMemo(
		() => ({
			abstain: theme === 'dark' ? '#407BFF80' : '#407BFF80',
			aye: theme === 'dark' ? '#64A05780' : '#2ED47A80',
			nay: theme === 'dark' ? '#BD202080' : '#E8486580'
		}),
		[theme]
	);

	const bnToIntBalance = useMemo(() => createBnToIntBalance(network), [network]);

	const getTotalVotes = async () => {
		setLoadingStatus({
			isLoading: true,
			message: 'Loading votes'
		});

		try {
			const { data, error } = await nextApiClientFetch<IAllVotesType>('api/v1/votes/total', {
				postId: postId,
				voteType: voteType
			});

			if (error || !data) {
				throw new Error(error || 'Failed to fetch votes');
			}

			const votesRes = data;
			if (votesRes?.totalCount === 0) {
				setNoVotes(true);
				setLoadingStatus({ isLoading: false, message: '' });
				return;
			}

			// Process data in a single iteration
			const formattedVotesData = votesRes?.data?.map((vote) => {
				const balance = bnToIntBalance(new BN(vote?.balance || '0'));
				const votingPower = bnToIntBalance(new BN(vote?.selfVotingPower || '0').add(new BN(vote?.delegatedVotingPower || '0')));
				let color;

				switch (vote.decision) {
					case 'yes':
						color = colors.aye;
						break;
					case 'no':
						color = colors.nay;
						break;
					default:
						color = colors.abstain;
				}

				return {
					balance,
					color,
					decision: vote.decision,
					lockPeriod: vote.lockPeriod,
					voter: vote.voter,
					votingPower
				};
			});

			setFormattedVotesData(formattedVotesData || []);
			setLoadingStatus({ isLoading: false, message: '' });
		} catch (err) {
			console.error('Error fetching votes:', err);
			setNoVotes(true);
			setLoadingStatus({ isLoading: false, message: '' });
		}
	};

	useEffect(() => {
		getTotalVotes();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postId, voteType]);

	if (noVotes) {
		return (
			<div className='flex flex-col items-center justify-center gap-5 p-10'>
				<NoVotesIcon />
				<p className='text-sm'>No votes have been casted yet</p>
			</div>
		);
	}

	if (loadingStatus.isLoading) {
		return <Skeleton className='h-[200px] w-full' />;
	}

	return (
		<div className='flex w-full flex-col items-center justify-center gap-2'>
			<CirclePacking
				data={formattedVotesData}
				name='votes'
			/>
			<div className='flex items-center justify-center gap-5'>
				<div className='flex items-center gap-2'>
					<span className='h-2 w-2 rounded-full bg-green-500/50' />
					<span className='text-sm'>Aye</span>
				</div>
				<div className='flex items-center gap-2'>
					<span className='h-2 w-2 rounded-full bg-red-500/50' />
					<span className='text-sm'>Nay</span>
				</div>
				<div className='flex items-center gap-2'>
					<span className='h-2 w-2 rounded-full bg-blue-500/50' />
					<span className='text-sm'>Abstain</span>
				</div>
			</div>
		</div>
	);
};

export default VoteBubble;
