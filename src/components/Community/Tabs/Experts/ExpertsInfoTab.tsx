// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { useNetworkSelector } from '~src/redux/selectors';
import { defaultIdentityInfo } from '../../utils';
import MemberInfoCard from '../Members/MemberInfoCard';

interface Props {
	user: any;
	className?: string;
	trackNum?: number;
	disabled?: boolean;
}

const ExpertsInfoTab = ({ user }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi } = usePeopleChainApiContext();

	// Add state to store identity information
	const [identityInfo, setIdentityInfo] = useState(defaultIdentityInfo);

	const handleBeneficiaryIdentityInfo = async () => {
		if (!api || !apiReady || !user?.addresses?.length) return;

		const promiseArr = user?.addresses?.map((address: string) => getIdentityInformation({ address, api: peopleChainApi ?? api, network }));

		try {
			const resolved = await Promise?.all(promiseArr);
			setIdentityInfo(resolved[0] || defaultIdentityInfo); // Update state instead of modifying `user`
			console.log('inside experts1: ', resolved[0] || defaultIdentityInfo);
		} catch (err) {
			console.error('Error fetching identity info:', err);
			setIdentityInfo(defaultIdentityInfo);
		}
	};

	useEffect(() => {
		handleBeneficiaryIdentityInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, user?.userId]);

	// Now `identityInfo` will reflect the fetched data
	console.log('inside experts: ', { ...user, identityInfo });

	return (
		<div>
			<MemberInfoCard
				user={user}
				disabled={false}
				// handleUsername={(objWithUsername) => handleUsernameUpdateInDelegate(objWithUsername)}
			/>
		</div>
	);
};

export default ExpertsInfoTab;
