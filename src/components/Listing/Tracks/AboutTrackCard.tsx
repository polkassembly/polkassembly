// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Tooltip , Skeleton } from 'antd';
import BN from 'bn.js';
import React, { FC, useEffect, useState } from 'react';
import formatBnBalance from 'src/util/formatBnBalance';

import { chainProperties } from '~src/global/networkConstants';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import DelegateModal from './DelegateModal';
import { useApiContext, useNetworkContext } from '~src/context';
import { TrackProps } from '~src/types';
import { ChartData, Point } from 'chart.js';
import { getTrackFunctions } from '../../Post/GovernanceSideBar/Referenda/util';
import blockToTime from '~src/util/blockToTime';
import dynamic from 'next/dynamic';

const Curves = dynamic(() => import('./Curves'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});
// import DelegateModalEthV2 from './DelegateModalEthV2';

interface IAboutTrackCardProps {
	className?: string;
	trackName: string;
}

const getDefaultTrackMetaData = () => {
	return {
		confirmPeriod: '',
		decisionDeposit: '',
		decisionPeriod: '',
		description: '',
		group: '',
		maxDeciding: '',
		minEnactmentPeriod: '',
		preparePeriod: '',
		trackId: 0
	};
};

export const getTrackData = (network: string, trackName?: string, trackNumber?: number) => {
	const defaultTrackMetaData = getDefaultTrackMetaData();
	if (!network) return defaultTrackMetaData;
	let trackMetaData: TrackProps | undefined = undefined;
	if (trackName) {
		trackMetaData = networkTrackInfo[network][trackName];
	} else if (trackNumber || trackNumber === 0) {
		trackMetaData = Object.values(networkTrackInfo[network]).find((v) => v && v.trackId === trackNumber);
	}
	if (trackMetaData) {
		Object.keys(defaultTrackMetaData).forEach((key) => {
			(defaultTrackMetaData as any)[key] = trackMetaData?.[key];
		});
	}
	const tracks = localStorage.getItem('tracks');
	if (tracks) {
		const tracksArr = JSON.parse(tracks) as any[];
		if (tracksArr && Array.isArray(tracksArr) && tracksArr.length > 0) {
			const currTrackMetaDataArr = tracksArr.find((v) => v && Array.isArray(v) && v.length > 1 && v[0] === trackMetaData?.trackId);
			if (currTrackMetaDataArr && Array.isArray(currTrackMetaDataArr) && currTrackMetaDataArr.length >= 2) {
				const currTrackMetaData = currTrackMetaDataArr[1];
				const keys = ['confirmPeriod', 'decisionDeposit', 'decisionPeriod', 'maxDeciding', 'minEnactmentPeriod', 'preparePeriod'];
				keys.forEach((key) => {
					if (currTrackMetaData[key]) {
						(defaultTrackMetaData as any)[key] = currTrackMetaData[key];
					}
				});
			}
		}
	}
	return defaultTrackMetaData;
};

export const blocksToRelevantTime = (network: string, blocks:number): string => {
	const blockTimeSeconds:number = chainProperties?.[network]?.blockTime / 1000;
	let divisor:number = 1;
	let text:string = 'sec';

	const blockSeconds = blocks*blockTimeSeconds;

	if(blockSeconds > 60 && blockSeconds <= 3600) {
		divisor = 60;
		text = 'min';
	} else if (blockSeconds > 3600 && blockSeconds < 86400) {
		divisor = 3600;
		text = 'hrs';
	} else if (blockSeconds >= 86400) {
		divisor = 86400;
		text = 'days';
	}

	return `${blockSeconds/divisor} ${text}`;
};

