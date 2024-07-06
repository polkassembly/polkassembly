// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Divider } from 'antd';
import Image from 'next/image';
import { spaceGrotesk } from 'pages/_app';
import ImageIcon from '~src/ui-components/ImageIcon';
import TrackTag from '~src/ui-components/TrackTag';
import getAscciiFromHex from '~src/util/getAscciiFromHex';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { getTrackNameFromId } from '~src/util/trackNameFromId';

interface IBountyProposal {
	proposer: string;
	index: number;
	trackNumber: number;
	status: string;
	bountyId: number;
	reward: string;
}

interface BountiesProposalsCardProps {
	proposal: IBountyProposal;
}

const BountiesProposalsCard: React.FC<BountiesProposalsCardProps> = ({ proposal }) => {
	if (!proposal) {
		return null; // Return null or some fallback UI if proposal is undefined
	}

	const { network } = useNetworkSelector();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const { proposer, index, trackNumber, status, bountyId, reward } = proposal;

	function formatTrackName(str: string) {
		return str
			.split('_') // Split the string into words using underscores as separators
			.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
			.join(' '); // Join the words back together with a space separator
	}

	return (
		<section className='w-[383px]'>
			<div className='w-[383px]'>
				<div className='flex'>
					<div className='flex h-[56px] w-full items-center justify-between rounded-t-3xl border-b-0 border-l border-r border-t border-solid border-section-light-container bg-white px-3 pt-5 dark:border-section-dark-container dark:bg-section-light-overlay'>
						<h2 className='mt-4 text-[35px] font-normal text-pink_primary'>${Number(formatedBalance(reward.toString(), unit).replaceAll(',', ''))}</h2>
						<Divider
							type='vertical'
							className='h-[30px] bg-section-light-container dark:bg-section-dark-container'
						/>
						<h2 className='mt-3 text-[22px] font-normal'>52%</h2>
					</div>
					<div className='mb-2 ml-2 flex w-full items-center'>
						<Image
							src={'assets/bounty-icons/redirect-icon.svg'}
							width={45}
							height={45}
							alt='redirect link'
							className='-mr-[2px] cursor-pointer rounded-full bg-black'
						/>
						<div className='h-2 w-[10px] bg-black'></div>
						<button
							className={`${spaceGrotesk.className} ${spaceGrotesk.variable} -ml-[2px] h-[44px] w-[100px] cursor-pointer rounded-3xl border-none bg-black text-lg font-bold text-white`}
						>
							Vote
						</button>
					</div>
				</div>
				<div
					className={`rounded-b-3xl rounded-tr-2xl border-b border-l border-r border-t-0 
                     border-solid border-section-light-container bg-white px-3 py-1 dark:border-section-dark-container dark:bg-section-light-overlay`}
				>
					<ImageIcon
						src='/assets/bounty-icons/bounty-image.svg'
						alt='bounty icon'
						imgClassName='mt-5 mb-3'
						imgWrapperClassName=''
					/>
					<div className={`${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
						<span className='mr-1 text-base font-medium text-blue-light-medium dark:text-blue-dark-medium'>#{bountyId}</span>
						<span className='text-lg font-bold text-blue-light-high dark:text-blue-dark-high'>{proposer.slice(0, 5)}...</span>
					</div>
					<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-sm font-normal`}>{`Reward: ${formatedBalance(reward, unit)}`}</p>

					<TrackTag
						className='mb-3 mt-2'
						track={formatTrackName(getTrackNameFromId(network, trackNumber))}
					/>
				</div>
			</div>
		</section>
	);
};

export default BountiesProposalsCard;
