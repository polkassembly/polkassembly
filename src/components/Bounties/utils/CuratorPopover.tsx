// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import React, { useEffect, useState } from 'react';
import { IDelegationProfileType } from '~src/auth/types';
import ImageComponent from '~src/components/ImageComponent';
import NameLabel from '~src/ui-components/NameLabel';
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

	const getData = async () => {
		if (newAddress) {
			try {
				const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`/api/v1/auth/data/profileWithAddress?address=${newAddress}`, undefined, 'GET');
				if (error || !data || !data.username || !data.user_id) {
					return;
				}
				console.log('error', error);

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
		}
	};

	useEffect(() => {
		if (!newAddress) return;
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
	return (
		<div>
			{profileDetails.username ? (
				<div className='flex gap-1'>
					<ImageComponent
						src={profileDetails.image}
						alt='user icon'
						className='h-[12px] w-[12px]'
					/>
					<span className='text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>{profileDetails.username}</span>
				</div>
			) : (
				<NameLabel defaultAddress={newAddress} />
			)}
		</div>
	);
};

export default CuratorPopover;
