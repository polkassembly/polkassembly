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

interface IDecentralizedVoicesProps {
	votes: IVoteData[];
}

const DecentralizedVoices: FC<IDecentralizedVoicesProps> = ({ votes }) => {
	const { network } = useNetworkSelector();
	const [delegates, setDelegates] = useState<any[]>([]);

	const [openModal, setOpenModal] = useState<boolean>(false);
	const [totalVotingPower, setTotalVotingPower] = useState<number>(0);
	const [decentralizedVotingPower, setDecentralizedVotingPower] = useState<number>(0);
	const [decentralizedAyeVotes, setDecentralizedAyeVotes] = useState<number>(0);
	const [decentralizedNayVotes, setDecentralizedNayVotes] = useState<number>(0);
	const [decentralizedVotes, setDecentralizedVotes] = useState<any[]>([]);
	const [decentralizedAyeVotesPercentage, setDecentralizedAyeVotesPercentage] = useState<number>(0);
	const [decentralizedNayVotesPercentage, setDecentralizedNayVotesPercentage] = useState<number>(0);
	const [decentralizedVotingPowerPercentage, setDecentralizedVotingPowerPercentage] = useState<number>(0);

	useEffect(() => {
		const loadDelegates = async () => {
			const delegatesModule = await import(`pages/api/v1/delegations/w3f-delegates-${network}.json`);
			setDelegates(delegatesModule.default || []);
		};
		loadDelegates();
	}, [network]);

	useEffect(() => {
		const decentralizedVotes = votes.filter((vote) => {
			const delegate = delegates.find((delegate) => delegate.address === vote.voter);
			return delegate;
		});
		setDecentralizedVotes(decentralizedVotes);
		setTotalVotingPower(votes.reduce((acc, vote) => acc + vote.votingPower, 0));
		setDecentralizedVotingPower(decentralizedVotes.reduce((acc, vote) => acc + vote.votingPower, 0));
		setDecentralizedAyeVotes(decentralizedVotes.filter((vote) => vote.decision === 'aye').reduce((acc, vote) => acc + vote.votingPower, 0));
		setDecentralizedNayVotes(decentralizedVotes.filter((vote) => vote.decision === 'nay').reduce((acc, vote) => acc + vote.votingPower, 0));
	}, [delegates, votes]);

	useEffect(() => {
		setDecentralizedAyeVotesPercentage(Number(((decentralizedAyeVotes / totalVotingPower) * 100).toFixed(2)));
		setDecentralizedNayVotesPercentage(Number(((decentralizedNayVotes / totalVotingPower) * 100).toFixed(2)));
		setDecentralizedVotingPowerPercentage(Number(((decentralizedVotingPower / totalVotingPower) * 100).toFixed(2)));
	}, [decentralizedAyeVotes, decentralizedNayVotes, decentralizedVotingPower, totalVotingPower]);

	console.log(decentralizedVotes);
	return (
		<div>
			<div className='flex items-center gap-2'>
				<div className='flex w-full items-center justify-between gap-2 rounded-md bg-[#F6F8FB] px-2 py-1 text-xs dark:bg-[#353535]'>
					<span className='text text-[#576D8B] dark:text-icon-dark-inactive'>Decentralized Voices </span>
					<span>
						{decentralizedVotingPowerPercentage}% (~{formatUSDWithUnits(decentralizedVotingPower.toString() || '0', 2)})
					</span>
					<Divider
						className='bg-section-light-container dark:bg-blue-dark-medium'
						orientation='right'
						type='vertical'
					/>
					<span className='text text-[#576D8B] dark:text-icon-dark-inactive'>Aye </span>
					<span>
						{decentralizedAyeVotesPercentage}% (~
						{formatUSDWithUnits(decentralizedAyeVotes.toString() || '0', 2)})
					</span>
					<Divider
						className='bg-section-light-container dark:bg-blue-dark-medium'
						orientation='right'
						type='vertical'
					/>
					<span className='text text-[#576D8B] dark:text-icon-dark-inactive'>Nay </span>
					<span>
						{decentralizedNayVotesPercentage}% (~
						{formatUSDWithUnits(decentralizedNayVotes.toString() || '0', 2)})
					</span>
				</div>
				<button
					onClick={() => setOpenModal(true)}
					className='border-none bg-transparent p-0 outline-none'
				>
					<Image
						src='/assets/icons/decentralized-voices-menu-icon.svg'
						alt='menu icon'
						width={24}
						height={24}
						className='filter dark:grayscale dark:invert'
					/>
				</button>
			</div>
			<DecentralizedVoicesModal
				open={openModal}
				setOpen={setOpenModal}
				totalVotingPower={totalVotingPower}
				decentralizedVotes={decentralizedVotes}
				decentralizedVotingPower={decentralizedVotingPower}
				decentralizedAyeVotes={decentralizedAyeVotes}
				decentralizedNayVotes={decentralizedNayVotes}
				decentralizedVotingPowerPercentage={decentralizedVotingPowerPercentage}
				decentralizedAyeVotesPercentage={decentralizedAyeVotesPercentage}
				decentralizedNayVotesPercentage={decentralizedNayVotesPercentage}
			/>
		</div>
	);
};

export default DecentralizedVoices;
