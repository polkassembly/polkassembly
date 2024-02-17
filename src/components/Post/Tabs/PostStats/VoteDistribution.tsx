// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ResponsiveTreeMap } from '@nivo/treemap';

const VoteDistribution = ({ votesDistribution }: { votesDistribution: { ayes: any[]; nays: any[]; abstain: any[] } }) => {
	const colors: { [key: string]: string } = {
		abstain: '#407BFF',
		aye: '#6DE1A2',
		nay: '#FF778F'
	};

	console.log(votesDistribution);

	const chartData = {
		children: [
			{
				children: votesDistribution.ayes,
				name: 'ayes'
			},
			{
				children: votesDistribution.nays,
				name: 'nays'
			},
			{
				children: votesDistribution.abstain,
				name: 'abstain'
			}
		],
		name: 'vote distribution'
	};
	return (
		<div className='h-[280px] w-full'>
			<ResponsiveTreeMap
				data={chartData}
				identity='voter'
				value='balance'
				valueFormat='.02s'
				leavesOnly={true}
				innerPadding={6}
				margin={{ bottom: 10, left: 10, right: 10, top: 10 }}
				enableLabel={false}
				colors={[colors.aye, colors.nay, colors.abstain]}
				labelSkipSize={12}
				labelTextColor={{
					from: 'color',
					modifiers: [['darker', 1.2]]
				}}
				nodeOpacity={1}
				parentLabelPosition='left'
				parentLabelTextColor={{
					from: 'color',
					modifiers: [['darker', 2]]
				}}
				borderColor={{
					from: 'color',
					modifiers: [['darker', 0.1]]
				}}
			/>
		</div>
	);
};

export default VoteDistribution;
