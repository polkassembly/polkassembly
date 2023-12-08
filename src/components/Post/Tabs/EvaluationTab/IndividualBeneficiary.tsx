// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useContext, useEffect, useState } from 'react';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { DeriveAccountInfo, DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { network as AllNetworks } from '~src/global/networkConstants';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { useNetworkSelector } from '~src/redux/selectors';
import { ApiPromise } from '@polkadot/api';
import { ApiContext } from '~src/context/ApiContext';
import UserInfo from './UserInfo';

interface IIndividualBeneficiary {
	className?: string;
	address?: string;
}

const IndividualBeneficiary: FC<IIndividualBeneficiary> = ({ address, className }) => {
	console.log(address);
	const apiContext = useContext(ApiContext);
	const { network } = useNetworkSelector();
	const [apiReady, setApiReady] = useState(false);
	const [api, setApi] = useState<ApiPromise>();
	useEffect(() => {
		if (network === AllNetworks.COLLECTIVES && apiContext.relayApi && apiContext.relayApiReady) {
			setApi(apiContext.relayApi);
			setApiReady(apiContext.relayApiReady);
		} else {
			if (!apiContext.api || !apiContext.apiReady) return;
			setApi(apiContext.api);
			setApiReady(apiContext.apiReady);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, apiContext.api, apiContext.apiReady, apiContext.relayApi, apiContext.relayApiReady, address]);

	const [identity, setIdentity] = useState<DeriveAccountRegistration>();

	let encodedAddr: any;
	if (address) {
		encodedAddr = address ? getEncodedAddress(address, network) || '' : '';
	}
	const [profileData, setProfileData] = useState<IGetProfileWithAddressResponse | undefined>();
	useEffect(() => {
		fetchUsername(address);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!api || !apiReady || !address || !encodedAddr) return;
		handleIdentityInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, address, encodedAddr, network]);

	const handleIdentityInfo = () => {
		api?.derive.accounts.info(encodedAddr, (info: DeriveAccountInfo) => {
			setIdentity(info.identity);
		});
	};

	const judgements = identity?.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid);
	const isGood = judgements?.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);

	const fetchUsername = async (address: string | undefined) => {
		console.log(address);
		let substrateAddress;
		if (address) {
			substrateAddress = getSubstrateAddress(address);
		}

		if (substrateAddress) {
			try {
				const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${substrateAddress}`, undefined, 'GET');
				if (error || !data || !data.username) {
					return;
				}
				setProfileData(data);
			} catch (error) {
				// console.log(error);
			}
		}
	};

	return (
		<div className={`${className}`}>
			<UserInfo
				address={address}
				profileData={profileData}
				isGood={isGood}
			/>
		</div>
	);
};

export default IndividualBeneficiary;
