// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { Card, Popover } from 'antd';
import { useTheme } from 'next-themes';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { chainProperties } from 'src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import Address from '~src/ui-components/Address';
import { useTranslation } from 'next-i18next';

interface IVoteDistributionProps {
	votesDistribution: { ayes: any[]; nays: any[]; abstain: any[] };
}

interface IVoteType {
	count: number;
	totalBalance: any;
	percent: number;
	votes: any[];
}
const VoteDistribution = ({ votesDistribution }: IVoteDistributionProps) => {
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');
	const [ayeVotes, setAyeVotes] = useState<IVoteType>({
		count: 0,
		percent: 0,
		totalBalance: 0,
		votes: []
	});
	const [nayVotes, setNayVotes] = useState<IVoteType>({
		count: 0,
		percent: 0,
		totalBalance: 0,
		votes: []
	});
	const [abstainVotes, setAbstainVotes] = useState<IVoteType>({
		count: 0,
		percent: 0,
		totalBalance: 0,
		votes: []
	});

	useEffect(() => {
		const totalAyeBal = votesDistribution?.ayes.reduce((acc, cur) => acc + cur.balance, 0);
		const totalNayBal = votesDistribution?.nays.reduce((acc, cur) => acc + cur.balance, 0);
		const totalAbstainBal = votesDistribution?.abstain.reduce((acc, cur) => acc + cur.balance, 0);

		const sortedAyes = votesDistribution.ayes
			.filter((item) => item.balance >= totalAyeBal * 0.03)
			.sort((a, b) => (a.votingPower && b.votingPower ? b.votingPower - a.votingPower : b.balance - a.balance));
		const smallAyesBalance = votesDistribution.ayes.filter((item) => item.balance < totalAyeBal * 0.03).reduce((acc, cur) => acc + cur.balance, 0);
		if (smallAyesBalance > 0) {
			sortedAyes.push({ balance: smallAyesBalance, voter: 'Others' });
		}

		const sortedNays = votesDistribution.nays
			.filter((item) => item.balance >= totalNayBal * 0.03)
			.sort((a, b) => (a.votingPower && b.votingPower ? b.votingPower - a.votingPower : b.balance - a.balance));
		const smallNaysBalance = votesDistribution.nays.filter((item) => item.balance < totalNayBal * 0.03).reduce((acc, cur) => acc + cur.balance, 0);
		if (smallNaysBalance > 0) {
			sortedNays.push({ balance: smallNaysBalance, voter: 'Others' });
		}

		const sortedAbstain = votesDistribution.abstain
			.filter((item) => item.balance >= totalAbstainBal * 0.03)
			.sort((a, b) => (a.votingPower && b.votingPower ? b.votingPower - a.votingPower : b.balance - a.balance));
		const smallAbstainBalance = votesDistribution.abstain.filter((item) => item.balance < totalAbstainBal * 0.03).reduce((acc, cur) => acc + cur.balance, 0);
		if (smallAbstainBalance > 0) {
			sortedAbstain.push({ balance: smallAbstainBalance, voter: 'Others' });
		}

		const totalVotesBalance = totalAyeBal + totalNayBal + totalAbstainBal;

		const ayePercent = Math.round((totalAyeBal / totalVotesBalance) * 100);
		const nayPercent = Math.round((totalNayBal / totalVotesBalance) * 100);
		const abstainPercent = Math.round((totalAbstainBal / totalVotesBalance) * 100);

		setAyeVotes({ count: sortedAyes.length, percent: ayePercent, totalBalance: totalAyeBal, votes: sortedAyes });
		setNayVotes({ count: sortedNays.length, percent: nayPercent, totalBalance: totalNayBal, votes: sortedNays });
		setAbstainVotes({ count: sortedAbstain.length, percent: abstainPercent, totalBalance: totalAbstainBal, votes: sortedAbstain });
	}, [votesDistribution]);

	const colors: { [key: string]: string } = {
		abstain: theme === 'dark' ? '#407BFF' : '#407BFF',
		aye: theme === 'dark' ? '#64A057' : '#2ED47A',
		nay: theme === 'dark' ? '#BD2020' : '#E84865'
	};
	return (
		<Card className='mx-auto h-fit w-full flex-1 rounded-xxl border-section-light-container bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white md:max-h-[500px]'>
			<div className='flex items-center justify-between gap-5'>
				<h2 className='text-xl font-semibold'>{t('vote_distribution')}</h2>
				<Legend className='hidden md:flex' />
			</div>
			<div className='flex h-[200px] w-full justify-center gap-1.5'>
				{ayeVotes.percent ? (
					<div
						className='flex h-full gap-1.5'
						style={{ width: `calc(${ayeVotes.percent}% - ${ayeVotes.count * 4}px)` }}
					>
						{ayeVotes?.votes.map((item, index) => {
							// Calculate width based on balance prop
							return (
								<GridItem
									key={index}
									color={colors.aye}
									voteType='Aye'
									voter={item.voter}
									votePercent={(item.balance / ayeVotes.totalBalance) * 100}
									balance={item.balance}
									votingPower={item.votingPower}
								/>
							);
						})}
					</div>
				) : null}
				{nayVotes.percent ? (
					<div
						className='flex h-full gap-1.5'
						style={{ width: `calc(${nayVotes.percent}% - ${nayVotes.count * 4}px)` }}
					>
						{nayVotes?.votes.map((item, index) => {
							// Calculate width based on balance prop
							return (
								<GridItem
									key={index}
									color={colors.nay}
									voteType='Nay'
									voter={item.voter}
									balance={item.balance}
									votePercent={(item.balance / nayVotes.totalBalance) * 100}
									votingPower={item.votingPower}
								/>
							);
						})}
					</div>
				) : null}
				{abstainVotes.percent ? (
					<div
						className='flex h-full gap-1.5'
						style={{ width: `calc(${abstainVotes.percent}% - ${abstainVotes.count * 4}px)` }}
					>
						{abstainVotes?.votes.map((item, index) => {
							// Calculate width based on balance prop
							return (
								<GridItem
									key={index}
									color={colors.abstain}
									voter={item.voter}
									voteType='Abstain'
									balance={item.balance}
									votePercent={(item.balance / abstainVotes.totalBalance) * 100}
									votingPower={item.votingPower}
								/>
							);
						})}
					</div>
				) : null}
			</div>
			<Legend className='mt-5 flex justify-center md:hidden' />
		</Card>
	);
};

