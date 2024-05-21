// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { useNetworkSelector } from '~src/redux/selectors';
import { delegationSupportedNetworks } from '~src/components/Post/Tabs/PostStats/util/constants';
import ImageIcon from '~src/ui-components/ImageIcon';
import DelegatedProfileIcon from '~assets/icons/delegate-profile.svg';

const SmallScreenButtons = () => {
	const { network } = useNetworkSelector();
	return (
		<div className='z-2000 fixed bottom-0 -ml-2.5 w-full rounded-t-lg bg-[#FFFFFF] p-4 shadow-md dark:bg-section-dark-overlay sm:hidden'>
			<div className='flex flex-col items-center justify-center gap-3 '>
				<button
					className={
						'flex h-10 w-full items-center justify-center gap-2 rounded-[8px] border-none bg-pink_primary font-medium text-white shadow-none hover:bg-pink_secondary dark:text-white'
					}
				>
					<ImageIcon
						src='/assets/icons/create-treasury-proposal-icon.svg'
						alt='Create Treasury Proposal icon'
						className='-mt-[2px]'
					/>
					Create Proposal
				</button>
				{delegationSupportedNetworks.includes(network) && (
					<button
						className={
							'flex h-10 w-full items-center justify-center gap-2  rounded-[8px] border-[1px] border-pink_primary bg-transparent text-sm font-medium text-pink_primary shadow-none'
						}
					>
						<DelegatedProfileIcon className='' />
						<span>Delegate</span>
					</button>
				)}
			</div>
		</div>
	);
};

export default SmallScreenButtons;
