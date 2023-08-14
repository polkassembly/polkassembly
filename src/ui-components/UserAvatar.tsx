// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Avatar } from 'antd';
import { AvatarSize } from 'antd/lib/avatar/SizeContext';
import React, { useCallback, useEffect, useState } from 'react';

import { ProfileDetailsResponse } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface Props {
	className?: string
	username: string | null
	id: number | null
	size?: AvatarSize;
}

const UserAvatar = ({ className, id, username, size }: Props) => {
	const [userProfileData, setUserProfileData] = useState<ProfileDetailsResponse | null>(null);
	const getRandomColorClass = () => {
		const colors = ['#E97451', '#FC80A5', '#C9A0DC', '#FCD667', '#FF4466','#A0E6FF','#DA8A67'];
		const randomIndex = Math.floor(Math.random() * colors.length);
		return colors[randomIndex];
	};
	const color = getRandomColorClass();
	const getUserDetails = useCallback(async () => {
		const { data , error } = await nextApiClientFetch<ProfileDetailsResponse>( 'api/v1/events', { userId: id });
		if (error || !data) return;

		if(data) {
			setUserProfileData(data);
		}
	}, [id]);

	useEffect(() => {
		getUserDetails();
	}, [getUserDetails]);

	return (
		userProfileData?.image ? <Avatar className={className} src={userProfileData?.image} size={size} />
			: <Avatar className={`${className}`} style={{ backgroundColor: color }} size={size} shape='circle'>{username?.substring(0, 1).toUpperCase()}</Avatar>
	);
};

export default React.memo(UserAvatar);
