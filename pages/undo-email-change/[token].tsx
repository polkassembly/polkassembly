// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { WarningOutlined } from '@ant-design/icons';
import { Row } from 'antd';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import queueNotification from 'src/ui-components/QueueNotification';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { UndoEmailChangeResponseType } from '~src/auth/types';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { handleTokenChange } from '~src/services/auth.service';
import { NotificationStatus } from '~src/types';
import FilteredError from '~src/ui-components/FilteredError';
import Loader from '~src/ui-components/Loader';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const UndoEmailChange = ({ network }: { network: string }) => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();
	const [error, setError] = useState('');
	const currentUser = useUserDetailsSelector();

	const handleUndoEmailChange = useCallback(async () => {
		const { data, error } = await nextApiClientFetch<UndoEmailChangeResponseType>('api/v1/auth/actions/requestResetPassword');
		if (error) {
			console.error('Undo email change error ', error);
			setError(error);
			queueNotification({
				header: 'Error!',
				message: 'There was an error undoing email change. Please try again.',
				status: NotificationStatus.SUCCESS
			});
		}

		if (data) {
			handleTokenChange(data.token, currentUser, dispatch);
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
			<SEOHead
				title='Undo Email Change'
				network={network}
			/>
			<Row
				justify='center'
				align='middle'
				className='-mt-16 h-full'
			>
				{error ? (
					<article className='flex flex-col gap-y-6 rounded-md bg-white p-8 shadow-md dark:bg-section-dark-overlay md:min-w-[500px]'>
						<h2 className='flex flex-col items-center gap-y-2 text-xl font-medium'>
							<WarningOutlined />
							<FilteredError text={error} />
						</h2>
					</article>
				) : (
					<Loader />
				)}
			</Row>
		</>
	);
};

export default UndoEmailChange;
