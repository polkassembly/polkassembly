// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';

import Address from './Address';
import Link from 'next/link';
import QuickView, { TippingUnavailableNetworks } from './QuickView';
import { Tooltip } from 'antd';
import { ISocial } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { useNetworkSelector } from '~src/redux/selectors';
//import TopicTag from './TopicTag';

const Tipping = dynamic(() => import('~src/components/Tipping'), {
	ssr: false
});

interface Props {
	className?: string;
	address: string;
	topic?: string;
	username?: string;
	truncateUsername?: boolean;
}

const OnchainCreationLabel = ({ address, username, truncateUsername, className }: Props) => {
	const { network } = useNetworkSelector();
	const [open, setOpen] = useState<boolean>(false);
	const [socials, setSocials] = useState<ISocial[]>([]);
	const [profileCreatedAt, setProfileCreatedAt] = useState<Date | null>(null);
	const [openTipping, setOpenTipping] = useState<boolean>(false);
	const [openAddressChangeModal, setOpenAddressChangeModal] = useState<boolean>(false);
	const [profileAddress, setAddress] = useState<string>('');

	const getUserProfile = async () => {
		const { data } = await nextApiClientFetch<any>(`api/v1/auth/data/userProfileWithUsername?username=${username}`);
		if (data) {
			setSocials(data?.social_links || []);
			setProfileCreatedAt(data?.created_at || null);
			if (data?.addresses) {
				setAddress(data?.addresses[0]);
			}
		}
	};
	useEffect(() => {
		if (!address && username) {
			getUserProfile();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [username]);

	return (
		<div className='flex w-full justify-between text-xs text-lightBlue dark:text-blue-dark-medium min-[340px]:w-auto min-[340px]:flex-row min-[340px]:items-center'>
			<div className='flex items-center'>
				{username || address ? (
					<>
						{address ? (
							<Address
								address={address}
								className='address '
								displayInline
								isTruncateUsername={truncateUsername}
								isSubVisible={false}
								usernameClassName='font-semibold'
							/>
						) : (
							<Tooltip
								arrow
								color='#fff'
								overlayClassName={className}
								title={
									<QuickView
										address={profileAddress}
										socials={socials}
										setOpen={setOpen}
										profileCreatedAt={profileCreatedAt}
										username={username || ''}
										polkassemblyUsername={username}
										enableTipping={!!profileAddress}
										setOpenAddressChangeModal={setOpenAddressChangeModal}
										setOpenTipping={setOpenTipping}
									/>
								}
								open={!address ? open : false}
								onOpenChange={(e) => {
									setOpen(e);
								}}
							>
								<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>
									<Link
										href={`/user/${username}`}
										target='_blank'
										rel='noreferrer'
									>
										{username}
									</Link>
								</span>
							</Tooltip>
						)}
					</>
				) : null}
			</div>
			{!TippingUnavailableNetworks.includes(network) && !!profileAddress && !address && (
				<Tipping
					username={username || ''}
					open={openTipping}
					setOpen={setOpenTipping}
					key={profileAddress}
					paUsername={username}
					setOpenAddressChangeModal={setOpenAddressChangeModal}
					openAddressChangeModal={openAddressChangeModal}
				/>
			)}
		</div>
	);
};

export default styled(OnchainCreationLabel)`
	.ant-tooltip-content .ant-tooltip-inner {
		width: 363px !important;
	}
`;
