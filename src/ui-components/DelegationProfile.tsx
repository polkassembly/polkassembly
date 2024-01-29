// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';
import { ProfileDetailsResponse } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ProfileCard from '~src/components/UserProfile/ProfileCard';
import { useNetworkSelector } from '~src/redux/selectors';
import getEncodedAddress from '~src/util/getEncodedAddress';

interface Props {
	username: string;
	address: string;
	isSearch?: boolean;
	className?: string;
}

const DelegationProfile = ({ username, address }: Props) => {
	const { network } = useNetworkSelector();
	const [profileDetails, setProfileDetails] = useState<ProfileDetailsResponse>({
		addresses: [],
		badges: [],
		bio: '',
		image: '',
		social_links: [],
		title: '',
		user_id: 0,
		username: ''
	});

	const [addressWithIdentity, setAddressWithIdentity] = useState<string>('');

	const getData = async () => {
		const { data, error } = await nextApiClientFetch(`api/v1/auth/data/userProfileWithUsername?username=${username}`);

		if (data) {
			setProfileDetails({ ...profileDetails, ...data });
			setAddressWithIdentity(getEncodedAddress(address, network) || '');
		} else {
			console.log(error);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [username, address]);

	return profileDetails?.user_id ? (
		<div className='mt-8'>
			<ProfileCard
				userProfile={profileDetails}
				addressWithIdentity={addressWithIdentity}
			/>
		</div>
	) : (
		<div className='mt-8 p-6'>
			<Skeleton />
		</div>
	);
};
export default DelegationProfile;
