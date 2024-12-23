// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Tabs } from '~src/ui-components/Tabs';
import BecomeDelegate from './BecomeDelegate';
import TotalDelegationData from './TotalDelegationData';
import TrendingDelegates from './TrendingDelegates';
import { TabsProps } from 'antd';
import DelegationProfile from '~src/components/DelegationDashboard/DelegationProfile';
import DashboardTrackListing from './TracksListing';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import { IDelegationProfileType } from '~src/auth/types';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { useApiContext } from '~src/context';
import Skeleton from '~src/basic-components/Skeleton';
import { useTheme } from 'next-themes';
import TotalDelegationDataSmall from './smallScreenComponents/TotalDelegationDataSmall';
import BecomeDelegateModal from '~src/ui-components/BecomeDelegateModal';

interface Props {
	className?: string;
	theme?: string;
	isLoggedOut: boolean;
	identity: DeriveAccountRegistration | null;
}

const DelegationTabs = ({ className, isLoggedOut, identity }: Props) => {
	const userProfile = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	const { delegationDashboardAddress } = userProfile;
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [profileDetails, setProfileDetails] = useState<IDelegationProfileType>({
		bio: '',
		image: '',
		social_links: [],
		user_id: 0,
		username: ''
	});
	const [userBio, setUserBio] = useState<string>('');
	const { resolvedTheme: theme } = useTheme();
	const [openBecomeDelegateModal, setOpenBecomeDelegateModal] = useState<boolean>(false);

	const getData = async () => {
		try {
			const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(
				`api/v1/auth/data/profileWithAddress?address=${delegationDashboardAddress}`,
				undefined,
				'GET'
			);
			if (error || !data || !data.username || !data.user_id) {
				return;
			}
			setProfileDetails({
				bio: data?.profile?.bio || '',
				image: data?.profile?.image || '',
				social_links: data?.profile?.social_links || [],
				user_id: data?.user_id,
				username: data?.username
			});
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		setProfileDetails({
			bio: '',
			image: '',
			social_links: [],
			user_id: 0,
			username: ''
		});
		getData();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [delegationDashboardAddress, api, apiReady]);

	const tabItems: TabsProps['items'] = [
		{
			children: (
				<>
					{isLoggedOut && <h2 className='mb-6 mt-5 text-2xl font-semibold text-bodyBlue dark:text-blue-dark-high max-lg:pt-[60px] md:mb-5'>Delegation </h2>}
					<BecomeDelegate
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
						profileDetails={profileDetails}
						userBio={userBio}
						setUserBio={setUserBio}
						onchainUsername={identity?.display || identity?.legal || ''}
					/>
					<TotalDelegationData className='hidden sm:block' />
					<TotalDelegationDataSmall
						setOpenBecomeDelegateModal={setOpenBecomeDelegateModal}
						className='sm:hidden'
					/>
					<TrendingDelegates theme={theme} />
				</>
			),
			key: '1',
			label: <span className='px-1.5 '>Dashboard</span>
		},
		{
			children: (
				<>
					<BecomeDelegate
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
						profileDetails={profileDetails}
						userBio={userBio}
						setUserBio={setUserBio}
						onchainUsername={identity?.display || identity?.legal || ''}
					/>
					<DelegationProfile
						className='rounded-xxl bg-white px-6 py-5 drop-shadow-md dark:bg-section-dark-overlay'
						profileDetails={profileDetails}
						setIsModalOpen={setIsModalOpen}
						userBio={userBio}
						setUserBio={setUserBio}
						identity={identity || null}
					/>
					<div className='mt-8 rounded-xxl bg-white p-0 drop-shadow-md dark:bg-section-dark-overlay sm:p-5'>
						{!!userProfile?.delegationDashboardAddress && userProfile?.delegationDashboardAddress?.length > 0 ? (
							<DashboardTrackListing
								theme={theme}
								address={String(userProfile.delegationDashboardAddress)}
							/>
						) : (
							<Skeleton />
						)}
					</div>
				</>
			),
			key: '2',
			label: <span className='px-1.5'>My Delegation</span>
		}
	];

	return (
		<div className={classNames(className, 'mt-8 rounded-[18px]')}>
			<Tabs
				defaultActiveKey='2'
				theme={theme}
				type='card'
				className={`ant-tabs-tab-bg-white font-medium text-bodyBlue dark:bg-transparent dark:text-blue-dark-high ${isLoggedOut ? '' : 'max-lg:mt-28 max-sm:mt-16'}`}
				items={tabItems}
			/>
			<BecomeDelegateModal
				isModalOpen={openBecomeDelegateModal as boolean}
				setIsModalOpen={setOpenBecomeDelegateModal as any}
				className=''
				profileDetails={profileDetails as any}
				userBio={userBio as any}
				setUserBio={setUserBio as any}
				onchainUsername={identity?.display || identity?.legal || ''}
			/>
		</div>
	);
};

export default styled(DelegationTabs)`
	.ant-tabs-tab-active .active-icon {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}
`;