const GridItem = ({
	color,
	votePercent,
	voter,
	balance,
	voteType,
	votingPower
}: {
	balance: number;
	voter: string;
	color: string;
	votePercent: number;
	voteType: string;
	votingPower: number;
}) => {
	const { network } = useNetworkSelector();
	const style = {
		backgroundColor: color,
		border: `1px solid ${color}`,
		borderRadius: '5px',
		height: '100%',
		width: `${votePercent}%`
	};

	return (
		<Popover
			title=''
			trigger='hover'
			arrow={false}
			overlayClassName='dark:bg-section-dark-overlay dark:text-white'
			overlayStyle={{ padding: '0px' }}
			content={
				<div className='flex cursor-pointer flex-col items-center p-0 text-xs font-medium text-blue-light-high dark:text-white'>
					{voter === 'Others' ? (
						voter
					) : (
						<span className='hover:scale-105 hover:opacity-80'>
							<Address
								address={voter}
								displayInline
								isTruncateUsername={false}
								disableTooltip
								iconSize={18}
							/>
						</span>
					)}
					<span>
						{formatUSDWithUnits(votingPower ? votingPower.toString() : balance.toString(), 2)} {chainProperties[network]?.tokenSymbol}
					</span>
					<span>
						{votePercent.toFixed(2) + '%'} of {voteType}
					</span>
				</div>
			}
		>
			<div style={style}></div>
		</Popover>
	);
};

const Legend = ({ className }: { className?: string }) => {
	return (
		<div className={`${className} flex items-center gap-5 text-xs dark:text-[#747474]`}>
			<div className='flex items-center gap-2'>
				<div className='h-1.5 w-1.5 rounded-full bg-ayeGreenColor'></div>
				<span>Aye</span>
			</div>
			<div className='flex items-center gap-2'>
				<div className='h-1.5 w-1.5 rounded-full bg-nayRedColor'></div>
				<span>Nay</span>
			</div>
			<div className='flex items-center gap-2'>
				<div className='h-1.5 w-1.5 rounded-full bg-abstainBlueColor'></div>
				<span>Abstain</span>
			</div>
		</div>
	);
};

export default VoteDistribution;
