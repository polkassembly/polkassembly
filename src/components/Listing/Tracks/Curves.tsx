// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
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
import { Spin } from 'antd';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

interface ICurvesProps {
    data: {
		datasets: any[],
		labels: any[]
	};
	curvesLoading: boolean;
}

const Curves: FC<ICurvesProps> = (props) => {
	const { data, curvesLoading } = props;
	const labelsLength = data.labels.length;
	return(
		<Spin indicator={<LoadingOutlined />} spinning={curvesLoading}>

			<article className='sm:-mx-3 md:m-0 max-w-[300px] max-h-[800px]'>
				<Chart.Line
					className='h-full w-full'
					data={data}
					options={{
						animation: {
							duration: 0
						},
						clip: false,
						maintainAspectRatio: false,
						plugins:{
							legend: {
								display: false
							},
							tooltip: {
								callbacks: {
									label(tooltipItem: any) {
										const { dataIndex, parsed, dataset } = tooltipItem;
										// only display one item
										if (['Approval'].includes(dataset.label)) {
											return '';
										}
										const hs = parsed.x;
										const approval = data.datasets[0].data[dataIndex];
										const support = data.datasets[1].data[dataIndex];
										const approvalValue = Number(
											typeof approval === 'object'? approval.y: approval
										).toFixed(2);
										const supportValue = Number(
											typeof support === 'object'? support.y: support
										).toFixed(2);

										const result = `Time: ${(hs/60).toFixed(0)}hs Support: ${supportValue}% Approval: ${approvalValue}%`;

										return result;
									},
									title() {
										return '';
									}
								},
								displayColors: false,
								intersect: false,
								mode: 'index'
							}
						},
						responsive: true,
						scales: {
							x: {
								display: true,
								grid: {
									display: true,
									drawOnChartArea: false
								},
								ticks: {
									callback(v: any) {
										return (v / (60 * 24)).toFixed(0);
									},
									max: labelsLength,
									stepSize: Math.round(labelsLength / (labelsLength/(60 * 24)))
								} as any,
								type: 'linear'
							},
							y: {
								beginAtZero: false,
								display: true,
								grid: {
									display: false // Hide y-axis grid lines
								},
								max: 100,
								min: 0,
								ticks: {
									callback(val: any) {
										return val + '%';
									},
									stepSize: 20
								}
							}
						}
					}}
				/>
			</article>
			<article className='mt-5 mx-10 flex items-center justify-start gap-x-5'>
				<div className='flex flex-col items-center'>
					<div className='w-10 h-0.5 rounded-full bg-[#E5007A]'></div>
					<p className='text-xs text-bodyBlue my-0.5'>Support</p>
				</div>
				<div className='flex flex-col items-center'>
					<div className='w-10 h-0.5 rounded-full bg-[#5BC044]'></div>
					<p className='text-xs text-bodyBlue my-0.5'>Approval</p>
				</div>
			</article>
		</Spin>
	);
};
export default Curves;