const AboutTrackCard: FC<IAboutTrackCardProps> = (props) => {
	const { network } = useNetworkContext();
	const { className, trackName } = props;
	const [trackMetaData, setTrackMetaData] = useState(getDefaultTrackMetaData());
	useEffect(() => {
		setTrackMetaData(getTrackData(network, trackName));
	}, [network, trackName]);
	const [data, setData] = useState<any>({
		datasets: [],
		labels: []
	});
	const [curvesLoading, setCurvesLoading] = useState(true);
	//get the track number of the track
	const track_number = trackMetaData?.trackId;
	const { api, apiReady } = useApiContext();
	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}
		setCurvesLoading(true);
		const getData = async () => {
			const tracks = network != 'collectives' ? api.consts.referenda.tracks.toJSON() : api.consts.fellowshipReferenda.tracks.toJSON();
			if (tracks && Array.isArray(tracks)) {
				const track = tracks.find((track) => track && Array.isArray(track) && track.length >= 2 && track[0] === track_number);
				if (track && Array.isArray(track) && track.length > 1) {
					const trackInfo = track[1] as any;
					const { decisionPeriod } = trackInfo;
					const strArr = blockToTime(decisionPeriod, network)['time'].split(' ');
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
					const labels: number[] = [];
					const supportData: { x: number; y: number; }[] = [];
					const approvalData: { x: number; y: number; }[] = [];
					const { approvalCalc, supportCalc } = getTrackFunctions(trackInfo);
					for (let i = 0; i < (decisionPeriodHrs * 60); i++) {
						labels.push(i);
						if (supportCalc) {
							supportData.push({
								x: i,
								y: supportCalc((i / (decisionPeriodHrs * 60))) * 100
							});
						}
						if (approvalCalc) {
							approvalData.push({
								x: i,
								y: approvalCalc((i / (decisionPeriodHrs * 60))) * 100
							});
						}
					}
					const newData: ChartData<'line', (number | Point | null)[]> = {
						datasets: [
							{
								backgroundColor: 'transparent',
								borderColor: '#5BC044',
								borderWidth: 1,
								data: approvalData,
								label: 'Approval',
								pointHitRadius: 10,
								pointHoverRadius: 5,
								pointRadius: 0,
								tension: 0.1
							},
							{
								backgroundColor: 'transparent',
								borderColor: '#E5007A',
								borderWidth: 1,
								data: supportData,
								label: 'Support',
								pointHitRadius: 10,
								pointHoverRadius: 5,
								pointRadius: 0,
								tension: 0.1
							}
						],
						labels
					};
					setData(JSON.parse(JSON.stringify(newData)));
				}
			}
			setCurvesLoading(false);
		};
		getData();
	}
	, [api, apiReady, network , track_number]);

	return (
		<section className={`${className} bg-white drop-shadow-md rounded-xxl md:p-4`}>
			<article className="flex justify-between px-4 xs:pt-1.5">
				<div className='flex items-center gap-x-2 xs:flex-wrap'>
					<h2 className="text-xl mb-0 font-semibold leading-8 text-bodyBlue">
        About {trackName.split(/(?=[A-Z])/).join(' ')}
					</h2>
					<Tooltip color='#E5007A' title='Track Number' className='cursor-pointer'>
						<h4 className=' text-[#E5007A] text-xl mb-0 font-semibold leading-8 tracking-[0.01em]'>
          #{trackMetaData.trackId}
						</h4>
					</Tooltip>
				</div>
				<div className="xs:hidden md:flex justify-end md:p-1 lg:mr-3 xl:mr-1.5">
					{!['moonbeam', 'moonbase', 'moonriver'].includes(network) &&
    <DelegateModal trackNum={trackMetaData?.trackId} />}
				</div>
			</article>

			<p className="mt-0 font-normal text-base leading-6 text-bodyBlue px-4">{trackMetaData?.description}</p>

			<article className='md:flex md:justify-between'>
				<section className="mt-1.5 text-xs w-full md:w-[70%] md:grid md:grid-cols-3 flex flex-wrap">
					<article className="xs:w-1/2 sm:w-1/2 lg:w-auto px-4">
						<div className="flex flex-col">
							<span className="font-medium text-sm text-lightBlue whitespace-pre">Max Deciding</span>
							<span className="text-lg font-medium leading-7 text-bodyBlue my-1.5 whitespace-pre">{trackMetaData.maxDeciding}</span>
						</div>
					</article>

					<article className="xs:w-1/2 sm:w-1/2 lg:w-auto px-4">
						<div className="flex flex-col">
							<span className="font-medium text-sm text-lightBlue whitespace-pre">Confirm Period</span>
							<span className="text-lg font-medium leading-7 text-bodyBlue my-1.5 whitespace-pre">{blocksToRelevantTime(network, Number(trackMetaData.confirmPeriod))}</span>
						</div>
					</article>

					<article className="xs:w-1/2 sm:w-1/2 lg:w-auto px-4">
						<div className='flex flex-col'>
							<span className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Min. Enactment Period</span>
							<span className='whitespace-pre text-lg font-medium leading-7 text-bodyBlue my-1.5'>{blocksToRelevantTime(network, Number(trackMetaData.minEnactmentPeriod))}</span>
						</div>
					</article>

					<article className="xs:w-1/2 sm:w-1/2 lg:w-auto px-4">
						<div className='flex flex-col'>
							<span className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Decision Period</span>
							<span className='whitespace-pre text-lg font-medium leading-7 text-bodyBlue my-1.5'>{blocksToRelevantTime(network, Number(trackMetaData.decisionPeriod))}</span>
						</div>
					</article>

					<article className="xs:w-1/2 sm:w-1/2 lg:w-auto px-4">
						<div className='flex flex-col'>
							<span className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Decision Deposit</span>
							<span className='text-lg font-medium leading-7 text-bodyBlue my-1.5 whitespace-pre'>
								{trackMetaData.decisionDeposit &&
              formatUSDWithUnits(formatBnBalance(`${trackMetaData.decisionDeposit}`.startsWith('0x') ? new BN(`${trackMetaData.decisionDeposit}`.slice(2), 'hex') : trackMetaData.decisionDeposit, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)
								}
							</span>
						</div>
					</article>

					<article className="xs:w-1/2 sm:w-1/2 lg:w-auto px-4">
						<div className='flex flex-col'>
							<span className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Prepare Period</span>
							<span className='whitespace-pre text-lg font-medium leading-7 text-bodyBlue my-1.5'>{blocksToRelevantTime(network, Number(trackMetaData.preparePeriod))}</span>
						</div>
					</article>
				</section>
				<section className='flex justify-center xs:mt-6 sm:mt-0 mr-5 mb-5 md:w-[30%]'>
					<Curves curvesLoading={curvesLoading} data={data} />
				</section>
			</article>

			<Divider className='xs:block sm:hidden' />

			<article className="md:hidden xs:flex justify-end pt-0 px-4 pb-4 md:p-4">
				{!['moonbeam', 'moonbase', 'moonriver'].includes(network) &&
      <DelegateModal trackNum={trackMetaData?.trackId} />}
			</article>
		</section>

	);
};

export default AboutTrackCard;
