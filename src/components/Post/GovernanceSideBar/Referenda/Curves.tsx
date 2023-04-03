// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
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
	const [data, setData] = useState<any>({
		datasets: [],
		labels: []
	});
	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}
		api.query.referenda.referendumInfoFor.multi([referendumId]).then(async (res) => {
			const referendaInfo = res[0].unwrap();
			if (referendaInfo.isOngoing) {
				const info = referendaInfo.asOngoing.toJSON();
				const tracks = api.consts.referenda.tracks.toJSON();
				console.log(tracks);
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
						if (data && Array.isArray(data) && data.length > 1) {
							const newData: ChartData<'line', (number | Point | null)[]> = {
								datasets: [
									{
										backgroundColor: '#FFF',
										borderColor: '#000',
										borderWidth: 10,
										data: data[0].values[0].map((value) => isBn(value)? value.toNumber(): value),
										label: 'Approval'
									}
								],
								labels: data[0].labels
							};
							setData(newData);
						}
						console.log('activeIssuance', activeIssuance, data);
					}
				}
			}
		}).catch((err) => {
			console.log(err);
		});
	}, [api, apiReady, referendumId]);
	return (
		<div>
			<Chart.Line
				data={data}
				options={{
					responsive: true,
					scales: {
						y: {
							max: 100,
							min: 0
						}
					}
				}}
			/>
		</div>
	);
};

export default Curves;