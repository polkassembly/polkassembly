import React from 'react';
import { ResponsivePie } from '@nivo/pie';

const ClaimedAmountPieGraph = ({ percentageClaimed }: { percentageClaimed: number }) => {
	const data = [
		{
			id: 'claimed',
			label: 'claimed',
			value: percentageClaimed,
			color: '#FFC302'
		},
		{
			id: 'unclaimed',
			label: 'unclaimed',
			value: 100 - percentageClaimed,
			color: '#E0E0E0'
		}
	];

	return (
		<div style={{ height: '30px', width: '30px' }}>
			<ResponsivePie
				data={data}
				margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
				innerRadius={0.73}
				padAngle={0.2}
				cornerRadius={3}
				colors={{ datum: 'data.color' }}
				borderWidth={1}
				borderColor={{
					from: 'color',
					modifiers: [['darker', 0.2]]
				}}
				enableArcLabels={false}
				enableArcLinkLabels={false}
				isInteractive={false}
			/>
		</div>
	);
};

export default ClaimedAmountPieGraph;
