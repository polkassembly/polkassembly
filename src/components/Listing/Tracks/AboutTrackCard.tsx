// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col, Divider, Row } from 'antd';
import BN from 'bn.js';
import React, { FC, useEffect, useState } from 'react';
import formatBnBalance from 'src/util/formatBnBalance';

import { chainProperties } from '~src/global/networkConstants';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';

import DelegateModal from './DelegateModal';
import { useNetworkContext } from '~src/context';
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

const AboutTrackCard: FC<IAboutTrackCardProps> = (props) => {
	const { network } = useNetworkContext();

	const { className, trackName } = props;
	const [trackMetaData, setTrackMetaData] = useState(getDefaultTrackMetaData());
	useEffect(() => {
		const trackMetaData = networkTrackInfo[network][trackName];
		const defaultTrackMetaData = getDefaultTrackMetaData();
		Object.keys(defaultTrackMetaData).forEach((key) => {
			(defaultTrackMetaData as any)[key] = trackMetaData?.[key];
		});
		const tracks = localStorage.getItem('tracks');
		if (tracks) {
			const tracksArr = JSON.parse(tracks) as any[];
			if (tracksArr && Array.isArray(tracksArr) && tracksArr.length > 0) {
				const currTrackMetaDataArr = tracksArr.find((v) => v && Array.isArray(v) && v.length > 1 && v[0] === trackMetaData.trackId);
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
		setTrackMetaData(defaultTrackMetaData);
	}, [network, trackName]);

	const blockTimeSeconds:number = chainProperties?.[network]?.blockTime / 1000;

	const blocksToRelevantTime = (blocks:number): string => {
		let divisor:number = 1;
		let text:string = 'sec';

		const blockSeconds = blocks*blockTimeSeconds;

		if(blockSeconds > 60 && blockSeconds < 3600) {
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

	return (
		<div className={`${className} bg-white drop-shadow-md rounded-md p-4 md:p-8 text-sidebarBlue`}>
			<div className="flex justify-between capitalize font-medium">
				<h2 className="text-lg capitalize">
						About {trackName.split(/(?=[A-Z])/).join(' ')}
				</h2>

				<h2 className="text-sm text-pink_primary">{trackMetaData?.group}</h2>
			</div>

			<p className="mt-5 text-sm font-normal">{trackMetaData?.description}</p>

			<div className="mt-8 text-xs w-full max-w-[1000px]">
				<Row gutter={[{ lg: 32, md: 16, sm: 4, xl: 32, xs: 4, xxl: 32 }, 16]}>
					<Col xs={24} sm={24} md={12} lg={12} xl={8}>
						{trackMetaData.maxDeciding && <Row>
							<Col span={15} className='font-bold'>Capacity:</Col>
							<Col span={9}>{trackMetaData.maxDeciding}</Col>
						</Row>
						}

						{trackMetaData.decisionDeposit && <Row className='mt-3'>
							<Col span={15} className='font-bold'>Decision Deposit:</Col>
							<Col span={9}>
								{trackMetaData.decisionDeposit &&
									formatUSDWithUnits(formatBnBalance(`${trackMetaData.decisionDeposit}`.startsWith('0x') ? new BN(`${trackMetaData.decisionDeposit}`.slice(2), 'hex') : trackMetaData.decisionDeposit, { numberAfterComma: 2,
										withThousandDelimitor: false, withUnit: true }, network), 1)
								}
							</Col>
						</Row>
						}
					</Col>

					<Col xs={24} sm={24} md={12} lg={12} xl={8}>
						{trackMetaData.preparePeriod && <Row>
							<Col span={15} className='font-bold'>Prepare Period:</Col>
							<Col span={9} className='whitespace-pre'>{blocksToRelevantTime(Number(trackMetaData.preparePeriod))}</Col>
						</Row>}

						{trackMetaData.confirmPeriod && <Row className='mt-3'>
							<Col span={15} className='font-bold'>Confirm Period:</Col>
							<Col span={9} className='whitespace-pre'>{blocksToRelevantTime(Number(trackMetaData.confirmPeriod))}</Col>
						</Row>}
					</Col>

					<Col xs={24} sm={24} md={12} lg={12} xl={8}>
						{trackMetaData.minEnactmentPeriod &&<Row>
							<Col xs={15} xl={19} className='font-bold'>Min Enactment Period:</Col>
							<Col xs={9} xl={5} className='whitespace-pre'>{blocksToRelevantTime(Number(trackMetaData.minEnactmentPeriod))}</Col>
						</Row>}

						{trackMetaData.decisionPeriod && <Row className='mt-3'>
							<Col xs={15} xl={19} className='font-bold'>Decision Period:</Col>
							<Col xs={9} xl={5} className='whitespace-pre'>{blocksToRelevantTime(Number(trackMetaData.decisionPeriod))}</Col>
						</Row>}
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
