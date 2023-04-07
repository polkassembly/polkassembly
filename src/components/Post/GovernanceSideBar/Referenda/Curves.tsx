// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import React, { FC, useEffect, useState } from 'react';
import { useApiContext, useNetworkContext, usePostDataContext } from '~src/context';
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
import blockToTime from '~src/util/blockToTime';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ICurvePointsResponse } from 'pages/api/v1/curves';
import dayjs from 'dayjs';

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
	const [progress, setProgress] = useState({
		approval: 0,
		support: 0
	});
	const { network } = useNetworkContext();
	const { postData: { created_at } } = usePostDataContext();
	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}
		setLoading(true);
		api.query.referenda.referendumInfoFor.multi([referendumId]).then(async (res) => {
			const referendaInfo = res[0].unwrap();
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
						if (data && Array.isArray(data) && data.length > 1) {
							setProgress({
								approval: data[0].progress.percent,
								support: data[1].progress.percent
							});
							const { data: curveData, error } = await nextApiClientFetch<ICurvePointsResponse>('api/v1/curves', {
								postId: referendumId
							});
							let graph_points: any[] = [];
							if (!error) {
								graph_points = curveData?.graph_points?.map((graph_point) => {
									return {
										...graph_point,
										hour: dayjs(graph_point.time).diff(dayjs(created_at), 'hour')
									};
								}) || [];
							}
							const first = data[0].labels?.[0] || new BN(0);
							const labels: number[] = data[0].labels.map((label) => {
								const strArr = blockToTime(label.sub(first), network).split(' ');
								let value = 0;
								if (strArr.length > 1) {
									strArr.map((str) => {
										if (str.includes('h')) {
											value += Number(str.replace('h', '').trim());
										} else if (str.includes('d')) {
											value += Number(str.replace('d', '').trim()) * 24;
										}
									});
								}
								return value;
							});
							const newData: ChartData<'line', (number | Point | null)[]> = {
								datasets: [
									{
										borderColor: '#5BC044',
										borderWidth: 2,
										data: data[0].values[0].map((value) => isBn(value)? value.toNumber(): value),
										label: 'Approval',
										pointHitRadius: 10,
										pointHoverRadius: 5,
										pointRadius: 0,
										tension: 0.1
									},
									{
										borderColor: '#E5007A',
										borderWidth: 2,
										data: data[1].values[0].map((value) => isBn(value)? value.toNumber(): value),
										label: 'Support',
										pointHitRadius: 10,
										pointHoverRadius: 5,
										pointRadius: 0,
										tension: 0.1
									},
									{
										borderColor: '#5BC044',
										borderWidth: 2,
										data: graph_points.map((graph_point) => {
											return {
												x: graph_point.hour,
												y: graph_point.approval_percent
											};
										}),
										label: 'Current Approval',
										pointHitRadius: 10,
										pointHoverRadius: 5,
										pointRadius: 0,
										tension: 0.1

									},
									{
										borderColor: '#E5007A',
										borderWidth: 2,
										data: graph_points.map((graph_point) => {
											return {
												x: graph_point.hour,
												y: graph_point.support_percent
											};
										}),
										label: 'Current Support',
										pointHitRadius: 10,
										pointHoverRadius: 5,
										pointRadius: 0,
										tension: 0.1
									}
								],
								labels: labels
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
	}, [api, apiReady, created_at, network, referendumId]);
	const labelsLength = (data?.labels?.length? typeof data.labels.length === 'number'? data.labels.length: isNaN(Number(data.labels.length))? 0: Number(data.labels.length): 0) as number;
	return (
		<Spin indicator={<LoadingOutlined />} spinning={loading}>
			{
				error?
					<p className='text-red-500 font-medium text-center'>
						{error}
					</p>
					: <section>
						<article className='h-[400px]'>
							<Chart.Line
								data={data}
								plugins={[hoverLinePlugin]}
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
											display: true
										},
										tooltip: {
											callbacks: {
												label(tooltipItem: any) {
													const { dataIndex, parsed, dataset } = tooltipItem;

													// only display one item
													if (dataset.label === 'Approval') {
														return '';
													}

													const hs = parsed.x;
													const supportValue = Number(
														data.datasets[0].data[dataIndex]
													).toFixed(2);
													const approvalValue = Number(
														data.datasets[1].data[dataIndex]
													).toFixed(2);

													const result = `Time: ${hs}hs Support: ${supportValue}% Approval: ${approvalValue}%`;

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
									} as any,
									scales: {
										x: {
											display: true,
											grid: {
												display: false
											},
											ticks: {
												callback(v: any) {
													return v + 'hs';
												},
												max: labelsLength,
												stepSize: Math.round(labelsLength / 100)
											} as any,
											title: {
												display: true,
												text: 'Hours'
											},
											type: 'linear'
										},
										y: {
											beginAtZero: true,
											display: true,
											max: 100,
											min: 0,
											ticks: {
												callback(val: any) {
													return val + '%';
												},
												stepSize: 10
											},
											title: {
												display: true,
												text: 'Passing Percentage'
											}
										}
									}
								}}
							/>
						</article>
						<article className='flex items-center justify-between gap-x-2'>
							<div className='flex-1 p-[12.5px] bg-[#FFF5FB] rounded-[5px] shadow-[0px_6px_10px_rgba(0,0,0,0.06)]'>
								<p className='flex items-center gap-x-2 justify-between text-[10px] leading-3 text-[#334D6E]'>
									<span className='font-semibold'>Current Approval</span>
									<span className='font-normal'>{progress.approval}%</span>
								</p>
								<p className='flex items-center gap-x-2 justify-between text-[10px] leading-3 text-[#334D6E]'>
									<span className='font-semibold'>Threshold</span>
									<span className='font-normal'>54%</span>
								</p>
							</div>
							<div className='flex-1 p-[12.5px] bg-[#FFF5FB] rounded-[5px] shadow-[0px_6px_10px_rgba(0,0,0,0.06)]'>
								<p className='flex items-center gap-x-2 justify-between text-[10px] leading-3 text-[#334D6E]'>
									<span className='font-semibold'>Current Support</span>
									<span className='font-normal'>{progress.support}%</span>
								</p>
								<p className='flex items-center gap-x-2 justify-between text-[10px] leading-3 text-[#334D6E]'>
									<span className='font-semibold'>Threshold</span>
									<span className='font-normal'>54%</span>
								</p>
							</div>
						</article>
					</section>
			}
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

		if (chart.tooltip._active && chart.tooltip._active.length) {
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