// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTheme } from 'next-themes';
import React, { FC, useEffect, useState } from 'react';
import FilterByTags from '~src/ui-components/FilterByTags';
import { Tabs } from '~src/ui-components/Tabs';
import BountiesTable from './BountiesTable';
import { EUserCreatedBountiesStatuses, IUserCreatedBounty } from '~src/types';
import { useRouter } from 'next/router';

interface IBountiesTabItemsProps {
	bounties: IUserCreatedBounty[];
}

const BountiesTabItems: FC<IBountiesTabItemsProps> = (props) => {
	const { resolvedTheme: theme } = useTheme();
	const router = useRouter();

	const [activeTab, setActiveTab] = useState<string>('all');

	useEffect(() => {
		const statusFromUrl = router.query.status as string;

		if (statusFromUrl) {
			setActiveTab(statusFromUrl.toUpperCase());
		} else {
			setActiveTab('all');
		}
	}, [router.query.status]);

	const bountyStatuses = [
		{ key: 'all', label: 'All' },
		...Object.entries(EUserCreatedBountiesStatuses).map(([key, value]) => ({
			key,
			label: value?.[0].toUpperCase() + value?.slice(1)
		}))
	];

	const tabItems = bountyStatuses.map((status) => ({
		children: <BountiesTable bounties={props.bounties?.length > 0 ? (props.bounties as IUserCreatedBounty[]) : []} />,
		key: status.key,
		label: <p>{status.label}</p>
	}));

	const handleTabChange = (key: string) => {
		if (key === 'all') {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { status, ...restQuery } = router.query;
			router.push({
				pathname: router.pathname,
				query: {
					...restQuery,
					page: 1
				}
			});
		} else {
			router.push({
				pathname: router.pathname,
				query: {
					...router.query,
					page: 1,
					status: key.toLowerCase()
				}
			});
		}
	};

	return (
		<div className='relative mt-5 md:mt-0'>
			<div className='absolute -top-2 right-5 z-50 md:top-8'>
				<FilterByTags isUsedInBountyPage={true} />
			</div>

			<div>
				<Tabs
					theme={theme}
					type='card'
					activeKey={activeTab}
					onChange={handleTabChange}
					className='ant-tabs-tab-bg-white pt-5 font-medium text-bodyBlue dark:bg-transparent dark:text-blue-dark-high'
					items={tabItems}
				/>
			</div>
		</div>
	);
};

export default BountiesTabItems;
