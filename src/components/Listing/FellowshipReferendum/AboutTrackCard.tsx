// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React, { FC, useEffect, useState, useContext } from 'react';
import formatBnBalance from 'src/util/formatBnBalance';

import { NetworkContext } from '~src/context/NetworkContext';
import { chainProperties } from '~src/global/networkConstants';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { ChartData, Point } from 'chart.js';
import { getTrackFunctions } from '../../Post/GovernanceSideBar/Referenda/util';
import blockToTime from '~src/util/blockToTime';
import { useApiContext } from '~src/context';
import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';
const Curves = dynamic(() => import('../Tracks/Curves'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});
interface IAboutTrackCardProps {
	className?: string;
	trackName: string;
    fellowshipReferendumPostOrigins: string[];
}

const AboutTrackCard: FC<IAboutTrackCardProps> = (props) => {
	const { className, trackName, fellowshipReferendumPostOrigins } = props;
	const { network } = useContext(NetworkContext);
	const trackMetaData = networkTrackInfo[network][trackName];
	const [data, setData] = useState<any>({
		datasets: [],
		labels: []
	});
	const [curvesLoading, setCurvesLoading] = useState(true);
	//get the track number of the track
	const track_number = trackMetaData?.trackId;
	const { api, apiReady } = useApiContext();
	const blockTimeSeconds:number = chainProperties?.[network]?.blockTime / 1000;

	const blocksToRelevantTime = (blocks:number): string => {
		let divisor:number = 1;
		let text:string = 'sec';

		const blockSeconds = blocks*blockTimeSeconds;

		if(blockSeconds >= 60 && blockSeconds < 3600) {
			divisor = 60;
			text = 'min';
		} else if (blockSeconds >= 3600 && blockSeconds < 86400) {
			divisor = 3600;
			text = 'hrs';
		} else if (blockSeconds >= 86400) {
			divisor = 86400;
			text = 'days';
		}

		return `${blockSeconds/divisor} ${text}`;
	};

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

	if (!fellowshipReferendumPostOrigins.includes(trackName)) {
		return (
			<div className={`${className} bg-white drop-shadow-md rounded-xxl p-4 md:p-8`}>
				<h2 className="text-xl font-semibold leading-8 text-bodyBlue">Member Referenda</h2>
				<p className="mt-5 text-sm text-bodyBlue font-normal">
                    Aggregation of data across all membership referenda
				</p>
			</div>
		);
	}

	return (
		<section className={`${className} bg-white drop-shadow-md rounded-xxl md:p-4`}>
			<article className="flex justify-between px-4 xs:pt-1.5">
				<h2 className="text-xl mb-0 font-semibold leading-8 text-bodyBlue">
						About {trackName.split(/(?=[A-Z])/).join(' ')}
				</h2>

				<h2 className="text-sm text-pink_primary">{trackMetaData?.group}</h2>
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
							<span className="text-lg font-medium leading-7 text-bodyBlue my-1.5 whitespace-pre">{blocksToRelevantTime(Number(trackMetaData.confirmPeriod))}</span>
						</div>
					</article>
					<article className="xs:w-1/2 sm:w-1/2 lg:w-auto px-4">
						<div className='flex flex-col'>
							<span className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Min. Enactment Period</span>
							<span className='whitespace-pre text-lg font-medium leading-7 text-bodyBlue my-1.5'>{blocksToRelevantTime(Number(trackMetaData.minEnactmentPeriod))}</span>
						</div>
					</article>

					<article className="xs:w-1/2 sm:w-1/2 lg:w-auto px-4">
						<div className='flex flex-col'>
							<span className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Decision Period</span>
							<span className='whitespace-pre text-lg font-medium leading-7 text-bodyBlue my-1.5'>{blocksToRelevantTime(Number(trackMetaData.minEnactmentPeriod))}</span>
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
							<span className='whitespace-pre text-lg font-medium leading-7 text-bodyBlue my-1.5'>{blocksToRelevantTime(Number(trackMetaData.preparePeriod))}</span>
						</div>
					</article>
				</section>
				<section className='flex justify-center xs:mt-6 sm:mt-0 mr-5 mb-5 md:w-[30%]'>
					<Curves curvesLoading={curvesLoading} data={data} />
				</section>
			</article>
		</section>
	);
};

export default AboutTrackCard;
