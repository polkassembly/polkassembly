// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { useRouter } from 'next/router';
import { Dropdown } from '~src/ui-components/Dropdown';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { SwapOutlined } from '@ant-design/icons';
import { sortOptions } from 'src/global/sortOptions'; // Import if required
import { useTheme } from 'next-themes';

interface SortByDropdownProps {
	theme?: string | undefined;
	sortBy: any;
	setSortBy: any;
	isUsedInTrackListing?: boolean;
}

const SortByDropdownComponent: React.FC<SortByDropdownProps> = ({ sortBy, setSortBy, isUsedInTrackListing }) => {
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();
	const sortByOptions: ItemType[] = sortOptions;

	const handleSortByClick = ({ key }: { key: string }) => {
		router.push({
			pathname: '',
			query: { ...router.query, sortBy: key }
		});
		setSortBy(key);
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
			trigger={['click']}
			overlayClassName='z-[1056]'
		>
			<div className='dropdown-div flex cursor-pointer items-center whitespace-pre rounded px-2 py-1 text-pink_primary hover:text-pink_primary'>
				<span className={`${isUsedInTrackListing ? 'text-bodyBlue opacity-70 dark:text-[#96A4B6] dark:opacity-100' : ''} text-xs font-normal sm:mr-1 sm:mt-0.5`}>Sort By</span>
				<SwapOutlined
					rotate={90}
					style={{ fontSize: '14px', marginRight: '10px' }}
				/>
			</div>
		</Dropdown>
	);
};

export default SortByDropdownComponent;
