// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTheme } from 'next-themes';
import React, { FC } from 'react';
import FilterByTags from '~src/ui-components/FilterByTags';
import { Tabs } from '~src/ui-components/Tabs';
import { useRouter } from 'next/router';
import BountiesTable from './BountiesTable';
import { EUserCreatedBountiesStatuses, IUserCreatedBounty } from '~src/types';

interface IBountiesTabItemsProps {
	bountiesDetails: { bounties: IUserCreatedBounty[]; totalCount: number };
}

const BountiesTabItems: FC<IBountiesTabItemsProps> = (props) => {
	const { resolvedTheme: theme } = useTheme();
	const router = useRouter();
	const {
		bountiesDetails: { totalCount, bounties }
	} = props;
	console.log('user bounties: ', props?.bountiesDetails);

	const bountyStatuses = [
		{ key: 'all', label: 'All' },
		...Object.entries(EUserCreatedBountiesStatuses).map(([key, value]) => ({
			key,
			label: value?.[0].toUpperCase() + value?.slice(1)
		}))
	];
	const tabItems = bountyStatuses.map((status) => ({
		children: <BountiesTable bounties={totalCount ? (bounties as IUserCreatedBounty[]) : []} />,
		key: status.key,
		label: <p>{status.label}</p>
	}));

	const onTabChange = (key: string) => {
		const status = key === 'all' ? '' : key.toLowerCase();
		router.push({
			pathname: router.pathname,
			query: {
				...router.query,
				page: 1,
				status: encodeURIComponent(JSON.stringify(status))
			}
		});
	};
	return (
		<div className='relative mt-5 md:mt-0'>
			<div className='absolute -top-2 right-5 z-50 md:top-8'>
				<FilterByTags />
			</div>

			<div>
				<Tabs
					theme={theme}
					type='card'
					onChange={onTabChange}
					className='ant-tabs-tab-bg-white pt-5 font-medium text-bodyBlue dark:bg-transparent dark:text-blue-dark-high'
					items={tabItems}
				/>
			</div>
		</div>
	);
};

export default BountiesTabItems;
