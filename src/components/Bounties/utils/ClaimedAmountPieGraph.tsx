// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import React from 'react';
import { ResponsivePie } from '@nivo/pie';

const ClaimedAmountPieGraph = ({ percentageClaimed, isUsedInBountyDetails }: { percentageClaimed: number; isUsedInBountyDetails?: boolean }) => {
	const size = isUsedInBountyDetails ? 20 : 30;
	const data = [
		{
			color: '#FFC302',
			id: 'claimed',
			label: 'claimed',
			value: percentageClaimed
		},
		{
			color: '#E0E0E0',
			id: 'unclaimed',
			label: 'unclaimed',
			value: 100 - percentageClaimed
		}
	];

	return (
		<div style={{ height: `${size}px`, width: `${size}px` }}>
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
