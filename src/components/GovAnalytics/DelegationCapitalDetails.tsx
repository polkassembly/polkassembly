// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Card } from 'antd';
import { useTheme } from 'next-themes';
import styled from 'styled-components';
import { useNetworkSelector } from '~src/redux/selectors';
import { IDelegationCapitalDetails } from './types';
import formatBnBalance from '~src/util/formatBnBalance';
import BN from 'bn.js';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import Slider from '~src/ui-components/Slider';

const ZERO = new BN(0);

const StyledCard = styled(Card)`
	g[transform='translate(0,0)'] g:nth-child(even) {
		display: none !important;
	}
	div[style*='pointer-events: none;'] {
		visibility: hidden;
		animation: fadeIn 0.5s forwards;
	}

	@keyframes fadeIn {
		0% {
			visibility: hidden;
			opacity: 0;
		}
		100% {
			visibility: visible;
			opacity: 1;
		}
	}

	@media (max-width: 640px) {
		.ant-card-body {
			padding: 12px !important;
		}
	}
`;

const DelegationCapitalDetails: FC<IDelegationCapitalDetails> = (props) => {
	const { delegationData } = props;
	const { network } = useNetworkSelector();
	const isMobile = typeof window !== 'undefined' && window?.screen.width < 1024;
	const { resolvedTheme: theme } = useTheme();

	const bnToIntBalance = (bnValue: string | number | BN): number => {
		const bn = BN.isBN(bnValue) ? bnValue : new BN(bnValue && bnValue.toString());
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0]);

	useEffect(() => {
		if (delegationData && isMobile) {
			const totalEntries = Object.keys(delegationData).length;
			const middleIndex = Math.floor(totalEntries / 2);
			setSelectedRange([middleIndex - 2 > 0 ? middleIndex - 2 : 0, middleIndex + 2 < totalEntries ? middleIndex + 2 : totalEntries - 1]);
		}
	}, [delegationData, isMobile]);

	const onChange = (value: number[]) => {
		setSelectedRange(value as [number, number]);
	};

	// Use full data if not mobile, otherwise use selected range
	const data = Object.keys(delegationData || {})
		.slice(isMobile ? selectedRange[0] : 0, isMobile ? selectedRange[1] + 1 : undefined)
		.map((key) => ({
			Capital: bnToIntBalance(delegationData[key].totalCapital || ZERO) || 0,
			Votes: bnToIntBalance(delegationData[key].totalVotesBalance || ZERO) || 0,
			capitalColor: '#796EEC',
			trackName: key
				.split(' ')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' '),
			votesColor: '#B6B0FB'
		}));

	const nivoTheme = {
		axis: {
			legend: {
				text: {
					fill: theme === 'dark' ? '#909090' : 'black'
				}
			},
			ticks: {
				line: {
					stroke: theme === 'dark' ? 'white' : 'black'
				},
				text: {
					fill: theme === 'dark' ? 'white' : 'black'
				}
			}
		},
		grid: {
			line: {
				stroke: theme === 'dark' ? '#333' : '#ddd',
				strokeDasharray: '4 4'
			}
		},
		legends: {
			text: {
				fill: theme === 'dark' ? 'white' : 'black',
				fontSize: 14
			}
		},
		tooltip: {
			container: {
				background: theme === 'dark' ? '#333' : '#fff',
				color: theme === 'dark' ? 'white' : 'black'
			}
		}
	};

	const marks = {
		0: Object.keys(delegationData)[0],
		[Object.keys(delegationData).length - 1]: Object.keys(delegationData)[Object.keys(delegationData).length - 1]
	};

	return (
		<StyledCard
			className={`mx-auto ${
				isMobile ? 'max-h-[550px] p-3' : 'max-h-[500px] p-0'
			} w-full flex-1 rounded-xxl border-section-light-container bg-white text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white`}
		>
			<div className='flex items-center justify-between'>
				<h2 className='text-base font-semibold sm:text-xl'>Track Delegation</h2>
				{!isMobile && (
					<div className='flex gap-x-4'>
						<div className='flex items-center gap-x-1'>
							<div className='h-[5px] w-[5px] rounded-full bg-[#B6B0FB]'></div>
							<p className='m-0 p-0 text-xs font-normal text-bodyBlue dark:text-white'>Votes</p>
						</div>
						<div className='flex items-center gap-x-1'>
							<div className='h-[5px] w-[5px] rounded-full bg-[#796EEC]'></div>
							<p className='m-0 p-0 text-xs font-normal text-bodyBlue dark:text-white'>Capital</p>
						</div>
					</div>
				)}
			</div>
			<div
				className={`${isMobile ? 'ml-3' : 'ml-0'} flex justify-start`}
				style={{ height: '300px', width: '100%' }}
			>
				<ResponsiveBar
					data={data}
					keys={['Votes', 'Capital']}
					indexBy='trackName'
					margin={{ bottom: 60, left: 10, right: 40, top: 50 }}
					padding={0.6}
					enableGridY={isMobile ? false : true}
					enableLabel={false}
					valueScale={{ type: 'linear' }}
					indexScale={{ round: true, type: 'band' }}
					colors={({ id, data }) => (id === 'Votes' ? data.votesColor : data.capitalColor)}
					tooltip={({ id, value, indexValue }) => (
						<div className='border-1 rounded-[11px] border-solid border-[#F9F9F9] bg-white p-3 shadow-md dark:bg-[#000000]'>
							<div className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>Referenda {indexValue}</div>
							<div className='flex items-end gap-x-1 text-xl font-medium dark:text-blue-dark-high'>
								{formatUSDWithUnits(value.toString(), 1)} <p className='m-0 p-0 text-sm capitalize text-lightBlue dark:text-blue-dark-high'>{id}</p>
							</div>
						</div>
					)}
					theme={nivoTheme}
					axisTop={null}
					axisRight={null}
					axisBottom={{
						legend: '',
						legendOffset: 78,
						legendPosition: 'middle',
						tickPadding: 5,
						tickRotation: -26,
						tickSize: 0
					}}
					axisLeft={null}
				/>
			</div>
			{isMobile && (
				<>
					<div className='mt-4 flex justify-center gap-x-4'>
						<div className='flex items-center gap-x-1'>
							<div className='h-[5px] w-[5px] rounded-full bg-[#B6B0FB]'></div>
							<p className='m-0 p-0 text-xs font-normal text-bodyBlue dark:text-white'>Votes</p>
						</div>
						<div className='flex items-center gap-x-1'>
							<div className='h-[5px] w-[5px] rounded-full bg-[#796EEC]'></div>
							<p className='m-0 p-0 text-xs font-normal text-bodyBlue dark:text-white'>Capital</p>
						</div>
					</div>
					<div className='mx-auto mt-6 w-[96%]'>
						<Slider
							range
							min={0}
							max={Object.keys(delegationData).length - 1}
							value={selectedRange}
							onChange={onChange}
							marks={marks}
							tooltip={{
								formatter: (value) => {
									if (value !== undefined && value >= 0 && value < Object.keys(delegationData).length) {
										const dataIndex = Object.keys(delegationData)[value];
										return `Referenda: ${dataIndex}`;
									}
									return '';
								}
							}}
						/>
					</div>
				</>
			)}
		</StyledCard>
	);
};

export default DelegationCapitalDetails;
