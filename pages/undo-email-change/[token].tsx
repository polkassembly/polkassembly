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
import { UndoEmailChangeResponseType } from '~src/auth/types';
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

const UndoEmailChange = ({ network }: { network: string }) => {
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();
	const [error, setError] = useState('');
	const currentUser = useUserDetailsContext();

	const handleUndoEmailChange = useCallback(async () => {
		const { data , error } = await nextApiClientFetch<UndoEmailChangeResponseType>( 'api/v1/auth/actions/requestResetPassword');
		if(error) {
			console.error('Undo email change error ', error);
			setError(error);
			queueNotification({
				header: 'Error!',
				message: 'There was an error undoing email change. Please try again.',
				status: NotificationStatus.SUCCESS
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
	}, [currentUser]);

	useEffect(() => {
		handleUndoEmailChange();
	}, [handleUndoEmailChange]);

	return (
		<>
			<SEOHead title="Undo Email Change" network={network}/>
			<Row justify='center' align='middle' className='h-full -mt-16'>
				{ error ? <article className="bg-white shadow-md rounded-md p-8 flex flex-col gap-y-6 md:min-w-[500px]">
					<h2 className='flex flex-col gap-y-2 items-center text-xl font-medium'>
						<WarningOutlined />
						<FilteredError text={error}/>
					</h2>
				</article>
					: <Loader/>
				}
			</Row>
		</>
	);
};

export default UndoEmailChange;