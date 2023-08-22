// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { WarningOutlined } from '@ant-design/icons';
import { Row } from 'antd';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { useNetworkContext, useUserDetailsContext } from 'src/context';
import queueNotification from 'src/ui-components/QueueNotification';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { ChangeResponseType } from '~src/auth/types';
import SEOHead from '~src/global/SEOHead';
import { handleTokenChange } from '~src/services/auth.service';
import { NotificationStatus } from '~src/types';
import FilteredError from '~src/ui-components/FilteredError';
import Loader from '~src/ui-components/Loader';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	return { props: { network } };
};

const VerifyEmail = ({ network }: { network: string }) => {
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();
	const [error, setError] = useState('');

	const currentUser = useUserDetailsContext();

	const handleVerifyEmail = useCallback(async () => {
		const { data , error } = await nextApiClientFetch<ChangeResponseType>( 'api/v1/auth/actions/verifyEmail');
		if(error) {
			console.error('Email verification error ', error);
			setError(error);
			queueNotification({
				header: 'Error!',
				message: 'There was an error in verifying your email. Please try again.',
				status: NotificationStatus.ERROR
			});
		}

		if (data) {
			handleTokenChange(data.token, currentUser);
			queueNotification({
				header: 'Success!',
				message: data.message,
				status: NotificationStatus.SUCCESS
			});
			router.replace('/');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		handleVerifyEmail();
	}, [handleVerifyEmail]);

	return (
		<>
			<SEOHead title="Verify Email" network={network}/>
			<Row justify='center' align='middle' className='h-full -mt-16'>
				{ error
					? <article className="bg-white dark:bg-section-dark-overlay shadow-md rounded-md p-8 flex flex-col gap-y-6 md:min-w-[500px]">
						<h2 className='flex flex-col gap-y-2 items-center text-xl font-medium'>
							<WarningOutlined />
							{/* TODO: Check error message from BE when email already verified */}
							<FilteredError text={error}/>
						</h2>
					</article>
					: <Loader/>
				}
			</Row>
		</>
	);
};

export default VerifyEmail;
