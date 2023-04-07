// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import React, { FC, useEffect, useState } from 'react';
import { useApiContext, useNetworkContext, usePostDataContext } from '~src/context';
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
import { makeLinearCurve, makeReciprocalCurve } from './util';

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
		approvalThreshold: 0,
		support: 0,
		supportThreshold: 0
	});
	const { network } = useNetworkContext();
	const { postData: { created_at, track_number } } = usePostDataContext();
	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}
		setLoading(true);

		const getData = async () => {
			const tracks = api.consts.referenda.tracks.toJSON();
			if (tracks && Array.isArray(tracks)) {
				const track = tracks.find((track) => track && Array.isArray(track) && track.length >= 2 && track[0] === track_number);
				if (track && Array.isArray(track) && track.length > 1) {
					const trackInfo = track[1] as any;
					const { decisionPeriod } = trackInfo;
					const strArr = blockToTime(decisionPeriod, network).split(' ');
					let decisionPeriodHrs = 0;
					if (strArr && Array.isArray(strArr)) {
						strArr.forEach((str) => {
							if (str.includes('h')) {
								decisionPeriodHrs += parseInt(str.replace('h', ''));
							} else if (str.includes('d')) {
								decisionPeriodHrs += parseInt(str.replace('d', '')) * 24;
							}
						});
					}
					let labels: number[] = [];
					let supportData: (number | { x: number; y: number; })[] = [];
					let approvalData: (number | { x: number; y: number; })[] = [];
					const currentApprovalData: { x: number; y: number; }[] = [];
					const currentSupportData: { x: number; y: number; }[] = [];
					let supportCalc: any = null;
					let approvalCalc: any = null;
					if (trackInfo) {
						if (trackInfo.minApproval) {
							if (trackInfo.minApproval.reciprocal) {
								approvalCalc = makeReciprocalCurve(trackInfo.minApproval.reciprocal);
							} else if (trackInfo.minApproval.linearDecreasing) {
								approvalCalc = makeLinearCurve(trackInfo.minApproval.linearDecreasing);
							}
						}
						if (trackInfo.minSupport) {
							if (trackInfo.minSupport.reciprocal) {
								supportCalc = makeReciprocalCurve(trackInfo.minSupport.reciprocal);
							} else if (trackInfo.minSupport.linearDecreasing) {
								supportCalc = makeLinearCurve(trackInfo.minSupport.linearDecreasing);
							}
						}
					}
					for (let i = 0; i < decisionPeriodHrs + 1; i++) {
						labels.push(i);
						if (supportCalc) {
							supportData.push(supportCalc((i / decisionPeriodHrs)) * 100);
						}
						if (approvalCalc) {
							approvalData.push(approvalCalc((i / decisionPeriodHrs)) * 100);
						}
					}
					const { data, error } = await nextApiClientFetch<ICurvePointsResponse>('api/v1/curves', {
						postId: referendumId
					});
					if (!error || !data) {
						const graph_points = data?.graph_points || [];
						labels = [];
						approvalData = [];
						supportData = [];
						if (graph_points?.length > 0) {
							const lastGraphPoint = graph_points[graph_points.length - 1];
							const decisionPeriodHrs = dayjs(lastGraphPoint.time).diff(dayjs(created_at), 'hour');
							graph_points?.forEach((graph_point) => {
								const hour = dayjs(graph_point.time).diff(dayjs(created_at), 'hour');
								const new_graph_point = {
									...graph_point,
									hour
								};
								labels.push(hour);
								approvalData.push({
									x: hour,
									y: approvalCalc((hour / decisionPeriodHrs)) * 100
								});
								supportData.push({
									x: hour,
									y: supportCalc((hour / decisionPeriodHrs)) * 100
								});
								currentApprovalData.push({
									x: hour,
									y: new_graph_point.approval_percent
								});
								currentSupportData.push({
									x: hour,
									y: new_graph_point.support_percent
								});
								return new_graph_point;
							});
							setProgress({
								approval: graph_points[graph_points.length - 1].approval_percent,
								approvalThreshold: (approvalData[approvalData.length - 1] as any).y,
								support: graph_points[graph_points.length - 1].support_percent,
								supportThreshold: (supportData[supportData.length - 1] as any).y
							});
						}
					} else {
						setError(error || 'Something went wrong.');
					}
					const newData: ChartData<'line', (number | Point | null)[]> = {
						datasets: [
							{
								borderColor: '#5BC044',
								borderWidth: 2,
								data: approvalData.slice(1),
								label: 'Approval',
								pointHitRadius: 10,
								pointHoverRadius: 5,
								pointRadius: 0,
								tension: 0.1
							},
							{
								borderColor: '#E5007A',
								borderWidth: 2,
								data: supportData.slice(1),
								label: 'Support',
								pointHitRadius: 10,
								pointHoverRadius: 5,
								pointRadius: 0,
								tension: 0.1
							},
							{
								borderColor: '#7F64FF',
								borderWidth: 2,
								data: currentApprovalData.slice(1),
								label: 'Current Approval',
								pointHitRadius: 10,
								pointHoverRadius: 5,
								pointRadius: 0,
								tension: 0.1

							},
							{
								borderColor: '#334D6E',
								borderWidth: 2,
								data: currentSupportData.slice(1),
								label: 'Current Support',
								pointHitRadius: 10,
								pointHoverRadius: 5,
								pointRadius: 0,
								tension: 0.1
							}
						],
						labels
					};
					setData(newData);
				}
			}
			setLoading(false);
		};
		getData();
	}, [api, apiReady, referendumId, created_at, track_number, network]);
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
													const approval = data.datasets[0].data[dataIndex];
													const support = data.datasets[1].data[dataIndex];
													const approvalValue = Number(
														typeof approval === 'object'? approval.y: approval
													).toFixed(2);
													const supportValue = Number(
														typeof support === 'object'? support.y: support
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
											beginAtZero: false,
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
											beginAtZero: false,
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
						<article className='flex items-center justify-between gap-x-2 -mt-10'>
							<div className='flex-1 p-[12.5px] bg-[#FFF5FB] rounded-[5px] shadow-[0px_6px_10px_rgba(0,0,0,0.06)]'>
								<p className='flex items-center gap-x-2 justify-between text-[10px] leading-3 text-[#334D6E]'>
									<span className='font-semibold'>Current Approval</span>
									<span className='font-normal'>{progress.approval}%</span>
								</p>
								<p className='flex items-center gap-x-2 justify-between text-[10px] leading-3 text-[#334D6E]'>
									<span className='font-semibold'>Threshold</span>
									<span className='font-normal'>{progress.approvalThreshold && progress.approvalThreshold.toFixed(1)}%</span>
								</p>
							</div>
							<div className='flex-1 p-[12.5px] bg-[#FFF5FB] rounded-[5px] shadow-[0px_6px_10px_rgba(0,0,0,0.06)]'>
								<p className='flex items-center gap-x-2 justify-between text-[10px] leading-3 text-[#334D6E]'>
									<span className='font-semibold'>Current Support</span>
									<span className='font-normal'>{progress.support}%</span>
								</p>
								<p className='flex items-center gap-x-2 justify-between text-[10px] leading-3 text-[#334D6E]'>
									<span className='font-semibold'>Threshold</span>
									<span className='font-normal'>{progress.supportThreshold && progress.supportThreshold.toFixed(1)}%</span>
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