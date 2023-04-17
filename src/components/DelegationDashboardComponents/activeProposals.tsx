// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import ActiveProposalsIcon from '~assets/icons/active-proposals.svg';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import { IPostListing, IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { CustomStatus } from '../Listing/Tracks/TrackListingCard';
import ActiveProposalCard from './activeProposalCard';
import { ProposalType } from '~src/global/proposalType';
import { useRouter } from 'next/router';
import { useNetworkContext } from '~src/context';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { PostOrigin, TrackProps } from '~src/types';

interface Props{
  className?: string;
}

export const queryToTrackOrigin = ( track: string, network:string, setTrackDetails: (pre:any) => void) => {

	const originTrack = track && !Array.isArray(track) && track.split('-').join('_').toUpperCase();
	if(originTrack === 'ROOT'){
		const data = network && networkTrackInfo[network][PostOrigin.ROOT];
		setTrackDetails(data);
	}
	else if(originTrack === 'AUCTION_ADMIN'){
		const data = network && networkTrackInfo[network][PostOrigin.AUCTION_ADMIN];
		setTrackDetails(data);
	}
	else if(originTrack === 'BIG_SPENDER'){
		const data = network && networkTrackInfo[network][PostOrigin.BIG_SPENDER];
		setTrackDetails(data);
	}
	else if(originTrack === 'BIG_TIPPER'){
		const data = network && networkTrackInfo[network][PostOrigin.BIG_TIPPER];
		setTrackDetails(data);
	}
	else if(originTrack === 'FELLOWSHIP_ADMIN'){
		const data = network && networkTrackInfo[network][PostOrigin.FELLOWSHIP_ADMIN];
		setTrackDetails(data);
	}
	else if(originTrack === 'GENERAL_ADMIN'){
		const data = network && networkTrackInfo[network][PostOrigin.GENERAL_ADMIN];
		setTrackDetails(data);
	}
	else if(originTrack === 'LEASE_ADMIN'){
		const data = network && networkTrackInfo[network][PostOrigin.LEASE_ADMIN];
		setTrackDetails(data);
	}
	else if(originTrack === 'MEDIUM_SPENDER'){
		const data = network && networkTrackInfo[network][PostOrigin.MEDIUM_SPENDER];
		setTrackDetails(data);
	}
	else if(originTrack === 'REFERENDUM_CANCELLER'){
		const data = network && networkTrackInfo[network][PostOrigin.REFERENDUM_CANCELLER];
		setTrackDetails(data);
	}
	else if(originTrack === 'REFERENDUM_KILLER'){
		const data = network && networkTrackInfo[network][PostOrigin.REFERENDUM_KILLER];
		setTrackDetails(data);
	}
	else if(originTrack === 'SMALL_SPENDER'){
		const data = network && networkTrackInfo[network][PostOrigin.SMALL_SPENDER];
		setTrackDetails(data);
	}
	else if(originTrack === 'SMALL_TIPPER'){
		const data = network && networkTrackInfo[network][PostOrigin.SMALL_TIPPER];
		setTrackDetails(data);
	}
	else if(originTrack === 'STAKING_ADMIN'){
		const data = network && networkTrackInfo[network][PostOrigin.STAKING_ADMIN];
		setTrackDetails(data);
	}
	else if(originTrack === 'TREASURER'){
		const data = network && networkTrackInfo[network][PostOrigin.TREASURER];
		setTrackDetails(data);
	}
	else if(originTrack === 'WHITELISTED_CALLER'){
		const data = network && networkTrackInfo[network][PostOrigin.WHITELISTED_CALLER];
		setTrackDetails(data);
	}
};

const ActiveProposals = ( { className }: Props ) => {

	const [count, setCount] = useState<number>(0);
	const [expandProposals, setExpandProposals] = useState<boolean>(false);
	const [activeProposals, setActiveProposals] = useState<IPostListing[]>([]);
	const { query: { track } } = useRouter();
	const { network } = useNetworkContext();
	const [trackDetails, setTrackDetails] = useState<TrackProps>();

	const getActiveProposals = async() => {

		const { data, error } = await nextApiClientFetch<IPostsListingResponse>(`api/v1/listing/on-chain-posts?trackNo=${trackDetails?.trackId}&trackStatus=${CustomStatus.Active}&proposalType=${ProposalType.OPEN_GOV}`);
		if(data){
			setActiveProposals(data.posts);
			setCount(data?.posts?.length);
		}else{
			console.log(error);
		}

	};

	useEffect(() => {
		if(!track){
			return;
		}else{
			queryToTrackOrigin(String(track), network, setTrackDetails);
		}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [track]);

	useEffect(() => {
		console.log(trackDetails);
		trackDetails?.trackId && getActiveProposals();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackDetails]);

	return <div className=  {`${className} rounded-[14px] bg-white py-[24px] px-[37px] mt-[22px]`}>
		<div className=' shadow-[0px 4px 6px rgba(0, 0, 0, 0.08] flex items-center justify-between'>
			<div  className='flex jutify-center items-center gap-2'>
				<ActiveProposalsIcon className='mr-[4px]'/>
				<span className='text-[28px] font-semibold tracking-[0.0015em] text-[#243A57]'>
          Active Proposals
				</span>
				<span className='h-[34px] py-[6px] px-3 bg-[#D2D8E04D] rounded-[26px] text-[#243A57] flex justify-center items-center font-semibold'>
					{count < 10 && count !==0 && 0}{count}
				</span>
			</div>
			<div onClick={() => setExpandProposals(!expandProposals)}>{!expandProposals ? <ExpandIcon/> : <CollapseIcon/>}</div>
		</div>
		{expandProposals && <div className='mt-[24px] border-solid flex flex-col gap-6'>
			{activeProposals.length > 0 && activeProposals.map((proposal, index) => (<ActiveProposalCard proposal= {proposal} key={index}/>))}
		</div>}
	</div>;
};
export default ActiveProposals;