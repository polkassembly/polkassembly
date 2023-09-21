// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { getProfileWithAddress } from 'pages/api/v1/auth/data/profileWithAddress';
import React, { FC, useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { ProfileDetails } from '~src/auth/types';
import { useNetworkContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

interface IProfileProps {
	className?: string;
	userProfile: {
		data: ProfileDetails;
		error: string | null;
	};
	network: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const address = context.params?.address;

	const network = getNetworkFromReqHeaders(context.req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { data, error } = await getProfileWithAddress({
		address
	});
	const props: IProfileProps = {
		network,
		userProfile: {
			data: data?.profile || {
				badges: [],
				bio: '',
				image: '',
				social_links: [],
				title: ''
			},
			error: error
		}
	};
	return { props: props };
};

const ProfileComponent = dynamic(() => import('~src/components/Profile'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const Profile: FC<IProfileProps> = (props) => {
	const { className, userProfile, network } = props;
	const { setNetwork } = useNetworkContext();
	useEffect(() => {
		setNetwork(network);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead
				title='Profile'
				network={network}
			/>
			<ProfileComponent
				className={className}
				profileDetails={userProfile.data}
			/>
		</>
	);
};

export default Profile;
