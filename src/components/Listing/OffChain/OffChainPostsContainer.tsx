// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SwapOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useRouter } from 'next/router';
import React, { FC,useState } from 'react';
import { sortOptions, sortValues } from 'src/global/sortOptions';
import styled from 'styled-components';
import { OffChainProposalType } from '~src/global/proposalType';
import OffChainPostsListingContainer from './OffChainPostsListingContainer';
import FilterByTags from '~src/ui-components/FilterByTags';
import FilteredTags from '~src/ui-components/filteredTags';

interface IOffChainContainerProps {
	posts: any[];
	className?: string;
	count: number;
	proposalType: OffChainProposalType
}

export function getTitle(proposalType: OffChainProposalType): string {
	switch(proposalType) {
	case OffChainProposalType.DISCUSSIONS:
		return 'Discussions';
	case OffChainProposalType.GRANTS:
		return 'Grants';
	}
	return '';
}

const OffChainPostsContainer: FC<IOffChainContainerProps> = ({ posts, className, count, proposalType }) => {
	const router = useRouter();
	const [sortBy, setSortBy] = useState<string>(sortValues.COMMENTED);

	const handleSortByClick = ({ key }: { key:string }) => {

		router.push({
			pathname:'',
			query:{ ...router.query,
				sortBy: key
			}
		});
		setSortBy(key);
	};

	const sortByOptions: ItemType[] = sortOptions;
	const sortByDropdown = (
		<Dropdown
			menu={{
				defaultSelectedKeys: [sortValues.COMMENTED],
				items: sortByOptions,
				onClick: handleSortByClick,
				selectable: true
			}}
			trigger={['click']}>
			<div className='dropdown-div text-grey_primary flex items-center cursor-pointer hover:text-pink_primary py-1 px-2 rounded'>
				<span className='mr-2'>Sort By</span>
				<SwapOutlined rotate={90} style={ { fontSize: '14px' } } />
			</div>
		</Dropdown>);

	return (
		<div className={`${className} bg-white p-3 md:p-8 rounded-[4px] shadow-[0px_6px_18px_rgba(0,0,0,0.06)]`}>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='dashboard-heading'>{ count } {
						getTitle(proposalType)
					}</h1>
					<FilteredTags/>
				</div>
				<div className='flex gap-1'>
					<FilterByTags/>
					{sortByDropdown}
				</div>
			</div>
			<OffChainPostsListingContainer proposalType={proposalType} sortBy={sortBy} count={count} posts={posts} className='mt-8' />
		</div>
	);
};

export default styled(OffChainPostsContainer)`
	.ant-dropdown-trigger.ant-dropdown-open {
		color: pink_primary !important;
	}
  .text-color{
  color: #334D6E;
}

`;