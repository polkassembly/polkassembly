// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { useNetworkSelector } from '~src/redux/selectors';
import { chainProperties } from '~src/global/networkConstants';
import Address from '~src/ui-components/Address';
import { useTheme } from 'next-themes';

const LABEL_CONFIG = [
	{ charCount: 10, minRadius: 60 },
	{ charCount: 8, minRadius: 50 },
	{ charCount: 7, minRadius: 40 },
	{ charCount: 6, minRadius: 30 },
	{ charCount: 5, minRadius: 20 },
	{ charCount: 4, minRadius: 10 },
	{ charCount: 3, minRadius: 0 }
];

interface IVoteData {
	voter: string;
	balance: number;
	votingPower: number;
	color: string;
	lockPeriod?: string;
	decision: string;
}

interface ICirclePackingProps {
	className?: string;
	data: IVoteData[];
	name: string;
}

const CirclePacking: FC<ICirclePackingProps> = ({ className, data, name }) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	if (data.length === 0) {
		return (
			<div className='flex h-[500px] w-full items-center justify-center'>
				<p className='text-sm'>No data available</p>
			</div>
		);
	}

	const chartData = {
		children: data,
		color: 'transparent',
		name: name
	};

	return (
		<div className={`h-[300px] w-full md:h-[500px] ${className}`}>
			<ResponsiveCirclePacking
				data={chartData}
				margin={{ bottom: 10, left: 10, right: 10, top: 10 }}
				id='voter'
				value='balance'
				colors={(circle) => circle.data.color}
				childColor={{
					from: 'color',
					modifiers: [['opacity', 0.5]]
				}}
				padding={4}
				leavesOnly={true}
				enableLabels={true}
				label={(datum) => {
					const { id, radius } = datum;
					if (typeof id !== 'string') return String(id);

					// Find the appropriate character count based on radius
					const config = LABEL_CONFIG.find((config) => radius > config.minRadius);
					const charCount = config ? config.charCount : 3;

					return id.slice(0, charCount) + (id.length > charCount ? '...' : '');
				}}
				labelsSkipRadius={30}
				labelTextColor={{
					from: 'color',
					modifiers: [['darker', 10]]
				}}
				borderWidth={1}
				borderColor={{
					from: 'color',
					modifiers: [['darker', 2]]
				}}
				tooltip={({ id }) => {
					const item = data.find((item) => item.voter === id);

					return (
						<div className={`flex flex-col gap-2 rounded-md bg-white capitalize dark:bg-[#1E2126] ${theme === 'dark' ? 'text-white' : 'text-[#576D8B]'} p-2 text-[11px] shadow-md`}>
							<span className='text-xs font-semibold'>
								<Address
									address={id}
									iconSize={16}
								/>
							</span>
							<span className='text-xs font-semibold'>
								{'Capital: '}
								{formatUSDWithUnits(item?.balance?.toString() || '0', 1)} {chainProperties[network]?.tokenSymbol}{' '}
								<span className='lowercase'>{item?.lockPeriod ? `(${item.lockPeriod}x/d)` : ''}</span>
							</span>
							<span className='text-xs font-semibold'>
								{'Votes: '}
								{formatUSDWithUnits(item?.votingPower?.toString() || '0', 1)} {chainProperties[network]?.tokenSymbol}
							</span>
						</div>
					);
				}}
			/>
		</div>
	);
};

export default CirclePacking;
