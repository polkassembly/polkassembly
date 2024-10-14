// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { RightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import CuratorProfile from './Profile';
// import CuratorPendingRequestManager from './PendingRequestManager';
import CuratedInfo from './CuratedInfo';
import { ProfileDetailsResponse } from '~src/auth/types';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { TOnChainIdentity } from '../UserProfile';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import { useNetworkSelector } from '~src/redux/selectors';
import getEncodedAddress from '~src/util/getEncodedAddress';

function CuratorDashboardTabItems({ curatorprofile }: { curatorprofile: ProfileDetailsResponse }) {
	const [activeTab, setActiveTab] = useState<string>('general');
	const [addressWithIdentity, setAddressWithIdentity] = useState<string>('');
	const { api, apiReady } = useApiContext();
	const [onChainIdentity, setOnChainIdentity] = useState<any>();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const { network } = useNetworkSelector();

	useEffect(() => {
		if (!api || !apiReady) return;

		let unsubscribes: (() => void)[];
		const onChainIdentity: TOnChainIdentity = {
			judgements: [],
			nickname: ''
		};
		const resolved: any[] = [];
		curatorprofile?.addresses.forEach(async (address) => {
			const info = await getIdentityInformation({
				address: address,
				api: peopleChainApi ?? api,
				network: network
			});

			if (info?.nickname && !onChainIdentity.nickname) {
				onChainIdentity.nickname = info.nickname;
			}
			Object.entries(info).forEach(([key, value]) => {
				if (value) {
					if (Array.isArray(value) && value.length > 0 && (onChainIdentity as any)?.[key]?.length === 0) {
						(onChainIdentity as any)[key] = value;
						setAddressWithIdentity(getEncodedAddress(address, network) || '');
					} else if (!(onChainIdentity as any)?.[key]) {
						(onChainIdentity as any)[key] = value;
					}
				}
			});
			resolved.push(true);
			if (resolved.length === curatorprofile?.addresses.length) {
				setOnChainIdentity(onChainIdentity);
			}
		});
		return () => {
			unsubscribes && unsubscribes.length > 0 && unsubscribes.forEach((unsub) => unsub && unsub());
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [curatorprofile?.addresses, api, apiReady, peopleChainApi, peopleChainApiReady, network]);
	const tabs = [
		{
			children: (
				<CuratorProfile
					addressWithIdentity={addressWithIdentity}
					curatorprofile={curatorprofile}
					onchainIdentity={onChainIdentity}
				/>
			),
			description: 'Vestibulum nec leo at dui euismod',
			icon: '/assets/icons/curator-dashboard/general.svg',
			key: 'general',
			title: 'General'
		},
		{
			children: <CuratedInfo />,
			description: 'Maecenas eget ligula vitae',
			icon: '/assets/icons/curator-dashboard/bounties-curated.svg',
			key: 'bounties-curated',
			title: 'Bounties Curated'
		}
		// {
		// children: <CuratorPendingRequestManager />,
		// description: 'Ut vestibulum efficitur mollis',
		// icon: '/assets/icons/curator-dashboard/pending-request.svg',
		// key: 'pending-requests',
		// title: 'Pending Requests'
		// }
	];

	return (
		<div className='flex gap-5'>
			<div className='mt-3 flex w-[400px] flex-col gap-2 rounded-xl border-[0.7px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]'>
				{tabs.map((tab) => (
					<div
						key={tab.key}
						className={`flex cursor-pointer items-center justify-between px-3 py-2  transition-colors duration-300 ${
							activeTab === tab.key ? 'rounded-lg border-[0.7px] border-solid border-[text-pink_primary] text-pink_primary  ' : 'border-none text-black dark:text-white'
						}`}
						onClick={() => setActiveTab(tab.key)}
					>
						<div className='flex gap-3'>
							<div className='rounded-full bg-[#F0F2F5] p-2'>
								<Image
									src={tab.icon}
									alt={`Curator Dashboard Icon ${tab.key}`}
									width={24}
									height={24}
									style={{
										filter: activeTab === tab.key ? 'brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%)' : 'none'
									}}
								/>
							</div>
							<div className='flex flex-col'>
								<span className={`${activeTab === tab.key && 'font-bold text-pink_primary'} text-[16px]`}>{tab.title}</span>
								<span className={`${activeTab === tab.key && 'text-pink_primary'} mt-1 whitespace-nowrap text-sm  text-blue-light-medium `}>{tab.description}</span>
							</div>
						</div>
						<RightOutlined className='ml-5' />
					</div>
				))}
			</div>
			<div className='mt-3 flex-grow'>{activeTab && tabs.find((tab) => tab.key === activeTab)?.children}</div>
		</div>
	);
}

export default CuratorDashboardTabItems;
