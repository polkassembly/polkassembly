// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Divider } from 'antd';
import Image from 'next/image';
import { spaceGrotesk } from 'pages/_app';
import ImageIcon from '~src/ui-components/ImageIcon';
import TrackTag from '~src/ui-components/TrackTag';
// import getAscciiFromHex from '~src/util/getAscciiFromHex';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { getTrackNameFromId } from '~src/util/trackNameFromId';
import { IBountyProposal } from 'pages/api/v1/bounty/getBountyProposals';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import styled from 'styled-components';

export interface BountiesProposalsCardProps {
	proposal: IBountyProposal;
}

const CardHeader = styled.div`
	&:after {
		content: '';
		position: absolute;
		bottom: 0px;
		right: -30px;
		height: 30px;
		width: 30px;
		border-bottom-left-radius: 100%;
		border-left: 1px solid ${(props: any) => (props.theme === 'dark' ? '#3b444f' : '#d2d8e0')} !important;
		box-shadow: -9px 9px 0 4px ${(props: any) => (props.theme === 'dark' ? '#141416' : '#fff')} !important;
	}
`;

const HeaderBtns = styled.div`
	&:after {
		content: '';
		position: absolute;
		bottom: 29px;
		right: 105px;
		height: 12px;
		width: 12px;
		border-radius: 100%;
		box-shadow: 0px 4px 0 0px ${(props: any) => (props.theme === 'dark' ? 'white' : 'black')} !important;
	}
	&:before {
		content: '';
		position: absolute;
		bottom: 4px;
		right: 105px;
		height: 12px;
		width: 12px;
		border-radius: 100%;
		box-shadow: 0px -4px 0 0px ${(props: any) => (props.theme === 'dark' ? 'white' : 'black')} !important;
	}
`;

const BountiesProposalsCard: React.FC<BountiesProposalsCardProps> = ({ proposal }) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const { proposer, index, trackNumber, bountyId, reward } = proposal;
	if (!proposal) {
		return null;
	}

	function formatTrackName(str: string) {
		return str
			.split('_')
			.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	return (
		<section className='w-full md:w-[383px]'>
			<div className='w-full md:w-[383px]'>
				<div className='flex'>
					<CardHeader
						theme={theme as any}
						className='relative flex h-[56px] w-full items-center justify-between rounded-t-3xl border-b-0 border-l border-r border-t border-solid border-section-light-container bg-white px-3 pt-5 dark:border-section-dark-container dark:bg-section-light-overlay'
					>
						<h2 className='mt-4 text-[35px] font-normal text-pink_primary'>${Number(formatedBalance(reward.toString(), unit).replaceAll(',', ''))}</h2>
						<Divider
							type='vertical'
							className='h-[30px] bg-section-light-container dark:bg-section-dark-container'
						/>
						<h2 className='mt-3 text-[22px] font-normal dark:text-white'>52%</h2>
					</CardHeader>
					<Link
						href={`/referenda/${index}`}
						target='_blank'
					>
						<HeaderBtns
							theme={theme as any}
							className='relative ml-2 flex w-full items-center'
						>
							<Image
								src={theme === 'light' ? '/assets/bounty-icons/redirect-icon.svg' : '/assets/bounty-icons/redirect-icon-black.svg'}
								width={45}
								height={45}
								alt='redirect link'
								className='-mr-[2px] h-[36px] w-[36px] cursor-pointer rounded-full bg-black dark:bg-white md:h-auto md:w-auto'
							/>
							<div className='h-2 w-[10px] bg-black dark:bg-white'></div>
							<button
								className={`${spaceGrotesk.className} ${spaceGrotesk.variable} -ml-[2px] h-[36px] w-[75px] cursor-pointer rounded-3xl border-none bg-black text-base font-bold text-white dark:bg-white dark:text-black md:h-[44px] md:w-[100px] md:text-lg`}
							>
								Vote
							</button>
						</HeaderBtns>
					</Link>
				</div>
				<div
					className={`rounded-b-3xl rounded-tr-2xl border-b border-l border-r border-t-0 
                     border-solid border-section-light-container bg-white px-3 py-1 dark:border-section-dark-container dark:bg-section-light-overlay`}
				>
					<ImageIcon
						src='/assets/bounty-icons/bounty-image.svg'
						alt='bounty icon'
						imgClassName='mt-5 mb-3 w-full md:w-auto'
						imgWrapperClassName=''
					/>
					<div className={`${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
						<span className='mr-1 text-base font-medium text-blue-light-medium dark:text-blue-dark-medium'>#{bountyId}</span>
						<span className='text-lg font-bold text-blue-light-high dark:text-blue-dark-high'>{proposer.slice(0, 5) || 'Unknown'}</span>
					</div>
					<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium`}>{`Reward: ${formatedBalance(
						reward,
						unit
					)}`}</p>

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
