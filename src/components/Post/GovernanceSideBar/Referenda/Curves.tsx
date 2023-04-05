// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import React, { FC, useEffect, useState } from 'react';
import { useApiContext } from '~src/context';
import { calcCurves, getChartResult } from './util';
import BN from 'bn.js';
import { BN_ZERO, isBn } from '@polkadot/util';
import * as Chart from 'react-chartjs-2';import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	ChartData,
	Point
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
    referendumId: number;
}

const Curves: FC<ICurvesProps> = (props) => {
	const { referendumId } = props;
	const { api, apiReady } = useApiContext();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [data, setData] = useState<any>({
		datasets: [],
		labels: []
	});
	console.log(referendumId, data);
	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}
		setLoading(true);
		api.query.referenda.referendumInfoFor.multi([referendumId]).then(async (res) => {
			const referendaInfo = res[0].unwrap();
			console.log(referendaInfo.isOngoing);
			if (referendaInfo.isOngoing) {
				const info = referendaInfo.asOngoing.toJSON();
				const tracks = api.consts.referenda.tracks.toJSON();
				if (tracks && Array.isArray(tracks)) {
					const track = tracks.find((track) => track && Array.isArray(track) && track.length >= 2 && track[0] === info.track);
					if (track && Array.isArray(track) && track.length > 1) {
						const trackInfo = track[1] as any;
						trackInfo.decisionPeriod = new BN(trackInfo.decisionPeriod);
						const { ceil, floor, length } = trackInfo.minApproval.linearDecreasing;
						trackInfo.minApproval.linearDecreasing = {
							ceil: new BN(ceil),
							floor: new BN(floor),
							length: new BN(length)
						};
						const { factor, xOffset, yOffset } = trackInfo.minSupport.reciprocal;
						trackInfo.minSupport.reciprocal = {
							factor: new BN(factor),
							xOffset: new BN(xOffset),
							yOffset: new BN(yOffset)
						};
						const totalIssuance = await api.query.balances.totalIssuance();
						const inactiveIssuance = await api.query.balances.inactiveIssuance();
						const activeIssuance = totalIssuance.sub(inactiveIssuance || BN_ZERO);
						const trackGraph = calcCurves(trackInfo);
						const data = getChartResult(activeIssuance, true, referendaInfo, trackInfo, trackGraph);
						console.log(trackInfo);
						if (data && Array.isArray(data) && data.length > 1) {
							console.log('activeIssuance', activeIssuance, data[0].labels.length);
							const newData: ChartData<'line', (number | Point | null)[]> = {
								datasets: [
									{
										backgroundColor: '#5BC044',
										borderColor: '#000',
										borderWidth: 0,
										data: data[0].values[0].map((value) => isBn(value)? value.toNumber(): value),
										label: 'Approval'
									},
									{
										borderColor: '#68D183',
										borderDash: [5, 5],
										data: data[0].values[1].map((value) => isBn(value)? value.toNumber(): value),
										label: 'Current Approval',
										tension: 0.1
									},
									{
										backgroundColor: '#E5007A',
										borderColor: '#000',
										borderWidth: 0,
										data: data[1].values[0].map((value) => isBn(value)? value.toNumber(): value),
										label: 'Support'
									},
									{
										backgroundColor: '#FFF',
										borderColor: '#E5007A',
										borderDash: [5, 5],
										data: data[1].values[1].map((value) => isBn(value)? value.toNumber(): value),
										label: 'Current Support'
									}
								],
								labels: data[0].labels
							};
							setData(newData);
						}
					}
				}
			}
			setLoading(false);
		}).catch((err) => {
			console.log(err);
			setLoading(false);
			if (err) {
				if (typeof err === 'string') {
					setError(err);
				} else if (err.message && typeof err.message === 'string') {
					setError(err.message);
				} else {
					setError('Something went wrong.');
				}
			} else {
				setError('Something went wrong.');
			}
		});
	}, [api, apiReady, referendumId]);
	return (
		<Spin indicator={<LoadingOutlined />} spinning={loading}>
			{
				error?
					<p className='text-red-500 font-medium text-center'>
						{error}
					</p>
					: <div className='h-[500px]'>
						<Chart.Line
							data={data}
							options={{
								aspectRatio: 0,
								maintainAspectRatio: true,
								scales: {
									y: {
										beginAtZero: true
									}
								}
							}}
						/>
					</div>
			}
		</Spin>
	);
};

export default Curves;