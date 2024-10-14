// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import ImageComponent from '~src/components/ImageComponent';
import Address from '~src/ui-components/Address';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import copyToClipboard from '~src/util/copyToClipboard';
import { message } from 'antd';
import { CopyIcon } from '~src/ui-components/CustomIcons';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { spaceGrotesk } from 'pages/_app';

interface Props {
	curatorprofile: ProfileDetailsResponse;
	addressWithIdentity: string;
	onchainIdentity?: DeriveAccountRegistration | null;
}

function CuratorProfile({ curatorprofile, addressWithIdentity, onchainIdentity }: Props) {
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;
	const [messageApi, contextHolder] = message.useMessage();

	const handleCopyAddress = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};
	return (
		<div className='rounded-lg border-[0.7px] border-solid border-[#D2D8E0] bg-white p-5'>
			<div className='flex gap-5'>
				<ImageComponent
					src={curatorprofile?.image}
					alt='profile'
					className='flex h-[100px] w-[120px] items-center justify-center '
					iconClassName='flex items-center justify-center text-[#FCE5F2] w-full h-full rounded-full'
				/>
				<div className='flex w-full flex-col'>
					<div className='flex justify-between'>
						<div className='flex'>
							<Address
								address={curatorprofile?.addresses?.[0]}
								disableIdenticon
								isProfileView
								destroyTooltipOnHide
								className='flex gap-1'
								usernameClassName='text-2xl'
								isTruncateUsername={isMobile || false}
								passedUsername={curatorprofile?.username}
							/>
							<span
								className='flex cursor-pointer flex-row items-center p-1'
								onClick={(e) => {
									e.preventDefault();
									copyToClipboard(addressWithIdentity);
									handleCopyAddress();
								}}
							>
								{contextHolder}
								<CopyIcon className='text-2xl text-lightBlue dark:text-icon-dark-inactive' />
							</span>
						</div>
						<p className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-[16px] font-bold text-pink_primary`}>Edit</p>
					</div>
					<div className='flex gap-3 text-sm font-bold'>
						<p className='rounded-full bg-[#EEF2FF] p-1 px-2 text-[#4F46E5]'>0 Bounties Curated</p>
						<p className='rounded-full bg-[#FFEEE0] p-1 px-2 text-[#DB511F]'>0 Child Bounties Curated</p>
					</div>
					<div>{curatorprofile?.bio}</div>
				</div>
			</div>
		</div>
	);
}

export default CuratorProfile;
