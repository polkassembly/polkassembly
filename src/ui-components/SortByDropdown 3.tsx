// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Dropdown } from '~src/ui-components/Dropdown';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { SwapOutlined } from '@ant-design/icons';
import { sortOptions } from 'src/global/sortOptions'; // Import if required
import { useTheme } from 'next-themes';
import { Divider } from 'antd';

interface SortByDropdownProps {
	theme?: string | undefined;
	sortBy: any;
	setSortBy: any;
	isUsedInTrackListing?: boolean;
}

const SortByDropdownComponent: React.FC<SortByDropdownProps> = ({ sortBy, setSortBy, isUsedInTrackListing }) => {
	const router = useRouter();
	const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
	const { resolvedTheme: theme } = useTheme();
	const clearFilterOption = {
		key: 'clear_filter',
		label: (
			<div>
				<div className='flex justify-end'>
					<span className='my-1 text-xs text-pink_primary'>Clear Filter</span>
				</div>
				<Divider
					style={{ background: '#D2D8E0', flexGrow: 1 }}
					className='my-2 dark:bg-separatorDark'
				/>
			</div>
		)
	};
	const sortByOptions: ItemType[] = [clearFilterOption, ...sortOptions];

	const handleSortByClick = ({ key }: { key: string }) => {
		if (key === 'clear_filter') {
			router.push({ pathname: '' });
			setSelectedStatus(null);
			setSortBy(null);
		} else {
			router.push({
				pathname: '',
				query: { ...router.query, sortBy: key }
			});
			setSortBy(key);
			setSelectedStatus(key);
		}
	};

	return (
		<Dropdown
			theme={theme}
			menu={{
				defaultSelectedKeys: [sortBy],
				items: sortByOptions,
				onClick: handleSortByClick,
				selectable: true
			}}
			trigger={['hover']}
			overlayClassName='z-[1056]'
		>
			<div
				className={`dropdown-div flex cursor-pointer items-center whitespace-pre rounded px-2 py-1 text-xs font-normal text-pink_primary hover:text-pink_primary ${
					isUsedInTrackListing ? 'text-bodyBlue opacity-70 dark:text-[#96A4B6] dark:opacity-100' : ''
				}`}
			>
				<span className={`${selectedStatus ? 'text-pink_primary' : ''} sm:mr-1 sm:mt-0.5`}>Sort By</span>
				<SwapOutlined
					className={`${isUsedInTrackListing ? `${selectedStatus ? 'text-pink_primary' : 'text-bodyBlue opacity-70 dark:text-[#96A4B6] '}` : ''}`}
					rotate={90}
					style={{ fontSize: '14px', marginRight: '10px' }}
				/>
			</div>
		</Dropdown>
	);
};

export default SortByDropdownComponent;
