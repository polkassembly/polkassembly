// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { WarningOutlined } from '@ant-design/icons';
import { Row } from 'antd';
import { GetServerSideProps } from 'next';
import { getTwitterCallback } from 'pages/api/v1/verification/twitter-callback';
import React, { useEffect } from 'react';
import { useNetworkContext } from 'src/context';
import { getNetworkFromReqHeaders } from '~src/api-utils';
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

	if(data){
		return { props: { network } };
	}
	return { props: { error: error || 'Error in getting twitter handle', network } };
};

const TwitterCallback = ({ error, network  }: { network: string, error: null | any}) => {
	const { setNetwork } = useNetworkContext();
	useEffect(() => {
		setNetwork(network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead title="Twitter Callback" network={network}/>
			<Row justify='center' align='middle' className='h-full -mt-16'>
				{ error
					? <article className="bg-white shadow-md rounded-md p-8 flex flex-col gap-y-6 md:min-w-[500px]">
						<h2 className='flex flex-col gap-y-2 items-center text-xl font-medium'>
							<WarningOutlined />
							{/* TODO: Check error message from BE when email already verified */}
							<FilteredError text={error?.message || error}/>
						</h2>
					</article>
					: <Loader/>
				}
			</Row>
		</>
	);
};

export default TwitterCallback;
