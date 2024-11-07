// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { useNetworkSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const MembersTab = () => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const [loading, setLoading] = useState<boolean>(false);

	const handleIdentity = async (delegates: any) => {
		if (!api || !apiReady) return;

		const identityInfo: { [key: string]: any | null } = {};
		const identityInfoPromises = delegates?.map(async (delegate: any) => {
			if (delegate?.address) {
				const info = await getIdentityInformation({
					address: delegate?.address,
					api: peopleChainApi ?? api,
					network: network
				});

				identityInfo[delegate?.address] = info || null;
			}
		});

		await Promise.allSettled(identityInfoPromises);
		console.log('identityInfoPromises: ', identityInfoPromises);
	};

	const getData = async () => {
		if (!(api && peopleChainApiReady) || !network) return;
		setLoading(true);

		const { data, error } = await nextApiClientFetch<any>('api/v1/auth/data/getAllUsers');
		if (data) {
			data.data.map((user: any) => {
				handleIdentity(user?.addresses[0]);
			});
		} else {
			console.log(error);
			setLoading(false);
		}
	};
	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, peopleChainApi, peopleChainApiReady, apiReady, network]);
	return <div>MembersTab</div>;
};

export default MembersTab;
