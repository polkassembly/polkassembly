// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';

import Address from './Address';
import QuickView, { TippingUnavailableNetworks } from './QuickView';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ISocial } from '~src/auth/types';
import styled from 'styled-components';
import { useNetworkSelector } from '~src/redux/selectors';
import dynamic from 'next/dynamic';
import Tooltip from '~src/basic-components/Tooltip';

const Tipping = dynamic(() => import('~src/components/Tipping'), {
	ssr: false
});

interface Props {
	className?: string;
	defaultAddress?: string | null;
	username?: string;
	disableIdenticon?: boolean;
	usernameClassName?: string;
	disableAddressClick?: boolean;
	truncateUsername?: boolean;
	usernameMaxLength?: number;
	isUsedInLeadership?: boolean;
}
const NameLabel = ({
	className,
	defaultAddress,
	username,
	disableIdenticon = false,
	usernameClassName,
	disableAddressClick = false,
	truncateUsername,
	usernameMaxLength,
	isUsedInLeadership
}: Props) => {
	const { network } = useNetworkSelector();
	const [open, setOpen] = useState<boolean>(false);
	const [socials, setSocials] = useState<ISocial[]>([]);
	const [profileCreatedAt, setProfileCreatedAt] = useState<Date | null>(null);
	const [openTipping, setOpenTipping] = useState<boolean>(false);
	const [openAddressChangeModal, setOpenAddressChangeModal] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [leaderboardAstrals, setLeaderboardAstrals] = useState<number | null | undefined>(null);
	const [userImage, setUserImage] = useState<string | null | undefined>(null);

	const getUserProfile = async () => {
		const { data } = await nextApiClientFetch<any>(`api/v1/auth/data/userProfileWithUsername?username=${username}`);
		if (data) {
			setSocials(data?.social_links || []);
			setProfileCreatedAt(data?.created_at || null);
			if (data?.addresses) {
				setAddress(data?.addresses[0]);
			}
			setLeaderboardAstrals(data?.profile_score);
			setUserImage(data?.image);
		}
	};
	useEffect(() => {
		if (!defaultAddress) {
			getUserProfile();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [username]);

	return (
		<>
			<div
				className={`${className}`}
				title={username}
			>
				{!defaultAddress ? (
					<Tooltip
						arrow
						color='#fff'
						overlayClassName={className}
						title={
							<QuickView
								address={address}
								socials={socials}
								setOpen={setOpen}
								profileCreatedAt={profileCreatedAt}
								username={username || ''}
								polkassemblyUsername={username}
								enableTipping={!!address}
								setOpenAddressChangeModal={setOpenAddressChangeModal}
								setOpenTipping={setOpenTipping}
								leaderboardAstrals={leaderboardAstrals}
								imgUrl={userImage ? userImage : ''}
							/>
						}
						open={!defaultAddress ? open : false}
						onOpenChange={(e) => {
							setOpen(e);
						}}
					>
						<span
							className={`username mr-1.5 ${isUsedInLeadership ? 'font-normal' : 'font-semibold'} text-bodyBlue dark:text-blue-dark-high ${
								!disableAddressClick ? 'cursor-pointer hover:underline' : 'cursor-not-allowed'
							} ${className}`}
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								if (!disableAddressClick) {
									const routePath = `/user/${username}`;
									window.open(routePath, '_blank');
								}
							}}
						>
							{username}
						</span>
					</Tooltip>
				) : (
					<Address
						passedUsername={username}
						address={defaultAddress}
						className='text-sm'
						displayInline
						usernameClassName={usernameClassName}
						disableIdenticon={disableIdenticon}
						disableAddressClick={disableAddressClick}
						isTruncateUsername={truncateUsername || false}
						isSubVisible={false}
						usernameMaxLength={usernameMaxLength}
					/>
				)}
			</div>
			{!TippingUnavailableNetworks.includes(network) && !!address && !defaultAddress && (
				<Tipping
					username={username || ''}
					open={openTipping}
					setOpen={setOpenTipping}
					key={address}
					paUsername={username as any}
					setOpenAddressChangeModal={setOpenAddressChangeModal}
					openAddressChangeModal={openAddressChangeModal}
				/>
			)}
		</>
	);
};

export default styled(NameLabel)`
	.ant-tooltip-content .ant-tooltip-inner {
		width: 363px !important;
	}
`;
