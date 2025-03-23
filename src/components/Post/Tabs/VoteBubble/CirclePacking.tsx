// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useState, useEffect, useMemo } from 'react';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { useNetworkSelector } from '~src/redux/selectors';
import { chainProperties } from '~src/global/networkConstants';
import Address from '~src/ui-components/Address';
import { useTheme } from 'next-themes';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import { usePeopleChainApiContext } from '~src/context';
import { useContext } from 'react';
import { ApiContext } from '~src/context/ApiContext';
import { network as AllNetworks } from '~src/global/networkConstants';
import isPeopleChainSupportedNetwork from '~src/components/OnchainIdentity/utils/getPeopleChainSupportedNetwork';
import { ApiPromise } from '@polkadot/api';

const LABEL_CONFIG = [
	{ charCount: 10, minRadius: 60 },
	{ charCount: 8, minRadius: 50 },
	{ charCount: 7, minRadius: 40 },
	{ charCount: 6, minRadius: 30 },
	{ charCount: 5, minRadius: 20 },
	{ charCount: 4, minRadius: 10 },
	{ charCount: 3, minRadius: 0 }
];

// Custom hook to get identity display names
const useVoterDisplayNames = (voters: string[]) => {
	const { network } = useNetworkSelector();
	const apiContext = useContext(ApiContext);
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const [displayInfo, setDisplayInfo] = useState<Record<string, { name: string; isVerified: boolean; isGood: boolean }>>({});

	useEffect(() => {
		// Skip if no voters
		if (!voters.length) return;

		// Set up API
		let api: ApiPromise | undefined = undefined;
		let apiReady = false;

		if (network === AllNetworks.COLLECTIVES && apiContext.relayApi && apiContext.relayApiReady) {
			api = apiContext.relayApi;
			apiReady = apiContext.relayApiReady;
		} else if (isPeopleChainSupportedNetwork(network)) {
			api = peopleChainApi;
			apiReady = peopleChainApiReady;
		} else {
			if (!apiContext.api || !apiContext.apiReady) return;
			api = apiContext.api;
			apiReady = apiContext.apiReady;
		}

		if (!api || !apiReady) return;

		// Fetch identity info for all voters
		const fetchIdentities = async () => {
			const results: Record<string, { name: string; isVerified: boolean; isGood: boolean }> = {};

			await Promise.all(
				voters.map(async (voter) => {
					try {
						const info = await getIdentityInformation({
							address: voter,
							api: peopleChainApi || api,
							network: network
						});

						// Use display name if available, otherwise use shortened address
						if (info.display || info.displayParent) {
							results[voter] = {
								isGood: info.isGood || false,
								isVerified: info.isVerified || false,
								name: info.displayParent || info.display
							};
						} else {
							// Fallback to shortened address if no identity
							results[voter] = {
								isGood: false,
								isVerified: false,
								name: voter.slice(0, 5) + '...' + voter.slice(-5)
							};
						}
					} catch (err) {
						console.error(`Error fetching identity for ${voter}:`, err);
						results[voter] = {
							isGood: false,
							isVerified: false,
							name: voter.slice(0, 5) + '...' + voter.slice(-5)
						};
					}
				})
			);

			setDisplayInfo(results);
		};

		fetchIdentities();
	}, [voters, network, apiContext, peopleChainApi, peopleChainApiReady]);

	return displayInfo;
};

interface IVoteData {
	voter: string;
	balance: number;
	votingPower: number;
	color: string;
	lockPeriod?: string;
	decision: string;
	delegators?: number;
}

interface ICirclePackingProps {
	className?: string;
	data: IVoteData[];
	name: string;
	selectedTab: 'flattened' | 'nested';
}

const CirclePacking: FC<ICirclePackingProps> = ({ className, data, name, selectedTab }) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

	// Get all unique voter addresses
	const voterAddresses = useMemo(() => {
		return [...new Set(data.map((item) => item.voter))];
	}, [data]);

	// Get display names for all voters
	const displayInfo = useVoterDisplayNames(voterAddresses);

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
				value={selectedTab === 'flattened' ? 'balance' : 'votingPower'}
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

					// Use identity display name if available
					if (displayInfo[id] && selectedTab === 'nested') {
						// Find the appropriate character count based on radius
						const config = LABEL_CONFIG.find((config) => radius > config.minRadius);
						const charCount = config ? config.charCount : 3;

						const info = displayInfo[id];
						const displayName = info.name;

						// Add verification badge symbols
						let prefix = '';
						if (info.isVerified && info.isGood) {
							prefix = '✅ '; // Verified and good (green checkmark)
						} else if (info.isVerified) {
							prefix = '✓ '; // Just verified (checkmark)
						} else if (info.name.length > 10) {
							// Likely has some identity but not verified
							prefix = ''; // Information symbol
						}

						// Format the final label with prefix and name
						const nameWithPrefix = prefix + displayName;
						return nameWithPrefix.length > charCount + prefix.length ? nameWithPrefix.slice(0, charCount + prefix.length) + '...' : nameWithPrefix;
					}

					// Fallback to address truncation
					const config = LABEL_CONFIG.find((config) => radius > config.minRadius);
					const charCount = config ? config.charCount : 3;
					return id.slice(0, charCount) + (id.length > charCount ? '...' : '');
				}}
				labelsSkipRadius={30}
				labelTextColor={
					theme === 'dark'
						? '#FFFFFF' // White text for dark mode
						: {
								from: 'color',
								modifiers: [['darker', 10]] // Keep existing style for light mode
						  }
				}
				borderWidth={1}
				borderColor={{
					from: 'color',
					modifiers: [['darker', 2]]
				}}
				tooltip={({ id }) => {
					const item = data.find((item) => item.voter === id);

					return selectedTab === 'flattened' ? (
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
					) : (
						<div className={`flex flex-col gap-2 rounded-md bg-white capitalize dark:bg-[#1E2126] ${theme === 'dark' ? 'text-white' : 'text-[#576D8B]'} p-2 text-[11px] shadow-md`}>
							<span className='text-xs font-semibold'>
								<Address
									address={id}
									iconSize={16}
								/>
							</span>
							<span className='text-xs font-semibold'>
								{'Votes: '}
								{formatUSDWithUnits(item?.votingPower?.toString() || '0', 1)} {chainProperties[network]?.tokenSymbol}
							</span>
							<span className='text-xs font-semibold'>
								{'Delegators: '}
								{item?.delegators}
							</span>
						</div>
					);
				}}
			/>
		</div>
	);
};

export default CirclePacking;
