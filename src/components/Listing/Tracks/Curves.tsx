// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import * as Chart from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
} from 'chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

export interface IProgress {
	approval: number,
	approvalThreshold: number,
	support: number,
	supportThreshold: number
}

interface ICurvesProps {
    data: {
		datasets: any[],
		labels: any[]
	};
}

const Curves: FC<ICurvesProps> = (props) => {
	const { data } = props;
	return(
		<article className='-mx-3 md:m-0'>
			<Chart.Line
				className='h-full w-full'
				data={data}
				options={{
					animation: {
						duration: 0
					},
					clip: false,
					plugins: {
						hoverLine: {
							lineColor: '#0F0F',
							lineWidth: 1
						},
						legend: {
							display: false,
							position: 'bottom'
						}
					} as any,
					scales: {
						x: {
							beginAtZero: false,
							display: true,
							grid: {
								display: true,
								drawOnChartArea: false
							},
							ticks: {
								max: 10,
								stepSize: 2
							} as any,
							title: {
								display: true,
								font: {
									size: window.innerWidth < 400? 10: 12,
									weight: window.innerWidth > 400? '500': '400'
								},
								text: 'Days'
							},
							type: 'linear'
						},
						y: {
							beginAtZero: false,
							display: true,
							max: 100,
							min: 0,
							ticks: {
								callback(val: any) {
									return val + '%';
								},
								stepSize: 20
							},
							title: {
								display: true,
								font: {
									size: window.innerWidth < 400? 10: 12,
									weight: window.innerWidth > 400? '500': '400'
								},
								text: 'Passing Percentage'
							}
						}
					}
				}}
			/>
		</article>
	);
};

export default Curves;
