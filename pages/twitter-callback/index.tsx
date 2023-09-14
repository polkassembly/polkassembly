// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { WarningOutlined } from '@ant-design/icons';
import { Row } from 'antd';
import { GetServerSideProps } from 'next';
import { getTwitterCallback } from 'pages/api/v1/verification/twitter-callback';
import React, { useEffect, useState } from 'react';
import { useNetworkContext } from 'src/context';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import VerificationSuccessScreen from '~src/components/OnchainIdentity/VerificationSuccessScreen';
import SEOHead from '~src/global/SEOHead';
import FilteredError from '~src/ui-components/FilteredError';
import Loader from '~src/ui-components/Loader';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	const { oauth_verifier: oauthVerifier, oauth_token: oauthRequestToken } = query;
	const { data, error } = await getTwitterCallback({
		network,
		oauthRequestToken: String(oauthRequestToken),
		oauthVerifier: String(oauthVerifier)
	});

	if (data) {
		return { props: { network, twitterHandle: data } };
	}
	return { props: { error: error || 'Error in getting twitter handle', network } };
};

const TwitterCallback = ({ error, network, twitterHandle }: { network: string; error?: null | any; twitterHandle?: string }) => {
	const { setNetwork } = useNetworkContext();
	const [identityEmailSuccess, setIdentityEmailSuccess] = useState<boolean>(!error);

	useEffect(() => {
		setNetwork(network);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<>
			<SEOHead
				title='Twitter Callback'
				network={network}
			/>
			<Row
				justify='center'
				align='middle'
				className='-mt-16 h-full'
			>
				{error ? (
					<article className='flex flex-col gap-y-6 rounded-md bg-white p-8 shadow-md md:min-w-[500px]'>
						<h2 className='flex flex-col items-center gap-y-2 text-xl font-medium'>
							<WarningOutlined />
							{/* TODO: Check error message from BE when email already verified */}
							<FilteredError text={error?.message || error} />
						</h2>
					</article>
				) : (
					<Loader />
				)}
			</Row>
			<VerificationSuccessScreen
				open={identityEmailSuccess}
				social='Twitter'
				socialHandle={twitterHandle}
				onClose={() => setIdentityEmailSuccess(false)}
			/>
		</>
	);
};

export default TwitterCallback;
