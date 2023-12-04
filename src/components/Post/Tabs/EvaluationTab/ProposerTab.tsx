// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Collapse } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ProposerIcon from '~assets/icons/proposerIcon.svg';

import React, { FC, useContext, useEffect, useState } from 'react';
import { usePostDataContext } from '~src/context';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { DeriveAccountInfo, DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { network as AllNetworks } from '~src/global/networkConstants';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { useNetworkSelector } from '~src/redux/selectors';
import { ApiPromise } from '@polkadot/api';
import { ApiContext } from '~src/context/ApiContext';
import ProposerData from './ProposerData';

const { Panel } = Collapse;

interface IProposerTab {
	className?: string;
}

const ProposerTab: FC<IProposerTab> = (className) => {
	// const { picture } = useUserDetailsSelector();
	const postedBy = usePostDataContext();
	const address = postedBy?.postData?.proposer;
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

	const encodedAddr = postedBy?.postData?.proposer ? getEncodedAddress(postedBy?.postData?.proposer, network) || '' : '';
	const [profileData, setProfileData] = useState<IGetProfileWithAddressResponse | undefined>();
	useEffect(() => {
		fetchUsername(postedBy?.postData?.proposer);
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

	const fetchUsername = async (address: string) => {
		const substrateAddress = getSubstrateAddress(address);

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
			<Collapse
				size='large'
				className={'bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
				expandIconPosition='end'
				expandIcon={({ isActive }) => {
					return isActive ? <ExpandIcon /> : <CollapseIcon />;
				}}
				// theme={theme}
			>
				<Panel
					header={
						<div className='channel-header flex items-center gap-[6px]'>
							<ProposerIcon />
							<h3 className='mb-0 ml-1 mt-[2px] text-[16px] font-semibold leading-[21px] tracking-wide text-blue-light-high dark:text-blue-dark-high md:text-[18px]'>Proposer</h3>
						</div>
					}
					key='1'
				>
					<ProposerData
						address={address}
						profileData={profileData}
						isGood={isGood}
					/>
				</Panel>
			</Collapse>
		</div>
	);
};

export default ProposerTab;
