// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Card } from 'antd';
import { useTheme } from 'next-themes';

const VoteDistribution = ({ votesDistribution }: { votesDistribution: { ayes: any[]; nays: any[]; abstain: any[] } }) => {
	const { resolvedTheme: theme } = useTheme();

	const sortedAyes = votesDistribution.ayes.sort((a, b) => b.balance - a.balance);
	const sortedNays = votesDistribution.nays.sort((a, b) => b.balance - a.balance);
	const sortedAbstain = votesDistribution.abstain.sort((a, b) => b.balance - a.balance);

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
		<Card className='mx-auto h-fit max-h-[500px] w-full flex-1 rounded-xxl border-[#D2D8E0] bg-white p-0 text-blue-light-high dark:bg-section-dark-overlay dark:text-white'>
			<div className='flex flex-col items-center justify-between gap-5 md:flex-row'>
				<h2 className='text-xl font-semibold'>Vote Distribution</h2>
				<div className='flex items-center gap-5 text-xs'>
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
									balance={item.balance}
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
									balance={item.balance}
									size={item.balance / 1.0e3}
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
									balance={item.balance}
									size={item.balance / 1.0e3}
								/>
							);
						})}
					</div>
				) : null}
			</div>
		</Card>
	);
};

const GridItem = ({ size, color }: { size: number; balance: number; color: string }) => {
	const style = {
		backgroundColor: color,
		border: `2px solid ${color}`,
		borderRadius: '5px',
		gridColumn: `span ${size / 1000}`,
		gridRow: 'span 5'
	};

	return <div style={style}></div>;
};

export default VoteDistribution;
