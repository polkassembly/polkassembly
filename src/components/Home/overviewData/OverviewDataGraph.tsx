// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import React from 'react';
import { useTheme } from 'next-themes';
import { ResponsiveLine } from '@nivo/line';
import formatBnBalance from '~src/util/formatBnBalance';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { useNetworkSelector } from '~src/redux/selectors';
import { LoadingOutlined } from '@ant-design/icons';
import { IMonthlyTreasuryTally } from 'pages/api/v1/treasury-amount-history';

const monthOrder = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const CustomTooltip = ({ point }: any) => {
	return (
		<div className='border-1 rounded-[11px] border-solid border-[#F9F9F9] bg-white p-3 shadow-md dark:bg-[#000000]'>
			<div className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>{point.data.x}</div>
			<div className='text-xl font-medium dark:text-blue-dark-high'>{Number(point.data.y).toFixed(2)}M DOT </div>
		</div>
	);
};

const OverviewDataGraph = ({
	graphData
}: {
	graphData: IMonthlyTreasuryTally[];
	currentTokenPrice: {
		isLoading: boolean;
		value: string;
	};
}) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

	const filteredData = graphData
		.filter((item) => parseFloat(item.balance) !== 0)
		.sort((a, b) => monthOrder.indexOf(a.month.toLowerCase()) - monthOrder.indexOf(b.month.toLowerCase()));

	const firstMonth = filteredData[0]?.month;
	const lastMonth = filteredData[filteredData.length - 1]?.month;

	const formattedData = [
		{
			id: 'balance',
			data: filteredData.map((item) => ({
				x: item.month.charAt(0).toUpperCase() + item.month.slice(1),
				y: formatUSDWithUnits(
					formatBnBalance(
						item.balance,
						{
							numberAfterComma: 0,
							withThousandDelimitor: false,
							withUnit: false
						},
						network
					)
				)
			}))
		}
	];

	if (filteredData.length === 0) {
		return (
			<div className='mt-3 flex h-full w-full items-center justify-center'>
				<LoadingOutlined />
			</div>
		);
	}

	return (
		<div style={{ height: '75px' }}>
			<ResponsiveLine
				data={formattedData}
				margin={{ bottom: 40, left: 0, right: 0, top: 15 }}
				xScale={{ type: 'point' }}
				yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
				axisTop={null}
				axisRight={null}
				axisBottom={{
					tickSize: 3,
					tickPadding: 20,
					tickRotation: 0,
					format: (value) => {
						if (value === firstMonth.charAt(0).toUpperCase() + firstMonth.slice(1) || value === lastMonth.charAt(0).toUpperCase() + lastMonth.slice(1)) {
							return '';
						}
						return value;
					}
				}}
				axisLeft={null}
				tooltip={CustomTooltip}
				tooltipFormat={(value) => `${Number(value).toFixed(2)}`}
				colors={['#ADC2F9']}
				pointSize={10}
				pointColor={{ theme: 'background' }}
				pointBorderWidth={2}
				pointBorderColor={{ from: 'serieColor' }}
				pointLabelYOffset={-12}
				useMesh={true}
				enableGridX={false}
				enableGridY={false}
				curve='monotoneX'
				enableArea={true}
				areaOpacity={0.2}
				enablePoints={false}
				theme={{
					axis: {
						domain: {
							line: {
								stroke: 'transparent',
								strokeWidth: 1
							}
						},
						ticks: {
							line: {
								stroke: 'transparent'
							},
							text: {
								fill: theme === 'dark' ? '#fff' : '#576D8B',
								fontSize: 12,
								outlineColor: 'transparent',
								outlineWidth: 0
							}
						}
					},
					grid: {
						line: {
							stroke: theme === 'dark' ? '#3B444F' : '#D2D8E0',
							strokeDasharray: '2 2',
							strokeWidth: 1
						}
					},
					legends: {
						text: {
							fontSize: 12,
							textTransform: 'capitalize'
						}
					}
				}}
			/>
		</div>
	);
};

export default OverviewDataGraph;
