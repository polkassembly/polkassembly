// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

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
			<div
				className={`${className} bg-white drop-shadow-md rounded-xxl p-4 md:p-8`}
			>
				<h2 className="text-xl font-semibold leading-8 text-bodyBlue">
					Member Referenda
				</h2>
				<p className="mt-5 text-sm text-bodyBlue font-normal">
					Aggregation of data across all membership referenda
				</p>
			</div>
		);
	}
	const trackMetaData = networkTrackInfo[network][trackName];

	const blockTimeSeconds: number =
		chainProperties?.[network]?.blockTime / 1000;

	const blocksToRelevantTime = (blocks: number): string => {
		let divisor: number = 1;
		let text: string = 'sec';

		const blockSeconds = blocks * blockTimeSeconds;

		if (blockSeconds >= 60 && blockSeconds < 3600) {
			divisor = 60;
			text = 'min';
		} else if (blockSeconds >= 3600 && blockSeconds < 86400) {
			divisor = 3600;
			text = 'hrs';
		} else if (blockSeconds >= 86400) {
			divisor = 86400;
			text = 'days';
		}

		return `${blockSeconds / divisor} ${text}`;
	};

	return (
		<div
			className={`${className} bg-white drop-shadow-md rounded-xxl p-4 md:p-8`}
		>
			<div className="flex justify-between">
				<h2 className="text-xl font-semibold leading-8 text-bodyBlue">
					About {trackName.split(/(?=[A-Z])/).join(' ')}
				</h2>

				<h2 className="text-sm text-pink_primary">
					{trackMetaData?.group}
				</h2>
			</div>

			<p className="mt-0 font-normal text-base leading-6 text-bodyBlue">
				{trackMetaData?.description}
			</p>

			<div className="mt-8 text-xs w-full flex flex-wrap lg:gap-x-24">
				<div className="w-full sm:w-1/2 md:w-1/3 lg:w-auto">
					{trackMetaData.maxDeciding && (
						<div className="flex flex-col">
							<div className="font-medium leading-5 text-sm text-lightBlue">
								Max Deciding:
							</div>
							<div className="text-lg font-medium leading-7 my-2 text-bodyBlue">
								{trackMetaData.maxDeciding}
							</div>
						</div>
					)}
				</div>

				<div className="w-full sm:w-1/2 md:w-1/3 lg:w-auto">
					{trackMetaData.decisionDeposit && (
						<div className="flex flex-col">
							<div className="font-medium leading-5 text-sm text-lightBlue">
								Decision Deposit:
							</div>
							<div className="text-lg font-medium leading-7 my-2 text-bodyBlue">
								{trackMetaData.decisionDeposit &&
									formatUSDWithUnits(
										formatBnBalance(
											`${trackMetaData.decisionDeposit}`.startsWith(
												'0x',
											)
												? new BN(
														`${trackMetaData.decisionDeposit}`.slice(
															2,
														),
														'hex',
												  )
												: trackMetaData.decisionDeposit,
											{
												numberAfterComma: 2,
												withThousandDelimitor: false,
												withUnit: true,
											},
											network,
										),
										1,
									)}
							</div>
						</div>
					)}
				</div>

				<div className="w-full sm:w-1/2 md:w-1/3 lg:w-auto">
					{trackMetaData.confirmPeriod && (
						<div className="flex flex-col">
							<div className="font-medium leading-5 text-sm text-lightBlue">
								Confirm Period:
							</div>
							<div className="text-lg font-medium leading-7 my-2 text-bodyBlue">
								{blocksToRelevantTime(
									Number(trackMetaData.confirmPeriod),
								)}
							</div>
						</div>
					)}
				</div>
				<div className="w-full sm:w-1/2 md:w-1/3 lg:w-auto">
					{trackMetaData.preparePeriod && (
						<div className="flex flex-col">
							<div className="font-medium leading-5 text-sm text-lightBlue">
								Prepare Period:
							</div>
							<div className="text-lg font-medium leading-7 my-2 text-bodyBlue">
								{blocksToRelevantTime(
									Number(trackMetaData.preparePeriod),
								)}
							</div>
						</div>
					)}
				</div>

				<div className="w-full sm:w-1/2 md:w-1/3 lg:w-auto">
					{trackMetaData.minEnactmentPeriod && (
						<div className="flex flex-col">
							<div className="font-medium leading-5 text-sm text-lightBlue">
								Min. Enactment Period:
							</div>
							<div className="text-lg font-medium leading-7 my-2 text-bodyBlue">
								{blocksToRelevantTime(
									Number(trackMetaData.minEnactmentPeriod),
								)}
							</div>
						</div>
					)}
				</div>
				<div className="w-full sm:w-1/2 md:w-1/3 lg:w-auto">
					{trackMetaData.decisionPeriod && (
						<div className="flex flex-col">
							<div className="font-medium leading-5 text-sm text-lightBlue">
								Decision Period:
							</div>
							<div className="text-lg font-medium leading-7 my-2 text-bodyBlue">
								{blocksToRelevantTime(
									Number(trackMetaData.decisionPeriod),
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AboutTrackCard;
