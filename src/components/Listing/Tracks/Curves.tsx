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

interface ICurvesProps {
    data: {
		datasets: any[],
		labels: any[]
	};
}

const Curves: FC<ICurvesProps> = (props) => {
	const { data } = props;
	const options = {
		plugins:{
			legend: {
				display: false
			}
		},
		scales: {
			x: {
				grid: {
					display: false // Hide x-axis grid lines
				}
			},
			y: {
				grid: {
					display: false // Hide y-axis grid lines
				}
			}
		}
	};
	return(
		<>
			<article className='-mx-3 md:m-0'>
				<Chart.Line
					className='h-full w-full'
					data={data}
					options={options}
				/>
			</article>
			<article className='mt-5 flex items-center justify-start gap-x-5'>
				<div className='flex flex-col items-center'>
					<div className='w-10 h-0.5 rounded-full bg-[#E5007A]'></div>
					<p className='text-xs text-bodyBlue my-0.5'>Support</p>
				</div>
				<div className='flex flex-col items-center'>
					<div className='w-10 h-0.5 rounded-full bg-[#5BC044]'></div>
					<p className='text-xs text-bodyBlue my-0.5'>Approval</p>
				</div>
			</article>
		</>
	);
};
export default Curves;