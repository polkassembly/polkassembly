// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col, Divider, Row, Tooltip } from 'antd';
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
		<div className={`${className} bg-white drop-shadow-md rounded-xxl p-4 md:p-8`}>
			<div className="flex justify-between">
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
				<h2 className="text-sm text-pink_primary">{trackMetaData?.group}</h2>
			</div>

			<p className="mt-0 font-normal text-base leading-6 text-bodyBlue">{trackMetaData?.description}</p>

			<div className="mt-8 text-xs w-full max-w-[1000px]">
				<Row gutter={[16, 16]}>
					<Col xs={24} sm={12} md={8} lg={4} xl={4}>
						<Row className='flex flex-col'>
							<Col span={15} className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Max Deciding</Col>
							<Col span={9} className='text-lg font-medium leading-7 text-bodyBlue mt-2 whitespace-pre'>{trackMetaData.maxDeciding}</Col>
						</Row>
					</Col>

					<Col xs={24} sm={12} md={8} lg={4} xl={4}>
						<Row className='flex flex-col'>
							<Col span={15} className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Confirm Period</Col>
							<Col span={9} className='whitespace-pre text-lg font-medium leading-7 text-bodyBlue mt-2'>{blocksToRelevantTime(network, Number(trackMetaData.confirmPeriod))}</Col>
						</Row>
					</Col>

					<Col xs={24} sm={12} md={8} lg={4} xl={4}>
						<Row className='flex flex-col'>
							<Col span={15} className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Min. Enactment Period</Col>
							<Col span={9} className='whitespace-pre text-lg font-medium leading-7 text-bodyBlue mt-2'>{blocksToRelevantTime(network, Number(trackMetaData.minEnactmentPeriod))}</Col>
						</Row>
					</Col>

					<Col xs={24} sm={12} md={8} lg={4} xl={4}>
						<Row className='flex flex-col lg:mx-16'>
							<Col span={15} className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Decision Period</Col>
							<Col span={9} className='whitespace-pre text-lg font-medium leading-7 text-bodyBlue mt-2'>{blocksToRelevantTime(network, Number(trackMetaData.decisionPeriod))}</Col>
						</Row>
					</Col>

					<Col xs={24} sm={12} md={8} lg={4} xl={4}>
						<Row className='flex flex-col lg:mx-20'>
							<Col span={15} className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Decision Deposit</Col>
							<Col span={9} className='text-lg font-medium leading-7 text-bodyBlue mt-2 whitespace-pre'>
								{trackMetaData.decisionDeposit &&
              formatUSDWithUnits(formatBnBalance(`${trackMetaData.decisionDeposit}`.startsWith('0x') ? new BN(`${trackMetaData.decisionDeposit}`.slice(2), 'hex') : trackMetaData.decisionDeposit, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)
								}
							</Col>
						</Row>
					</Col>

					<Col xs={24} sm={12} md={8} lg={4} xl={4}>
						<Row className='flex flex-col lg:mx-24'>
							<Col span={15} className='font-medium leading-5 text-sm text-lightBlue whitespace-pre'>Prepare Period</Col>
							<Col span={9} className='whitespace-pre text-lg font-medium leading-7 text-bodyBlue mt-2 whitespace-pre'>{blocksToRelevantTime(network, Number(trackMetaData.preparePeriod))}</Col>
						</Row>
					</Col>
				</Row>
			</div>

			<Divider />

			<div className="flex justify-end">
				{!['moonbeam', 'moonbase', 'moonriver'].includes(network) &&
      <DelegateModal trackNum={trackMetaData?.trackId} />}
			</div>
		</div>

	);
};

export default AboutTrackCard;
