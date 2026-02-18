// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { dmSans, spaceGrotesk } from 'pages/_app';
import ImageIcon from '~src/ui-components/ImageIcon';
import TrackTag from '~src/ui-components/TrackTag';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import { getTrackNameFromId } from '~src/util/trackNameFromId';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import styled from 'styled-components';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Skeleton from '~src/basic-components/Skeleton';
import ImageComponent from '../ImageComponent';
import VotesProgressInListing from '~src/ui-components/VotesProgressInListing';
import getReferendumVotes from '~src/util/getReferendumVotes';
import { getPeriodData } from '~src/util/getPeriodData';
import dayjs from 'dayjs';
import { IPeriod } from '~src/types';
import { getTrackData } from '../Listing/Tracks/AboutTrackCard';
import { getStatusBlock } from '~src/util/getStatusBlock';
import { GetCurrentTokenPrice } from '~src/util/getCurrentTokenPrice';
import { formatTrackName, getFormattedValue } from './utils/formatBalanceUsd';
import { IDelegationProfileType } from '~src/auth/types';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import getAscciiFromHex from '~src/util/getAscciiFromHex';
import { removeSymbols } from '~src/util/htmlDiff';
export interface BountiesProposalsCardProps {
	activeData: any;
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

const BtnLine = styled.div`
	&:after {
		content: '';
		position: absolute;
		bottom: 8px;
		right: -1px;
		height: 12px;
		width: 12px;
		border-radius: 100%;
		box-shadow: 0px 4px 0 0px ${(props: any) => (props.theme === 'dark' ? 'white' : 'black')} !important;
	}
	&:before {
		content: '';
		position: absolute;
		bottom: -13px;
		right: -1px;
		height: 12px;
		width: 12px;
		border-radius: 100%;
		box-shadow: 0px -4px 0 0px ${(props: any) => (props.theme === 'dark' ? 'white' : 'black')} !important;
	}
`;

const BountiesProposalsCard: React.FC<BountiesProposalsCardProps> = ({ activeData }) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const { track_no, tags, title, content, reward, user_id, post_id, tally, created_at, timeline, proposer, description } = activeData;
	/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
	const [decision, setDecision] = useState<IPeriod>();
	const decidingStatusBlock = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'Deciding');
	const [loading, setLoading] = useState(false);
	const [votesData, setVotesData] = useState(null);
	const [currentTokenPrice, setCurrentTokenPrice] = useState({
		isLoading: true,
		value: ''
	});
	const [profileDetails, setProfileDetails] = useState<IDelegationProfileType>({
		bio: '',
		image: '',
		social_links: [],
		user_id: 0,
		username: ''
	});

	const getData = async () => {
		try {
			const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${proposer}`, undefined, 'GET');
			if (error || !data || !data.username || !data.user_id) {
				return;
			}
			setProfileDetails({
				bio: data?.profile?.bio || '',
				image: data?.profile?.image || '',
				social_links: data?.profile?.social_links || [],
				user_id: data?.user_id,
				username: data?.username
			});
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			if (network && post_id) {
				const votesResponse = await getReferendumVotes(network, post_id);
				if (votesResponse.data) {
					setVotesData(votesResponse.data);
				} else {
					console.error(votesResponse.error);
				}
			}

			setLoading(false);
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [post_id, user_id, network]);

	useEffect(() => {
		if (!window || track_no === null) return;
		const trackDetails = getTrackData(network, '', track_no);
		if (!created_at || !trackDetails) return;

		const prepare = getPeriodData(network, dayjs(created_at), trackDetails, 'preparePeriod');

		const decisionPeriodStartsAt = decidingStatusBlock && decidingStatusBlock.timestamp ? dayjs(decidingStatusBlock.timestamp) : prepare.periodEndsAt;
		const decision = getPeriodData(network, decisionPeriodStartsAt, trackDetails, 'decisionPeriod');
		setDecision(decision);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [track_no, created_at, network]);

	useEffect(() => {
		if (!network) return;
		GetCurrentTokenPrice(network, setCurrentTokenPrice);
		const fetchData = async () => {
			setLoading(true);
			await getData();
			setLoading(false);
		};
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [post_id, user_id, network]);

	return (
		<section className='w-full md:w-[383px]'>
			{loading ? (
				<Skeleton />
			) : (
				<div className='w-full cursor-pointer md:w-[355px]'>
					<Link
						key={post_id}
						href={`/referenda/${post_id}`}
						target='_blank'
					>
						<div className='flex'>
							<CardHeader
								theme={theme as any}
								className='relative flex h-[56px] w-full items-center justify-start gap-3 rounded-t-3xl border-b-0 border-l border-r border-t border-solid border-section-light-container bg-white px-3 pt-5 dark:border-section-dark-container dark:bg-section-light-overlay'
							>
								<div className='flex items-baseline gap-x-2'>
									<h2 className='mt-4 font-pixeboy text-[35px] font-normal text-pink_primary'>
										{currentTokenPrice.isLoading || isNaN(Number(currentTokenPrice.value)) ? '' : '$'}
										{getFormattedValue(String(reward), network, currentTokenPrice)}
									</h2>
									<span className=' font-pixeboy text-[24px] font-normal text-pink_primary'>
										{currentTokenPrice.isLoading || isNaN(Number(currentTokenPrice.value)) ? `${unit}` : ''}
									</span>
								</div>
								<div className='mr-1'>
									{votesData && (
										<VotesProgressInListing
											index={post_id}
											proposalType={'ReferendumV2'}
											votesData={votesData}
											onchainId={post_id}
											tally={tally}
										/>
									)}
								</div>
							</CardHeader>
							<Link
								href={`/referenda/${post_id}`}
								target='_blank'
							>
								<div className='relative ml-2 flex w-full items-center'>
									<Image
										src={theme === 'light' ? '/assets/bounty-icons/redirect-icon.svg' : '/assets/bounty-icons/redirect-icon-black.svg'}
										width={45}
										height={45}
										alt='redirect link'
										className='-mr-[2px] h-[36px] w-[36px] cursor-pointer rounded-full bg-black dark:bg-white md:h-auto md:w-auto'
									/>
									<BtnLine
										theme={theme as any}
										className='relative h-2 w-[10px] bg-black dark:bg-white'
									></BtnLine>
									<button
										className={`${spaceGrotesk.className} ${spaceGrotesk.variable} -ml-[2px] h-[36px] w-[75px] cursor-pointer rounded-3xl border-none bg-black text-base font-bold text-white dark:bg-white dark:text-black md:h-[44px] md:w-[100px] md:text-lg`}
									>
										Vote
									</button>
								</div>
							</Link>
						</div>
						<div
							className={`rounded-b-3xl rounded-tr-2xl border-b border-l border-r border-t-0 
                     border-solid border-section-light-container bg-white px-3 py-1 dark:border-section-dark-container dark:bg-section-light-overlay`}
						>
							<Link
								href={`/referenda/${post_id}`}
								target='_blank'
							>
								<ImageIcon
									src='/assets/bounty-icons/bounty-image.svg'
									alt='bounty icon'
									imgClassName='mt-5 mb-3 w-full w-[329px]'
									imgWrapperClassName=''
								/>
							</Link>
							<div className={`${spaceGrotesk.className} ${spaceGrotesk.variable} scroll-hidden h-7 overflow-y-auto`}>
								<span className='mr-1 text-base font-medium text-blue-light-medium dark:text-blue-dark-medium'>#{post_id}</span>
								<span className='text-lg font-bold text-blue-light-high dark:text-blue-dark-high'>{title}</span>
							</div>
							<div
								className={`${spaceGrotesk.className} ${spaceGrotesk.variable} h-[40px] overflow-y-auto break-words text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium`}
							>
								{content ? removeSymbols(content).slice(0, 90) : getAscciiFromHex(description).slice(0, 90)}...
							</div>
							{tags && tags.length > 0 && (
								<div className='flex gap-x-1'>
									{tags?.slice(0, 3).map((tag: string, index: number) => (
										<div
											key={index}
											style={{ fontSize: '10px' }}
											className=' w-min rounded-xl border-[1px] border-solid border-section-light-container px-[14px] py-[4px] font-medium text-lightBlue dark:border-[#3B444F] dark:border-separatorDark dark:text-blue-dark-high'
										>
											{tag}
										</div>
									))}
									{tags.length > 3 && (
										<span
											className='text-bodyBlue dark:text-blue-dark-high'
											style={{ background: '#D2D8E050', borderRadius: '20px', fontSize: '10px', padding: '4px 8px' }}
										>
											+{tags.length - 3}
										</span>
									)}
								</div>
							)}
							<div className='mb-2 mt-2 flex justify-between'>
								<Link
									href={`/address/${proposer}`}
									target='_blank'
								>
									<ImageComponent
										alt='user img'
										src={profileDetails.image}
										className='-mt-[2px] mr-[2px] h-[17px] w-[17px]'
									/>
									<span className={`${dmSans.variable} ${dmSans.className} text-sm font-medium text-blue-light-high dark:text-blue-dark-high`}>{profileDetails.username}</span>
								</Link>
								<TrackTag
									theme={theme as any}
									className='sm:mt-0'
									track={formatTrackName(getTrackNameFromId(network, track_no))}
								/>
							</div>
						</div>
					</Link>
				</div>
			)}
		</section>
	);
};

export default BountiesProposalsCard;
