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
import Image from 'next/image';
import CreateBountyBtn from '../CreateBountyBtn';

interface IBountiesTabItemsProps {
	bounties: IUserCreatedBounty[];
}

const BountiesTabItems: FC<IBountiesTabItemsProps> = (props) => {
	const { resolvedTheme: theme } = useTheme();
	const router = useRouter();
	const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

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
		children:
			props.bounties?.length > 0 ? (
				<BountiesTable bounties={props.bounties as IUserCreatedBounty[]} />
			) : (
				<div className='flex w-full flex-col items-center justify-center bg-white pb-40 dark:bg-section-dark-overlay'>
					<Image
						src='/assets/Gifs/watering.gif'
						alt='empty state'
						width={isMobile ? 400 : 600}
						height={isMobile ? 400 : 600}
						className='-mt-10 mb-4'
					/>
					<div className='-mt-20 items-center sm:-mt-40 sm:flex sm:flex-col'>
						<div className='text-lg font-semibold text-blue-light-high dark:text-blue-dark-high'>Nothing to see here</div>
						<span className='mt-1 flex gap-1 text-sm text-blue-light-medium dark:text-blue-dark-medium'>
							No Bounties have been created yet.
							{!isMobile && (
								<>
									{' '}
									<CreateBountyBtn
										className='hidden md:block'
										isUsedInTable={true}
									/>
									to get started.
								</>
							)}
						</span>
					</div>
				</div>
			),
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
			{props.bounties?.length > 0 && (
				<div className='absolute -top-2 right-5 z-50 md:top-8'>
					<FilterByTags isUsedInBountyPage={true} />
				</div>
			)}

			<div>
				<Tabs
					theme={theme}
					type='card'
					activeKey={activeTab}
					onChange={handleTabChange}
					className='ant-tabs-tab-bg-white pt-2 font-medium text-bodyBlue dark:bg-transparent dark:text-blue-dark-high sm:pt-5'
					items={tabItems}
				/>
			</div>
		</div>
	);
};

export default BountiesTabItems;
