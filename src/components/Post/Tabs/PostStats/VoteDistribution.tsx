// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Card, Popover } from 'antd';
import { useTheme } from 'next-themes';

interface IVoteDistributionProps {
	votesDistribution: { ayes: any[]; nays: any[]; abstain: any[] };
}
const VoteDistribution = ({ votesDistribution }: IVoteDistributionProps) => {
	const { resolvedTheme: theme } = useTheme();

	const sortedAyes = votesDistribution.ayes.sort((a, b) => b.balance - a.balance);
	const sortedNays = votesDistribution.nays.sort((a, b) => b.balance - a.balance);
	const sortedAbstain = votesDistribution.abstain.sort((a, b) => b.balance - a.balance);

	const totalAyeVotes = sortedAyes.reduce((acc, cur) => acc + cur.balance, 0);
	const totalNayVotes = sortedNays.reduce((acc, cur) => acc + cur.balance, 0);
	const totalAbstainVotes = sortedAbstain.reduce((acc, cur) => acc + cur.balance, 0);

	const colors: { [key: string]: string } = {
		abstain: theme === 'dark' ? '#407BFF' : '#407BFF',
		aye: theme === 'dark' ? '#64A057' : '#2ED47A',
		nay: theme === 'dark' ? '#BD2020' : '#E84865'
	};

	const gridStyle = {
		display: 'grid',
		gridAutoColumns: 'auto',
		gridAutoFlow: 'dense',
		gridAutoRows: 'auto',
		gridGap: '5px',
		gridTemplateColumns: 'repeat(auto-fit, minmax(10px, 1fr))',
		gridTemplateRows: 'repeat(auto-fit, minmax(10px, 1fr))' // Add this line to wrap items to the next line
	};

	return (
		<Card className='mx-auto h-fit w-full flex-1 rounded-xxl border-[#D2D8E0] bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white md:max-h-[500px]'>
			<div className='flex items-center justify-between gap-5'>
				<h2 className='text-xl font-semibold'>Vote Distribution</h2>
				<Legend className='hidden md:flex' />
			</div>
			<div className='flex w-full flex-col gap-2 overflow-hidden lg:flex-row'>
				{sortedAyes.length ? (
					<div
						className='h-fit w-full min-w-[40%]'
						style={gridStyle}
					>
						{sortedAyes.map((item, index) => {
							// Calculate width based on balance prop
							return (
								<GridItem
									key={index}
									color={colors.aye}
									voter={item.voter}
									votePercent={(item.balance / totalAyeVotes) * 100}
									size={item.balance / 1.0e3}
								/>
							);
						})}
					</div>
				) : null}
				{sortedNays.length ? (
					<div
						className='h-fit w-full min-w-[20%]'
						style={gridStyle}
					>
						{sortedNays.map((item, index) => {
							// Calculate width based on balance prop
							return (
								<GridItem
									key={index}
									color={colors.nay}
									voter={item.voter}
									size={item.balance / 1.0e3}
									votePercent={(item.balance / totalNayVotes) * 100}
								/>
							);
						})}
					</div>
				) : null}
				{sortedAbstain.length ? (
					<div
						className='h-fit'
						style={gridStyle}
					>
						{sortedAbstain.map((item, index) => {
							// Calculate width based on balance prop
							return (
								<GridItem
									key={index}
									color={colors.abstain}
									voter={item.voter}
									size={item.balance / 1.0e3}
									votePercent={(item.balance / totalAbstainVotes) * 100}
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

const GridItem = ({ size, color, votePercent, voter }: { size: number; voter: string; color: string; votePercent: number }) => {
	const style = {
		backgroundColor: color,
		border: `2px solid ${color}`,
		borderRadius: '5px',
		gridColumn: `span ${size / 1000}`,
		gridRow: 'span 5'
	};

	return (
		<Popover
			title=''
			trigger='hover'
			arrow={false}
			overlayClassName='dark:bg-section-dark-overlay dark:text-white'
			overlayStyle={{ padding: '0px' }}
			content={
				<div className='flex cursor-pointer flex-col items-center p-0 text-xs font-medium text-blue-light-high hover:scale-105 hover:opacity-80 dark:text-white'>
					<span>{`${voter.slice(0, 5)}...${voter.slice(-3)}`}</span>
					<span>{votePercent.toFixed(2) + '%'}</span>
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
