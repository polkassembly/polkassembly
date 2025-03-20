// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { theme as antdTheme } from 'antd';
import { useNetworkSelector } from '~src/redux/selectors';
import { chainProperties } from '~src/global/networkConstants';
import Address from '~src/ui-components/Address';

interface ICirclePackingProps {
	className?: string;
	data: any[];
	name: string;
}

const CirclePacking: FC<ICirclePackingProps> = ({ className, data, name }) => {
	const { network } = useNetworkSelector();

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

	// Get the current theme mode
	const { token } = antdTheme.useToken();
	const isDarkMode = token.colorBgContainer === '#000' || token.colorBgContainer === '#1E2126';

	return (
		<div className={`h-[500px] w-full ${className}`}>
			<ResponsiveCirclePacking
				data={chartData}
				margin={{ bottom: 20, left: 20, right: 20, top: 20 }}
				id='voter'
				value='balance'
				colors={(circle) => circle.data.color}
				childColor={{
					from: 'color',
					modifiers: [['brighter', 0.4]]
				}}
				padding={4}
				leavesOnly={true}
				enableLabels={true}
				label={(datum) => {
					const { id, radius } = datum;
					if (typeof id !== 'string') return String(id);

					let charCount = 3; // minimum characters to show

					if (radius > 60) charCount = 10;
					else if (radius > 50) charCount = 8;
					else if (radius > 40) charCount = 7;
					else if (radius > 30) charCount = 6;
					else if (radius > 20) charCount = 5;
					else if (radius > 10) charCount = 4;

					return id.slice(0, charCount) + (id.length > charCount ? '...' : '');
				}}
				labelsSkipRadius={30}
				labelTextColor={{
					from: 'color',
					modifiers: [['darker', 2.5]]
				}}
				borderWidth={1}
				borderColor={{
					from: 'color',
					modifiers: [['darker', 0.5]]
				}}
				defs={[
					{
						background: 'none',
						color: 'inherit',
						id: 'lines',
						lineWidth: 5,
						rotation: -45,
						spacing: 8,
						type: 'solid'
					}
				]}
				fill={[
					{
						id: 'lines',
						match: {
							depth: 1
						}
					}
				]}
				tooltip={({ id }) => {
					const item = data.find((item) => item.voter === id);

					return (
						<div className={`flex flex-col gap-2 rounded-md bg-white capitalize dark:bg-[#1E2126] ${isDarkMode ? 'text-white' : 'text-[#576D8B]'} p-2 text-[11px] shadow-md`}>
							<span className='text-xs font-semibold'>
								<Address
									address={id}
									iconSize={16}
								/>
							</span>
							<span className='text-xs font-semibold'>
								{'Capital: '}
								{formatUSDWithUnits(item?.balance.toString(), 1)} {chainProperties[network]?.tokenSymbol}{' '}
								<span className='lowercase'>{item?.lockPeriod ? `(${item.lockPeriod}x/d)` : ''}</span>
							</span>
							<span className='text-xs font-semibold'>
								{'Votes: '}
								{formatUSDWithUnits(item?.votingPower.toString(), 1)} {chainProperties[network]?.tokenSymbol}
							</span>
						</div>
					);
				}}
			/>
		</div>
	);
};

export default CirclePacking;
