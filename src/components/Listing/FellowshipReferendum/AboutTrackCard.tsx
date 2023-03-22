// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col, Row } from 'antd';
import BN from 'bn.js';
import React, { FC, useContext } from 'react';
import formatBnBalance from 'src/util/formatBnBalance';

import { NetworkContext } from '~src/context/NetworkContext';
import { chainProperties } from '~src/global/networkConstants';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';

interface IAboutTrackCardProps {
	className?: string;
	trackName: string;
    fellowshipReferendumPostOrigins: string[];
}

const AboutTrackCard: FC<IAboutTrackCardProps> = (props) => {
	const { className, trackName, fellowshipReferendumPostOrigins } = props;
	const { network } = useContext(NetworkContext);

	if (!fellowshipReferendumPostOrigins.includes(trackName)) {
		return (
			<div className={'bg-white drop-shadow-md rounded-md p-4 md:p-8 text-sidebarBlue'}>
				<h2 className="text-lg capitalize">Member Referenda</h2>
				<p className="mt-5 text-sm font-normal">
                    Aggregation of data across all membership referenda
				</p>
			</div>
		);
	}
	const trackMetaData = networkTrackInfo[network][trackName];

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
							<Col span={15} className='font-bold'>Max Deciding:</Col>
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
		</div>
	);
};

export default AboutTrackCard;
