// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dynamic from 'next/dynamic';
import { IReferendumV2PostsByStatus } from 'pages/root';
import React, { FC } from 'react';
import Skeleton from '~src/basic-components/Skeleton';
import TrackListingTabs from './TrackListingTabs';
import { useNetworkSelector } from '~src/redux/selectors';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { delegationSupportedNetworks } from '~src/components/Post/Tabs/PostStats/util/constants';
import ImageIcon from '~src/ui-components/ImageIcon';
import DelegatedProfileIcon from '~assets/icons/delegate-profile.svg';

const AboutTrackCard = dynamic(() => import('~src/components/Listing/Tracks/AboutTrackCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface ITrackListingProps {
	posts: IReferendumV2PostsByStatus;
	trackName: string;
}

const TrackListing: FC<ITrackListingProps> = (props) => {
	const { posts, trackName } = props;
	const { network } = useNetworkSelector();
	return (
		<div className=''>
			<AboutTrackCard trackName={trackName} />
			<TrackListingTabs
				className='mt-12'
				posts={posts}
				trackName={trackName}
			/>
			<div className='z-2000 rounded-t-2 fixed bottom-0 w-full bg-[#FFFFFF] p-4'>
				<div className='flex flex-col items-center justify-center gap-3 '>
					{delegationSupportedNetworks.includes(network) && (
						<button
							className={
								'flex h-10 w-full items-center justify-center gap-2 rounded-md border-[1px] border-pink_primary bg-transparent text-sm font-medium text-pink_primary shadow-none'
							}
						>
							<DelegatedProfileIcon className='mr-2' />
							<span>Delegate</span>
						</button>
					)}
					<CustomButton
						className='mx-auto flex w-full gap-1'
						variant='primary'
						height={40}
					>
						<ImageIcon
							src='/assets/icons/create-treasury-proposal-icon.svg'
							alt='Create Treasury Proposal icon'
							className='-mt-[2px]'
						/>
						Create Proposal
					</CustomButton>
				</div>
			</div>
		</div>
	);
};

export default TrackListing;
