// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import React from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { isForumSupportedNetwork } from '~src/global/ForumNetworks';
import { isOpenGovSupported } from '~src/global/openGovNetworks';

export const getServerSideProps: GetServerSideProps = async (context) => {
	const network = getNetworkFromReqHeaders(context.req.headers);

	if (isForumSupportedNetwork(network)) {
		return {
			redirect: {
				destination: '/forum',
				permanent: false
			}
		};
	}

	if (isOpenGovSupported(network)) {
		return {
			redirect: {
				destination: '/opengov',
				permanent: false
			}
		};
	}

	return {
		redirect: {
			destination: '/',
			permanent: false
		}
	};
};

const Slug = () => {
	return <div>Slug</div>;
};

export default Slug;
