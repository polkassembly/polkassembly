// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import React, { useEffect, useState } from 'react';
import { IDelegationProfileType } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const CuratorPopover = (props: any) => {
	const newAddress = props.address;
	const [profileDetails, setProfileDetails] = useState<IDelegationProfileType>({
		bio: '',
		image: '',
		social_links: [],
		user_id: 0,
		username: ''
	});
	console.log('profileDetails', newAddress);

	const getData = async () => {
		try {
			const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${newAddress}`, undefined, 'GET');
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
		setProfileDetails({
			bio: '',
			image: '',
			social_links: [],
			user_id: 0,
			username: ''
		});
		getData();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [newAddress]);
	return <div>{profileDetails.username}</div>;
};

export default CuratorPopover;
