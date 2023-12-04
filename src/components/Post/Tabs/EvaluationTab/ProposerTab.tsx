// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Collapse } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ProposerIcon from '~assets/icons/proposerIcon.svg';

import React, { FC, useEffect, useState } from 'react';
// import { ProfileIcon } from '~src/ui-components/CustomIcons';
import ImageComponent from '~src/components/ImageComponent';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { usePostDataContext } from '~src/context';
import Address from '~src/ui-components/Address';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
const { Panel } = Collapse;

interface IProposerTab {
	className?: string;
}

const ProposerTab: FC<IProposerTab> = (className) => {
	// const { picture } = useUserDetailsSelector();
	const postedBy = usePostDataContext();
	const [profileData, setProfileData] = useState<IGetProfileWithAddressResponse | undefined>();
	useEffect(() => {
		fetchUsername(postedBy?.postData?.proposer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const currentUser = useUserDetailsSelector();
	const fetchUsername = async (address: string) => {
		// if (isVoterAddress) {
		// return;
		// }
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
	console.log(profileData);
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
					{/* move this to new component */}
					<div className='flex gap-x-4'>
						<ImageComponent
							src={profileData?.profile?.image}
							alt='User Picture'
							className='flex h-[60px] w-[60px] items-center justify-center bg-transparent'
							iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
						/>
						<div>
							<p className='text-white'>{profileData?.username}</p>
						</div>
					</div>
				</Panel>
			</Collapse>
		</div>
	);
};

export default ProposerTab;
