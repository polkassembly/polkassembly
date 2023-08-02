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
	const options = {
		plugins:{
			legend: {
				display: false
			}
		},
		scales: {
			x: {
				beginAtZero: false,
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
				} as any
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
	};
	return(
		<Spin indicator={<LoadingOutlined />} spinning={curvesLoading}>

			<article className='sm:-mx-3 md:m-0 max-w-[350px] max-h-[800px]'>
				<Chart.Line
					className='h-full w-full'
					data={data}
					options={options}
					plugins={[hoverLinePlugin]}
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

const hoverLinePlugin = {
	beforeDraw: (chart: any) => {
		const options = chart.config.options?.plugins?.hoverLine ?? {};

		if (!options) {
			return;
		}

		const { lineWidth, lineColor } = options ?? {};

		if (chart?.tooltip?._active && chart?.tooltip?._active.length) {
			const { ctx } = chart;
			ctx.save();

			ctx.beginPath();
			ctx.moveTo(chart.tooltip._active[0].element.x, chart.chartArea.top);
			ctx.lineTo(chart.tooltip._active[0].element.x, chart.chartArea.bottom);
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = lineColor;
			ctx.stroke();
			ctx.restore();
		}
	},
	id: 'hoverLine'
};