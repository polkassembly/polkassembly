// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { useRouter } from 'next/router';
import { Dropdown } from '~src/ui-components/Dropdown';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { gov2ReferendumStatusOptions } from '~src/global/statuses';

interface SortByDropdownProps {
	theme: string | undefined;
	sortBy: any;
	setSortBy: any;
}

const SortByStatusDropdownComponent: React.FC<SortByDropdownProps> = ({ theme, sortBy, setSortBy }) => {
	const router = useRouter();
	const sortByOptions: ItemType[] = gov2ReferendumStatusOptions;

	const handleSortByClick = ({ key }: { key: string }) => {
		router.push({
			pathname: '',
			query: { ...router.query, status: key }
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
				<span className='font-normal sm:mr-1 sm:mt-0.5'>Status</span>
			</div>
		</Dropdown>
	);
};

export default SortByStatusDropdownComponent;
