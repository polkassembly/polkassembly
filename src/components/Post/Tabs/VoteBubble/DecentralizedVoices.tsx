// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useEffect, useState } from 'react';
import { useNetworkSelector } from '~src/redux/selectors';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { Divider } from 'antd';
import Image from 'next/image';
import DecentralizedVoicesModal from './DecentralizedVoicesModal';

interface IVoteData {
	voter: string;
	balance: number;
	votingPower: number;
	color: string;
	lockPeriod?: string;
	decision: string;
	delegators?: number;
}

interface IVoteStats {
	totalPower: number;
	decentralizedPower: number;
	ayePower: number;
	nayPower: number;
	percentages: {
		total: number;
		aye: number;
		nay: number;
	};
}

const calculateVoteStats = (votes: IVoteData[], delegates: any[]): IVoteStats => {
	const decentralizedVotes = votes.filter((vote) => delegates.some((delegate) => delegate.address === vote.voter));

	const totalPower = votes.reduce((acc, vote) => acc + vote.votingPower, 0);
	const decentralizedPower = decentralizedVotes.reduce((acc, vote) => acc + vote.votingPower, 0);
	const ayePower = decentralizedVotes.filter((vote) => vote.decision === 'aye').reduce((acc, vote) => acc + vote.votingPower, 0);
	const nayPower = decentralizedVotes.filter((vote) => vote.decision === 'nay').reduce((acc, vote) => acc + vote.votingPower, 0);

	return {
		ayePower,
		decentralizedPower,
		nayPower,
		percentages: {
			aye: Number(((ayePower / totalPower) * 100).toFixed(2)),
			nay: Number(((nayPower / totalPower) * 100).toFixed(2)),
			total: Number(((decentralizedPower / totalPower) * 100).toFixed(2))
		},
		totalPower
	};
};

interface IDecentralizedVoicesProps {
	votes: IVoteData[];
}

const DecentralizedVoices: FC<IDecentralizedVoicesProps> = ({ votes }) => {
	const { network } = useNetworkSelector();
	const [delegates, setDelegates] = useState<any[]>([]);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [voteStats, setVoteStats] = useState<IVoteStats>({
		ayePower: 0,
		decentralizedPower: 0,
		nayPower: 0,
		percentages: { aye: 0, nay: 0, total: 0 },
		totalPower: 0
	});
	const [decentralizedVotes, setDecentralizedVotes] = useState<IVoteData[]>([]);

	useEffect(() => {
		const loadDelegates = async () => {
			try {
				const delegatesModule = await import(`pages/api/v1/delegations/w3f-delegates-${network}.json`);
				setDelegates(delegatesModule.default || []);
			} catch (error) {
				console.error('Failed to load delegates:', error);
				setDelegates([]);
			}
		};
		loadDelegates();
	}, [network]);

	useEffect(() => {
		if (!delegates.length) return;

		const filteredVotes = votes.filter((vote) => delegates.some((delegate) => delegate.address === vote.voter));
		const stats = calculateVoteStats(votes, delegates);

		setDecentralizedVotes(filteredVotes);
		setVoteStats(stats);
	}, [delegates, votes]);

	return (
		<div>
			<div className='flex items-center gap-2'>
				<div className='flex w-full flex-col items-center justify-between gap-2 rounded-md bg-[#F6F8FB] px-2 py-1 text-xs dark:bg-[#353535] md:flex-row'>
					<div className='flex items-center gap-2'>
						<span className='text text-[#576D8B] dark:text-icon-dark-inactive'>Decentralized Voices </span>
						<span>
							{voteStats.percentages.total}% (~{formatUSDWithUnits(voteStats.decentralizedPower.toString(), 2)})
						</span>
					</div>
					<Divider
						className='hidden bg-section-light-container dark:bg-blue-dark-medium md:block'
						orientation='right'
						type='vertical'
					/>
					<div className='flex items-center gap-2'>
						<span className='text text-[#576D8B] dark:text-icon-dark-inactive'>Aye </span>
						<span>
							{voteStats.percentages.aye}% (~{formatUSDWithUnits(voteStats.ayePower.toString(), 2)})
						</span>
						<Divider
							className='bg-section-light-container dark:bg-blue-dark-medium'
							orientation='right'
							type='vertical'
						/>
						<span className='text text-[#576D8B] dark:text-icon-dark-inactive'>Nay </span>
						<span>
							{voteStats.percentages.nay}% (~{formatUSDWithUnits(voteStats.nayPower.toString(), 2)})
						</span>
					</div>
				</div>
				<button
					onClick={() => setOpenModal(true)}
					className='relative flex items-center justify-center border-none bg-transparent p-0 outline-none'
				>
					<span className='block h-6 w-6 rounded-md bg-white p-0 dark:bg-[#353535]' />
					<Image
						src='/assets/icons/decentralized-voices-menu-icon.svg'
						alt='menu icon'
						width={26}
						height={26}
						className='absolute inset-0 -left-[1px] filter dark:grayscale dark:invert'
					/>
				</button>
			</div>
			<DecentralizedVoicesModal
				open={openModal}
				setOpen={setOpenModal}
				totalVotingPower={voteStats.totalPower}
				decentralizedVotes={decentralizedVotes}
				decentralizedVotingPower={voteStats.decentralizedPower}
				decentralizedAyeVotes={voteStats.ayePower}
				decentralizedNayVotes={voteStats.nayPower}
				decentralizedVotingPowerPercentage={voteStats.percentages.total}
				decentralizedAyeVotesPercentage={voteStats.percentages.aye}
				decentralizedNayVotesPercentage={voteStats.percentages.nay}
			/>
		</div>
	);
};

export default DecentralizedVoices;
