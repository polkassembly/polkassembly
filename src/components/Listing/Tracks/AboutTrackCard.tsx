// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Tooltip } from 'antd';
import BN from 'bn.js';
import React, { FC, useEffect, useState } from 'react';
import formatBnBalance from 'src/util/formatBnBalance';

import { chainProperties } from '~src/global/networkConstants';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';

import DelegateModal from './DelegateModal';
import { useNetworkContext } from '~src/context';
import { TrackProps } from '~src/types';
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

	return (
		<div className={`${className} bg-white drop-shadow-md rounded-xxl md:p-4`}>
			<div className="flex justify-between px-4 xs:pt-2.5 sm:py-2">
				<div className='flex items-center gap-x-2 xs:flex-wrap'>
					<h2 className="text-xl font-semibold leading-8 text-bodyBlue">
        About {trackName.split(/(?=[A-Z])/).join(' ')}
					</h2>
					<Tooltip color='#E5007A' title='Track Number' className='cursor-pointer'>
						<h4 className=' text-[#E5007A] text-xl font-semibold leading-8 tracking-[0.01em]'>
          #{trackMetaData.trackId}
						</h4>
					</Tooltip>
				</div>
				<div className="xs:hidden sm:flex justify-end sm:p-2">
					{!['moonbeam', 'moonbase', 'moonriver'].includes(network) &&
    <DelegateModal trackNum={trackMetaData?.trackId} />}
				</div>
			</div>

			<p className="mt-0 font-normal text-base leading-6 text-bodyBlue px-4">{trackMetaData?.description}</p>

			<div className="mt-8 sm:pb-2 lg:pb-0 text-xs w-full flex flex-wrap gap-x-0 lg:gap-x-5 xl:gap-x-12">
				<div className="xs:w-1/2 md:w-1/3 lg:w-auto px-4">
					<div className="flex flex-col">
						<div className="font-medium text-sm text-lightBlue whitespace-pre">Max Deciding</div>
						<div className="text-lg font-medium leading-7 text-bodyBlue my-2 whitespace-pre">{trackMetaData.maxDeciding}</div>
					</div>
				</div>

				<div className="xs:w-1/2 md:w-1/3 lg:w-auto px-4">
					<div className="flex flex-col">
						<div className="font-medium text-sm text-lightBlue whitespace-pre">Confirm Period</div>
						<div className="text-lg font-medium leading-7 text-bodyBlue my-2 whitespace-pre">{blocksToRelevantTime(network, Number(trackMetaData.confirmPeriod))}</div>
					</div>
				</div>

				<div className="xs:w-1/2 md:w-1/3 lg:w-auto px-4">
					<div className='flex flex-col'>
						<div className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Min. Enactment Period</div>
						<div className='whitespace-pre text-lg font-medium leading-7 text-bodyBlue my-2'>{blocksToRelevantTime(network, Number(trackMetaData.minEnactmentPeriod))}</div>
					</div>
				</div>

				<div className="xs:w-1/2 md:w-1/3 lg:w-auto px-4">
					<div className='flex flex-col'>
						<div className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Decision Period</div>
						<div className='whitespace-pre text-lg font-medium leading-7 text-bodyBlue my-2'>{blocksToRelevantTime(network, Number(trackMetaData.decisionPeriod))}</div>
					</div>
				</div>

				<div className="xs:w-1/2 md:w-1/3 lg:w-auto px-4">
					<div className='flex flex-col'>
						<div className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Decision Deposit</div>
						<div className='text-lg font-medium leading-7 text-bodyBlue my-2 whitespace-pre'>
							{trackMetaData.decisionDeposit &&
              formatUSDWithUnits(formatBnBalance(`${trackMetaData.decisionDeposit}`.startsWith('0x') ? new BN(`${trackMetaData.decisionDeposit}`.slice(2), 'hex') : trackMetaData.decisionDeposit, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)
							}
						</div>
					</div>
				</div>

				<div className="xs:w-1/2 md:w-1/3 lg:w-auto px-4">
					<div className='flex flex-col'>
						<div className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Prepare Period</div>
						<div className='whitespace-pre text-lg font-medium leading-7 text-bodyBlue my-2 whitespace-pre'>{blocksToRelevantTime(network, Number(trackMetaData.preparePeriod))}</div>
					</div>
				</div>
			</div>

			<Divider className='xs:block sm:hidden' />

			<div className="sm:hidden xs:flex justify-end pt-0 px-4 pb-4 sm:p-4">
				{!['moonbeam', 'moonbase', 'moonriver'].includes(network) &&
      <DelegateModal trackNum={trackMetaData?.trackId} />}
			</div>
		</div>

	);
};

export default AboutTrackCard;
