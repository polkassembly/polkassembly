// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Collapse } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ProposerIcon from '~assets/icons/proposerIcon.svg';

import React, { FC, useEffect, useState } from 'react';
import { usePostDataContext } from '~src/context';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import UserInfo from './UserInfo';
import { trackEvent } from 'analytics';
import { useUserDetailsSelector } from '~src/redux/selectors';

const { Panel } = Collapse;

interface IProposerTab {
	className?: string;
}

const ProposerTab: FC<IProposerTab> = (className) => {
	const {
		postData: { proposer }
	} = usePostDataContext();
	const currentUser = useUserDetailsSelector();
	const [profileData, setProfileData] = useState<IGetProfileWithAddressResponse | undefined>();
	useEffect(() => {
		trackEvent('proposer_dropdown_clicked', 'clicked_proposer_dropdown', {
			isWeb3Login: currentUser?.web3signup,
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});
		fetchUsername(proposer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
				className={'my-custom-collapse bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
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
					<UserInfo
						address={proposer}
						profileData={profileData}
					/>
				</Panel>
			</Collapse>
		</div>
	);
};

export default ProposerTab;
