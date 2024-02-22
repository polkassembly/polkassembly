// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Card } from 'antd';

const VoteDistribution = ({ votesDistribution }: { votesDistribution: { ayes: any[]; nays: any[]; abstain: any[] } }) => {
	const sortedAyes = votesDistribution.ayes.sort((a, b) => b.balance - a.balance);
	const sortedNays = votesDistribution.nays.sort((a, b) => b.balance - a.balance);
	const sortedAbstain = votesDistribution.abstain.sort((a, b) => b.balance - a.balance);

	const colors: { [key: string]: string } = {
		abstain: '#407BFF',
		aye: '#6DE1A2',
		nay: '#FF778F'
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
			<h2 className='text-xl font-semibold'>Vote Distribution</h2>
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
